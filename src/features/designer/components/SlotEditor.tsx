import { Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  defaultLayouts,
  MAX_CAPTURE_COUNT
} from "@/domain/layouts/defaultLayouts";
import type { LayoutDefinition, SlotFit } from "@/domain/layouts/types";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/classNames";

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
    field: "x" | "y" | "width" | "height" | "borderRadius",
    value?: number
  ) => void;
}

export function SlotEditor({
  layout,
  selectedSlotIndex,
  onAddSlot,
  onRemoveSlot,
  onResetToDefault,
  onSelectSlot,
  onUpdateSlotFit,
  onUpdateSlotNumber
}: SlotEditorProps) {
  return (
    <Card className="motion-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Photo slots
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            Numeric layout
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
        {layout.slots.map((slot, index) => (
          <article
            key={`${index}-${slot.x}-${slot.y}`}
            className={cn(
              "rounded-md border bg-stone-50 p-3 transition-all duration-200",
              selectedSlotIndex === index
                ? "border-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.14)]"
                : "border-stone-200 hover:border-stone-300"
            )}
            onFocus={() => onSelectSlot(index)}
            onMouseEnter={() => onSelectSlot(index)}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-stone-950">Photo {index + 1}</h3>
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
              <NumberField
                label="X"
                value={slot.x}
                onChange={(value) => onUpdateSlotNumber(index, "x", value)}
              />
              <NumberField
                label="Y"
                value={slot.y}
                onChange={(value) => onUpdateSlotNumber(index, "y", value)}
              />
              <NumberField
                label="Width"
                value={slot.width}
                min={1}
                onChange={(value) => onUpdateSlotNumber(index, "width", value)}
              />
              <NumberField
                label="Height"
                value={slot.height}
                min={1}
                onChange={(value) => onUpdateSlotNumber(index, "height", value)}
              />
              <NumberField
                label="Radius"
                value={slot.borderRadius ?? 0}
                min={0}
                onChange={(value) =>
                  onUpdateSlotNumber(index, "borderRadius", value)
                }
              />
              <label className="grid gap-1 text-sm font-semibold text-stone-700">
                Fit
                <select
                  value={slot.fit}
                  onChange={(event) =>
                    onUpdateSlotFit(index, event.target.value as SlotFit)
                  }
                  className="booth-focus-ring min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  onChange: (value?: number) => void;
}

function NumberField({ label, value, min = 0, onChange }: NumberFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-stone-700">
      {label}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          onChange(Number.isNaN(nextValue) ? undefined : nextValue);
        }}
        className="booth-focus-ring min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950"
      />
    </label>
  );
}
