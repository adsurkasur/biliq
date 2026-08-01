import type { CaptureMode } from "@/domain/events/types";

export interface CapturedFrame {
  imageDataUrl: string;
  width: number;
  height: number;
}

export interface ComposedPhoto {
  imageDataUrl: string;
  width: number;
  height: number;
}

export interface ComposedOutput {
  kind: CaptureMode;
  mediaDataUrl: string;
  imageDataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  durationMs?: number;
  frameCount?: number;
}
