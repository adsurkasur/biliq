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
    <section className="result-reveal flex min-h-[360px] flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-booth">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-950">Final output</h2>
        {width && height ? (
          <Badge>{width} x {height}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md bg-stone-100">
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="Composed photo output"
            className="result-reveal max-h-[62vh] w-auto max-w-full object-contain shadow-sm"
          />
        ) : (
          <p className="px-6 text-center text-sm font-medium text-stone-500">
            Output will appear after capture.
          </p>
        )}
      </div>

      {children ? (
        <div className="motion-enter flex flex-wrap gap-3 border-t border-stone-100 pt-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}
