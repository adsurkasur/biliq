import type { MutableRefObject } from "react";

export type CaptureState =
  | "idle"
  | "ready"
  | "countdown"
  | "capturing"
  | "recording"
  | "processing"
  | "preview"
  | "saved"
  | "error";

export interface ShotProgress {
  current: number;
  total: number;
}

export function getStateLabel(state: CaptureState): string {
  const labels: Record<CaptureState, string> = {
    idle: "Starting camera",
    ready: "Ready",
    countdown: "Countdown",
    capturing: "Capturing",
    recording: "Recording",
    processing: "Processing",
    preview: "Preview",
    saved: "Saved",
    error: "Needs attention"
  };

  return labels[state];
}

export async function runCountdown(
  seconds: number,
  token: number,
  tokenRef: MutableRefObject<number>,
  setCountdown: (value: number | null) => void
): Promise<boolean> {
  const safeSeconds = Math.max(0, Math.round(seconds));

  for (let remaining = safeSeconds; remaining > 0; remaining -= 1) {
    if (tokenRef.current !== token) {
      return false;
    }

    setCountdown(remaining);
    await delay(1000);
  }

  setCountdown(null);
  return tokenRef.current === token;
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
