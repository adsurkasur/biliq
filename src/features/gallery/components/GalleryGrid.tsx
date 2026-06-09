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
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Toast } from "@/shared/components/ui/Toast";
import { routes } from "@/shared/config/routes";

interface GalleryGridProps {
  eventSlug: string;
}

export function GalleryGrid({ eventSlug }: GalleryGridProps) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [status, setStatus] = useState("Loading gallery...");
  const [feedback, setFeedback] = useState("");

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
    setFeedback("Deleted local photo.");
    await loadPhotos();
  }

  if (status === "Loading gallery...") {
    return (
      <Card className="p-8 text-center">
        <Spinner label={status} className="justify-center text-[var(--booth-on-surface-variant)]" />
      </Card>
    );
  }

  if (status) {
    return (
      <EmptyState icon={ZoomIn} title="No saved photos yet">
        {status}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4">
      {feedback ? <Toast tone="success">{feedback}</Toast> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <Card
            as="article"
            key={photo.id}
            interactive
            className="motion-card overflow-hidden"
          >
            <Link href={routes.photo(photo.id)} className="group block bg-[var(--booth-surface-container)]">
              <img
                src={photo.thumbnailDataUrl ?? photo.imageDataUrl}
                alt="Saved booth output"
                className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            <div className="grid gap-3 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                {new Date(photo.createdAt).toLocaleString()}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Link
                  href={routes.photo(photo.id)}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                  aria-label="Open photo"
                  title="Open photo"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    downloadGalleryPhoto(photo);
                    setFeedback("Download started.");
                  }}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                  aria-label="Download photo"
                  title="Download photo"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  href={routes.print(photo.id)}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                  aria-label="Print photo"
                  title="Print photo"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className={buttonClassName({ variant: "danger", size: "sm" })}
                  aria-label="Delete photo"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
