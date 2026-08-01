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
  WelcomeScreenDesign,
  WelcomeScreenOrientation,
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
  const orientation: WelcomeScreenOrientation =
    canvasHeight >= canvasWidth ? "portrait" : "landscape";
  const portraitSize = getWelcomeScreenCanvasSize(canvasWidth, canvasHeight, "portrait");
  const landscapeSize = getWelcomeScreenCanvasSize(canvasWidth, canvasHeight, "landscape");
  const designs = {
    portrait: createDefaultWelcomeScreenDesign(portraitSize.width, portraitSize.height),
    landscape: createDefaultWelcomeScreenDesign(landscapeSize.width, landscapeSize.height)
  };

  return {
    enabled: true,
    orientation,
    showCamera: true,
    cameraFacingMode: "user",
    cameraFit: "cover",
    designs,
    ...cloneWelcomeScreenDesign(designs[orientation])
  };
}

function createDefaultWelcomeScreenDesign(
  canvasWidth: number,
  canvasHeight: number
): WelcomeScreenDesign {
  return {
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

  const orientation: WelcomeScreenOrientation =
    configured.orientation ??
    (configured.canvasHeight >= configured.canvasWidth ? "portrait" : "landscape");
  const legacyDesign = getLegacyWelcomeScreenDesign(configured, fallback.designs[orientation]);
  const activeSource = configured.designs?.[orientation] ?? legacyDesign;
  const otherOrientation = oppositeWelcomeOrientation(orientation);
  const otherSource = configured.designs?.[otherOrientation] ?? activeSource;
  const activeSize = getWelcomeScreenCanvasSize(
    event.outputWidth,
    event.outputHeight,
    orientation
  );
  const otherSize = getWelcomeScreenCanvasSize(
    event.outputWidth,
    event.outputHeight,
    otherOrientation
  );
  const activeDesign = translateWelcomeScreenDesign(
    activeSource,
    activeSize.width,
    activeSize.height
  );
  const otherDesign = translateWelcomeScreenDesign(
    otherSource,
    otherSize.width,
    otherSize.height
  );
  const designs = {
    ...fallback.designs,
    [orientation]: activeDesign,
    [otherOrientation]: otherDesign
  };

  return {
    ...fallback,
    ...configured,
    orientation,
    designs,
    ...cloneWelcomeScreenDesign(designs[orientation])
  };
}

export function syncActiveWelcomeScreenDesign(
  config: WelcomeScreenConfig
): WelcomeScreenConfig {
  const activeDesign = pickWelcomeScreenDesign(config);
  return {
    ...config,
    designs: {
      ...config.designs,
      [config.orientation]: activeDesign
    }
  };
}

export function setWelcomeScreenOrientation(
  config: WelcomeScreenConfig,
  orientation: WelcomeScreenOrientation
): WelcomeScreenConfig {
  if (orientation === config.orientation) return syncActiveWelcomeScreenDesign(config);
  const synced = syncActiveWelcomeScreenDesign(config);
  const targetDesign = synced.designs[orientation];
  return {
    ...synced,
    orientation,
    ...cloneWelcomeScreenDesign(targetDesign)
  };
}

export function copyWelcomeScreenDesign(
  config: WelcomeScreenConfig,
  sourceOrientation: WelcomeScreenOrientation,
  targetOrientation: WelcomeScreenOrientation
): WelcomeScreenConfig {
  const synced = syncActiveWelcomeScreenDesign(config);
  const target = synced.designs[targetOrientation];
  const translated = translateWelcomeScreenDesign(
    synced.designs[sourceOrientation],
    target.canvasWidth,
    target.canvasHeight
  );
  const next = {
    ...synced,
    designs: {
      ...synced.designs,
      [targetOrientation]: translated
    }
  };
  return targetOrientation === next.orientation
    ? { ...next, ...cloneWelcomeScreenDesign(translated) }
    : next;
}

export function translateWelcomeScreenDesign(
  source: WelcomeScreenDesign,
  targetWidth: number,
  targetHeight: number
): WelcomeScreenDesign {
  const sourceWidth = Math.max(1, source.canvasWidth || targetWidth);
  const sourceHeight = Math.max(1, source.canvasHeight || targetHeight);
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const offsetX = (targetWidth - sourceWidth * scale) / 2;
  const offsetY = (targetHeight - sourceHeight * scale) / 2;

  return {
    canvasWidth: targetWidth,
    canvasHeight: targetHeight,
    backgroundColor: source.backgroundColor,
    overlayLayers: (source.overlayLayers ?? []).map((layer) => ({
      ...layer,
      x: Math.round(offsetX + layer.x * scale),
      y: Math.round(offsetY + layer.y * scale),
      width: Math.round(layer.width * scale),
      height: Math.round(layer.height * scale)
    })),
    elements: (source.elements ?? []).map((element) => ({
      ...element,
      x: Math.round(offsetX + element.x * scale),
      y: Math.round(offsetY + element.y * scale),
      width: Math.round(element.width * scale),
      height: Math.round(element.height * scale),
      fontSize: Math.max(12, Math.round(element.fontSize * scale))
    }))
  };
}

export function getWelcomeScreenCanvasSize(
  outputWidth: number,
  outputHeight: number,
  orientation: WelcomeScreenOrientation
): { width: number; height: number } {
  const shortSide = Math.min(outputWidth, outputHeight);
  const longSide = Math.max(outputWidth, outputHeight);
  return orientation === "portrait"
    ? { width: shortSide, height: longSide }
    : { width: longSide, height: shortSide };
}

function getLegacyWelcomeScreenDesign(
  configured: WelcomeScreenConfig,
  fallback: WelcomeScreenDesign
): WelcomeScreenDesign {
  return {
    canvasWidth: configured.canvasWidth || fallback.canvasWidth,
    canvasHeight: configured.canvasHeight || fallback.canvasHeight,
    backgroundColor: configured.backgroundColor || fallback.backgroundColor,
    overlayLayers: configured.overlayLayers ?? [],
    elements: configured.elements?.length ? configured.elements : fallback.elements
  };
}

function pickWelcomeScreenDesign(config: WelcomeScreenConfig): WelcomeScreenDesign {
  return cloneWelcomeScreenDesign(config);
}

function cloneWelcomeScreenDesign(design: WelcomeScreenDesign): WelcomeScreenDesign {
  return {
    canvasWidth: design.canvasWidth,
    canvasHeight: design.canvasHeight,
    backgroundColor: design.backgroundColor,
    overlayLayers: design.overlayLayers.map((layer) => ({ ...layer })),
    elements: design.elements.map((element) => ({ ...element }))
  };
}

function oppositeWelcomeOrientation(
  orientation: WelcomeScreenOrientation
): WelcomeScreenOrientation {
  return orientation === "portrait" ? "landscape" : "portrait";
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
