import { cn } from "@/shared/lib/classNames";
import { RotateCw } from "lucide-react";
import React from "react";
import { Tooltip } from "@/shared/components/ui/Tooltip";

export type TransformAction = 
  | "resize-tl" 
  | "resize-tr" 
  | "resize-bl" 
  | "resize-br" 
  | "resize-t"
  | "resize-r"
  | "resize-b"
  | "resize-l"
  | "rotate";

interface DesignerTransformHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  canvasWidth: number;
  canvasHeight: number;
  canResize?: boolean;
  canRotate?: boolean;
  guideTarget?: string;
  onPointerDown: (e: React.PointerEvent, action: TransformAction) => void;
}

export function DesignerTransformHandles({
  x,
  y,
  width,
  height,
  rotation = 0,
  canvasWidth,
  canvasHeight,
  canResize = true,
  canRotate = false,
  guideTarget,
  onPointerDown
}: DesignerTransformHandlesProps) {
  const leftPercent = (x / canvasWidth) * 100;
  const topPercent = (y / canvasHeight) * 100;
  const widthPercent = (width / canvasWidth) * 100;
  const heightPercent = (height / canvasHeight) * 100;

  const handleClass =
    "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-[var(--booth-primary)] shadow-md touch-none pointer-events-auto hover:scale-110 active:scale-95 transition-transform grid place-items-center";
  const sideHandleClass =
    "absolute rounded-full border border-white/55 bg-[var(--booth-primary)] shadow-md touch-none pointer-events-auto transition-transform hover:scale-110 active:scale-95";

  return (
    <div
      className="absolute pointer-events-none z-50"
      data-guide-target={guideTarget === "transform-handles" ? "resize-handles" : guideTarget}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        transform: `rotate(${rotation}deg)`
      }}
    >
      {/* Bounding box outline */}
      <div className="absolute inset-0 border-2 border-[var(--booth-primary)] opacity-80" />

      {/* Rotation handle */}
      {canRotate && (
        <>
          <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 -translate-y-full bg-[var(--booth-primary)] opacity-80" />
          <Tooltip content="Drag to rotate.">
            <button
              type="button"
              className={cn(handleClass, "left-1/2 top-[-32px] cursor-grab active:cursor-grabbing")}
              data-guide-target="rotation-handle"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "rotate");
              }}
            >
              <RotateCw className="h-3 w-3 text-white" />
            </button>
          </Tooltip>
        </>
      )}

      {/* Resize handles */}
      {canResize && (
        <>
            <button
              type="button"
              className={cn(sideHandleClass, "left-1/2 top-0 h-3 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize")}
              aria-label="Resize height from top"
              title="Drag to resize vertically. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-t");
              }}
            />
            <button
              type="button"
              className={cn(sideHandleClass, "right-0 top-1/2 h-8 w-3 translate-x-1/2 -translate-y-1/2 cursor-ew-resize")}
              aria-label="Resize width from right"
              title="Drag to resize horizontally. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-r");
              }}
            />
            <button
              type="button"
              className={cn(sideHandleClass, "bottom-0 left-1/2 h-3 w-8 -translate-x-1/2 translate-y-1/2 cursor-ns-resize")}
              aria-label="Resize height from bottom"
              title="Drag to resize vertically. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-b");
              }}
            />
            <button
              type="button"
              className={cn(sideHandleClass, "left-0 top-1/2 h-8 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize")}
              aria-label="Resize width from left"
              title="Drag to resize horizontally. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-l");
              }}
            />
            <button
              type="button"
              className={cn(handleClass, "left-0 top-0 cursor-nwse-resize")}
              aria-label="Resize from top left"
              title="Drag to resize. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-tl");
              }}
            />
            <button
              type="button"
              className={cn(handleClass, "right-0 top-0 translate-x-1/2 cursor-nesw-resize")}
              aria-label="Resize from top right"
              title="Drag to resize. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-tr");
              }}
            />
            <button
              type="button"
              className={cn(handleClass, "bottom-0 left-0 translate-y-1/2 cursor-nesw-resize")}
              aria-label="Resize from bottom left"
              title="Drag to resize. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-bl");
              }}
            />
            <button
              type="button"
              className={cn(handleClass, "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize")}
              aria-label="Resize from bottom right"
              title="Drag to resize. Hold Shift to keep proportions."
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPointerDown(e, "resize-br");
              }}
            />
        </>
      )}
    </div>
  );
}
