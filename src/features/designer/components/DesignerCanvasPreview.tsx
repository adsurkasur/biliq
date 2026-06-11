import { useEffect, useRef, useState } from "react";
import type { EventConfig, OverlayLayer } from "@/domain/events/types";
import type { LayoutDefinition, LayoutSlot } from "@/domain/layouts/types";
import { cn } from "@/shared/lib/classNames";
import { DesignerTransformHandles, TransformAction } from "./DesignerTransformHandles";

const MIN_SIZE = 24;

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
    action: "move" | TransformAction;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    initialRotation: number;
    initialPointerAngle: number;
    aspectRatioLocked: boolean;
    aspectRatio: number;
  } | null>(null);

  const [snapGuides, setSnapGuides] = useState<{ type: "vertical" | "horizontal"; pos: number }[]>([]);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = eventConfig.outputWidth / rect.width;
      const scaleY = eventConfig.outputHeight / rect.height;

      const deltaX = (e.clientX - dragState.startX) * scaleX;
      const deltaY = (e.clientY - dragState.startY) * scaleY;

      let nextX = dragState.initialX;
      let nextY = dragState.initialY;
      let nextWidth = dragState.initialWidth;
      let nextHeight = dragState.initialHeight;
      let nextRotation = dragState.initialRotation;

      if (dragState.action === "move") {
        nextX += deltaX;
        nextY += deltaY;
      } else if (dragState.action.startsWith("resize-")) {
        const isLeft = dragState.action.includes("l");
        const isTop = dragState.action.includes("t");

        let dw = isLeft ? -deltaX : deltaX;
        let dh = isTop ? -deltaY : deltaY;

        if (e.altKey) {
          dw *= 2;
          dh *= 2;
        }

        nextWidth = Math.max(MIN_SIZE, dragState.initialWidth + dw);
        nextHeight = Math.max(MIN_SIZE, dragState.initialHeight + dh);

        if (dragState.aspectRatioLocked || e.shiftKey) {
          if (Math.abs(dw) > Math.abs(dh)) {
            nextHeight = nextWidth / dragState.aspectRatio;
          } else {
            nextWidth = nextHeight * dragState.aspectRatio;
          }
          if (nextWidth < MIN_SIZE) {
            nextWidth = MIN_SIZE;
            nextHeight = nextWidth / dragState.aspectRatio;
          }
          if (nextHeight < MIN_SIZE) {
            nextHeight = MIN_SIZE;
            nextWidth = nextHeight * dragState.aspectRatio;
          }
        }

        if (e.altKey) {
          const cx = dragState.initialX + dragState.initialWidth / 2;
          const cy = dragState.initialY + dragState.initialHeight / 2;
          nextX = cx - nextWidth / 2;
          nextY = cy - nextHeight / 2;
        } else {
          if (isLeft) {
            nextX = dragState.initialX + dragState.initialWidth - nextWidth;
          }
          if (isTop) {
            nextY = dragState.initialY + dragState.initialHeight - nextHeight;
          }
        }
      } else if (dragState.action === "rotate") {
        const centerX = dragState.initialX + dragState.initialWidth / 2;
        const centerY = dragState.initialY + dragState.initialHeight / 2;
        const screenCenterX = rect.left + (centerX / eventConfig.outputWidth) * rect.width;
        const screenCenterY = rect.top + (centerY / eventConfig.outputHeight) * rect.height;
        const currentAngle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);
        const deltaAngle = currentAngle - dragState.initialPointerAngle;
        nextRotation = dragState.initialRotation + deltaAngle * (180 / Math.PI);
        // Normalize rotation to 0-360 for cleanliness, though negative is fine.
        nextRotation = Math.round(nextRotation) % 360;
        if (nextRotation < 0) nextRotation += 360;
      }

      // Snapping (only for move/resize, not rotate)
      const guides: { type: "vertical" | "horizontal"; pos: number }[] = [];
      const SNAP_THRESHOLD = 12;
      const bypassSnapping = e.ctrlKey || e.metaKey;

      const snapValue = (val: number, targets: number[]) => {
        if (bypassSnapping) return val;
        for (const target of targets) {
          if (Math.abs(val - target) <= SNAP_THRESHOLD) return target;
        }
        return val;
      };

      if (!bypassSnapping && dragState.action !== "rotate") {
        const otherElements: { id: string, left: number, right: number, top: number, bottom: number, centerX: number, centerY: number }[] = [];
        
        layout.slots.forEach((slot, idx) => {
          if (dragState.type === "slot" && dragState.id === idx) return;
          otherElements.push({
            id: `slot-${idx}`,
            left: slot.x,
            right: slot.x + slot.width,
            top: slot.y,
            bottom: slot.y + slot.height,
            centerX: slot.x + slot.width / 2,
            centerY: slot.y + slot.height / 2
          });
        });

        visibleLayers.forEach(layer => {
          if (dragState.type === "layer" && dragState.id === layer.id) return;
          otherElements.push({
            id: `layer-${layer.id}`,
            left: layer.x,
            right: layer.x + layer.width,
            top: layer.y,
            bottom: layer.y + layer.height,
            centerX: layer.x + layer.width / 2,
            centerY: layer.y + layer.height / 2
          });
        });

        const hGaps = new Set<number>();
        const vGaps = new Set<number>();

        for (let i = 0; i < otherElements.length; i++) {
          for (let j = i + 1; j < otherElements.length; j++) {
            hGaps.add(Math.abs(otherElements[i].right - otherElements[j].left));
            hGaps.add(Math.abs(otherElements[j].right - otherElements[i].left));
            vGaps.add(Math.abs(otherElements[i].bottom - otherElements[j].top));
            vGaps.add(Math.abs(otherElements[j].bottom - otherElements[i].top));
          }
        }

        const vTargetsLeft = [0, eventConfig.outputWidth / 2, eventConfig.outputWidth];
        const vTargetsRight = [0, eventConfig.outputWidth / 2, eventConfig.outputWidth];
        const vTargetsCenter = [eventConfig.outputWidth / 2];

        const hTargetsTop = [0, eventConfig.outputHeight / 2, eventConfig.outputHeight];
        const hTargetsBottom = [0, eventConfig.outputHeight / 2, eventConfig.outputHeight];
        const hTargetsCenter = [eventConfig.outputHeight / 2];

        otherElements.forEach(el => {
          vTargetsLeft.push(el.left, el.right, el.centerX);
          vTargetsRight.push(el.left, el.right, el.centerX);
          vTargetsCenter.push(el.centerX);

          hTargetsTop.push(el.top, el.bottom, el.centerY);
          hTargetsBottom.push(el.top, el.bottom, el.centerY);
          hTargetsCenter.push(el.centerY);

          hGaps.forEach(gap => {
            if (gap > 0) {
              vTargetsLeft.push(el.right + gap);
              vTargetsRight.push(el.left - gap);
            }
          });

          vGaps.forEach(gap => {
            if (gap > 0) {
              hTargetsTop.push(el.bottom + gap);
              hTargetsBottom.push(el.top - gap);
            }
          });
        });

        // Snapping X edges depending on action
        if (dragState.action === "move" || dragState.action === "resize-tl" || dragState.action === "resize-bl") {
          const snappedX = snapValue(nextX, vTargetsLeft);
          if (snappedX !== nextX) {
            if (dragState.action !== "move") nextWidth += (nextX - snappedX);
            nextX = snappedX;
            guides.push({ type: "vertical", pos: snappedX });
          }
        }
        if (dragState.action === "move" || dragState.action === "resize-tr" || dragState.action === "resize-br") {
          const rightEdge = nextX + nextWidth;
          const snappedRight = snapValue(rightEdge, vTargetsRight);
          if (snappedRight !== rightEdge) {
            if (dragState.action === "move") {
              nextX += (snappedRight - rightEdge);
            } else {
              nextWidth += (snappedRight - rightEdge);
            }
            guides.push({ type: "vertical", pos: snappedRight });
          }
        }

        // Snapping Y edges
        if (dragState.action === "move" || dragState.action === "resize-tl" || dragState.action === "resize-tr") {
          const snappedY = snapValue(nextY, hTargetsTop);
          if (snappedY !== nextY) {
            if (dragState.action !== "move") nextHeight += (nextY - snappedY);
            nextY = snappedY;
            guides.push({ type: "horizontal", pos: snappedY });
          }
        }
        if (dragState.action === "move" || dragState.action === "resize-bl" || dragState.action === "resize-br") {
          const bottomEdge = nextY + nextHeight;
          const snappedBottom = snapValue(bottomEdge, hTargetsBottom);
          if (snappedBottom !== bottomEdge) {
            if (dragState.action === "move") {
              nextY += (snappedBottom - bottomEdge);
            } else {
              nextHeight += (snappedBottom - bottomEdge);
            }
            guides.push({ type: "horizontal", pos: snappedBottom });
          }
        }

        // Snap centers during move
        if (dragState.action === "move") {
          const centerX = nextX + nextWidth / 2;
          const snappedCenterX = snapValue(centerX, vTargetsCenter);
          if (snappedCenterX !== centerX) {
            nextX += (snappedCenterX - centerX);
            guides.push({ type: "vertical", pos: snappedCenterX });
          }

          const centerY = nextY + nextHeight / 2;
          const snappedCenterY = snapValue(centerY, hTargetsCenter);
          if (snappedCenterY !== centerY) {
            nextY += (snappedCenterY - centerY);
            guides.push({ type: "horizontal", pos: snappedCenterY });
          }
        }
      }

      setSnapGuides(guides);

      nextX = Math.round(nextX);
      nextY = Math.round(nextY);
      nextWidth = Math.round(nextWidth);
      nextHeight = Math.round(nextHeight);

      if (dragState.type === "slot" && onUpdateSlotNumber) {
        if (dragState.action === "move" || dragState.action.startsWith("resize")) {
          onUpdateSlotNumber(dragState.id as number, "x", nextX);
          onUpdateSlotNumber(dragState.id as number, "y", nextY);
        }
        if (dragState.action.startsWith("resize")) {
          onUpdateSlotNumber(dragState.id as number, "width", nextWidth);
          onUpdateSlotNumber(dragState.id as number, "height", nextHeight);
        }
        if (dragState.action === "rotate") {
          onUpdateSlotNumber(dragState.id as number, "rotation", nextRotation);
        }
      } else if (dragState.type === "layer" && onUpdateLayerNumber) {
        if (dragState.action === "move" || dragState.action.startsWith("resize")) {
          onUpdateLayerNumber(dragState.id as string, "x", nextX);
          onUpdateLayerNumber(dragState.id as string, "y", nextY);
        }
        if (dragState.action.startsWith("resize")) {
          onUpdateLayerNumber(dragState.id as string, "width", nextWidth);
          onUpdateLayerNumber(dragState.id as string, "height", nextHeight);
        }
        if (dragState.action === "rotate") {
          onUpdateLayerNumber(dragState.id as string, "rotation", nextRotation);
        }
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
      setSnapGuides([]);
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

        {snapGuides.map((guide, i) => (
          <div
            key={`guide-${i}`}
            className="absolute z-40 bg-[var(--booth-primary)]"
            style={{
              ...(guide.type === "vertical"
                ? { left: `${(guide.pos / eventConfig.outputWidth) * 100}%`, top: 0, bottom: 0, width: 1 }
                : { top: `${(guide.pos / eventConfig.outputHeight) * 100}%`, left: 0, right: 0, height: 1 }),
              opacity: 0.6
            }}
          />
        ))}

        {layout.slots.map((slot, index) => {
          const isSelected = selectedSlotIndex === index;
          return (
            <div key={`${slot.x}-${slot.y}-${slot.width}-${slot.height}-${index}`}>
              <button
                type="button"
                onClick={() => onSelectSlot(index)}
                onPointerDown={(e) => {
                  onSelectSlot(index);
                  e.preventDefault();
                  setDragState({
                    type: "slot",
                    id: index,
                    action: "move",
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: slot.x,
                    initialY: slot.y,
                    initialWidth: slot.width,
                    initialHeight: slot.height,
                    initialRotation: 0,
                    initialPointerAngle: 0,
                    aspectRatioLocked: !!slot.aspectRatioLocked,
                    aspectRatio: slot.width / slot.height
                  });
                }}
                className={cn(
                  "booth-focus-ring absolute grid place-items-center text-center text-xs font-black uppercase tracking-wide transition-[background-color] duration-200 touch-none",
                  isSelected
                    ? "z-20 bg-[var(--booth-primary-container)]/80 text-[var(--booth-on-primary-container)] border-2 border-solid border-[var(--booth-primary)]"
                    : "z-10 bg-[var(--booth-primary-container)]/20 text-[var(--booth-on-primary-container)] hover:bg-[var(--booth-primary-container)]/40 cursor-move border-2 border-dashed border-[#4A7C7380]"
                )}
                style={{
                  left: `${(slot.x / layout.canvasWidth) * 100}%`,
                  top: `${(slot.y / layout.canvasHeight) * 100}%`,
                  width: `${(slot.width / layout.canvasWidth) * 100}%`,
                  height: `${(slot.height / layout.canvasHeight) * 100}%`,
                  transform: `rotate(${slot.rotation ?? 0}deg)`,
                  borderRadius: `${(slot.borderRadius ?? 0) / 8}px`
                }}
              >
                Photo {index + 1}
              </button>
              
              {isSelected && (
                <DesignerTransformHandles
                  x={slot.x}
                  y={slot.y}
                  width={slot.width}
                  height={slot.height}
                  rotation={slot.rotation ?? 0}
                  canvasWidth={layout.canvasWidth}
                  canvasHeight={layout.canvasHeight}
                  canResize={true}
                  canRotate={true}
                  onPointerDown={(e, action) => {
                    let initialPointerAngle = 0;
                    if (action === "rotate" && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const centerX = slot.x + slot.width / 2;
                      const centerY = slot.y + slot.height / 2;
                      const screenCenterX = rect.left + (centerX / layout.canvasWidth) * rect.width;
                      const screenCenterY = rect.top + (centerY / layout.canvasHeight) * rect.height;
                      initialPointerAngle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);
                    }
                    
                    setDragState({
                      type: "slot",
                      id: index,
                      action,
                      startX: e.clientX,
                      startY: e.clientY,
                      initialX: slot.x,
                      initialY: slot.y,
                      initialWidth: slot.width,
                      initialHeight: slot.height,
                      initialRotation: slot.rotation ?? 0,
                      initialPointerAngle,
                      aspectRatioLocked: !!slot.aspectRatioLocked,
                      aspectRatio: slot.width / slot.height
                    });
                  }}
                />
              )}
            </div>
          );
        })}

        {visibleLayers.map((layer) => {
          const leftPercent = (layer.x / eventConfig.outputWidth) * 100;
          const topPercent = (layer.y / eventConfig.outputHeight) * 100;
          const widthPercent = (layer.width / eventConfig.outputWidth) * 100;
          const heightPercent = (layer.height / eventConfig.outputHeight) * 100;

          const isSelected = selectedLayerId === layer.id;

          return (
            <div key={layer.id}>
              <button
                type="button"
                onClick={() => onSelectLayer(layer.id)}
                onPointerDown={(e) => {
                  onSelectLayer(layer.id);
                  if (layer.locked) return;
                  e.preventDefault();
                  
                  setDragState({
                    type: "layer",
                    id: layer.id,
                    action: "move",
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: layer.x,
                    initialY: layer.y,
                    initialWidth: layer.width,
                    initialHeight: layer.height,
                    initialRotation: layer.rotation,
                    initialPointerAngle: 0,
                    aspectRatioLocked: !!layer.aspectRatioLocked,
                    aspectRatio: layer.width / layer.height
                  });
                }}
                className={cn(
                  "absolute touch-none",
                  !layer.locked && "cursor-move",
                  !isSelected && "hover:ring-2 hover:ring-[var(--booth-primary)]/50"
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
              
              {isSelected && !layer.locked && (
                <DesignerTransformHandles
                  x={layer.x}
                  y={layer.y}
                  width={layer.width}
                  height={layer.height}
                  rotation={layer.rotation}
                  canvasWidth={eventConfig.outputWidth}
                  canvasHeight={eventConfig.outputHeight}
                  canResize={true}
                  canRotate={true}
                  onPointerDown={(e, action) => {
                    let initialPointerAngle = 0;
                    if (action === "rotate" && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const centerX = layer.x + layer.width / 2;
                      const centerY = layer.y + layer.height / 2;
                      const screenCenterX = rect.left + (centerX / eventConfig.outputWidth) * rect.width;
                      const screenCenterY = rect.top + (centerY / eventConfig.outputHeight) * rect.height;
                      initialPointerAngle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);
                    }
                    
                    setDragState({
                      type: "layer",
                      id: layer.id,
                      action,
                      startX: e.clientX,
                      startY: e.clientY,
                      initialX: layer.x,
                      initialY: layer.y,
                      initialWidth: layer.width,
                      initialHeight: layer.height,
                      initialRotation: layer.rotation,
                      initialPointerAngle,
                      aspectRatioLocked: !!layer.aspectRatioLocked,
                      aspectRatio: layer.width / layer.height
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
