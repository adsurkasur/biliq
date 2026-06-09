import type { CapturedFrame } from "@/domain/media/types";

export function captureFrame(video: HTMLVideoElement): CapturedFrame {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    throw new Error("Camera preview is not ready yet.");
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("Camera frame size is unavailable.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }

  context.drawImage(video, 0, 0, width, height);

  return {
    imageDataUrl: canvas.toDataURL("image/jpeg", 0.95),
    width,
    height
  };
}
