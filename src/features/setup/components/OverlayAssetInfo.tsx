import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import type { ImageDimensions } from "@/shared/lib/image";

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
    <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-950">Overlay</h2>
        <ImagePlus className="h-5 w-5 text-teal-700" aria-hidden="true" />
      </div>

      <div className="mb-4 rounded-md bg-teal-50 p-3 text-sm font-medium text-teal-950">
        Prepare a transparent PNG at {outputWidth} x {outputHeight} px.
        Mismatched dimensions are allowed, but may not align perfectly in the live
        viewfinder and final output.
      </div>

      <label className="booth-focus-ring flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center hover:border-teal-700">
        <Camera className="h-8 w-8 text-stone-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-stone-800">
          Upload transparent PNG
        </span>
        <input
          type="file"
          accept="image/png,image/*"
          className="sr-only"
          onChange={(event) => onUpload(event.target.files?.[0])}
        />
      </label>

      <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-3">
        <p className="text-sm font-semibold text-stone-950">Current overlay</p>
        <p className="mt-1 text-sm font-medium text-stone-600">
          {overlayDataUrl ? overlayFileName || "Overlay uploaded" : "None uploaded"}
        </p>
        {overlayDimensions ? (
          <div className="mt-3 flex items-start gap-2 text-sm font-medium">
            {overlayMatches ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal-700" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
            )}
            <p className={overlayMatches ? "text-teal-800" : "text-amber-800"}>
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
            className="overflow-hidden rounded-md border border-stone-200 bg-stone-100"
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
          <button
            type="button"
            onClick={onRemove}
            className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove overlay
          </button>
        </div>
      ) : null}
    </aside>
  );
}
