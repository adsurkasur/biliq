import { useEffect, useRef, useState } from "react";
import type { EventConfig, OverlayLayer } from "@/domain/events/types";
import type { LayoutDefinition, LayoutSlot } from "@/domain/layouts/types";
import { cn } from "@/shared/lib/classNames";

interface DesignerCanvasPreviewProps {
  eventConfig: EventConfig;
  layout: LayoutDefinition;
  overlayLayers: OverlayLayer[];
  selectedSlotIndex: number | null;
  selectedLayerId: string | null;
  onSelectSlot: (index: number) => void;
  onSelectLayer: (id: string) => void;
  onUpdateSlotNumber?: (index: number, property: any, value: number) => void;
  onUpdateLayerNumber?: (id: string, property: any, value: number) => void;
}

export function DesignerCanvasPreview({
  eventConfig,
  layout,
  overlayLayers,
  selectedSlotIndex,
  selectedLayerId,
  onSelectSlot,
  onSelectLayer,
  onUpdateSlotNumber,
  onUpdateLayerNumber
}: DesignerCanvasPreviewProps) {
  const visibleLayers = overlayLayers.filter((layer) => layer.visible).sort((a, b) => a.zIndex - b.zIndex);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    type: "slot" | "layer";
    id: string | number;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = eventConfig.outputWidth / rect.width;
      const scaleY = eventConfig.outputHeight / rect.height;

      const deltaX = (e.clientX - dragState.startX) * scaleX;
      const deltaY = (e.clientY - dragState.startY) * scaleY;

      const nextX = Math.round(dragState.initialX + deltaX);
      const nextY = Math.round(dragState.initialY + deltaY);

      if (dragState.type === "slot" && onUpdateSlotNumber) {
        onUpdateSlotNumber(dragState.id as number, "x", nextX);
        onUpdateSlotNumber(dragState.id as number, "y", nextY);
      } else if (dragState.type === "layer" && onUpdateLayerNumber) {
        onUpdateLayerNumber(dragState.id as string, "x", nextX);
        onUpdateLayerNumber(dragState.id as string, "y", nextY);
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, eventConfig.outputWidth, eventConfig.outputHeight, onUpdateSlotNumber, onUpdateLayerNumber]);

  return (
    <section className="motion-card rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/20 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-1)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Live layout preview
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            {eventConfig.outputWidth} x {eventConfig.outputHeight} px
          </h2>
        </div>
        <p className="text-sm font-semibold text-[var(--booth-on-surface-variant)]">
          {layout.slots.length} slot{layout.slots.length === 1 ? "" : "s"}, {overlayLayers.length} layer{overlayLayers.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        ref={canvasRef}
        className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)]"
        style={{ aspectRatio: `${eventConfig.outputWidth} / ${eventConfig.outputHeight}` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(45deg, rgba(0,121,107,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,121,107,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,121,107,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,121,107,0.06) 75%)",
            backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0",
            backgroundSize: "32px 32px"
          }}
        />

        {layout.slots.map((slot, index) => (
          <button
            type="button"
            key={`${slot.x}-${slot.y}-${slot.width}-${slot.height}-${index}`}
            onClick={() => onSelectSlot(index)}
            onPointerDown={(e) => {
              onSelectSlot(index);
              e.preventDefault();
              setDragState({
                type: "slot",
                id: index,
                startX: e.clientX,
                startY: e.clientY,
                initialX: slot.x,
                initialY: slot.y
              });
            }}
            className={cn(
              "booth-focus-ring absolute grid place-items-center border-2 text-center text-xs font-black uppercase tracking-wide shadow-[var(--booth-elevation-1)] transition-all duration-200 touch-none",
              selectedSlotIndex === index
                ? "z-20 border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/80 text-[var(--booth-on-primary-container)] ring-4 ring-[var(--booth-primary)]/20"
                : "z-10 border-[var(--booth-primary)]/60 bg-[var(--booth-primary-container)]/50 text-[var(--booth-on-primary-container)] hover:bg-[var(--booth-primary-container)]/70 cursor-move"
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

        {visibleLayers.map((layer) => {
          const leftPercent = (layer.x / eventConfig.outputWidth) * 100;
          const topPercent = (layer.y / eventConfig.outputHeight) * 100;
          const widthPercent = (layer.width / eventConfig.outputWidth) * 100;
          const heightPercent = (layer.height / eventConfig.outputHeight) * 100;

          const isSelected = selectedLayerId === layer.id;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer.id)}
              onPointerDown={(e) => {
                onSelectLayer(layer.id);
                if (layer.locked) return;
                e.preventDefault();
                setDragState({
                  type: "layer",
                  id: layer.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  initialX: layer.x,
                  initialY: layer.y
                });
              }}
              className={cn(
                "absolute touch-none",
                !layer.locked && "cursor-move",
                isSelected ? "ring-2 ring-[var(--booth-primary)] ring-offset-1" : "hover:ring-2 hover:ring-[var(--booth-primary)]/50"
              )}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                transform: `rotate(${layer.rotation}deg)`,
                opacity: layer.opacity,
                zIndex: 30 + layer.zIndex
              }}
            >
              <img
                src={layer.imageDataUrl}
                alt=""
                className="pointer-events-none h-full w-full object-fill select-none"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
