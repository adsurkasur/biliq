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
  onInteraction?: (interaction: "move" | "resize" | "rotate" | "snap") => void;
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
  onUpdateLayerNumber,
  onInteraction
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
  const [didSnap, setDidSnap] = useState(false);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = eventConfig.outputWidth / rect.width;
      const scaleY = eventConfig.outputHeight / rect.height;

      const deltaX = (e.clientX - dragState.startX) * scaleX;
      const deltaY = (e.clientY - dragState.startY) * scaleY;

      let rawDeltaX = deltaX;
      let rawDeltaY = deltaY;

      if (dragState.action === "move" && e.shiftKey) {
        if (Math.abs(rawDeltaX) > Math.abs(rawDeltaY)) {
          rawDeltaY = 0;
        } else {
          rawDeltaX = 0;
        }
      }

      let nextX = dragState.initialX;
      let nextY = dragState.initialY;
      let nextWidth = dragState.initialWidth;
      let nextHeight = dragState.initialHeight;
      let nextRotation = dragState.initialRotation;

      const bypassSnapping = e.ctrlKey || e.metaKey;
      const SNAP_THRESHOLD = 12;
      const guides: { type: "vertical" | "horizontal"; pos: number }[] = [];

      if (dragState.action === "move" || dragState.action.startsWith("resize-")) {
        const isResize = dragState.action.startsWith("resize-");
        const isLeft = isResize && ["resize-tl", "resize-bl", "resize-l"].includes(dragState.action);
        const isRight = isResize && ["resize-tr", "resize-br", "resize-r"].includes(dragState.action);
        const isTop = isResize && ["resize-tl", "resize-tr", "resize-t"].includes(dragState.action);
        const isBottom = isResize && ["resize-bl", "resize-br", "resize-b"].includes(dragState.action);
        const affectsHorizontal = isLeft || isRight;
        const affectsVertical = isTop || isBottom;
        const isCorner = affectsHorizontal && affectsVertical;
        const preserveAspect = Boolean(
          isResize && (e.shiftKey || (isCorner && dragState.aspectRatioLocked))
        );

        if (isResize) {
          let dw = affectsHorizontal ? (isLeft ? -rawDeltaX : rawDeltaX) : 0;
          let dh = affectsVertical ? (isTop ? -rawDeltaY : rawDeltaY) : 0;

          if (e.altKey) {
            if (affectsHorizontal) dw *= 2;
            if (affectsVertical) dh *= 2;
          }

          if (preserveAspect) {
            if (!affectsVertical || Math.abs(dw) > Math.abs(dh)) {
              dh = dw / dragState.aspectRatio;
            } else {
              dw = dh * dragState.aspectRatio;
            }
          }

          nextWidth = Math.max(MIN_SIZE, dragState.initialWidth + dw);
          nextHeight = Math.max(MIN_SIZE, dragState.initialHeight + dh);

          if (preserveAspect) {
            if (nextWidth === MIN_SIZE) {
              nextHeight = nextWidth / dragState.aspectRatio;
            } else if (nextHeight === MIN_SIZE) {
              nextWidth = nextHeight * dragState.aspectRatio;
            }
          }

          if (e.altKey) {
            const cx = dragState.initialX + dragState.initialWidth / 2;
            const cy = dragState.initialY + dragState.initialHeight / 2;
            nextX = cx - nextWidth / 2;
            nextY = cy - nextHeight / 2;
          } else {
            nextX = isLeft
              ? dragState.initialX + dragState.initialWidth - nextWidth
              : preserveAspect && !affectsHorizontal
                ? dragState.initialX + (dragState.initialWidth - nextWidth) / 2
                : dragState.initialX;
            nextY = isTop
              ? dragState.initialY + dragState.initialHeight - nextHeight
              : preserveAspect && !affectsVertical
                ? dragState.initialY + (dragState.initialHeight - nextHeight) / 2
                : dragState.initialY;
          }
        } else {
          nextX = dragState.initialX + rawDeltaX;
          nextY = dragState.initialY + rawDeltaY;
        }

        if (!bypassSnapping) {
          const otherElements: { id: string, left: number, right: number, top: number, bottom: number, centerX: number, centerY: number }[] = [];
          
          layout.slots.forEach((slot, idx) => {
            if (dragState.type === "slot" && dragState.id === idx) return;
            otherElements.push({
              id: `slot-${idx}`,
              left: slot.x, right: slot.x + slot.width,
              top: slot.y, bottom: slot.y + slot.height,
              centerX: slot.x + slot.width / 2, centerY: slot.y + slot.height / 2
            });
          });

          visibleLayers.forEach(layer => {
            if (dragState.type === "layer" && dragState.id === layer.id) return;
            otherElements.push({
              id: `layer-${layer.id}`,
              left: layer.x, right: layer.x + layer.width,
              top: layer.y, bottom: layer.y + layer.height,
              centerX: layer.x + layer.width / 2, centerY: layer.y + layer.height / 2
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

          type SnapPoint = { delta: number, pos: number, type: "vertical" | "horizontal" };
          let bestSnapX: SnapPoint | null = null;
          let bestSnapY: SnapPoint | null = null;

          const evaluateSnap = (currentVal: number, targets: number[], type: "vertical" | "horizontal"): SnapPoint | null => {
            let best: SnapPoint | null = null;
            for (const target of targets) {
              const delta = target - currentVal;
              if (Math.abs(delta) <= SNAP_THRESHOLD) {
                if (!best || Math.abs(delta) < Math.abs(best.delta)) {
                  best = { delta, pos: target, type };
                }
              }
            }
            return best;
          };

          const snapsX: (SnapPoint | null)[] = [];
          if (!isResize || isLeft) snapsX.push(evaluateSnap(nextX, vTargetsLeft, "vertical"));
          if (!isResize || isRight) snapsX.push(evaluateSnap(nextX + nextWidth, vTargetsRight, "vertical"));
          if (!isResize) snapsX.push(evaluateSnap(nextX + nextWidth / 2, vTargetsCenter, "vertical"));

          for (const s of snapsX) {
            if (s && (!bestSnapX || Math.abs(s.delta) < Math.abs(bestSnapX.delta))) bestSnapX = s;
          }

          const snapsY: (SnapPoint | null)[] = [];
          if (!isResize || isTop) snapsY.push(evaluateSnap(nextY, hTargetsTop, "horizontal"));
          if (!isResize || isBottom) snapsY.push(evaluateSnap(nextY + nextHeight, hTargetsBottom, "horizontal"));
          if (!isResize) snapsY.push(evaluateSnap(nextY + nextHeight / 2, hTargetsCenter, "horizontal"));

          for (const s of snapsY) {
            if (s && (!bestSnapY || Math.abs(s.delta) < Math.abs(bestSnapY.delta))) bestSnapY = s;
          }

          if (isResize) {
            if (preserveAspect) {
              let snap: SnapPoint | null = null;
              if (bestSnapX && bestSnapY) {
                snap = Math.abs(bestSnapX.delta) < Math.abs(bestSnapY.delta) ? bestSnapX : bestSnapY;
              } else {
                snap = bestSnapX || bestSnapY;
              }
              
              if (snap) {
                if (snap.type === "vertical") {
                  let wDelta = isLeft ? -snap.delta : snap.delta;
                  if (e.altKey) wDelta *= 2;
                  nextWidth = Math.max(MIN_SIZE, nextWidth + wDelta);
                  nextHeight = Math.max(MIN_SIZE, nextWidth / dragState.aspectRatio);
                  nextWidth = nextHeight * dragState.aspectRatio;
                } else {
                  let hDelta = isTop ? -snap.delta : snap.delta;
                  if (e.altKey) hDelta *= 2;
                  nextHeight = Math.max(MIN_SIZE, nextHeight + hDelta);
                  nextWidth = Math.max(MIN_SIZE, nextHeight * dragState.aspectRatio);
                  nextHeight = nextWidth / dragState.aspectRatio;
                }
                
                if (e.altKey) {
                  nextX = dragState.initialX + dragState.initialWidth / 2 - nextWidth / 2;
                  nextY = dragState.initialY + dragState.initialHeight / 2 - nextHeight / 2;
                } else {
                  nextX = isLeft
                    ? dragState.initialX + dragState.initialWidth - nextWidth
                    : !affectsHorizontal
                      ? dragState.initialX + (dragState.initialWidth - nextWidth) / 2
                      : dragState.initialX;
                  nextY = isTop
                    ? dragState.initialY + dragState.initialHeight - nextHeight
                    : !affectsVertical
                      ? dragState.initialY + (dragState.initialHeight - nextHeight) / 2
                      : dragState.initialY;
                }
                guides.push({ type: snap.type, pos: snap.pos });
              }
            } else {
              if (bestSnapX) {
                let wDelta = isLeft ? -bestSnapX.delta : bestSnapX.delta;
                if (e.altKey) wDelta *= 2;
                nextWidth = Math.max(MIN_SIZE, nextWidth + wDelta);
                if (e.altKey) {
                  nextX = dragState.initialX + dragState.initialWidth / 2 - nextWidth / 2;
                } else {
                  nextX = isLeft ? dragState.initialX + dragState.initialWidth - nextWidth : dragState.initialX;
                }
                guides.push({ type: bestSnapX.type, pos: bestSnapX.pos });
              }
              if (bestSnapY) {
                let hDelta = isTop ? -bestSnapY.delta : bestSnapY.delta;
                if (e.altKey) hDelta *= 2;
                nextHeight = Math.max(MIN_SIZE, nextHeight + hDelta);
                if (e.altKey) {
                  nextY = dragState.initialY + dragState.initialHeight / 2 - nextHeight / 2;
                } else {
                  nextY = isTop ? dragState.initialY + dragState.initialHeight - nextHeight : dragState.initialY;
                }
                guides.push({ type: bestSnapY.type, pos: bestSnapY.pos });
              }
            }
          } else {
            if (bestSnapX) {
              nextX += bestSnapX.delta;
              guides.push({ type: bestSnapX.type, pos: bestSnapX.pos });
            }
            if (bestSnapY) {
              nextY += bestSnapY.delta;
              guides.push({ type: bestSnapY.type, pos: bestSnapY.pos });
            }
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
        nextRotation = Math.round(nextRotation) % 360;
        if (nextRotation < 0) nextRotation += 360;
        if (e.shiftKey) nextRotation = Math.round(nextRotation / 15) * 15;
      }

      setSnapGuides(guides);
      if (guides.length > 0) setDidSnap(true);

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
      if (dragState) {
        if (dragState.action === "move") onInteraction?.("move");
        else if (dragState.action.startsWith("resize")) onInteraction?.("resize");
        else if (dragState.action === "rotate") onInteraction?.("rotate");
        
        if (didSnap) onInteraction?.("snap");
      }
      setDragState(null);
      setSnapGuides([]);
      setDidSnap(false);
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

  const selectedSlot = selectedSlotIndex !== null ? layout.slots[selectedSlotIndex] ?? null : null;
  const selectedLayer = selectedLayerId ? visibleLayers.find((layer) => layer.id === selectedLayerId) ?? null : null;

  return (
    <section className="motion-card rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/20 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-1)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Canvas preview
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            {eventConfig.outputWidth} x {eventConfig.outputHeight} px
          </h2>
        </div>
        <p className="text-sm font-semibold text-[var(--booth-on-surface-variant)]">
          {layout.slots.length} photo area{layout.slots.length === 1 ? "" : "s"}, {overlayLayers.length} overlay{overlayLayers.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        ref={canvasRef}
        className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)]"
        data-guide-target="live-layout-preview canvas-viewport"
        style={{ aspectRatio: `${eventConfig.outputWidth} / ${eventConfig.outputHeight}` }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[var(--booth-radius-lg)]">
          <div
            className="pointer-events-none absolute inset-0"
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
                data-guide-target={index === 0 ? "photo-slot" : undefined}
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
              
            </div>
          );
        })}
        </div>

        {selectedSlot && selectedSlotIndex !== null ? (
          <DesignerTransformHandles
            x={selectedSlot.x}
            y={selectedSlot.y}
            width={selectedSlot.width}
            height={selectedSlot.height}
            rotation={selectedSlot.rotation ?? 0}
            canvasWidth={layout.canvasWidth}
            canvasHeight={layout.canvasHeight}
            canResize
            canRotate
            guideTarget="transform-handles"
            onPointerDown={(event, action) => {
              let initialPointerAngle = 0;
              if (action === "rotate" && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const centerX = selectedSlot.x + selectedSlot.width / 2;
                const centerY = selectedSlot.y + selectedSlot.height / 2;
                initialPointerAngle = Math.atan2(
                  event.clientY - (rect.top + (centerY / layout.canvasHeight) * rect.height),
                  event.clientX - (rect.left + (centerX / layout.canvasWidth) * rect.width)
                );
              }
              setDragState({
                type: "slot",
                id: selectedSlotIndex,
                action,
                startX: event.clientX,
                startY: event.clientY,
                initialX: selectedSlot.x,
                initialY: selectedSlot.y,
                initialWidth: selectedSlot.width,
                initialHeight: selectedSlot.height,
                initialRotation: selectedSlot.rotation ?? 0,
                initialPointerAngle,
                aspectRatioLocked: Boolean(selectedSlot.aspectRatioLocked),
                aspectRatio: selectedSlot.width / selectedSlot.height
              });
            }}
          />
        ) : null}

        {selectedLayer && !selectedLayer.locked ? (
          <DesignerTransformHandles
            x={selectedLayer.x}
            y={selectedLayer.y}
            width={selectedLayer.width}
            height={selectedLayer.height}
            rotation={selectedLayer.rotation}
            canvasWidth={eventConfig.outputWidth}
            canvasHeight={eventConfig.outputHeight}
            canResize
            canRotate
            guideTarget="transform-handles"
            onPointerDown={(event, action) => {
              let initialPointerAngle = 0;
              if (action === "rotate" && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const centerX = selectedLayer.x + selectedLayer.width / 2;
                const centerY = selectedLayer.y + selectedLayer.height / 2;
                initialPointerAngle = Math.atan2(
                  event.clientY - (rect.top + (centerY / eventConfig.outputHeight) * rect.height),
                  event.clientX - (rect.left + (centerX / eventConfig.outputWidth) * rect.width)
                );
              }
              setDragState({
                type: "layer",
                id: selectedLayer.id,
                action,
                startX: event.clientX,
                startY: event.clientY,
                initialX: selectedLayer.x,
                initialY: selectedLayer.y,
                initialWidth: selectedLayer.width,
                initialHeight: selectedLayer.height,
                initialRotation: selectedLayer.rotation,
                initialPointerAngle,
                aspectRatioLocked: Boolean(selectedLayer.aspectRatioLocked),
                aspectRatio: selectedLayer.width / selectedLayer.height
              });
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
