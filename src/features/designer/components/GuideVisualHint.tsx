"use client";

import { MousePointer2, Move, RotateCw } from "lucide-react";
import { cn } from "@/shared/lib/classNames";

export type GuideHintType = "move" | "resize" | "rotate" | "snap" | null;

interface GuideVisualHintProps {
  type: GuideHintType;
  targetRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  isExiting?: boolean;
}

export function GuideVisualHint({ type, targetRect, isExiting }: GuideVisualHintProps) {
  if (!type || !targetRect) return null;

  switch (type) {
    case "move":
      return (
        <div 
          className={cn(
            "fixed z-[61] pointer-events-none flex flex-col items-center gap-2 guide-hint-position",
            isExiting ? "opacity-0" : "motion-guide-hint opacity-100"
          )}
          style={{
            top: targetRect.top + targetRect.height / 2,
            left: targetRect.left + targetRect.width / 2,
            transform: "translate(-50%, -50%)",
            transitionProperty: "top, left, transform, opacity",
            transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div className="flex items-center gap-2 text-[var(--booth-primary)] drop-shadow-md">
            <MousePointer2 className="h-5 w-5 fill-[var(--booth-on-primary-container)]/80 text-[var(--booth-primary)]" />
            <Move className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-[var(--booth-primary-container)] px-2 py-0.5 text-xs font-semibold text-[var(--booth-on-primary-container)] shadow-sm backdrop-blur-sm">
            Drag to move
          </span>
        </div>
      );

    case "resize":
      return (
        <div 
          className={cn(
            "fixed z-[61] pointer-events-none guide-hint-position",
            isExiting ? "opacity-0" : "motion-guide-hint opacity-100"
          )}
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            transitionProperty: "top, left, width, height, opacity",
            transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div className="absolute -left-3 -top-3 flex items-center gap-1">
            <span className="rounded-full bg-[var(--booth-primary-container)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--booth-on-primary-container)] shadow-sm backdrop-blur-sm">
              Resize
            </span>
          </div>
          <div className="absolute -bottom-3 -right-3 flex items-center gap-1">
            <span className="rounded-full bg-[var(--booth-primary-container)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--booth-on-primary-container)] shadow-sm backdrop-blur-sm">
              Resize
            </span>
          </div>
        </div>
      );

    case "rotate":
      return (
        <div 
          className={cn(
            "fixed z-[61] pointer-events-none flex flex-col items-center guide-hint-position",
            isExiting ? "opacity-0" : "motion-guide-hint opacity-100"
          )}
          style={{
            top: targetRect.top - 48,
            left: targetRect.left + targetRect.width / 2,
            transform: "translateX(-50%)",
            transitionProperty: "top, left, transform, opacity",
            transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <span className="mb-1 rounded-full bg-[var(--booth-primary-container)] px-2 py-0.5 text-xs font-semibold text-[var(--booth-on-primary-container)] shadow-sm backdrop-blur-sm">
            Rotate
          </span>
          <RotateCw className="h-5 w-5 text-[var(--booth-primary)] drop-shadow-md" />
        </div>
      );

    case "snap":
      // Show illustrative snap lines inside the target rect
      
      return (
        <div 
          className={cn(
            "fixed z-[61] pointer-events-none overflow-hidden guide-hint-position",
            isExiting ? "opacity-0" : "motion-guide-hint opacity-100"
          )}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        >
          {/* Vertical center line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-[var(--booth-primary)]/60"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          />
          {/* Horizontal center line */}
          <div 
            className="absolute left-0 right-0 h-0.5 bg-[var(--booth-primary)]/60"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />
          <div 
            className="absolute flex flex-col items-center"
            style={{
              top: "calc(50% - 24px)",
              left: "calc(50% + 12px)",
            }}
          >
            <span className="rounded-full bg-[var(--booth-primary-container)] px-2 py-0.5 text-xs font-semibold text-[var(--booth-on-primary-container)] shadow-sm backdrop-blur-sm">
              Snap guides
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
