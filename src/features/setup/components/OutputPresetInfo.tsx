import { formatAspectRatio } from "@/shared/lib/validation";

interface OutputPresetInfoProps {
  outputWidth: number;
  outputHeight: number;
  layoutName: string;
}

export function OutputPresetInfo({
  outputWidth,
  outputHeight,
  layoutName
}: OutputPresetInfoProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Selected output
        </p>
        <p className="mt-1 text-xl font-bold text-stone-950">
          {outputWidth} x {outputHeight} px
        </p>
        <p className="mt-1 text-sm font-medium text-stone-600">
          Aspect ratio: {formatAspectRatio(outputWidth, outputHeight)}
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Overlay recommendation
        </p>
        <p className="mt-1 text-xl font-bold text-stone-950">
          {outputWidth} x {outputHeight} px
        </p>
        <p className="mt-1 text-sm font-medium text-stone-600">
          Transparent PNG, full canvas. Active layout: {layoutName}.
        </p>
      </div>
    </section>
  );
}
