import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition } from "@/domain/layouts/types";

interface DesignerCanvasPreviewProps {
  eventConfig: EventConfig;
  layout: LayoutDefinition;
}

export function DesignerCanvasPreview({
  eventConfig,
  layout
}: DesignerCanvasPreviewProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
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
          <div
            key={`${slot.x}-${slot.y}-${slot.width}-${slot.height}-${index}`}
            className="absolute grid place-items-center border-2 border-teal-600 bg-teal-100/70 text-center text-xs font-black uppercase tracking-wide text-teal-950 shadow-sm"
            style={{
              left: `${(slot.x / layout.canvasWidth) * 100}%`,
              top: `${(slot.y / layout.canvasHeight) * 100}%`,
              width: `${(slot.width / layout.canvasWidth) * 100}%`,
              height: `${(slot.height / layout.canvasHeight) * 100}%`,
              borderRadius: `${(slot.borderRadius ?? 0) / 8}px`
            }}
          >
            Photo {index + 1}
          </div>
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
