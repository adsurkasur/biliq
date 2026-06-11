import { Trash2 } from "lucide-react";
import type { OverlayLayer } from "@/domain/events/types";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { ScrubbableNumberField } from "@/features/designer/components/ScrubbableNumberField";
import type { LayoutDefinition } from "@/domain/layouts/types";

interface OverlayLayerEditorProps {
  layer: OverlayLayer;
  layout: LayoutDefinition;
  onRemoveLayer: (id: string) => void;
  onUpdateLayerNumber: (
    id: string,
    field: "x" | "y" | "width" | "height" | "rotation" | "opacity" | "zIndex",
    value?: number
  ) => void;
  onUpdateLayerBoolean: (
    id: string,
    field: "aspectRatioLocked",
    value: boolean
  ) => void;
}

export function OverlayLayerEditor({
  layer,
  layout,
  onRemoveLayer,
  onUpdateLayerNumber,
  onUpdateLayerBoolean
}: OverlayLayerEditorProps) {
  return (
    <Card className="motion-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Overlay Properties
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            {layer.name}
          </h2>
        </div>
        <Button
          type="button"
          onClick={() => onRemoveLayer(layer.id)}
          variant="danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove
        </Button>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <ScrubbableNumberField
            label="X"
            value={layer.x}
            min={-layout.canvasWidth}
            max={layout.canvasWidth}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "x", value)}
          />
          <ScrubbableNumberField
            label="Y"
            value={layer.y}
            min={-layout.canvasHeight}
            max={layout.canvasHeight}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "y", value)}
          />
          <ScrubbableNumberField
            label="Width"
            value={layer.width}
            min={1}
            max={layout.canvasWidth * 2}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "width", value)}
          />
          <ScrubbableNumberField
            label="Height"
            value={layer.height}
            min={1}
            max={layout.canvasHeight * 2}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "height", value)}
          />
          <ScrubbableNumberField
            label="Rotation"
            value={layer.rotation}
            min={-360}
            max={360}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "rotation", value)}
          />
          <ScrubbableNumberField
            label="Opacity"
            value={layer.opacity}
            min={0}
            max={1}
            step={0.05}
            disabled={layer.locked}
            onChange={(value) => onUpdateLayerNumber(layer.id, "opacity", value)}
          />
          <label className="col-span-full flex items-center gap-2 text-sm font-semibold text-[var(--booth-on-surface)] mt-2">
            <input
              type="checkbox"
              checked={!!layer.aspectRatioLocked}
              disabled={layer.locked}
              onChange={(e) => onUpdateLayerBoolean(layer.id, "aspectRatioLocked", e.target.checked)}
              className="h-4 w-4 rounded border-[var(--booth-outline-variant)] text-[var(--booth-primary)] focus:ring-[var(--booth-primary)] disabled:opacity-50"
            />
            Lock aspect ratio during drag resize
          </label>
        </div>
      </div>
    </Card>
  );
}
