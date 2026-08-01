"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode
} from "react";

interface AnimatedAspectBoxProps extends HTMLAttributes<HTMLDivElement> {
  aspectWidth: number;
  aspectHeight: number;
  children?: ReactNode;
  durationMs?: number;
}

export function AnimatedAspectBox({
  aspectWidth,
  aspectHeight,
  children,
  durationMs = 560,
  style,
  ...props
}: AnimatedAspectBoxProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const previousAspectRatioRef = useRef(aspectWidth / aspectHeight);
  const animationFrameRef = useRef<number | null>(null);
  const [animatedHeight, setAnimatedHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const nextHeight = rect.height;
    const nextAspectRatio = aspectWidth / aspectHeight;
    const previousAspectRatio = previousAspectRatioRef.current;
    const previousHeight = element.style.height
      ? rect.height
      : rect.width / previousAspectRatio;
    previousAspectRatioRef.current = nextAspectRatio;

    if (
      !Number.isFinite(previousHeight) ||
      Math.abs(previousAspectRatio - nextAspectRatio) < 0.0001 ||
      Math.abs(previousHeight - nextHeight) < 2 ||
      document.documentElement.dataset.motion === "reduced"
    ) {
      setAnimatedHeight(null);
      return;
    }

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const startedAt = performance.now();
    setAnimatedHeight(previousHeight);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setAnimatedHeight(previousHeight + (nextHeight - previousHeight) * eased);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        animationFrameRef.current = null;
        setAnimatedHeight(null);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };
  }, [aspectHeight, aspectWidth, durationMs]);

  return (
    <div
      {...props}
      ref={elementRef}
      style={{
        ...style,
        aspectRatio: `${aspectWidth} / ${aspectHeight}`,
        height: animatedHeight ?? style?.height
      }}
    >
      {children}
    </div>
  );
}
