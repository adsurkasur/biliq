import { deletePhoto } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { downloadDataUrl, photoFilename } from "@/shared/lib/download";

export function downloadGalleryPhoto(photo: PhotoRecord): void {
  downloadDataUrl(photo.imageDataUrl, photoFilename(photo.eventSlug, photo.id));
}

export async function deleteGalleryPhoto(photoId: string): Promise<void> {
  await deletePhoto(photoId);
}
