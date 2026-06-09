import { Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  defaultLayouts,
  MAX_CAPTURE_COUNT
} from "@/domain/layouts/defaultLayouts";
import type { LayoutDefinition, SlotFit } from "@/domain/layouts/types";

interface SlotEditorProps {
  layout: LayoutDefinition;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onResetToDefault: (captureCount: number) => void;
  onUpdateSlotFit: (index: number, fit: SlotFit) => void;
  onUpdateSlotNumber: (
    index: number,
    field: "x" | "y" | "width" | "height" | "borderRadius",
    value?: number
  ) => void;
}

export function SlotEditor({
  layout,
  onAddSlot,
  onRemoveSlot,
  onResetToDefault,
  onUpdateSlotFit,
  onUpdateSlotNumber
}: SlotEditorProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Photo slots
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            Numeric layout
          </h2>
        </div>
        <button
          type="button"
          onClick={onAddSlot}
          disabled={layout.slots.length >= MAX_CAPTURE_COUNT}
          className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add slot
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {defaultLayouts.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onResetToDefault(preset.slots.length)}
            className="booth-focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {preset.slots.length} photo
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {layout.slots.map((slot, index) => (
          <article
            key={`${index}-${slot.x}-${slot.y}`}
            className="rounded-md border border-stone-200 bg-stone-50 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-stone-950">Photo {index + 1}</h3>
              <button
                type="button"
                onClick={() => onRemoveSlot(index)}
                disabled={layout.slots.length <= 1}
                className="booth-focus-ring inline-flex min-h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
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
    </section>
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
