import { describe, expect, it } from "vitest";
import { calculateFramePlacement, hasAspectRatioMismatch } from "./framePlacement";

describe("calculateFramePlacement", () => {
  it("centers a contained frame without distorting it", () => {
    expect(calculateFramePlacement(1600, 900, 1200, 1600, "fit")).toEqual({
      x: 0,
      y: 463,
      width: 1200,
      height: 675
    });
  });

  it("centers a covering frame and lets the canvas crop the overflow", () => {
    expect(calculateFramePlacement(1600, 900, 1200, 1600, "fill")).toEqual({
      x: -822,
      y: 0,
      width: 2844,
      height: 1600
    });
  });

  it("uses the exact canvas for stretch", () => {
    expect(calculateFramePlacement(1600, 900, 1200, 1600, "stretch")).toEqual({
      x: 0,
      y: 0,
      width: 1200,
      height: 1600
    });
  });
});

describe("hasAspectRatioMismatch", () => {
  it("flags visibly different ratios", () => {
    expect(hasAspectRatioMismatch(1600, 900, 1200, 1600)).toBe(true);
    expect(hasAspectRatioMismatch(1200, 1600, 1200, 1600)).toBe(false);
  });
});
