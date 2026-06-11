"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { getPhotoById } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";
import { createQrValue } from "@/shared/lib/createQrValue";
import { downloadDataUrl, photoFilename } from "@/shared/lib/download";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { ContextualBackButton } from "@/shared/components/navigation/ContextualBackButton";

interface PhotoDetailClientProps {
  photoId: string;
}

export function PhotoDetailClient({ photoId }: PhotoDetailClientProps) {
  const { toast } = useToast();
  const [photo, setPhoto] = useState<PhotoRecord | null>(null);
  const [status, setStatus] = useState("Loading photo...");

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
        <LoadingIndicator 
          variant="page" 
          label="Loading photo…" 
        />
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
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 motion-enter">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BiliqLogo variant="mark" size="sm" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)] m-0">
                {photo.eventSlug}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
              Photo
            </h1>
          </div>
          <ContextualBackButton fallbackRoute={routes.gallery(photo.eventSlug)} fallbackLabel="Gallery" />
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="result-reveal p-4">
            <img
              src={photo.imageDataUrl}
              alt="Saved photo booth output"
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-[var(--booth-radius-md)] object-contain"
            />
          </Card>

          <aside className="grid content-start gap-4">
            <Card className="motion-card p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                Saved
              </p>
              <p className="mt-1 font-semibold text-[var(--booth-on-surface)]">
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
                    toast("Download started.", "success");
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

            <QrPreview value={createQrValue(photo.id)} />
          </aside>
        </div>
      </div>
    </main>
  );
}
