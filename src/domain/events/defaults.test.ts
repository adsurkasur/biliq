import { describe, expect, it } from "vitest";
import {
  createDefaultEventConfig,
  getEnabledCaptureModes,
  getGifCaptureSettings,
  getWelcomeScreenConfig,
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

  it("creates an enabled live-camera welcome screen by default", () => {
    const event = createDefaultEventConfig();
    const welcome = getWelcomeScreenConfig(event);

    expect(welcome.enabled).toBe(true);
    expect(welcome.orientation).toBe("portrait");
    expect(welcome.showCamera).toBe(true);
    expect(welcome.cameraFacingMode).toBe("user");
    expect(welcome.elements.map((element) => element.type)).toEqual([
      "title",
      "subtitle",
      "start-button"
    ]);
  });

  it("supports a welcome orientation independent from the photo output", () => {
    const event = createDefaultEventConfig();
    event.welcomeScreen = {
      ...event.welcomeScreen!,
      orientation: "landscape"
    };

    const welcome = getWelcomeScreenConfig(event);
    expect(welcome.orientation).toBe("landscape");
    expect(welcome.canvasWidth).toBe(1600);
    expect(welcome.canvasHeight).toBe(1200);
  });

  it("rescales a welcome design when the event output changes", () => {
    const event = createDefaultEventConfig({ outputWidth: 600, outputHeight: 800 });
    event.welcomeScreen = {
      ...event.welcomeScreen!,
      canvasWidth: 1200,
      canvasHeight: 1600
    };

    const welcome = getWelcomeScreenConfig(event);
    expect(welcome.canvasWidth).toBe(600);
    expect(welcome.canvasHeight).toBe(800);
    expect(welcome.elements[0].x).toBe(Math.round(event.welcomeScreen!.elements[0].x / 2));
    expect(welcome.elements[0].fontSize).toBe(Math.round(event.welcomeScreen!.elements[0].fontSize / 2));
  });
});
