import {
  DEFAULT_LAYOUT_ID,
  TABLET_PORTRAIT_HEIGHT,
  TABLET_PORTRAIT_WIDTH
} from "@/domain/layouts/defaultLayouts";
import type { EventConfig } from "@/domain/events/types";
import { createEntityId } from "@/shared/lib/id";

export const OUTPUT_PRESETS = [
  {
    id: "tablet-portrait",
    label: "Tablet Portrait",
    width: TABLET_PORTRAIT_WIDTH,
    height: TABLET_PORTRAIT_HEIGHT
  },
  { id: "square", label: "Square", width: 1200, height: 1200 },
  { id: "landscape", label: "Landscape", width: 1600, height: 1200 }
] as const;

export function createDefaultEventConfig(
  overrides: Partial<EventConfig> = {}
): EventConfig {
  const now = new Date().toISOString();
  const preset = OUTPUT_PRESETS[0];

  return {
    id: createEntityId("event"),
    name: "New Event",
    slug: "new-event",
    countdownSeconds: 3,
    captureCount: 1,
    outputWidth: preset.width,
    outputHeight: preset.height,
    layoutId: DEFAULT_LAYOUT_ID,
    printerMode: "browser-print",
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}
