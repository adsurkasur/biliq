"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Printer, Trash2, ZoomIn } from "lucide-react";
import { getCaptureModeLabel } from "@/domain/events/captureModes";
import { getPhotosByEventSlug } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import {
  deleteGalleryPhoto,
  downloadGalleryPhoto
} from "@/features/gallery/lib/galleryActions";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";

interface GalleryGridProps {
  eventSlug: string;
}

export function GalleryGrid({ eventSlug }: GalleryGridProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [status, setStatus] = useState("Loading gallery...");

  const loadPhotos = useCallback(async () => {
    try {
      const nextPhotos = await getPhotosByEventSlug(eventSlug);
      setPhotos(nextPhotos);
      setStatus(nextPhotos.length ? "" : "No saved captures yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gallery could not load.");
    }
  }, [eventSlug]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleDelete(photoId: string) {
    const confirmed = window.confirm("Delete this local capture?");
    if (!confirmed) {
      return;
    }

    await deleteGalleryPhoto(photoId);
    toast("Deleted local capture.", "success");
    await loadPhotos();
  }

  if (status === "Loading gallery...") {
    return (
      <LoadingIndicator 
        variant="section" 
        label="Loading gallery…" 
        description="Fetching local capture records."
      />
    );
  }

  if (status) {
    return (
      <EmptyState icon={ZoomIn} title="No saved captures yet">
        {status}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <Card
            as="article"
            key={photo.id}
            interactive
            className="motion-card overflow-hidden"
          >
            <Link href={routes.photo(photo.id)} className="group relative block bg-[var(--booth-surface-container)]">
              <img
                src={photo.thumbnailDataUrl ?? photo.imageDataUrl}
                alt={`Saved ${getCaptureModeLabel(photo.kind).toLowerCase()} output`}
                className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute left-3 top-3">
                <Badge tone="dark">{getCaptureModeLabel(photo.kind)}</Badge>
              </span>
            </Link>

            <div className="grid gap-3 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                {new Date(photo.createdAt).toLocaleString()}
              </div>

              <div
                className={`grid gap-2 ${
                  (photo.kind ?? "photo") === "photo" ? "grid-cols-4" : "grid-cols-3"
                }`}
              >
                <Link
                  href={routes.photo(photo.id)}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                  aria-label="Open capture"
                  title="Open capture"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    downloadGalleryPhoto(photo);
                    toast("Download started.", "success");
                  }}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                  aria-label="Download capture"
                  title="Download capture"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
                {(photo.kind ?? "photo") === "photo" ? (
                  <Link
                    href={routes.print(photo.id)}
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                    aria-label="Print photo"
                    title="Print photo"
                  >
                    <Printer className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className={buttonClassName({ variant: "danger", size: "sm" })}
                  aria-label="Delete capture"
                  title="Delete capture"
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
