"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  GalleryHorizontal,
  Palette,
  RotateCcw,
  Save
} from "lucide-react";
import type { EventConfig } from "@/domain/events/types";
import { getCaptureCountForEvent } from "@/domain/layouts/defaultLayouts";
import type { ComposedPhoto } from "@/domain/media/types";
import type { PhotoRecord } from "@/domain/photos/types";
import { FinalOutputPreview } from "@/features/booth/components/FinalOutputPreview";
import type { CaptureState } from "@/features/booth/lib/boothState";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
import { Badge } from "@/shared/components/ui/Badge";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Toast } from "@/shared/components/ui/Toast";
import { routes } from "@/shared/config/routes";
import { createQrValue } from "@/shared/lib/createQrValue";
import { downloadDataUrl, photoFilename } from "@/shared/lib/download";

interface BoothReviewPanelProps {
  cameraMessage: string;
  captureState: CaptureState;
  eventConfig: EventConfig;
  finalOutput: ComposedPhoto;
  savedPhoto: PhotoRecord | null;
  onRetake: () => void;
  onSave: () => void;
}

export function BoothReviewPanel({
  cameraMessage,
  captureState,
  eventConfig,
  finalOutput,
  savedPhoto,
  onRetake,
  onSave
}: BoothReviewPanelProps) {
  const [downloaded, setDownloaded] = useState(false);
  const canPreviewActions =
    captureState === "preview" ||
    captureState === "saved" ||
    captureState === "error";

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-5 motion-enter">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
              {eventConfig.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[var(--booth-on-surface)]">Review</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.home}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Events
            </Link>
            <Link
              href={routes.gallery(eventConfig.slug)}
              className={buttonClassName({ variant: "secondary" })}
            >
              <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
              Gallery
            </Link>
            <Link
              href={routes.designer(eventConfig.slug)}
              className={buttonClassName({ variant: "secondary" })}
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
              Designer
            </Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <FinalOutputPreview
            imageDataUrl={finalOutput.imageDataUrl}
            width={finalOutput.width}
            height={finalOutput.height}
          >
            {canPreviewActions ? (
              <>
                <Button
                  type="button"
                  onClick={onRetake}
                  variant="secondary"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Retake
                </Button>
                <Button
                  type="button"
                  onClick={onSave}
                  disabled={Boolean(savedPhoto)}
                  variant="primary"
                  size="lg"
                >
                  <Save className="h-5 w-5" aria-hidden="true" />
                  {savedPhoto ? "Saved" : "Save"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    downloadDataUrl(
                      finalOutput.imageDataUrl,
                      savedPhoto
                        ? photoFilename(eventConfig.slug, savedPhoto.id)
                        : `${eventConfig.slug}-preview.jpg`
                    );
                    setDownloaded(true);
                    window.setTimeout(() => setDownloaded(false), 1800);
                  }}
                  variant="tonal"
                  size="lg"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </Button>
                <PrintButton photoId={savedPhoto?.id} />
              </>
            ) : null}
          </FinalOutputPreview>

          <aside className="grid content-start gap-4">
            <Card className="motion-card p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                Session
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--booth-on-surface)]">
                {getCaptureCountForEvent(eventConfig)} photo layout
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--booth-on-surface-variant)]">
                Countdown used: {Math.max(0, Math.round(eventConfig.countdownSeconds))}s
                before each shot.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={savedPhoto ? "teal" : "neutral"}>
                  {savedPhoto ? "Saved locally" : "Ready to save"}
                </Badge>
                <Badge tone="dark">Browser print</Badge>
              </div>
              {cameraMessage ? (
                <p className="mt-3 rounded-[var(--booth-radius-md)] bg-[var(--booth-error-container)] p-3 text-sm font-semibold text-[var(--booth-on-error-container)]">
                  {cameraMessage}
                </p>
              ) : null}
            </Card>

            {downloaded ? <Toast tone="success">Download started.</Toast> : null}

            {savedPhoto ? (
              <div className="grid gap-4 motion-enter">
                <Toast tone="success">Saved to the local gallery.</Toast>
                <QrPreview value={createQrValue(savedPhoto.id)} />
                <Card className="p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
                    Saved photo
                  </p>
                  <Link
                    href={routes.photo(savedPhoto.id)}
                    className="mt-2 inline-block text-lg font-bold text-[var(--booth-on-surface)] underline decoration-[var(--booth-primary)] underline-offset-4"
                  >
                    Open photo detail
                  </Link>
                </Card>
              </div>
            ) : (
              <Card className="motion-card p-5 text-sm font-medium text-[var(--booth-on-surface-variant)]">
                Save the output to generate the local photo page and QR preview.
              </Card>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
