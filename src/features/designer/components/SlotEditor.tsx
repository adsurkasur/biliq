import { Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  defaultLayouts,
  MAX_CAPTURE_COUNT
} from "@/domain/layouts/defaultLayouts";
import type { LayoutDefinition, SlotFit } from "@/domain/layouts/types";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/lib/classNames";
import { ScrubbableNumberField } from "@/features/designer/components/ScrubbableNumberField";

interface SlotEditorProps {
  layout: LayoutDefinition;
  selectedSlotIndex: number;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onResetToDefault: (captureCount: number) => void;
  onSelectSlot: (index: number) => void;
  onUpdateSlotFit: (index: number, fit: SlotFit) => void;
  onUpdateSlotNumber: (
    index: number,
    field: "x" | "y" | "width" | "height" | "rotation" | "borderRadius",
    value?: number
  ) => void;
  onUpdateSlotBoolean: (
    index: number,
    field: "aspectRatioLocked",
    value: boolean
  ) => void;
}

const fieldInputClass =
  "booth-focus-ring min-h-11 rounded-[var(--booth-radius-md)] border border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container-lowest)] px-3 py-2 text-[var(--booth-on-surface)] transition-colors focus:border-[var(--booth-primary)]";

export function SlotEditor({
  layout,
  selectedSlotIndex,
  onAddSlot,
  onRemoveSlot,
  onResetToDefault,
  onSelectSlot,
  onUpdateSlotFit,
  onUpdateSlotNumber,
  onUpdateSlotBoolean
}: SlotEditorProps) {
  return (
    <Card className="motion-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Photo areas
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            Exact position & size
          </h2>
        </div>
        <Button
          type="button"
          onClick={onAddSlot}
          disabled={layout.slots.length >= MAX_CAPTURE_COUNT}
          variant="primary"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add slot
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {defaultLayouts.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            onClick={() => onResetToDefault(preset.slots.length)}
            variant="secondary"
            size="sm"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {preset.slots.length} photo
          </Button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {layout.slots.map((slot, index) =>
          index === selectedSlotIndex ? (
          <article
            key={index}
            className={cn(
              "rounded-[var(--booth-radius-lg)] border p-4 transition-all duration-200",
              selectedSlotIndex === index
                ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/10 shadow-[0_0_0_3px_var(--booth-state-hover-primary)]"
                : "border-[var(--booth-outline-variant)]/40 bg-[var(--booth-surface-container)] hover:border-[var(--booth-outline-variant)]"
            )}
            onFocus={() => onSelectSlot(index)}
            onMouseEnter={() => onSelectSlot(index)}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-[var(--booth-on-surface)]">Photo {index + 1}</h3>
              <Button
                type="button"
                onClick={() => onRemoveSlot(index)}
                disabled={layout.slots.length <= 1}
                variant="danger"
                size="sm"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ScrubbableNumberField
                label="X"
                value={slot.x}
                min={-layout.canvasWidth}
                max={layout.canvasWidth}
                onChange={(value) => onUpdateSlotNumber(index, "x", value)}
              />
              <ScrubbableNumberField
                label="Y"
                value={slot.y}
                min={-layout.canvasHeight}
                max={layout.canvasHeight}
                onChange={(value) => onUpdateSlotNumber(index, "y", value)}
              />
              <ScrubbableNumberField
                label="Width"
                value={slot.width}
                min={1}
                max={layout.canvasWidth * 2}
                onChange={(value) => onUpdateSlotNumber(index, "width", value)}
              />
              <ScrubbableNumberField
                label="Height"
                value={slot.height}
                min={1}
                max={layout.canvasHeight * 2}
                onChange={(value) => onUpdateSlotNumber(index, "height", value)}
              />
              <ScrubbableNumberField
                label="Rotation"
                value={slot.rotation ?? 0}
                min={-360}
                max={360}
                onChange={(value) => onUpdateSlotNumber(index, "rotation", value)}
              />
              <ScrubbableNumberField
                label="Radius"
                value={slot.borderRadius ?? 0}
                min={0}
                max={layout.canvasWidth / 2}
                onChange={(value) =>
                  onUpdateSlotNumber(index, "borderRadius", value)
                }
              />
              <label className="grid gap-1 text-sm font-semibold text-[var(--booth-on-surface-variant)]">
                <span className="flex-none">Fit</span>
                <select
                  value={slot.fit}
                  onChange={(event) =>
                    onUpdateSlotFit(index, event.target.value as SlotFit)
                  }
                  className={fieldInputClass}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </label>
              <Tooltip content="Keep width and height proportional while resizing.">
                <label className="col-span-full flex w-fit items-center gap-2 text-sm font-semibold text-[var(--booth-on-surface)] mt-2">
                  <input
                    type="checkbox"
                    checked={!!slot.aspectRatioLocked}
                    onChange={(e) => onUpdateSlotBoolean(index, "aspectRatioLocked", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--booth-outline-variant)] text-[var(--booth-primary)] focus:ring-[var(--booth-primary)]"
                  />
                  Lock aspect ratio during drag resize
                </label>
              </Tooltip>
            </div>
          </article>
          ) : null
        )}
      </div>
    </Card>
  );
}

