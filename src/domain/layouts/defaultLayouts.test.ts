import { describe, expect, it } from "vitest";
import { normalizeLayoutSlot } from "@/domain/layouts/defaultLayouts";

describe("layout overflow normalization", () => {
  it("preserves intentional overflow within the editable workspace", () => {
    const slot = normalizeLayoutSlot(
      {
        x: -180,
        y: 1520,
        width: 1440,
        height: 420,
        fit: "cover"
      },
      1200,
      1600
    );

    expect(slot.x).toBe(-180);
    expect(slot.y).toBe(1520);
    expect(slot.width).toBe(1440);
    expect(slot.height).toBe(420);
  });
});
