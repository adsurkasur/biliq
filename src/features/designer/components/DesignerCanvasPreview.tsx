import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition } from "@/domain/layouts/types";
import { cn } from "@/shared/lib/classNames";

interface DesignerCanvasPreviewProps {
  eventConfig: EventConfig;
  layout: LayoutDefinition;
  selectedSlotIndex: number;
  onSelectSlot: (index: number) => void;
}

export function DesignerCanvasPreview({
  eventConfig,
  layout,
  selectedSlotIndex,
  onSelectSlot
}: DesignerCanvasPreviewProps) {
  return (
    <section className="motion-card rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Live layout preview
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            {eventConfig.outputWidth} x {eventConfig.outputHeight} px
          </h2>
        </div>
        <p className="text-sm font-semibold text-stone-500">
          {layout.slots.length} slot{layout.slots.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-md border border-stone-300 bg-stone-100"
        style={{ aspectRatio: `${eventConfig.outputWidth} / ${eventConfig.outputHeight}` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(45deg, rgba(20,184,166,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(20,184,166,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(20,184,166,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(20,184,166,0.08) 75%)",
            backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0",
            backgroundSize: "32px 32px"
          }}
        />

        {layout.slots.map((slot, index) => (
          <button
            type="button"
            key={`${slot.x}-${slot.y}-${slot.width}-${slot.height}-${index}`}
            onClick={() => onSelectSlot(index)}
            className={cn(
              "booth-focus-ring absolute grid place-items-center border-2 text-center text-xs font-black uppercase tracking-wide shadow-sm transition-all duration-200",
              selectedSlotIndex === index
                ? "z-20 border-teal-700 bg-teal-200/85 text-teal-950 ring-4 ring-teal-500/25"
                : "z-10 border-teal-600 bg-teal-100/70 text-teal-950 hover:bg-teal-200/80"
            )}
            style={{
              left: `${(slot.x / layout.canvasWidth) * 100}%`,
              top: `${(slot.y / layout.canvasHeight) * 100}%`,
              width: `${(slot.width / layout.canvasWidth) * 100}%`,
              height: `${(slot.height / layout.canvasHeight) * 100}%`,
              borderRadius: `${(slot.borderRadius ?? 0) / 8}px`
            }}
          >
            Photo {index + 1}
          </button>
        ))}

        {eventConfig.overlayDataUrl ? (
          <img
            src={eventConfig.overlayDataUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          />
        ) : null}
      </div>
    </section>
  );
}
