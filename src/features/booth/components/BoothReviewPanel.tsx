"use client";

import Link from "next/link";
import { ArrowLeft, Download, GalleryHorizontal, RotateCcw, Save } from "lucide-react";
import type { EventConfig } from "@/domain/events/types";
import { clampCaptureCount } from "@/domain/layouts/defaultLayouts";
import type { ComposedPhoto } from "@/domain/media/types";
import type { PhotoRecord } from "@/domain/photos/types";
import { FinalOutputPreview } from "@/features/booth/components/FinalOutputPreview";
import type { CaptureState } from "@/features/booth/lib/boothState";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
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
  const canPreviewActions =
    captureState === "preview" ||
    captureState === "saved" ||
    captureState === "error";

  return (
    <main className="min-h-screen px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              {eventConfig.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-stone-950">Review</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.home}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Events
            </Link>
            <Link
              href={routes.gallery(eventConfig.slug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
              Gallery
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
                <button
                  type="button"
                  onClick={onRetake}
                  className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={Boolean(savedPhoto)}
                  className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-5 w-5" aria-hidden="true" />
                  {savedPhoto ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadDataUrl(
                      finalOutput.imageDataUrl,
                      savedPhoto
                        ? photoFilename(eventConfig.slug, savedPhoto.id)
                        : `${eventConfig.slug}-preview.jpg`
                    );
                  }}
                  className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-100"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </button>
                <PrintButton photoId={savedPhoto?.id} />
              </>
            ) : null}
          </FinalOutputPreview>

          <aside className="grid content-start gap-4">
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Session
              </p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                {clampCaptureCount(eventConfig.captureCount)} photo layout
              </p>
              <p className="mt-2 text-sm font-medium text-stone-600">
                Countdown used: {Math.max(0, Math.round(eventConfig.countdownSeconds))}s
                before each shot.
              </p>
              {cameraMessage ? (
                <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
                  {cameraMessage}
                </p>
              ) : null}
            </div>

            {savedPhoto ? (
              <>
                <QrPreview value={createQrValue(savedPhoto.id)} />
                <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
                    Saved photo
                  </p>
                  <Link
                    href={routes.photo(savedPhoto.id)}
                    className="mt-2 inline-block text-lg font-bold text-stone-950 underline decoration-teal-700 underline-offset-4"
                  >
                    Open photo detail
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-stone-200 bg-white p-5 text-sm font-medium text-stone-600 shadow-sm">
                Save the output to generate the local photo page and QR preview.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
