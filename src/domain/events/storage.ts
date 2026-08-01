import type { EventConfig } from "@/domain/events/types";
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
  const hydratedLayers = await persistOverlayLayers(eventConfig.id, canonicalLayers);
  const nextEvent: EventConfig = {
    ...eventConfig,
    customLayout,
    captureCount,
    layoutId,
    overlayDataUrl: undefined,
    overlayLayers: hydratedLayers,
    slug: toSlug(eventConfig.slug || eventConfig.name),
    updatedAt: new Date().toISOString()
  };

  const persistedEvent: EventConfig = {
    ...nextEvent,
    overlayLayers: stripOverlayPayloads(hydratedLayers)
  };

  const migratedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.id === eventConfig.id) {
        return event;
      }

      const layers = getEffectiveOverlayLayers(event);
      const hasEmbeddedPayload = Boolean(event.overlayDataUrl) ||
        layers.some((layer) => Boolean(layer.imageDataUrl));

      if (!hasEmbeddedPayload) {
        return event;
      }

      const migratedLayers = await persistOverlayLayers(event.id, layers);
      return {
        ...event,
        overlayDataUrl: undefined,
        overlayLayers: stripOverlayPayloads(migratedLayers)
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
  const hydratedLayers = await hydrateOverlayLayers(eventConfig.overlayLayers ?? []);

  if (hydratedLayers.length > 0) {
    return { ...eventConfig, overlayLayers: hydratedLayers, overlayDataUrl: undefined };
  }

  return {
    ...eventConfig,
    overlayLayers: getEffectiveOverlayLayers(eventConfig)
  };
}
