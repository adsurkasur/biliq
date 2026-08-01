"use client";

import type { ReactNode } from "react";
import { getCaptureModeLabel } from "@/domain/events/captureModes";
import type { CaptureMode } from "@/domain/events/types";
import { Badge } from "@/shared/components/ui/Badge";

interface FinalOutputPreviewProps {
  imageDataUrl?: string;
  mediaDataUrl?: string;
  kind?: CaptureMode;
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function FinalOutputPreview({
  imageDataUrl,
  mediaDataUrl,
  kind = "photo",
  width,
  height,
  children
}: FinalOutputPreviewProps) {
  return (
    <section className="result-reveal flex min-h-[360px] flex-col gap-4 rounded-[var(--booth-radius-2xl)] border border-[var(--booth-outline-variant)]/20 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-2)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--booth-on-surface)]">
          {getCaptureModeLabel(kind)} preview
        </h2>
        {width && height ? (
          <Badge>{width} x {height}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)]">
        {kind === "video" && mediaDataUrl ? (
          <video
            src={mediaDataUrl}
            poster={imageDataUrl}
            controls
            playsInline
            className="result-reveal max-h-[62vh] w-auto max-w-full rounded-lg bg-black object-contain shadow-sm"
          />
        ) : mediaDataUrl || imageDataUrl ? (
          <img
            src={mediaDataUrl ?? imageDataUrl}
            alt={`${getCaptureModeLabel(kind)} booth output`}
            className="result-reveal max-h-[62vh] w-auto max-w-full object-contain shadow-sm"
          />
        ) : (
          <p className="px-6 text-center text-sm font-medium text-[var(--booth-on-surface-variant)]">
            Output will appear after capture.
          </p>
        )}
      </div>

      {children ? (
        <div className="motion-enter flex flex-wrap gap-3 border-t border-[var(--booth-outline-variant)]/20 pt-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}
