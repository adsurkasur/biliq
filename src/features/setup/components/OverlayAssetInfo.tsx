import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import type { ImageDimensions } from "@/shared/lib/image";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface OverlayAssetInfoProps {
  outputWidth: number;
  outputHeight: number;
  overlayDataUrl?: string;
  overlayFileName: string;
  overlayDimensions: ImageDimensions | null;
  onUpload: (file?: File) => void;
  onRemove: () => void;
}

export function OverlayAssetInfo({
  outputWidth,
  outputHeight,
  overlayDataUrl,
  overlayFileName,
  overlayDimensions,
  onUpload,
  onRemove
}: OverlayAssetInfoProps) {
  const overlayMatches =
    overlayDimensions?.width === outputWidth &&
    overlayDimensions?.height === outputHeight;

  return (
    <Card as="aside" className="motion-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--booth-on-surface)]">Overlay</h2>
        <ImagePlus className="h-5 w-5 text-[var(--booth-primary)]" aria-hidden="true" />
      </div>

      <div className="mb-4 rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)]/30 p-3 text-sm font-medium text-[var(--booth-on-primary-container)]">
        Prepare a transparent PNG at {outputWidth} x {outputHeight} px.
        Mismatched dimensions are allowed, but may not align perfectly in the live
        viewfinder and final output.
      </div>

      <label className="booth-focus-ring flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--booth-radius-lg)] border border-dashed border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container)] px-4 py-8 text-center transition-all hover:border-[var(--booth-primary)] hover:bg-[var(--booth-primary-container)]/15 hover:-translate-y-0.5">
        <Camera className="h-8 w-8 text-[var(--booth-on-surface-variant)]" aria-hidden="true" />
        <span className="text-sm font-semibold text-[var(--booth-on-surface)]">
          Upload transparent PNG
        </span>
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
                ? " Matches the selected output."
                : " Does not match the selected output."}
            </p>
          </div>
        ) : null}
      </div>

      {overlayDataUrl ? (
        <div className="mt-4 grid gap-3">
          <div
            className="overflow-hidden rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)]"
            style={{
              aspectRatio: `${outputWidth} / ${outputHeight}`
            }}
          >
            <img
              src={overlayDataUrl}
              alt="Uploaded overlay preview"
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            type="button"
            onClick={onRemove}
            variant="secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove overlay
          </Button>
        </div>
      ) : null}

      <div className="mt-6 rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)]/30 p-4">
        <h3 className="font-semibold text-[var(--booth-primary)]">Open Designer</h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--booth-on-surface-variant)]">
          Use the designer to arrange photo slots, add multiple overlays, and fine-tune position, size, rotation, and opacity.
        </p>
      </div>
    </Card>
  );
}
