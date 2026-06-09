"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEventBySlug } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import {
  clampCaptureCount,
  getScaledLayoutForEvent
} from "@/domain/layouts/defaultLayouts";
import { captureFrame } from "@/domain/media/captureFrame";
import { composePhoto, createThumbnailDataUrl } from "@/domain/media/composePhoto";
import type { CapturedFrame, ComposedPhoto } from "@/domain/media/types";
import { savePhotoRecord } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import {
  delay,
  runCountdown,
  type CaptureState,
  type ShotProgress
} from "@/features/booth/lib/boothState";
import { createEntityId } from "@/shared/lib/id";

export function useBoothSession(eventSlug: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const busyRef = useRef(false);
  const captureTokenRef = useRef(0);

  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [cameraMessage, setCameraMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotProgress, setShotProgress] = useState<ShotProgress | null>(null);
  const [finalOutput, setFinalOutput] = useState<ComposedPhoto | null>(null);
  const [savedPhoto, setSavedPhoto] = useState<PhotoRecord | null>(null);

  useEffect(() => {
    setEventConfig(getEventBySlug(eventSlug) ?? null);

    return () => {
      captureTokenRef.current += 1;
      busyRef.current = false;
    };
  }, [eventSlug]);

  const handleCameraReady = useCallback(() => {
    setCameraMessage("");
    setCaptureState((current) => (current === "idle" ? "ready" : current));
  }, []);

  const handleCameraError = useCallback((message: string) => {
    setCameraMessage(message);
    setCaptureState("error");
  }, []);

  async function handleStart() {
    if (!eventConfig || busyRef.current || captureState !== "ready") {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      setCameraMessage("Camera preview is unavailable.");
      setCaptureState("error");
      return;
    }

    busyRef.current = true;
    const token = captureTokenRef.current + 1;
    captureTokenRef.current = token;
    setFinalOutput(null);
    setSavedPhoto(null);
    setCameraMessage("");

    try {
      const totalShots = clampCaptureCount(eventConfig.captureCount);
      const capturedFrames: CapturedFrame[] = [];

      for (let index = 0; index < totalShots; index += 1) {
        if (captureTokenRef.current !== token) {
          return;
        }

        setShotProgress({ current: index + 1, total: totalShots });
        setCaptureState("countdown");
        const completedCountdown = await runCountdown(
          eventConfig.countdownSeconds,
          token,
          captureTokenRef,
          setCountdown
        );

        if (!completedCountdown) {
          return;
        }

        setCaptureState("capturing");
        capturedFrames.push(captureFrame(video));

        if (index < totalShots - 1) {
          setCaptureState("processing");
          await delay(400);
        }
      }

      setCaptureState("processing");
      setShotProgress(null);
      const composed = await composePhoto({
        capturedFrames,
        eventConfig,
        layout: getScaledLayoutForEvent(eventConfig)
      });

      if (captureTokenRef.current !== token) {
        return;
      }

      setFinalOutput(composed);
      setCaptureState("preview");
    } catch (error) {
      setCameraMessage(
        error instanceof Error ? error.message : "Capture could not be completed."
      );
      setCaptureState("error");
    } finally {
      if (captureTokenRef.current === token) {
        setCountdown(null);
        setShotProgress(null);
        busyRef.current = false;
      }
    }
  }

  function handleRetake() {
    if (busyRef.current) {
      return;
    }

    captureTokenRef.current += 1;
    setCountdown(null);
    setShotProgress(null);
    setFinalOutput(null);
    setSavedPhoto(null);
    setCameraMessage("");
    setCaptureState("ready");
  }

  async function handleSave() {
    if (!eventConfig || !finalOutput || savedPhoto) {
      return;
    }

    try {
      setCaptureState("processing");

      const id = createEntityId("photo");
      const thumbnailDataUrl = await createThumbnailDataUrl(finalOutput.imageDataUrl);
      const photo: PhotoRecord = {
        id,
        eventId: eventConfig.id,
        eventSlug: eventConfig.slug,
        imageDataUrl: finalOutput.imageDataUrl,
        thumbnailDataUrl,
        width: finalOutput.width,
        height: finalOutput.height,
        status: "saved",
        createdAt: new Date().toISOString()
      };

      const saved = await savePhotoRecord(photo);
      setSavedPhoto(saved);
      setCaptureState("saved");
    } catch (error) {
      setCameraMessage(
        error instanceof Error ? error.message : "Photo could not be saved."
      );
      setCaptureState("error");
    }
  }

  return {
    cameraMessage,
    captureState,
    countdown,
    eventConfig,
    finalOutput,
    savedPhoto,
    shotProgress,
    videoRef,
    handleCameraError,
    handleCameraReady,
    handleRetake,
    handleSave,
    handleStart
  };
}
