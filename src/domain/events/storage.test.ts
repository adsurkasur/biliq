import { beforeEach, describe, expect, it } from "vitest";
import { IDBKeyRange, indexedDB } from "fake-indexeddb";
import { createDefaultEventConfig } from "@/domain/events/defaults";
import {
  getEffectiveOverlayLayers,
  getEventBySlug,
  upsertEventConfig
} from "@/domain/events/storage";
import type { OverlayLayer } from "@/domain/events/types";
import { storageKeys } from "@/shared/config/storageKeys";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const localStorage = new MemoryStorage();

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { indexedDB, localStorage }
});
Object.defineProperty(globalThis, "IDBKeyRange", {
  configurable: true,
  value: IDBKeyRange
});

describe("event overlay persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores image payloads outside localStorage and hydrates them on load", async () => {
    const event = createDefaultEventConfig({
      id: "event-storage-test",
      name: "Storage Test",
      slug: "storage-test",
      overlayLayers: [createLayer("frame-a", "data:image/png;base64,AAAA")]
    });

    await upsertEventConfig(event);

    const rawEvents = JSON.parse(
      localStorage.getItem(storageKeys.events) ?? "[]"
    );
    expect(rawEvents[0].overlayLayers[0].imageDataUrl).toBe("");
    expect(rawEvents[0].overlayDataUrl).toBeUndefined();

    const loaded = await getEventBySlug("storage-test");
    expect(loaded).toBeDefined();
    expect(getEffectiveOverlayLayers(loaded!)[0].imageDataUrl).toBe(
      "data:image/png;base64,AAAA"
    );
  });

  it("replaces an existing designer overlay with the frame saved from setup", async () => {
    const event = createDefaultEventConfig({
      id: "event-replace-test",
      name: "Replace Test",
      slug: "replace-test",
      overlayLayers: [createLayer("old-frame", "data:image/png;base64,OLD")]
    });
    const firstSave = await upsertEventConfig(event);
    const replacement = createLayer("new-frame", "data:image/png;base64,NEW");

    await upsertEventConfig({
      ...firstSave,
      overlayDataUrl: undefined,
      overlayLayers: [replacement]
    });

    const loaded = await getEventBySlug("replace-test");
    const layers = getEffectiveOverlayLayers(loaded!);
    expect(layers).toHaveLength(1);
    expect(layers[0].name).toBe("new-frame");
    expect(layers[0].imageDataUrl).toBe("data:image/png;base64,NEW");
  });

  it("removes persisted overlay assets when the setup frame is cleared", async () => {
    const event = createDefaultEventConfig({
      id: "event-remove-test",
      name: "Remove Test",
      slug: "remove-test",
      overlayLayers: [createLayer("frame", "data:image/png;base64,FRAME")]
    });
    const firstSave = await upsertEventConfig(event);

    await upsertEventConfig({
      ...firstSave,
      overlayDataUrl: undefined,
      overlayLayers: []
    });

    const loaded = await getEventBySlug("remove-test");
    expect(getEffectiveOverlayLayers(loaded!)).toHaveLength(0);
  });

  it("persists and hydrates welcome-frame assets alongside output-frame assets", async () => {
    const event = createDefaultEventConfig({
      id: "event-welcome-assets",
      name: "Welcome Assets",
      slug: "welcome-assets",
      overlayLayers: [createLayer("output-frame", "data:image/png;base64,OUTPUT")]
    });
    event.welcomeScreen = {
      ...event.welcomeScreen!,
      overlayLayers: [createLayer("welcome-frame", "data:image/png;base64,WELCOME")]
    };

    await upsertEventConfig(event);

    const rawEvents = JSON.parse(localStorage.getItem(storageKeys.events) ?? "[]");
    expect(rawEvents[0].overlayLayers[0].imageDataUrl).toBe("");
    expect(rawEvents[0].welcomeScreen.overlayLayers[0].imageDataUrl).toBe("");

    const loaded = await getEventBySlug("welcome-assets");
    expect(loaded?.overlayLayers?.[0].imageDataUrl).toBe("data:image/png;base64,OUTPUT");
    expect(loaded?.welcomeScreen?.overlayLayers[0].imageDataUrl).toBe(
      "data:image/png;base64,WELCOME"
    );
  });
});

function createLayer(name: string, imageDataUrl: string): OverlayLayer {
  const now = new Date().toISOString();
  return {
    id: `layer-${name}`,
    name,
    imageDataUrl,
    x: 0,
    y: 0,
    width: 1200,
    height: 1600,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now
  };
}
