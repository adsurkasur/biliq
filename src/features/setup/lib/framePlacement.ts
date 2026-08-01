import type { FramePlacementMode } from "@/domain/events/types";

export interface FramePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateFramePlacement(
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  mode: FramePlacementMode
): FramePlacement {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    canvasWidth <= 0 ||
    canvasHeight <= 0 ||
    mode === "stretch"
  ) {
    return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  }

  const scale =
    mode === "fill"
      ? Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight)
      : Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  return {
    x: Math.round((canvasWidth - width) / 2),
    y: Math.round((canvasHeight - height) / 2),
    width,
    height
  };
}

export function hasAspectRatioMismatch(
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  tolerance = 0.05
): boolean {
  if (sourceWidth <= 0 || sourceHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return false;
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  return Math.abs(sourceRatio - canvasRatio) / canvasRatio > tolerance;
}
