import { formatAspectRatio } from "@/shared/lib/validation";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";

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
    <Card elevation={0} className="grid gap-4 bg-[var(--booth-primary-container)]/20 p-4 sm:grid-cols-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
          Selected output
        </p>
        <p className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
          {outputWidth} x {outputHeight} px
        </p>
        <div className="mt-2">
          <Badge tone="teal">Aspect ratio: {formatAspectRatio(outputWidth, outputHeight)}</Badge>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
          Overlay recommendation
        </p>
        <p className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
          {outputWidth} x {outputHeight} px
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--booth-on-surface-variant)]">
          Transparent PNG, full canvas. Active layout: {layoutName}.
        </p>
      </div>
    </Card>
  );
}
