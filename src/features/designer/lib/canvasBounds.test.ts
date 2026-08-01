import { describe, expect, it } from "vitest";
import { isCanvasObjectOutOfBounds } from "./canvasBounds";

describe("canvas bounds", () => {
  it("accepts an object fully inside the canvas", () => {
    expect(
      isCanvasObjectOutOfBounds({ x: 10, y: 20, width: 100, height: 80 }, 200, 200)
    ).toBe(false);
  });

  it("detects objects crossing any canvas edge", () => {
    expect(
      isCanvasObjectOutOfBounds({ x: -1, y: 20, width: 100, height: 80 }, 200, 200)
    ).toBe(true);
    expect(
      isCanvasObjectOutOfBounds({ x: 150, y: 20, width: 60, height: 80 }, 200, 200)
    ).toBe(true);
  });

  it("accounts for rotation when checking visible corners", () => {
    expect(
      isCanvasObjectOutOfBounds(
        { x: 0, y: 0, width: 50, height: 50, rotation: 45 },
        100,
        100
      )
    ).toBe(true);
  });
});
