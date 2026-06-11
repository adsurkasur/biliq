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
}

export function GuideVisualHint({ type, targetRect }: GuideVisualHintProps) {
  if (!type || !targetRect) return null;

  switch (type) {
    case "move":
      return (
        <div 
          className="absolute z-[61] pointer-events-none flex flex-col items-center gap-2 motion-enter"
          style={{
            top: targetRect.top + targetRect.height / 2,
            left: targetRect.left + targetRect.width / 2,
            transform: "translate(-50%, -50%)",
            transition: "top 350ms cubic-bezier(0.2, 0, 0, 1), left 350ms cubic-bezier(0.2, 0, 0, 1), transform 350ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div className="flex items-center gap-2 text-[var(--booth-primary)] drop-shadow-md">
            <MousePointer2 className="h-5 w-5 fill-[var(--booth-surface)]/80" />
            <Move className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-[var(--booth-on-surface)]/90 px-2 py-0.5 text-xs font-semibold text-[var(--booth-surface)] shadow-sm backdrop-blur-sm">
            Drag to move
          </span>
        </div>
      );

    case "resize":
      return (
        <div 
          className="absolute z-[61] pointer-events-none motion-enter"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            transition: "top 350ms cubic-bezier(0.2, 0, 0, 1), left 350ms cubic-bezier(0.2, 0, 0, 1), width 350ms cubic-bezier(0.2, 0, 0, 1), height 350ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div className="absolute -left-3 -top-3 flex items-center gap-1">
            <span className="rounded-full bg-[var(--booth-on-surface)]/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--booth-surface)] shadow-sm backdrop-blur-sm">
              Resize
            </span>
          </div>
          <div className="absolute -bottom-3 -right-3 flex items-center gap-1">
            <span className="rounded-full bg-[var(--booth-on-surface)]/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--booth-surface)] shadow-sm backdrop-blur-sm">
              Resize
            </span>
          </div>
        </div>
      );

    case "rotate":
      return (
        <div 
          className="absolute z-[61] pointer-events-none flex flex-col items-center motion-enter"
          style={{
            top: targetRect.top - 48,
            left: targetRect.left + targetRect.width / 2,
            transform: "translateX(-50%)",
            transition: "top 350ms cubic-bezier(0.2, 0, 0, 1), left 350ms cubic-bezier(0.2, 0, 0, 1), transform 350ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <span className="mb-1 rounded-full bg-[var(--booth-on-surface)]/90 px-2 py-0.5 text-xs font-semibold text-[var(--booth-surface)] shadow-sm backdrop-blur-sm">
            Rotate
          </span>
          <RotateCw className="h-5 w-5 text-white drop-shadow-md" />
        </div>
      );

    case "snap":
      // Show illustrative snap lines inside the target rect
      const centerX = targetRect.left + targetRect.width / 2;
      const centerY = targetRect.top + targetRect.height / 2;
      
      return (
        <div className="absolute inset-0 z-[61] pointer-events-none overflow-hidden motion-enter">
          {/* Vertical center line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400/60"
            style={{ left: centerX }}
          />
          {/* Horizontal center line */}
          <div 
            className="absolute left-0 right-0 h-0.5 bg-blue-400/60"
            style={{ top: centerY }}
          />
          <div 
            className="absolute flex flex-col items-center"
            style={{
              top: centerY - 24,
              left: centerX + 12,
            }}
          >
            <span className="rounded-full bg-blue-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              Snap guides
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
