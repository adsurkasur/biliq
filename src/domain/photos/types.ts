export type PhotoStatus = "saved";

export interface PhotoRecord {
  id: string;
  eventId: string;
  eventSlug: string;
  imageDataUrl: string;
  thumbnailDataUrl?: string;
  width: number;
  height: number;
  status: PhotoStatus;
  createdAt: string;
}
