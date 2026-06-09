import { AlertTriangle, CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import type { ImageDimensions } from "@/shared/lib/image";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface DesignerOverlayPanelProps {
  outputWidth: number;
  outputHeight: number;
  overlayDataUrl?: string;
  overlayDimensions: ImageDimensions | null;
  overlayFileName: string;
  onUpload: (file?: File) => void;
  onRemove: () => void;
}

export function DesignerOverlayPanel({
  outputWidth,
  outputHeight,
  overlayDataUrl,
  overlayDimensions,
  overlayFileName,
  onUpload,
  onRemove
}: DesignerOverlayPanelProps) {
  const overlayMatches =
    overlayDimensions?.width === outputWidth &&
    overlayDimensions?.height === outputHeight;

  return (
    <Card className="motion-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Overlay PNG
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            Transparent frame
          </h2>
        </div>
        <ImagePlus className="h-5 w-5 text-[var(--booth-primary)]" aria-hidden="true" />
      </div>

      <p className="mt-3 rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)]/30 p-3 text-sm font-medium leading-6 text-[var(--booth-on-primary-container)]">
        Recommended size: {outputWidth} x {outputHeight} px. Mismatched PNGs are
        allowed, but may not line up perfectly with the live viewfinder and final
        output.
      </p>

      <label className="booth-focus-ring mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-[var(--booth-radius-lg)] border border-dashed border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container)] px-4 py-5 text-sm font-semibold text-[var(--booth-on-surface)] transition-all hover:border-[var(--booth-primary)] hover:bg-[var(--booth-primary-container)]/15 hover:-translate-y-0.5">
        <ImagePlus className="h-5 w-5 text-[var(--booth-on-surface-variant)]" aria-hidden="true" />
        Upload or replace overlay
        <input
          type="file"
          accept="image/png,image/*"
          className="sr-only"
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
      </label>

      <div className="mt-4 rounded-[var(--booth-radius-md)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] p-3">
        <p className="text-sm font-semibold text-[var(--booth-on-surface)]">Current overlay</p>
        <p className="mt-1 text-sm font-medium text-[var(--booth-on-surface-variant)]">
          {overlayDataUrl ? overlayFileName || "Overlay uploaded" : "None uploaded"}
        </p>

        {overlayDimensions ? (
          <div className="mt-3 flex items-start gap-2 text-sm font-medium">
            {overlayMatches ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--booth-primary)]" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--booth-tertiary)]" />
            )}
            <p className={overlayMatches ? "text-[var(--booth-on-primary-container)]" : "text-[var(--booth-on-tertiary-container)]"}>
              Uploaded size: {overlayDimensions.width} x {overlayDimensions.height} px.
              {overlayMatches
                ? " Matches this event output."
                : " Does not match this event output."}
            </p>
          </div>
        ) : null}
      </div>

      {overlayDataUrl ? (
        <Button
          type="button"
          onClick={onRemove}
          variant="secondary"
          className="mt-4 w-full"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove overlay
        </Button>
      ) : (
        <div className="motion-pop mt-4 rounded-[var(--booth-radius-md)] border border-dashed border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container)] p-4 text-sm font-medium text-[var(--booth-on-surface-variant)]">
          No overlay yet. Upload a transparent PNG to preview it above the layout
          slots.
        </div>
      )}
    </Card>
  );
}
