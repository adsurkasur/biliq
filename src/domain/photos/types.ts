import type { CaptureMode } from "@/domain/events/types";

export type PhotoStatus = "saved";

export interface PhotoRecord {
  id: string;
  eventId: string;
  eventSlug: string;
  kind?: CaptureMode;
  mediaDataUrl?: string;
  imageDataUrl: string;
  thumbnailDataUrl?: string;
  mimeType?: string;
  durationMs?: number;
  frameCount?: number;
  width: number;
  height: number;
  status: PhotoStatus;
  createdAt: string;
}
