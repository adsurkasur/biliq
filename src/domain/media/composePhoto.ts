import type { EventConfig } from "@/domain/events/types";
import type { LayoutDefinition, LayoutSlot } from "@/domain/layouts/types";
import type { CapturedFrame, ComposedPhoto } from "@/domain/media/types";
import { loadImage } from "@/shared/lib/image";

interface ComposePhotoInput {
  capturedFrames: CapturedFrame[];
  eventConfig: EventConfig;
  layout: LayoutDefinition;
}

export async function composePhoto({
  capturedFrames,
  eventConfig,
  layout
}: ComposePhotoInput): Promise<ComposedPhoto> {
  if (!capturedFrames.length) {
    throw new Error("No captured frames were provided for composition.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = eventConfig.outputWidth;
  canvas.height = eventConfig.outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }

  context.fillStyle = layout.backgroundColor ?? "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const capturedImages = await Promise.all(
    capturedFrames.map((capturedFrame) => loadImage(capturedFrame.imageDataUrl))
  );

  layout.slots.forEach((slot, index) => {
    const image = capturedImages[index] ?? capturedImages[capturedImages.length - 1];
    drawImageInSlot(context, image, slot);
  });

  const { getEffectiveOverlayLayers } = await import("@/domain/events/storage");
  const overlayLayers = getEffectiveOverlayLayers(eventConfig);
  const visibleLayers = overlayLayers.filter(layer => layer.visible).sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of visibleLayers) {
    const overlayImage = await loadImage(layer.imageDataUrl);
    
    context.save();
    context.globalAlpha = layer.opacity;
    
    // Translate to center of the layer to rotate around center
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    
    context.translate(centerX, centerY);
    context.rotate((layer.rotation * Math.PI) / 180);
    
    // Draw the image centered around the new origin
    context.drawImage(
      overlayImage,
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );
    
    context.restore();
  }

  return {
    imageDataUrl: canvas.toDataURL("image/jpeg", 0.92),
    width: canvas.width,
    height: canvas.height
  };
}

export async function createThumbnailDataUrl(
  imageDataUrl: string,
  maxWidth = 360
): Promise<string> {
  const image = await loadImage(imageDataUrl);
  const ratio = image.height / image.width;
  const width = maxWidth;
  const height = Math.round(width * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function drawImageInSlot(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slot: LayoutSlot
): void {
  context.save();

  if (slot.borderRadius && slot.borderRadius > 0) {
    roundedRectPath(context, slot.x, slot.y, slot.width, slot.height, slot.borderRadius);
    context.clip();
  }

  if (slot.fit === "contain") {
    drawContain(context, image, slot);
  } else {
    drawCover(context, image, slot);
  }

  context.restore();
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slot: LayoutSlot
): void {
  const sourceRatio = image.width / image.height;
  const targetRatio = slot.width / slot.height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
  } else {
    sourceHeight = image.width / targetRatio;
  }

  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    slot.x,
    slot.y,
    slot.width,
    slot.height
  );
}

function drawContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slot: LayoutSlot
): void {
  const sourceRatio = image.width / image.height;
  const targetRatio = slot.width / slot.height;

  let targetWidth = slot.width;
  let targetHeight = slot.height;

  if (sourceRatio > targetRatio) {
    targetHeight = slot.width / sourceRatio;
  } else {
    targetWidth = slot.height * sourceRatio;
  }

  const targetX = slot.x + (slot.width - targetWidth) / 2;
  const targetY = slot.y + (slot.height - targetHeight) / 2;

  context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}
