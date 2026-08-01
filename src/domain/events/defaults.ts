import {
  DEFAULT_LAYOUT_ID,
  TABLET_PORTRAIT_HEIGHT,
  TABLET_PORTRAIT_WIDTH
} from "@/domain/layouts/defaultLayouts";
import type {
  CaptureMode,
  EventConfig,
  GifCaptureSettings,
  VideoCaptureSettings
} from "@/domain/events/types";
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

export const DEFAULT_CAPTURE_MODES: CaptureMode[] = ["photo"];

export const DEFAULT_GIF_SETTINGS: GifCaptureSettings = {
  frameCount: 6,
  frameDelayMs: 220
};

export const DEFAULT_VIDEO_SETTINGS: VideoCaptureSettings = {
  durationSeconds: 10,
  includeAudio: false
};

const CAPTURE_MODE_ORDER: CaptureMode[] = [
  "photo",
  "gif",
  "boomerang",
  "video"
];

export function getEnabledCaptureModes(event: EventConfig): CaptureMode[] {
  const validModes = new Set<CaptureMode>(CAPTURE_MODE_ORDER);
  const configuredModes = (event.captureModes ?? []).filter(
    (mode): mode is CaptureMode => validModes.has(mode)
  );

  const uniqueModes = Array.from(new Set(configuredModes));
  return uniqueModes.length
    ? CAPTURE_MODE_ORDER.filter((mode) => uniqueModes.includes(mode))
    : [...DEFAULT_CAPTURE_MODES];
}

export function getGifCaptureSettings(event: EventConfig): GifCaptureSettings {
  return {
    frameCount: clampNumber(event.gifSettings?.frameCount, 3, 12, DEFAULT_GIF_SETTINGS.frameCount),
    frameDelayMs: clampNumber(
      event.gifSettings?.frameDelayMs,
      100,
      1000,
      DEFAULT_GIF_SETTINGS.frameDelayMs
    )
  };
}

export function getVideoCaptureSettings(
  event: EventConfig
): VideoCaptureSettings {
  return {
    durationSeconds: clampNumber(
      event.videoSettings?.durationSeconds,
      3,
      60,
      DEFAULT_VIDEO_SETTINGS.durationSeconds
    ),
    includeAudio: event.videoSettings?.includeAudio === true
  };
}

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
    captureModes: [...DEFAULT_CAPTURE_MODES],
    gifSettings: { ...DEFAULT_GIF_SETTINGS },
    videoSettings: { ...DEFAULT_VIDEO_SETTINGS },
    outputWidth: preset.width,
    outputHeight: preset.height,
    layoutId: DEFAULT_LAYOUT_ID,
    printerMode: "browser-print",
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function clampNumber(
  value: number | undefined,
  minimum: number,
  maximum: number,
  fallback: number
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, Math.round(value ?? fallback)));
}
