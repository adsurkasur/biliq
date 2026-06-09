"use client";

import type { ReactNode } from "react";

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
    <section className="flex min-h-[360px] flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-950">Final output</h2>
        {width && height ? (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
            {width} x {height}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md bg-stone-100">
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="Composed photo output"
            className="max-h-[62vh] w-auto max-w-full object-contain"
          />
        ) : (
          <p className="px-6 text-center text-sm font-medium text-stone-500">
            Output will appear after capture.
          </p>
        )}
      </div>

      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </section>
  );
}
