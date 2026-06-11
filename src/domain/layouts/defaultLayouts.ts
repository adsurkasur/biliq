import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition, LayoutSlot } from "@/domain/layouts/types";
import { clampInteger } from "@/shared/lib/validation";

export const DEFAULT_LAYOUT_ID = "single-photo-full";
export const CUSTOM_LAYOUT_ID = "custom-layout";
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

export function getCaptureCountForEvent(eventConfig: EventConfig): number {
  return clampCaptureCount(
    eventConfig.customLayout?.slots.length ?? eventConfig.captureCount
  );
}

export function getScaledLayoutForEvent(
  eventConfig: EventConfig
): LayoutDefinition {
  if (eventConfig.customLayout) {
    return scaleLayoutDefinition(
      normalizeLayoutDefinition(eventConfig.customLayout, {
        canvasWidth: eventConfig.customLayout.canvasWidth,
        canvasHeight: eventConfig.customLayout.canvasHeight,
        id: CUSTOM_LAYOUT_ID,
        name: eventConfig.customLayout.name || "Custom layout"
      }),
      eventConfig.outputWidth,
      eventConfig.outputHeight
    );
  }

  const selectedLayout = getLayoutById(eventConfig.layoutId);
  const captureCount = clampCaptureCount(eventConfig.captureCount);
  const layout =
    selectedLayout.slots.length === captureCount
      ? selectedLayout
      : getLayoutForCaptureCount(captureCount);

  return scaleLayoutDefinition(layout, eventConfig.outputWidth, eventConfig.outputHeight);
}

export function scaleLayoutDefinition(
  layout: LayoutDefinition,
  outputWidth: number,
  outputHeight: number
): LayoutDefinition {
  const scaleX = outputWidth / layout.canvasWidth;
  const scaleY = outputHeight / layout.canvasHeight;

  return {
    ...layout,
    canvasWidth: outputWidth,
    canvasHeight: outputHeight,
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

export function normalizeLayoutDefinition(
  layout: LayoutDefinition,
  options: {
    canvasWidth: number;
    canvasHeight: number;
    id?: string;
    name?: string;
  }
): LayoutDefinition {
  const slots = layout.slots
    .slice(0, MAX_CAPTURE_COUNT)
    .map((slot) => normalizeLayoutSlot(slot, options.canvasWidth, options.canvasHeight));

  return {
    id: options.id ?? layout.id,
    name: options.name ?? layout.name,
    canvasWidth: options.canvasWidth,
    canvasHeight: options.canvasHeight,
    backgroundColor: layout.backgroundColor ?? "#ffffff",
    slots: slots.length
      ? slots
      : [
          {
            x: 0,
            y: 0,
            width: options.canvasWidth,
            height: options.canvasHeight,
            fit: "cover"
          }
        ]
  };
}

export function normalizeLayoutSlot(
  slot: LayoutSlot,
  canvasWidth: number,
  canvasHeight: number
): LayoutSlot {
  const width = clampInteger(
    Number(slot.width) || canvasWidth,
    1,
    canvasWidth
  );
  const height = clampInteger(
    Number(slot.height) || canvasHeight,
    1,
    canvasHeight
  );
  const x = clampInteger(Number(slot.x) || 0, 0, Math.max(0, canvasWidth - width));
  const y = clampInteger(Number(slot.y) || 0, 0, Math.max(0, canvasHeight - height));
  const borderRadiusValue =
    slot.borderRadius === undefined ? undefined : Number(slot.borderRadius);

  return {
    x,
    y,
    width,
    height,
    fit: slot.fit === "contain" ? "contain" : "cover",
    borderRadius:
      borderRadiusValue === undefined || Number.isNaN(borderRadiusValue)
        ? undefined
        : clampInteger(borderRadiusValue, 0, Math.floor(Math.min(width, height) / 2))
  };
}
