"use client";

import type { ReactNode } from "react";
import { Badge } from "@/shared/components/ui/Badge";

interface FinalOutputPreviewProps {
  imageDataUrl?: string;
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function FinalOutputPreview({
  imageDataUrl,
  width,
  height,
  children
}: FinalOutputPreviewProps) {
  return (
    <section className="result-reveal flex min-h-[360px] flex-col gap-4 rounded-[var(--booth-radius-2xl)] border border-[var(--booth-outline-variant)]/20 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-2)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--booth-on-surface)]">Final output</h2>
        {width && height ? (
          <Badge>{width} x {height}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)]">
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="Composed photo output"
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
