import type {
  EventConfig,
  OverlayLayer,
  WelcomeScreenConfig,
  WelcomeScreenOrientation
} from "@/domain/events/types";
import {
  getWelcomeScreenConfig,
  syncActiveWelcomeScreenDesign
} from "@/domain/events/defaults";
import {
  clampCaptureCount,
  CUSTOM_LAYOUT_ID,
  getLayoutById,
  getRecommendedLayoutIdForCaptureCount,
  normalizeLayoutDefinition
} from "@/domain/layouts/defaultLayouts";
import { isBrowser } from "@/shared/lib/browser";
import { toSlug } from "@/shared/lib/slug";
import { storageKeys } from "@/shared/config/storageKeys";
import {
  deleteOverlayAssetsByEventId,
  hydrateOverlayLayers,
  persistOverlayLayers,
  stripOverlayPayloads
} from "@/domain/events/overlayAssets";

export function getEvents(): EventConfig[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(storageKeys.events);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<EventConfig | undefined> {
  const event = getEvents().find((candidate) => candidate.slug === slug);
  return event ? hydrateEventOverlayLayers(event) : undefined;
}

export async function getEventById(id: string): Promise<EventConfig | undefined> {
  const event = getEvents().find((candidate) => candidate.id === id);
  return event ? hydrateEventOverlayLayers(event) : undefined;
}

export async function upsertEventConfig(eventConfig: EventConfig): Promise<EventConfig> {
  const events = getEvents();
  const existingIndex = events.findIndex((event) => event.id === eventConfig.id);
  const customLayout = eventConfig.customLayout
    ? normalizeLayoutDefinition(eventConfig.customLayout, {
        canvasWidth: eventConfig.outputWidth,
        canvasHeight: eventConfig.outputHeight,
        id: CUSTOM_LAYOUT_ID,
        name: eventConfig.customLayout.name || "Custom layout"
      })
    : undefined;
  const captureCount = customLayout
    ? clampCaptureCount(customLayout.slots.length)
    : clampCaptureCount(eventConfig.captureCount);
  let layoutId = CUSTOM_LAYOUT_ID;

  if (!customLayout) {
    const presetLayout = getLayoutById(eventConfig.layoutId);
    layoutId =
      presetLayout.slots.length === captureCount
        ? presetLayout.id
        : getRecommendedLayoutIdForCaptureCount(captureCount);
  }
  const canonicalLayers = getEffectiveOverlayLayers(eventConfig);
  const normalizedWelcomeScreen = eventConfig.welcomeScreen
    ? getWelcomeScreenConfig({
        ...eventConfig,
        welcomeScreen: syncActiveWelcomeScreenDesign(eventConfig.welcomeScreen)
      })
    : undefined;
  const welcomeLayerGroups = getWelcomeLayerGroups(normalizedWelcomeScreen);
  const canonicalWelcomeLayers = welcomeLayerGroups.flatMap((group) => group.layers);
  const hydratedAssets = await persistOverlayLayers(eventConfig.id, [
    ...canonicalLayers,
    ...canonicalWelcomeLayers
  ]);
  const hydratedLayers = hydratedAssets.slice(0, canonicalLayers.length);
  const hydratedWelcomeLayers = hydratedAssets.slice(canonicalLayers.length);
  const hydratedWelcomeScreen = normalizedWelcomeScreen
    ? applyWelcomeLayerGroups(
        normalizedWelcomeScreen,
        splitWelcomeLayers(hydratedWelcomeLayers, welcomeLayerGroups)
      )
    : undefined;
  const nextEvent: EventConfig = {
    ...eventConfig,
    customLayout,
    captureCount,
    layoutId,
    overlayDataUrl: undefined,
    overlayLayers: hydratedLayers,
    welcomeScreen: hydratedWelcomeScreen,
    slug: toSlug(eventConfig.slug || eventConfig.name),
    updatedAt: new Date().toISOString()
  };

  const persistedEvent: EventConfig = {
    ...nextEvent,
    overlayLayers: stripOverlayPayloads(hydratedLayers),
    welcomeScreen: nextEvent.welcomeScreen
      ? stripWelcomePayloads(nextEvent.welcomeScreen)
      : undefined
  };

  const migratedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.id === eventConfig.id) {
        return event;
      }

      const layers = getEffectiveOverlayLayers(event);
      const normalizedWelcome = event.welcomeScreen
        ? getWelcomeScreenConfig(event)
        : undefined;
      const existingWelcomeGroups = getWelcomeLayerGroups(normalizedWelcome);
      const welcomeLayers = existingWelcomeGroups.flatMap((group) => group.layers);
      const hasEmbeddedPayload = Boolean(event.overlayDataUrl) ||
        [...layers, ...welcomeLayers].some((layer) => Boolean(layer.imageDataUrl));

      if (!hasEmbeddedPayload) {
        return event;
      }

      const migratedAssets = await persistOverlayLayers(event.id, [
        ...layers,
        ...welcomeLayers
      ]);
      const migratedLayers = migratedAssets.slice(0, layers.length);
      const migratedWelcomeLayers = migratedAssets.slice(layers.length);
      const migratedWelcome = normalizedWelcome
        ? applyWelcomeLayerGroups(
            normalizedWelcome,
            splitWelcomeLayers(migratedWelcomeLayers, existingWelcomeGroups)
          )
        : undefined;
      return {
        ...event,
        overlayDataUrl: undefined,
        overlayLayers: stripOverlayPayloads(migratedLayers),
        welcomeScreen: migratedWelcome
          ? stripWelcomePayloads(migratedWelcome)
          : undefined
      };
    })
  );

  const nextEvents =
    existingIndex >= 0
      ? migratedEvents.map((event, index) =>
          index === existingIndex ? persistedEvent : event
        )
      : [persistedEvent, ...migratedEvents];

  try {
    window.localStorage.setItem(storageKeys.events, JSON.stringify(nextEvents));
  } catch {
    throw new Error(
      "The event could not be saved. Check that browser storage is available and try again."
    );
  }
  return nextEvent;
}

