export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function photoFilename(eventSlug: string, photoId: string): string {
  return `${eventSlug}-${photoId.slice(0, 8)}.jpg`;
}

export function mediaFilename(photo: PhotoRecord): string {
  const kind = photo.kind ?? "photo";
  const extension =
    kind === "gif" || kind === "boomerang"
      ? "gif"
      : kind === "video"
        ? getVideoExtension(photo.mimeType)
        : "jpg";

  return `${photo.eventSlug}-${photo.id.slice(0, 8)}-${kind}.${extension}`;
}

function getVideoExtension(mimeType?: string): string {
  return mimeType?.includes("mp4") ? "mp4" : "webm";
}
import type { PhotoRecord } from "@/domain/photos/types";
