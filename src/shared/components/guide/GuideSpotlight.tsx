"use client";

import { getPaddedGuideRect, type GuideTargetRect } from "./guideGeometry";
import { cn } from "@/shared/lib/classNames";

interface GuideSpotlightProps {
  rect: GuideTargetRect | null;
  isExiting?: boolean;
  onDismiss: () => void;
  zIndex?: number;
  padding?: number;
}

export function GuideSpotlight({
  rect,
  isExiting = false,
  onDismiss,
  zIndex = 60,
  padding = 8
}: GuideSpotlightProps) {
  const viewportWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight;
  const cutout = rect && viewportWidth && viewportHeight
    ? getPaddedGuideRect(rect, viewportWidth, viewportHeight, padding)
    : null;
  const dismissClass = "fixed pointer-events-auto bg-transparent";

  if (!cutout) {
    return (
      <div
        className={cn(
          "fixed inset-0 bg-stone-950/65 backdrop-blur-[1px]",
          isExiting ? "motion-guide-backdrop-exit" : "motion-guide-backdrop"
        )}
        style={{ zIndex }}
        data-guide-dismiss="full"
        onClick={onDismiss}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex }} aria-hidden="true">
      <div
        data-guide-highlight="true"
        className={cn(
          "pointer-events-none fixed rounded-[var(--booth-radius-lg)] ring-2 ring-[var(--booth-primary)] ring-offset-2 ring-offset-[var(--booth-guide-ring-offset)] transition-[top,left,width,height,opacity] duration-300 ease-out",
          isExiting && "opacity-0"
        )}
        style={{
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
          boxShadow: "0 0 0 9999px rgba(12, 10, 9, 0.68)"
        }}
      />
      <div data-guide-dismiss="top" className={cn(dismissClass, "left-0 right-0 top-0")} style={{ height: cutout.top }} onClick={onDismiss} />
      <div
        className={cn(dismissClass, "left-0")}
        data-guide-dismiss="left"
        style={{ top: cutout.top, width: cutout.left, height: cutout.height }}
        onClick={onDismiss}
      />
      <div
        className={cn(dismissClass, "right-0")}
        data-guide-dismiss="right"
        style={{ top: cutout.top, width: Math.max(0, viewportWidth - cutout.right), height: cutout.height }}
        onClick={onDismiss}
      />
      <div data-guide-dismiss="bottom" className={cn(dismissClass, "bottom-0 left-0 right-0")} style={{ top: cutout.bottom }} onClick={onDismiss} />
    </div>
  );
}
