import { describe, expect, it } from "vitest";
import { getPaddedGuideRect, getVisibleGuideRect } from "./guideGeometry";

describe("guide geometry", () => {
  it("clips an oversized target to the visible viewport", () => {
    expect(getVisibleGuideRect(
      { top: -120, left: -40, right: 1300, bottom: 980 },
      1200,
      800
    )).toEqual({ top: 10, left: 10, right: 1190, bottom: 790, width: 1180, height: 780 });
  });

  it("adds spotlight padding without escaping the viewport", () => {
    expect(getPaddedGuideRect(
      { top: 10, left: 10, right: 1190, bottom: 790, width: 1180, height: 780 },
      1200,
      800
    )).toEqual({ top: 6, left: 6, right: 1194, bottom: 794, width: 1188, height: 788 });
  });
});
