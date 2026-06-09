import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition } from "@/domain/layouts/types";
import { clampInteger } from "@/shared/lib/validation";

export const DEFAULT_LAYOUT_ID = "single-photo-full";
export const TABLET_PORTRAIT_WIDTH = 1200;
export const TABLET_PORTRAIT_HEIGHT = 1600;
export const MAX_CAPTURE_COUNT = 4;

const CANVAS_WIDTH = TABLET_PORTRAIT_WIDTH;
const CANVAS_HEIGHT = TABLET_PORTRAIT_HEIGHT;
const EDGE = 64;
const GAP = 32;

export const defaultLayouts: LayoutDefinition[] = [
  {
    id: DEFAULT_LAYOUT_ID,
    name: "1 photo - full frame",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    backgroundColor: "#ffffff",
    slots: [
      {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        fit: "cover"
      }
    ]
  },
  {
    id: "two-photo-vertical",
    name: "2 photos - vertical",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    backgroundColor: "#ffffff",
    slots: [
      {
        x: EDGE,
        y: EDGE,
        width: CANVAS_WIDTH - EDGE * 2,
        height: 720,
        fit: "cover"
      },
      {
        x: EDGE,
        y: EDGE + 720 + GAP,
        width: CANVAS_WIDTH - EDGE * 2,
        height: 720,
        fit: "cover"
      }
    ]
  },
  {
    id: "three-photo-strip",
    name: "3 photos - strip",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    backgroundColor: "#ffffff",
    slots: [
      {
        x: EDGE,
        y: EDGE,
        width: CANVAS_WIDTH - EDGE * 2,
        height: 472,
        fit: "cover"
      },
      {
        x: EDGE,
        y: EDGE + 472 + 28,
        width: CANVAS_WIDTH - EDGE * 2,
        height: 472,
        fit: "cover"
      },
      {
        x: EDGE,
        y: EDGE + (472 + 28) * 2,
        width: CANVAS_WIDTH - EDGE * 2,
        height: 472,
        fit: "cover"
      }
    ]
  },
  {
    id: "four-photo-grid",
    name: "4 photos - grid",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    backgroundColor: "#ffffff",
    slots: [
      {
        x: EDGE,
        y: EDGE,
        width: 520,
        height: 720,
        fit: "cover"
      },
      {
        x: EDGE + 520 + GAP,
        y: EDGE,
        width: 520,
        height: 720,
        fit: "cover"
      },
      {
        x: EDGE,
        y: EDGE + 720 + GAP,
        width: 520,
        height: 720,
        fit: "cover"
      },
      {
        x: EDGE + 520 + GAP,
        y: EDGE + 720 + GAP,
        width: 520,
        height: 720,
        fit: "cover"
      }
    ]
  }
];

export function getLayoutById(layoutId: string): LayoutDefinition {
  return (
    defaultLayouts.find((layout) => layout.id === layoutId) ?? defaultLayouts[0]
  );
}

export function clampCaptureCount(captureCount: number): number {
  return clampInteger(captureCount, 1, MAX_CAPTURE_COUNT);
}

export function getRecommendedLayoutIdForCaptureCount(captureCount: number): string {
  const safeCaptureCount = clampCaptureCount(captureCount);
  const layout = defaultLayouts.find(
    (definition) => definition.slots.length === safeCaptureCount
  );

  return layout?.id ?? DEFAULT_LAYOUT_ID;
}

export function getLayoutForCaptureCount(captureCount: number): LayoutDefinition {
  return getLayoutById(getRecommendedLayoutIdForCaptureCount(captureCount));
}

export function getScaledLayoutForEvent(
  eventConfig: EventConfig
): LayoutDefinition {
  const selectedLayout = getLayoutById(eventConfig.layoutId);
  const captureCount = clampCaptureCount(eventConfig.captureCount);
  const layout =
    selectedLayout.slots.length === captureCount
      ? selectedLayout
      : getLayoutForCaptureCount(captureCount);
  const scaleX = eventConfig.outputWidth / layout.canvasWidth;
  const scaleY = eventConfig.outputHeight / layout.canvasHeight;

  return {
    ...layout,
    canvasWidth: eventConfig.outputWidth,
    canvasHeight: eventConfig.outputHeight,
    slots: layout.slots.map((slot) => ({
      ...slot,
      x: Math.round(slot.x * scaleX),
      y: Math.round(slot.y * scaleY),
      width: Math.round(slot.width * scaleX),
      height: Math.round(slot.height * scaleY),
      borderRadius:
        slot.borderRadius === undefined
          ? undefined
          : Math.round(slot.borderRadius * Math.min(scaleX, scaleY))
    }))
  };
}
