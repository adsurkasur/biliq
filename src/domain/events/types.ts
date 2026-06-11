import type { LayoutDefinition } from "@/domain/layouts/types";

export type PrinterMode = "browser-print";

export interface OverlayLayer {
  id: string;
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
  outputWidth: number;
  outputHeight: number;
  layoutId: string;
  customLayout?: LayoutDefinition;
  overlayDataUrl?: string; // Legacy fallback
  overlayLayers?: OverlayLayer[];
  overlayUrl?: string;
  printerMode: PrinterMode;
  createdAt: string;
  updatedAt: string;
}
