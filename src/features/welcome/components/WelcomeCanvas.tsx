"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import type {
  OverlayLayer,
  WelcomeScreenConfig,
  WelcomeScreenElement
} from "@/domain/events/types";
import { CameraPreview } from "@/features/booth/components/CameraPreview";
import {
  DesignerTransformHandles,
  type TransformAction
} from "@/features/designer/components/DesignerTransformHandles";
import {
  snapMovedRect,
  snapResizedRect,
  type CanvasRect,
  type CanvasSnapGuide
} from "@/features/designer/lib/canvasSnapping";
import type { WelcomeSelection } from "@/features/welcome/hooks/useWelcomeScreenDesigner";
import { cn } from "@/shared/lib/classNames";

const MIN_SIZE = 24;

interface WelcomeCanvasProps {
  config: WelcomeScreenConfig;
  selection: WelcomeSelection;
  onSelect: (selection: WelcomeSelection) => void;
  onUpdateElement: (id: string, updates: Partial<WelcomeScreenElement>) => void;
  onUpdateLayer: (id: string, updates: Partial<OverlayLayer>) => void;
}

interface DragState {
  kind: "element" | "layer";
  id: string;
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
}

export function WelcomeCanvas({
  config,
  selection,
  onSelect,
  onUpdateElement,
  onUpdateLayer
}: WelcomeCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [snapGuides, setSnapGuides] = useState<CanvasSnapGuide[]>([]);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      let deltaX = (event.clientX - dragState.startX) * (config.canvasWidth / rect.width);
      let deltaY = (event.clientY - dragState.startY) * (config.canvasHeight / rect.height);
      let x = dragState.initialX;
      let y = dragState.initialY;
      let width = dragState.initialWidth;
      let height = dragState.initialHeight;
      let rotation = dragState.initialRotation;
      let guides: CanvasSnapGuide[] = [];
      const bypassSnapping = event.ctrlKey || event.metaKey;
      const otherRects: CanvasRect[] = [
        ...config.elements
          .filter((element) => !(dragState.kind === "element" && element.id === dragState.id))
          .map(({ x, y, width, height }) => ({ x, y, width, height })),
        ...config.overlayLayers
          .filter((layer) => layer.visible && !(dragState.kind === "layer" && layer.id === dragState.id))
          .map(({ x, y, width, height }) => ({ x, y, width, height }))
      ];

      if (dragState.action === "move") {
        if (event.shiftKey) {
          if (Math.abs(deltaX) >= Math.abs(deltaY)) deltaY = 0;
          else deltaX = 0;
        }
        x += deltaX;
        y += deltaY;
        if (!bypassSnapping) {
          const snapped = snapMovedRect({
            rect: { x, y, width, height },
            canvasWidth: config.canvasWidth,
            canvasHeight: config.canvasHeight,
            otherRects
          });
          ({ x, y, width, height } = snapped.rect);
          guides = snapped.guides;
        }
      } else if (dragState.action === "rotate") {
        const centerX = dragState.initialX + dragState.initialWidth / 2;
        const centerY = dragState.initialY + dragState.initialHeight / 2;
        const screenCenterX = rect.left + (centerX / config.canvasWidth) * rect.width;
        const screenCenterY = rect.top + (centerY / config.canvasHeight) * rect.height;
        const currentAngle = Math.atan2(event.clientY - screenCenterY, event.clientX - screenCenterX);
        rotation = dragState.initialRotation +
          (currentAngle - dragState.initialPointerAngle) * (180 / Math.PI);
        if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
      } else {
        const action = dragState.action;
        const isLeft = ["resize-tl", "resize-bl", "resize-l"].includes(action);
        const isRight = ["resize-tr", "resize-br", "resize-r"].includes(action);
        const isTop = ["resize-tl", "resize-tr", "resize-t"].includes(action);
        const isBottom = ["resize-bl", "resize-br", "resize-b"].includes(action);
        const horizontal = isLeft || isRight;
        const vertical = isTop || isBottom;
        const corner = horizontal && vertical;
        const keepRatio = event.shiftKey || (corner && dragState.aspectRatioLocked);
        let widthDelta = horizontal ? (isLeft ? -deltaX : deltaX) : 0;
        let heightDelta = vertical ? (isTop ? -deltaY : deltaY) : 0;

        if (event.altKey) {
          widthDelta *= horizontal ? 2 : 1;
          heightDelta *= vertical ? 2 : 1;
        }

        const ratio = dragState.aspectRatio;
        if (keepRatio) {
          if (!vertical || Math.abs(widthDelta) >= Math.abs(heightDelta)) {
            heightDelta = widthDelta / ratio;
          } else {
            widthDelta = heightDelta * ratio;
          }
        }

        width = Math.max(MIN_SIZE, dragState.initialWidth + widthDelta);
        height = Math.max(MIN_SIZE, dragState.initialHeight + heightDelta);
        if (event.altKey) {
          x = dragState.initialX + (dragState.initialWidth - width) / 2;
          y = dragState.initialY + (dragState.initialHeight - height) / 2;
        } else {
          x = isLeft
            ? dragState.initialX + dragState.initialWidth - width
            : keepRatio && !horizontal
              ? dragState.initialX + (dragState.initialWidth - width) / 2
              : dragState.initialX;
          y = isTop
            ? dragState.initialY + dragState.initialHeight - height
            : keepRatio && !vertical
              ? dragState.initialY + (dragState.initialHeight - height) / 2
              : dragState.initialY;
        }

        if (!bypassSnapping) {
          const snapped = snapResizedRect({
            rect: { x, y, width, height },
            canvasWidth: config.canvasWidth,
            canvasHeight: config.canvasHeight,
            otherRects,
            edges: { left: isLeft, right: isRight, top: isTop, bottom: isBottom },
            preserveAspect: keepRatio,
            aspectRatio: ratio,
            centered: event.altKey
          });
          ({ x, y, width, height } = snapped.rect);
          guides = snapped.guides;
        }
      }

      setSnapGuides(guides);

      const updates = {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        rotation: Math.round(rotation)
      };
      if (dragState.kind === "element") onUpdateElement(dragState.id, updates);
      else onUpdateLayer(dragState.id, updates);
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
  }, [config.canvasHeight, config.canvasWidth, dragState, onUpdateElement, onUpdateLayer]);

  function beginInteraction(
    event: React.PointerEvent,
    kind: "element" | "layer",
    id: string,
    action: "move" | TransformAction,
    object: { x: number; y: number; width: number; height: number; rotation: number },
    aspectRatioLocked: boolean
  ) {
    event.preventDefault();
    event.stopPropagation();
    onSelect({ kind, id });
    let initialPointerAngle = 0;
    if (action === "rotate" && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = object.x + object.width / 2;
      const centerY = object.y + object.height / 2;
      const screenCenterX = rect.left + (centerX / config.canvasWidth) * rect.width;
      const screenCenterY = rect.top + (centerY / config.canvasHeight) * rect.height;
      initialPointerAngle = Math.atan2(event.clientY - screenCenterY, event.clientX - screenCenterX);
    }
    setDragState({
      kind,
      id,
      action,
      startX: event.clientX,
      startY: event.clientY,
      initialX: object.x,
      initialY: object.y,
      initialWidth: object.width,
      initialHeight: object.height,
      initialRotation: object.rotation,
      initialPointerAngle,
      aspectRatioLocked,
      aspectRatio: object.width / object.height
    });
  }

  return (
    <section className="motion-card rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/25 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-1)]" data-app-guide="welcome-canvas">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-primary)]">Live welcome canvas</p>
          <h2 className="mt-1 text-xl font-bold">{config.canvasWidth} × {config.canvasHeight}px</h2>
        </div>
        <p className="text-sm text-[var(--booth-on-surface-variant)]">
          Shift: axis/ratio · Alt: resize from center · Ctrl/Cmd: free placement
        </p>
      </div>

      <div
        ref={canvasRef}
        className="relative mx-auto w-full max-w-[720px]"
        style={{
          aspectRatio: `${config.canvasWidth} / ${config.canvasHeight}`,
          containerType: "inline-size"
        }}
      >
        <CameraPreview
          videoRef={videoRef}
          preferredFacingMode={config.cameraFacingMode}
          outputWidth={config.canvasWidth}
          outputHeight={config.canvasHeight}
          overlayLayers={[]}
          videoVisible={config.showCamera}
          videoFit={config.cameraFit}
          className="h-full w-full rounded-[var(--booth-radius-lg)] ring-1 ring-[var(--booth-outline-variant)]/35"
          style={{ backgroundColor: config.backgroundColor }}
        />

        <div className="pointer-events-none absolute inset-0 z-30 overflow-visible rounded-[var(--booth-radius-lg)]">
          <div
            className={cn(
              "absolute inset-0 rounded-[var(--booth-radius-lg)] transition-opacity duration-[var(--booth-duration-medium)]",
              config.showCamera
                ? "bg-gradient-to-b from-black/45 via-transparent to-black/55"
                : "opacity-100"
            )}
            style={{ backgroundColor: config.showCamera ? undefined : config.backgroundColor }}
          />

          {!config.showCamera ? (
            <div className="absolute inset-0 grid place-items-center text-white/35">
              <Camera className="h-20 w-20" />
            </div>
          ) : null}

          {snapGuides.map((guide, index) => (
            <div
              key={`${guide.type}-${guide.pos}-${index}`}
              className="absolute z-[70] bg-[var(--booth-primary)] shadow-[0_0_0_1px_rgba(255,255,255,.25)]"
              style={guide.type === "vertical"
                ? { left: `${(guide.pos / config.canvasWidth) * 100}%`, top: "-8%", bottom: "-8%", width: 1 }
                : { top: `${(guide.pos / config.canvasHeight) * 100}%`, left: "-8%", right: "-8%", height: 1 }}
            />
          ))}

          {config.overlayLayers.filter((layer) => layer.visible).map((layer) => {
            const selected = selection.kind === "layer" && selection.id === layer.id;
            return (
              <div key={layer.id}>
                <button
                  type="button"
                  aria-label={`Select ${layer.name}`}
                  onPointerDown={(event) => {
                    if (layer.locked) {
                      onSelect({ kind: "layer", id: layer.id });
                      return;
                    }
                    beginInteraction(event, "layer", layer.id, "move", layer, Boolean(layer.aspectRatioLocked));
                  }}
                  className={cn("pointer-events-auto absolute touch-none", selected ? "ring-2 ring-[var(--booth-primary)]" : "hover:ring-2 hover:ring-[var(--booth-primary)]/45")}
                  style={{
                    left: `${(layer.x / config.canvasWidth) * 100}%`,
                    top: `${(layer.y / config.canvasHeight) * 100}%`,
                    width: `${(layer.width / config.canvasWidth) * 100}%`,
                    height: `${(layer.height / config.canvasHeight) * 100}%`,
                    transform: `rotate(${layer.rotation}deg)`,
                    opacity: layer.opacity,
                    zIndex: 20 + layer.zIndex
                  }}
                >
                  <img src={layer.imageDataUrl} alt="" className="pointer-events-none h-full w-full select-none object-fill" draggable={false} />
                </button>
                {selected && !layer.locked ? (
                  <DesignerTransformHandles
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    rotation={layer.rotation}
                    canvasWidth={config.canvasWidth}
                    canvasHeight={config.canvasHeight}
                    canRotate
                    canResize
                    onPointerDown={(event, action) => beginInteraction(event, "layer", layer.id, action, layer, Boolean(layer.aspectRatioLocked))}
                  />
                ) : null}
              </div>
            );
          })}

          {config.elements.filter((element) => element.visible).map((element) => {
            const selected = selection.kind === "element" && selection.id === element.id;
            return (
              <div key={element.id}>
                <button
                  type="button"
                  onPointerDown={(event) => beginInteraction(event, "element", element.id, "move", element, false)}
                  className={cn(
                    "pointer-events-auto absolute grid touch-none place-items-center overflow-hidden px-3 text-center leading-tight",
                    selected ? "ring-2 ring-[var(--booth-primary)]" : "hover:ring-2 hover:ring-[var(--booth-primary)]/45"
                  )}
                  style={{
                    left: `${(element.x / config.canvasWidth) * 100}%`,
                    top: `${(element.y / config.canvasHeight) * 100}%`,
                    width: `${(element.width / config.canvasWidth) * 100}%`,
                    height: `${(element.height / config.canvasHeight) * 100}%`,
                    transform: `rotate(${element.rotation}deg)`,
                    opacity: element.opacity,
                    color: element.color,
                    backgroundColor: element.type === "start-button" ? element.backgroundColor : "transparent",
                    borderRadius: element.borderRadius,
                    fontSize: `clamp(12px, ${(element.fontSize / config.canvasWidth) * 100}cqw, ${element.fontSize}px)`,
                    fontWeight: element.fontWeight,
                    zIndex: 40
                  }}
                  aria-label={`Select ${element.type}`}
                >
                  {element.text}
                </button>
                {selected ? (
                  <DesignerTransformHandles
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    rotation={element.rotation}
                    canvasWidth={config.canvasWidth}
                    canvasHeight={config.canvasHeight}
                    canRotate
                    canResize
                    onPointerDown={(event, action) => beginInteraction(event, "element", element.id, action, element, false)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
