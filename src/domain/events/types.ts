import type { LayoutDefinition } from "@/domain/layouts/types";

export type PrinterMode = "browser-print";

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
  overlayDataUrl?: string;
  overlayUrl?: string;
  printerMode: PrinterMode;
  createdAt: string;
  updatedAt: string;
}
