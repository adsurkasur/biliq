import { getEffectiveOverlayLayers } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import type { ComposedOutput } from "@/domain/media/types";
import { loadImage } from "@/shared/lib/image";

interface RecordVideoInput {
  video: HTMLVideoElement;
  eventConfig: EventConfig;
  durationSeconds: number;
  onTick?: (secondsRemaining: number) => void;
}

export async function recordVideo({
  video,
  eventConfig,
  durationSeconds,
  onTick
}: RecordVideoInput): Promise<ComposedOutput> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Video recording is not supported in this browser.");
  }

  const sourceStream = video.srcObject;
  if (
    !(sourceStream instanceof MediaStream) ||
    !sourceStream.getVideoTracks().length
  ) {
    throw new Error("The camera stream is unavailable for video recording.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = eventConfig.outputWidth;
  canvas.height = eventConfig.outputHeight;
  const context = canvas.getContext("2d");
  if (!context || typeof canvas.captureStream !== "function") {
    throw new Error("Canvas video recording is not supported in this browser.");
  }

  const visibleLayers = getEffectiveOverlayLayers(eventConfig)
    .filter((layer) => layer.visible)
    .sort((a, b) => a.zIndex - b.zIndex);
  const overlayImages = await Promise.all(
    visibleLayers.map((layer) => loadImage(layer.imageDataUrl))
  );
  let animationFrameId = 0;

  const drawFrame = () => {
    drawVideoCover(context, video, canvas.width, canvas.height);

    visibleLayers.forEach((layer, index) => {
      const image = overlayImages[index];
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;

      context.save();
      context.globalAlpha = layer.opacity;
      context.translate(centerX, centerY);
      context.rotate((layer.rotation * Math.PI) / 180);
      context.drawImage(
        image,
        -layer.width / 2,
        -layer.height / 2,
        layer.width,
        layer.height
      );
      context.restore();
    });

    animationFrameId = window.requestAnimationFrame(drawFrame);
  };

  drawFrame();
  const outputStream = canvas.captureStream(30);
  sourceStream.getAudioTracks().forEach((track) => outputStream.addTrack(track));

  const duration = Math.min(60, Math.max(3, Math.round(durationSeconds)));
  const mimeType = getSupportedVideoMimeType();
  const recorder = mimeType
    ? new MediaRecorder(outputStream, { mimeType })
    : new MediaRecorder(outputStream);
  const chunks: BlobPart[] = [];

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size) chunks.push(event.data);
  });

  const recordingComplete = new Promise<void>((resolve, reject) => {
    recorder.addEventListener("stop", () => resolve(), { once: true });
    recorder.addEventListener(
      "error",
      () => reject(new Error("Video recording stopped unexpectedly.")),
      { once: true }
    );
  });

  try {
    recorder.start(250);
    onTick?.(duration);

    for (let remaining = duration - 1; remaining >= 0; remaining -= 1) {
      await wait(1000);
      onTick?.(remaining);
    }

    recorder.stop();
    await recordingComplete;
  } finally {
    window.cancelAnimationFrame(animationFrameId);
    outputStream.getVideoTracks().forEach((track) => track.stop());
  }

  const resolvedMimeType = recorder.mimeType || mimeType || "video/webm";
  const blob = new Blob(chunks, { type: resolvedMimeType });
  if (!blob.size) {
    throw new Error("The browser returned an empty video recording.");
  }

  return {
    kind: "video",
    mediaDataUrl: await blobToDataUrl(blob),
    imageDataUrl: canvas.toDataURL("image/jpeg", 0.9),
    mimeType: resolvedMimeType,
    width: canvas.width,
    height: canvas.height,
    durationMs: duration * 1000
  };
}

function drawVideoCover(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  const sourceRatio = video.videoWidth / video.videoHeight;
  const targetRatio = width / height;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = sourceHeight * targetRatio;
  } else {
    sourceHeight = sourceWidth / targetRatio;
  }

  context.drawImage(
    video,
    (video.videoWidth - sourceWidth) / 2,
    (video.videoHeight - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  );
}

function getSupportedVideoMimeType(): string {
  return (
    [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4"
    ].find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? ""
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The video could not be prepared."));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
