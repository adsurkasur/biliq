export interface GuideTargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function getVisibleGuideRect(
  rect: Pick<GuideTargetRect, "top" | "left" | "right" | "bottom">,
  viewportWidth: number,
  viewportHeight: number,
  margin = 10
): GuideTargetRect | null {
  const left = Math.max(margin, Math.min(viewportWidth - margin, rect.left));
  const top = Math.max(margin, Math.min(viewportHeight - margin, rect.top));
  const right = Math.max(margin, Math.min(viewportWidth - margin, rect.right));
  const bottom = Math.max(margin, Math.min(viewportHeight - margin, rect.bottom));

  if (right - left < 2 || bottom - top < 2) return null;
  return { top, left, right, bottom, width: right - left, height: bottom - top };
}

export function getPaddedGuideRect(
  rect: GuideTargetRect,
  viewportWidth: number,
  viewportHeight: number,
  padding = 8,
  margin = 6
): GuideTargetRect {
  const left = Math.max(margin, rect.left - padding);
  const top = Math.max(margin, rect.top - padding);
  const right = Math.min(viewportWidth - margin, rect.right + padding);
  const bottom = Math.min(viewportHeight - margin, rect.bottom + padding);
  return { top, left, right, bottom, width: right - left, height: bottom - top };
}
