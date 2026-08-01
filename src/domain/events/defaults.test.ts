import { describe, expect, it } from "vitest";
import {
  createDefaultEventConfig,
  getEnabledCaptureModes,
  getGifCaptureSettings,
  getVideoCaptureSettings
} from "@/domain/events/defaults";

describe("capture mode defaults", () => {
  it("keeps legacy events compatible by enabling photo mode", () => {
    const event = createDefaultEventConfig();
    event.captureModes = undefined;

    expect(getEnabledCaptureModes(event)).toEqual(["photo"]);
  });

  it("deduplicates capture modes into a stable booth order", () => {
    const event = createDefaultEventConfig({
      captureModes: ["video", "gif", "photo", "gif"]
    });

    expect(getEnabledCaptureModes(event)).toEqual(["photo", "gif", "video"]);
  });

  it("clamps unsafe animation and video values", () => {
    const event = createDefaultEventConfig({
      gifSettings: { frameCount: 99, frameDelayMs: 20 },
      videoSettings: { durationSeconds: 500, includeAudio: true }
    });

    expect(getGifCaptureSettings(event)).toEqual({
      frameCount: 12,
      frameDelayMs: 100
    });
    expect(getVideoCaptureSettings(event)).toEqual({
      durationSeconds: 60,
      includeAudio: true
    });
  });
});
