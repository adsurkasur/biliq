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
  const dimClass = cn(
    "fixed bg-stone-950/65 backdrop-blur-[1px] guide-spotlight-segment",
    isExiting && "opacity-0"
  );

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
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex }} aria-hidden="true">
      <div data-guide-dismiss="top" className={cn(dimClass, "left-0 right-0 top-0 pointer-events-auto")} style={{ height: cutout.top }} onClick={onDismiss} />
      <div
        className={cn(dimClass, "left-0 pointer-events-auto")}
        data-guide-dismiss="left"
        style={{ top: cutout.top, width: cutout.left, height: cutout.height }}
        onClick={onDismiss}
      />
      <div
        className={cn(dimClass, "right-0 pointer-events-auto")}
        data-guide-dismiss="right"
        style={{ top: cutout.top, width: Math.max(0, viewportWidth - cutout.right), height: cutout.height }}
        onClick={onDismiss}
      />
      <div data-guide-dismiss="bottom" className={cn(dimClass, "bottom-0 left-0 right-0 pointer-events-auto")} style={{ top: cutout.bottom }} onClick={onDismiss} />
      <div
        data-guide-highlight="true"
        className={cn(
          "pointer-events-none fixed rounded-[var(--booth-radius-lg)] ring-2 ring-[var(--booth-primary)] ring-offset-2 ring-offset-[var(--booth-guide-ring-offset)] guide-spotlight-ring",
          isExiting && "opacity-0"
        )}
        style={{ top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height }}
      />
    </div>
  );
}
