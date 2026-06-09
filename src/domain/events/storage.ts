import type { EventConfig } from "@/domain/events/types";
import {
  clampCaptureCount,
  getRecommendedLayoutIdForCaptureCount
} from "@/domain/layouts/defaultLayouts";
import { isBrowser } from "@/shared/lib/browser";
import { toSlug } from "@/shared/lib/slug";
import { storageKeys } from "@/shared/config/storageKeys";

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

export function getEventBySlug(slug: string): EventConfig | undefined {
  return getEvents().find((event) => event.slug === slug);
}

export function getEventById(id: string): EventConfig | undefined {
  return getEvents().find((event) => event.id === id);
}

export function upsertEventConfig(eventConfig: EventConfig): EventConfig {
  const events = getEvents();
  const existingIndex = events.findIndex((event) => event.id === eventConfig.id);
  const captureCount = clampCaptureCount(eventConfig.captureCount);
  const nextEvent = {
    ...eventConfig,
    captureCount,
    layoutId: getRecommendedLayoutIdForCaptureCount(captureCount),
    slug: toSlug(eventConfig.slug || eventConfig.name),
    updatedAt: new Date().toISOString()
  };

  const nextEvents =
    existingIndex >= 0
      ? events.map((event, index) => (index === existingIndex ? nextEvent : event))
      : [nextEvent, ...events];

  window.localStorage.setItem(storageKeys.events, JSON.stringify(nextEvents));
  return nextEvent;
}

export function deleteEventConfig(id: string): void {
  const nextEvents = getEvents().filter((event) => event.id !== id);
  window.localStorage.setItem(storageKeys.events, JSON.stringify(nextEvents));
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
