import { deletePhoto } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { downloadDataUrl, mediaFilename } from "@/shared/lib/download";

export function downloadGalleryPhoto(photo: PhotoRecord): void {
  downloadDataUrl(
    photo.mediaDataUrl ?? photo.imageDataUrl,
    mediaFilename(photo)
  );
}

export async function deleteGalleryPhoto(photoId: string): Promise<void> {
  await deletePhoto(photoId);
}
