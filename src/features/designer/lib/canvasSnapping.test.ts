import { describe, expect, it } from "vitest";
import { snapMovedRect, snapResizedRect } from "@/features/designer/lib/canvasSnapping";

describe("canvas snapping", () => {
  it("sticks a moved object to canvas edges without clamping overflow", () => {
    const result = snapMovedRect({
      rect: { x: -8, y: 91, width: 100, height: 100 },
      canvasWidth: 1200,
      canvasHeight: 1600
    });

    expect(result.rect.x).toBe(0);
    expect(result.rect.y).toBe(91);
    expect(result.guides).toContainEqual({ type: "vertical", pos: 0 });
  });

  it("sticks a resized corner to the canvas while preserving its ratio", () => {
    const result = snapResizedRect({
      rect: { x: 100, y: 100, width: 1092, height: 546 },
      canvasWidth: 1200,
      canvasHeight: 1600,
      edges: { left: false, right: true, top: false, bottom: true },
      preserveAspect: true,
      aspectRatio: 2,
      centered: false
    });

    expect(result.rect.x + result.rect.width).toBe(1200);
    expect(result.rect.width / result.rect.height).toBe(2);
  });
});
