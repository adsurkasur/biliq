import {
  DEFAULT_LAYOUT_ID,
  TABLET_PORTRAIT_HEIGHT,
  TABLET_PORTRAIT_WIDTH
} from "@/domain/layouts/defaultLayouts";
import type {
  CaptureMode,
  EventConfig,
  GifCaptureSettings,
  WelcomeScreenConfig,
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
    framePlacement: "fit",
    welcomeScreen: createDefaultWelcomeScreenConfig(preset.width, preset.height),
    printerMode: "browser-print",
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function createDefaultWelcomeScreenConfig(
  canvasWidth: number,
  canvasHeight: number
): WelcomeScreenConfig {
  return {
    enabled: true,
    showCamera: true,
    cameraFacingMode: "user",
    cameraFit: "cover",
    canvasWidth,
    canvasHeight,
    backgroundColor: "#171715",
    overlayLayers: [],
    elements: [
      {
        id: "welcome-title",
        type: "title",
        text: "Welcome!",
        x: Math.round(canvasWidth * 0.08),
        y: Math.round(canvasHeight * 0.12),
        width: Math.round(canvasWidth * 0.84),
        height: Math.round(canvasHeight * 0.12),
        rotation: 0,
        opacity: 1,
        fontSize: Math.round(canvasWidth * 0.065),
        fontWeight: 800,
        color: "#FFFFFF",
        borderRadius: 0,
        visible: true
      },
      {
        id: "welcome-subtitle",
        type: "subtitle",
        text: "Tap below when you're ready to create a memory.",
        x: Math.round(canvasWidth * 0.12),
        y: Math.round(canvasHeight * 0.24),
        width: Math.round(canvasWidth * 0.76),
        height: Math.round(canvasHeight * 0.1),
        rotation: 0,
        opacity: 0.92,
        fontSize: Math.round(canvasWidth * 0.026),
        fontWeight: 600,
        color: "#FFFFFF",
        borderRadius: 0,
        visible: true
      },
      {
        id: "welcome-start-button",
        type: "start-button",
        text: "Start",
        x: Math.round(canvasWidth * 0.2),
        y: Math.round(canvasHeight * 0.78),
        width: Math.round(canvasWidth * 0.6),
        height: Math.round(canvasHeight * 0.1),
        rotation: 0,
        opacity: 1,
        fontSize: Math.round(canvasWidth * 0.035),
        fontWeight: 800,
        color: "#092E29",
        backgroundColor: "#A7D8CF",
        borderRadius: 999,
        visible: true
      }
    ]
  };
}

export function getWelcomeScreenConfig(event: EventConfig): WelcomeScreenConfig {
  const fallback = createDefaultWelcomeScreenConfig(event.outputWidth, event.outputHeight);
  const configured = event.welcomeScreen;
  if (!configured) return fallback;

  const sourceWidth = configured.canvasWidth || event.outputWidth;
  const sourceHeight = configured.canvasHeight || event.outputHeight;
  const scaleX = event.outputWidth / sourceWidth;
  const scaleY = event.outputHeight / sourceHeight;
  const scaleText = Math.min(scaleX, scaleY);

  return {
    ...fallback,
    ...configured,
    canvasWidth: event.outputWidth,
    canvasHeight: event.outputHeight,
    overlayLayers: (configured.overlayLayers ?? []).map((layer) => ({
      ...layer,
      x: Math.round(layer.x * scaleX),
      y: Math.round(layer.y * scaleY),
      width: Math.round(layer.width * scaleX),
      height: Math.round(layer.height * scaleY)
    })),
    elements: (configured.elements?.length ? configured.elements : fallback.elements).map(
      (element) => ({
        ...element,
        x: Math.round(element.x * scaleX),
        y: Math.round(element.y * scaleY),
        width: Math.round(element.width * scaleX),
        height: Math.round(element.height * scaleY),
        fontSize: Math.max(12, Math.round(element.fontSize * scaleText))
      })
    )
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
