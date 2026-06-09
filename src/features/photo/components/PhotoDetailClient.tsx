"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getPhotoById } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Toast } from "@/shared/components/ui/Toast";
import { routes } from "@/shared/config/routes";
import { createQrValue } from "@/shared/lib/createQrValue";
import { downloadDataUrl, photoFilename } from "@/shared/lib/download";

interface PhotoDetailClientProps {
  photoId: string;
}

export function PhotoDetailClient({ photoId }: PhotoDetailClientProps) {
  const [photo, setPhoto] = useState<PhotoRecord | null>(null);
  const [status, setStatus] = useState("Loading photo...");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    getPhotoById(photoId)
      .then((record) => {
        setPhoto(record ?? null);
        setStatus(record ? "" : "Photo not found in this browser.");
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Photo could not load.");
      });
  }, [photoId]);

  if (status) {
    if (status === "Loading photo...") {
      return (
        <main className="grid min-h-screen place-items-center px-5 py-8">
          <Card className="p-6">
            <Spinner label={status} className="text-stone-600" />
          </Card>
        </main>
      );
    }

    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <EmptyState
          icon={Download}
          title={status}
          action={
            <Link
              href={routes.home}
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              Events
            </Link>
          }
        >
          Local photos only exist on the device and browser that saved them.
        </EmptyState>
      </main>
    );
  }

  if (!photo) {
    return null;
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 motion-enter">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              {photo.eventSlug}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              Photo
            </h1>
          </div>
          <Link
            href={routes.gallery(photo.eventSlug)}
            className={buttonClassName({ variant: "secondary" })}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Gallery
          </Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="result-reveal p-4">
            <img
              src={photo.imageDataUrl}
              alt="Saved photo booth output"
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-md object-contain"
            />
          </Card>

          <aside className="grid content-start gap-4">
            <Card className="motion-card p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Saved
              </p>
              <p className="mt-1 font-semibold text-stone-950">
                {new Date(photo.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 grid gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    downloadDataUrl(
                      photo.imageDataUrl,
                      photoFilename(photo.eventSlug, photo.id)
                    );
                    setDownloaded(true);
                    window.setTimeout(() => setDownloaded(false), 1800);
                  }}
                  variant="primary"
                  size="lg"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </Button>
                <PrintButton photoId={photo.id} />
              </div>
            </Card>

            {downloaded ? <Toast tone="success">Download started.</Toast> : null}
            <QrPreview value={createQrValue(photo.id)} />
          </aside>
        </div>
      </div>
    </main>
  );
}