export async function deleteEventConfig(id: string): Promise<void> {
  const nextEvents = getEvents().filter((event) => event.id !== id);
  await deleteOverlayAssetsByEventId(id);
  window.localStorage.setItem(storageKeys.events, JSON.stringify(nextEvents));
}

export async function deleteEventBySlug(slug: string): Promise<EventConfig | undefined> {
  const events = getEvents();
  const eventToDelete = events.find((event) => event.slug === slug);

  if (!eventToDelete) {
    return undefined;
  }

  await deleteOverlayAssetsByEventId(eventToDelete.id);

  window.localStorage.setItem(
    storageKeys.events,
    JSON.stringify(events.filter((event) => event.id !== eventToDelete.id))
  );

  return eventToDelete;
}

export function ensureUniqueSlug(slug: string, eventId?: string): string {
  const baseSlug = toSlug(slug) || "event";
  const events = getEvents();
  let nextSlug = baseSlug;
  let suffix = 2;

  while (
    events.some((event) => event.slug === nextSlug && event.id !== eventId)
  ) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

export function getEffectiveOverlayLayers(eventConfig: EventConfig): import("@/domain/events/types").OverlayLayer[] {
  if (eventConfig.overlayLayers && eventConfig.overlayLayers.length > 0) {
    return eventConfig.overlayLayers;
  }
  
  if (eventConfig.overlayDataUrl) {
    return [{
      id: "legacy-overlay",
      name: "Overlay",
      imageDataUrl: eventConfig.overlayDataUrl,
      x: 0,
      y: 0,
      width: eventConfig.outputWidth,
      height: eventConfig.outputHeight,
      rotation: 0,
      opacity: 1,
      zIndex: 0,
      visible: true,
      locked: false,
      createdAt: eventConfig.createdAt || new Date().toISOString(),
      updatedAt: eventConfig.updatedAt || new Date().toISOString()
    }];
  }

  return [];
}

async function hydrateEventOverlayLayers(eventConfig: EventConfig): Promise<EventConfig> {
  const normalizedWelcome = eventConfig.welcomeScreen
    ? getWelcomeScreenConfig(eventConfig)
    : undefined;
  const welcomeGroups = getWelcomeLayerGroups(normalizedWelcome);
  const [hydratedLayers, hydratedWelcomeLayers] = await Promise.all([
    hydrateOverlayLayers(eventConfig.overlayLayers ?? []),
    hydrateOverlayLayers(welcomeGroups.flatMap((group) => group.layers))
  ]);
  const welcomeScreen = normalizedWelcome
    ? applyWelcomeLayerGroups(
        normalizedWelcome,
        splitWelcomeLayers(hydratedWelcomeLayers, welcomeGroups)
      )
    : undefined;

  if (hydratedLayers.length > 0) {
    return {
      ...eventConfig,
      overlayLayers: hydratedLayers,
      overlayDataUrl: undefined,
      welcomeScreen
    };
  }

  return {
    ...eventConfig,
    overlayLayers: getEffectiveOverlayLayers(eventConfig),
    welcomeScreen
  };
}

const WELCOME_ORIENTATIONS: WelcomeScreenOrientation[] = ["portrait", "landscape"];

interface WelcomeLayerGroup {
  orientation: WelcomeScreenOrientation;
  layers: OverlayLayer[];
}

function getWelcomeLayerGroups(
  welcomeScreen?: WelcomeScreenConfig
): WelcomeLayerGroup[] {
  if (!welcomeScreen) return [];
  return WELCOME_ORIENTATIONS.map((orientation) => ({
    orientation,
    layers: welcomeScreen.designs[orientation].overlayLayers
  }));
}

function splitWelcomeLayers(
  layers: OverlayLayer[],
  template: WelcomeLayerGroup[]
): WelcomeLayerGroup[] {
  let offset = 0;
  return template.map((group) => {
    const nextLayers = layers.slice(offset, offset + group.layers.length);
    offset += group.layers.length;
    return { orientation: group.orientation, layers: nextLayers };
  });
}

function applyWelcomeLayerGroups(
  welcomeScreen: WelcomeScreenConfig,
  groups: WelcomeLayerGroup[]
): WelcomeScreenConfig {
  const designs = { ...welcomeScreen.designs };
  for (const group of groups) {
    designs[group.orientation] = {
      ...designs[group.orientation],
      overlayLayers: group.layers
    };
  }
  return {
    ...welcomeScreen,
    designs,
    overlayLayers: designs[welcomeScreen.orientation].overlayLayers
  };
}

function stripWelcomePayloads(
  welcomeScreen: WelcomeScreenConfig
): WelcomeScreenConfig {
  return applyWelcomeLayerGroups(
    welcomeScreen,
    getWelcomeLayerGroups(welcomeScreen).map((group) => ({
      ...group,
      layers: stripOverlayPayloads(group.layers)
    }))
  );
}
