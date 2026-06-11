"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** The bounding rect of a guide target element, in viewport coordinates. */
export interface GuideTargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

/**
 * Tracks the bounding rect of a DOM element identified by
 * `[data-guide-target="<targetId>"]`. Re-measures on step change,
 * window resize, and scroll.
 *
 * Returns null if the element is not found (graceful fallback).
 */
export function useGuideTargetRect(targetId: string | null): GuideTargetRect | null {
  const [rect, setRect] = useState<GuideTargetRect | null>(null);
  const rafRef = useRef<number>(0);

  const measure = useCallback(() => {
    if (!targetId) {
      setRect(null);
      return;
    }

    const el = document.querySelector(`[data-guide-target="${targetId}"]`);
    if (!el) {
      // Fallback: try designer-canvas as a universal fallback
      if (targetId !== "designer-canvas") {
        const fallback = document.querySelector(`[data-guide-target="designer-canvas"]`);
        if (fallback) {
          const r = fallback.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
          return;
        }
      }
      setRect(null);
      return;
    }

    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
  }, [targetId]);

  // Measure on targetId change
  useEffect(() => {
    // Small delay to allow DOM to settle after step change
    const timer = setTimeout(measure, 50);
    return () => clearTimeout(timer);
  }, [measure]);

  // Re-measure on resize and scroll
  useEffect(() => {
    const handleUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  return rect;
}
