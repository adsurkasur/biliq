"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Printer, Trash2, ZoomIn } from "lucide-react";
import { getPhotosByEventSlug } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import {
  deleteGalleryPhoto,
  downloadGalleryPhoto
} from "@/features/gallery/lib/galleryActions";
import { routes } from "@/shared/config/routes";

interface GalleryGridProps {
  eventSlug: string;
}

export function GalleryGrid({ eventSlug }: GalleryGridProps) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [status, setStatus] = useState("Loading gallery...");

  const loadPhotos = useCallback(async () => {
    try {
      const nextPhotos = await getPhotosByEventSlug(eventSlug);
      setPhotos(nextPhotos);
      setStatus(nextPhotos.length ? "" : "No saved photos yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gallery could not load.");
    }
  }, [eventSlug]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleDelete(photoId: string) {
    const confirmed = window.confirm("Delete this local photo?");
    if (!confirmed) {
      return;
    }

    await deleteGalleryPhoto(photoId);
    await loadPhotos();
  }

  if (status) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-sm font-semibold text-stone-600 shadow-sm">
        {status}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {photos.map((photo) => (
        <article
          key={photo.id}
          className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
        >
          <Link href={routes.photo(photo.id)} className="block bg-stone-100">
            <img
              src={photo.thumbnailDataUrl ?? photo.imageDataUrl}
              alt="Saved booth output"
              className="aspect-[4/5] w-full object-cover"
            />
          </Link>

          <div className="grid gap-3 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {new Date(photo.createdAt).toLocaleString()}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Link
                href={routes.photo(photo.id)}
                className="booth-focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
                aria-label="Open photo"
                title="Open photo"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => downloadGalleryPhoto(photo)}
                className="booth-focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
                aria-label="Download photo"
                title="Download photo"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link
                href={routes.print(photo.id)}
                className="booth-focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
                aria-label="Print photo"
                title="Print photo"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="booth-focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 hover:bg-red-50"
                aria-label="Delete photo"
                title="Delete photo"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
