import type { CaptureMode } from "@/domain/events/types";

export const CAPTURE_MODE_LABELS: Record<CaptureMode, string> = {
  photo: "Photo",
  gif: "GIF",
  boomerang: "Boomerang",
  video: "Video"
};

export const CAPTURE_MODE_DESCRIPTIONS: Record<CaptureMode, string> = {
  photo: "A composed print-ready photo",
  gif: "A looping animated GIF",
  boomerang: "A forward-and-back animation",
  video: "A short camera recording"
};

export function getCaptureModeLabel(mode: CaptureMode | undefined): string {
  return CAPTURE_MODE_LABELS[mode ?? "photo"];
}
