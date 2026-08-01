"use client";

import Link from "next/link";
import {
  Download,
  RotateCcw,
  Save,
  Share2
} from "lucide-react";
import type { CaptureMode, EventConfig } from "@/domain/events/types";
import { getCaptureModeLabel } from "@/domain/events/captureModes";
import { getCaptureCountForEvent } from "@/domain/layouts/defaultLayouts";
import type { ComposedOutput } from "@/domain/media/types";
import type { PhotoRecord } from "@/domain/photos/types";
import { FinalOutputPreview } from "@/features/booth/components/FinalOutputPreview";
import type { CaptureState } from "@/features/booth/lib/boothState";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { createQrValue } from "@/shared/lib/createQrValue";
import { downloadDataUrl, mediaFilename } from "@/shared/lib/download";
import { shareCapture } from "@/shared/lib/share";

interface BoothReviewPanelProps {
  cameraMessage: string;
  captureState: CaptureState;
  eventConfig: EventConfig;
  activeMode: CaptureMode;
  finalOutput: ComposedOutput;
  savedPhoto: PhotoRecord | null;
  onRetake: () => void;
  onSave: () => Promise<void>;
}

export function BoothReviewPanel({
  cameraMessage,
  captureState,
  eventConfig,
  activeMode,
  finalOutput,
  savedPhoto,
  onRetake,
  onSave
}: BoothReviewPanelProps) {
  const { toast } = useToast();
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

          <EventNavigation eventSlug={eventConfig.slug} activeRoute="booth" />
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <FinalOutputPreview
            imageDataUrl={finalOutput.imageDataUrl}
            mediaDataUrl={finalOutput.mediaDataUrl}
            kind={finalOutput.kind}
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
                  onClick={async () => {
                    try {
                      await onSave();
                      toast("Saved to the local gallery.", "success");
                    } catch {
                      toast("The capture could not be saved.", "error");
                    }
                  }}
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
                      finalOutput.mediaDataUrl,
                      savedPhoto
                        ? mediaFilename(savedPhoto)
                        : previewFilename(eventConfig.slug, finalOutput)
                    );
                    toast("Download started.", "success");
                  }}
                  variant="tonal"
                  size="lg"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await shareCapture({
                        dataUrl: finalOutput.mediaDataUrl,
                        filename: savedPhoto
                          ? mediaFilename(savedPhoto)
                          : previewFilename(eventConfig.slug, finalOutput),
                        title: `${eventConfig.name} · ${getCaptureModeLabel(finalOutput.kind)}`
                      });
                    } catch (error) {
                      toast(
                        error instanceof Error ? error.message : "Sharing is unavailable.",
                        "error"
                      );
                    }
                  }}
                  variant="tonal"
                  size="lg"
                >
                  <Share2 className="h-5 w-5" aria-hidden="true" />
                  Share
                </Button>
                {finalOutput.kind === "photo" ? (
                  <PrintButton photoId={savedPhoto?.id} />
                ) : null}
              </>
            ) : null}
          </FinalOutputPreview>

          <aside className="grid content-start gap-4">
            <Card className="motion-card p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                Session
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--booth-on-surface)]">
                {getCaptureModeLabel(finalOutput.kind)} session
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--booth-on-surface-variant)]">
                {finalOutput.kind === "photo"
                  ? `${getCaptureCountForEvent(eventConfig)} photo layout`
                  : finalOutput.kind === "video"
                    ? `${Math.round((finalOutput.durationMs ?? 0) / 1000)} second recording`
                    : `${finalOutput.frameCount ?? 0} animation frames`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={savedPhoto ? "teal" : "neutral"}>
                  {savedPhoto ? "Saved locally" : "Ready to save"}
                </Badge>
                {finalOutput.kind === "photo" ? (
                  <Badge tone="dark">Print ready</Badge>
                ) : null}
              </div>
              {cameraMessage ? (
                <p className="mt-3 rounded-[var(--booth-radius-md)] bg-[var(--booth-error-container)] p-3 text-sm font-semibold text-[var(--booth-on-error-container)]">
                  {cameraMessage}
                </p>
              ) : null}
            </Card>

            {savedPhoto ? (
              <div className="grid gap-4 motion-enter">
                <QrPreview value={createQrValue(savedPhoto.id)} />
                <Card className="p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
                  Saved {getCaptureModeLabel(activeMode).toLowerCase()}
                  </p>
                  <Link
                    href={routes.photo(savedPhoto.id)}
                    className="mt-2 inline-block text-lg font-bold text-[var(--booth-on-surface)] underline decoration-[var(--booth-primary)] underline-offset-4"
                  >
                    Open capture detail
                  </Link>
                </Card>
              </div>
            ) : (
              <Card className="motion-card p-5 text-sm font-medium text-[var(--booth-on-surface-variant)]">
                Save the output to add it to the session gallery and generate a QR preview.
              </Card>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function previewFilename(
  eventSlug: string,
  output: ComposedOutput
): string {
  const extension =
    output.kind === "video"
      ? output.mimeType.includes("mp4")
        ? "mp4"
        : "webm"
      : output.kind === "photo"
        ? "jpg"
        : "gif";
  return `${eventSlug}-${output.kind}-preview.${extension}`;
}
