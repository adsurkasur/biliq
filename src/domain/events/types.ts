import type { LayoutDefinition } from "@/domain/layouts/types";

export type PrinterMode = "browser-print";

export type CaptureMode = "photo" | "gif" | "boomerang" | "video";

export type FramePlacementMode = "fit" | "fill" | "stretch";

export interface GifCaptureSettings {
  frameCount: number;
  frameDelayMs: number;
}

export interface VideoCaptureSettings {
  durationSeconds: number;
  includeAudio: boolean;
}

export interface OverlayLayer {
  id: string;
  assetId?: string;
  name: string;
  imageDataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  aspectRatioLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventConfig {
  id: string;
  name: string;
  slug: string;
  countdownSeconds: number;
  captureCount: number;
  captureModes?: CaptureMode[];
  gifSettings?: GifCaptureSettings;
  videoSettings?: VideoCaptureSettings;
  outputWidth: number;
  outputHeight: number;
  layoutId: string;
  customLayout?: LayoutDefinition;
  framePlacement?: FramePlacementMode;
  overlayDataUrl?: string; // Legacy fallback
  overlayLayers?: OverlayLayer[];
  overlayUrl?: string;
  printerMode: PrinterMode;
  createdAt: string;
  updatedAt: string;
}
