import { GIFEncoder, applyPalette, quantize } from "gifenc";
import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition } from "@/domain/layouts/types";
import { composePhoto } from "@/domain/media/composePhoto";
import type {
  CapturedFrame,
  ComposedOutput
} from "@/domain/media/types";
import { loadImage } from "@/shared/lib/image";

interface ComposeAnimationInput {
  capturedFrames: CapturedFrame[];
  eventConfig: EventConfig;
  layout: LayoutDefinition;
  frameDelayMs: number;
  reverse: boolean;
}

const MAX_GIF_WIDTH = 720;

export async function composeAnimation({
  capturedFrames,
  eventConfig,
  layout,
  frameDelayMs,
  reverse
}: ComposeAnimationInput): Promise<ComposedOutput> {
  if (capturedFrames.length < 2) {
    throw new Error("At least two frames are required to create an animation.");
  }

  const sequence = reverse
    ? [
        ...capturedFrames,
        ...capturedFrames.slice(1, -1).reverse()
      ]
    : capturedFrames;
  const composedFrames = await Promise.all(
    sequence.map((frame) =>
      composePhoto({ capturedFrames: [frame], eventConfig, layout })
    )
  );

  const scale = Math.min(1, MAX_GIF_WIDTH / eventConfig.outputWidth);
  const width = Math.max(1, Math.round(eventConfig.outputWidth * scale));
  const height = Math.max(1, Math.round(eventConfig.outputHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }

  const encoder = GIFEncoder();

  for (const frame of composedFrames) {
    const image = await loadImage(frame.imageDataUrl);
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const palette = quantize(pixels, 256, { format: "rgb565" });
    const indexedPixels = applyPalette(pixels, palette, "rgb565");
    encoder.writeFrame(indexedPixels, width, height, {
      palette,
      delay: frameDelayMs,
      repeat: 0
    });
  }

  encoder.finish();
  const encodedBytes = encoder.bytes();
  const encodedBuffer = new ArrayBuffer(encodedBytes.byteLength);
  new Uint8Array(encodedBuffer).set(encodedBytes);
  const mediaDataUrl = await blobToDataUrl(
    new Blob([encodedBuffer], { type: "image/gif" })
  );

  return {
    kind: reverse ? "boomerang" : "gif",
    mediaDataUrl,
    imageDataUrl: composedFrames[0].imageDataUrl,
    mimeType: "image/gif",
    width,
    height,
    durationMs: sequence.length * frameDelayMs,
    frameCount: sequence.length
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The animation could not be encoded."));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
