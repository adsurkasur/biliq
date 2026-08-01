"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  CameraAccessError,
  getCameraStream,
  stopCameraStream
} from "@/domain/media/camera";

export type CameraPreviewState = "requesting" | "ready" | "error";

interface UseCameraStreamInput {
  videoRef: RefObject<HTMLVideoElement | null>;
  preferredFacingMode?: "environment" | "user";
  includeAudio?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export function useCameraStream({
  videoRef,
  preferredFacingMode = "environment",
  includeAudio = false,
  onReady,
  onError
}: UseCameraStreamInput) {
  const [state, setState] = useState<CameraPreviewState>("requesting");
  const [message, setMessage] = useState("Requesting camera access");

  useEffect(() => {
    let mounted = true;
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      setState("requesting");
      setMessage("Requesting camera access");

      try {
        const stream = await getCameraStream(preferredFacingMode, includeAudio);

        if (!mounted) {
          stopCameraStream(stream);
          return;
        }

        activeStream = stream;
        const video = videoRef.current;

        if (!video) {
          throw new Error("Camera preview element is unavailable.");
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await waitForMetadata(video);
        await video.play();

        if (!mounted) {
          return;
        }

        setState("ready");
        setMessage("Camera ready");
        onReady?.();
      } catch (error) {
        if (!mounted) {
          return;
        }

        const nextMessage =
          error instanceof CameraAccessError || error instanceof Error
            ? error.message
            : "The camera could not be opened.";

        setState("error");
        setMessage(nextMessage);
        onError?.(nextMessage);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCameraStream(activeStream);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [includeAudio, onError, onReady, preferredFacingMode, videoRef]);

  return { state, message };
}

function waitForMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve();
  });
}
