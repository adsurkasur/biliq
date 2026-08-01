"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getEnabledCaptureModes,
  getGifCaptureSettings,
  getVideoCaptureSettings
} from "@/domain/events/defaults";
import { getEventBySlug } from "@/domain/events/storage";
import type { CaptureMode, EventConfig } from "@/domain/events/types";
import {
  getCaptureCountForEvent,
  getScaledLayoutForEvent
} from "@/domain/layouts/defaultLayouts";
import { captureFrame } from "@/domain/media/captureFrame";
import { composeAnimation } from "@/domain/media/composeAnimation";
import { composePhoto, createThumbnailDataUrl } from "@/domain/media/composePhoto";
import { recordVideo } from "@/domain/media/recordVideo";
import type {
  CapturedFrame,
  ComposedOutput
} from "@/domain/media/types";
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
  const [isEventLoaded, setIsEventLoaded] = useState(false);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [activeMode, setActiveModeState] = useState<CaptureMode>("photo");
  const [cameraMessage, setCameraMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingSecondsRemaining, setRecordingSecondsRemaining] = useState<
    number | null
  >(null);
  const [captureFeedbackKey, setCaptureFeedbackKey] = useState(0);
  const [shotProgress, setShotProgress] = useState<ShotProgress | null>(null);
  const [finalOutput, setFinalOutput] = useState<ComposedOutput | null>(null);
  const [savedPhoto, setSavedPhoto] = useState<PhotoRecord | null>(null);

  useEffect(() => {
    let isActive = true;

    getEventBySlug(eventSlug)
      .then((event) => {
        if (!isActive) return;
        setEventConfig(event ?? null);
        if (event) {
          setActiveModeState(getEnabledCaptureModes(event)[0]);
        }
      })
      .catch((error) => {
        if (!isActive) return;
        setCameraMessage(
          error instanceof Error ? error.message : "The event could not be loaded."
        );
        setEventConfig(null);
      })
      .finally(() => {
        if (isActive) setIsEventLoaded(true);
      });

    return () => {
      isActive = false;
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

  function handleModeChange(mode: CaptureMode) {
    if (!eventConfig || busyRef.current || captureState !== "ready") return;
    if (!getEnabledCaptureModes(eventConfig).includes(mode)) return;
    setActiveModeState(mode);
  }

  async function handleStart() {
    if (!eventConfig || busyRef.current || captureState !== "ready") return;

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
    setRecordingSecondsRemaining(null);

    try {
      const layout = getScaledLayoutForEvent(eventConfig);
      let output: ComposedOutput;

      if (activeMode === "video") {
        const completedCountdown = await runSessionCountdown(eventConfig, token);
        if (!completedCountdown) return;

        const videoSettings = getVideoCaptureSettings(eventConfig);
        setCaptureState("recording");
        output = await recordVideo({
          video,
          eventConfig,
          durationSeconds: videoSettings.durationSeconds,
          onTick: (remaining) => {
            if (captureTokenRef.current === token) {
              setRecordingSecondsRemaining(remaining);
            }
          }
        });
      } else if (activeMode === "gif" || activeMode === "boomerang") {
        const completedCountdown = await runSessionCountdown(eventConfig, token);
        if (!completedCountdown) return;

        const gifSettings = getGifCaptureSettings(eventConfig);
        const capturedFrames: CapturedFrame[] = [];

        for (let index = 0; index < gifSettings.frameCount; index += 1) {
          if (captureTokenRef.current !== token) return;
          setCaptureState("capturing");
          setShotProgress({ current: index + 1, total: gifSettings.frameCount });
          capturedFrames.push(captureFrame(video));
          setCaptureFeedbackKey((current) => current + 1);

          if (index < gifSettings.frameCount - 1) {
            await delay(gifSettings.frameDelayMs);
          }
        }

        setCaptureState("processing");
        setShotProgress(null);
        output = await composeAnimation({
          capturedFrames,
          eventConfig,
          layout,
          frameDelayMs: gifSettings.frameDelayMs,
          reverse: activeMode === "boomerang"
        });
      } else {
        const totalShots = getCaptureCountForEvent(eventConfig);
        const capturedFrames: CapturedFrame[] = [];

        for (let index = 0; index < totalShots; index += 1) {
          if (captureTokenRef.current !== token) return;

          setShotProgress({ current: index + 1, total: totalShots });
          setCaptureState("countdown");
          const completedCountdown = await runCountdown(
            eventConfig.countdownSeconds,
            token,
            captureTokenRef,
            setCountdown
          );
          if (!completedCountdown) return;

          setCaptureState("capturing");
          capturedFrames.push(captureFrame(video));
          setCaptureFeedbackKey((current) => current + 1);

          if (index < totalShots - 1) {
            setCaptureState("processing");
            await delay(400);
          }
        }

        setCaptureState("processing");
        setShotProgress(null);
        const composed = await composePhoto({ capturedFrames, eventConfig, layout });
        output = {
          kind: "photo",
          mediaDataUrl: composed.imageDataUrl,
          imageDataUrl: composed.imageDataUrl,
          mimeType: "image/jpeg",
          width: composed.width,
          height: composed.height
        };
      }

      if (captureTokenRef.current !== token) return;
      setFinalOutput(output);
      setCaptureState("preview");
    } catch (error) {
      setCameraMessage(
        error instanceof Error ? error.message : "Capture could not be completed."
      );
      setCaptureState("error");
    } finally {
      if (captureTokenRef.current === token) {
        setCountdown(null);
        setRecordingSecondsRemaining(null);
        setShotProgress(null);
        busyRef.current = false;
      }
    }
  }

  function handleRetake() {
    if (busyRef.current) return;
    captureTokenRef.current += 1;
    setCountdown(null);
    setRecordingSecondsRemaining(null);
    setShotProgress(null);
    setFinalOutput(null);
    setSavedPhoto(null);
    setCameraMessage("");
    setCaptureState("ready");
  }

  async function handleSave() {
    if (!eventConfig || !finalOutput || savedPhoto) return;

    try {
      setCaptureState("processing");
      const id = createEntityId("photo");
      const thumbnailDataUrl = await createThumbnailDataUrl(finalOutput.imageDataUrl);
      const photo: PhotoRecord = {
        id,
        eventId: eventConfig.id,
        eventSlug: eventConfig.slug,
        kind: finalOutput.kind,
        mediaDataUrl: finalOutput.mediaDataUrl,
        imageDataUrl: finalOutput.imageDataUrl,
        thumbnailDataUrl,
        mimeType: finalOutput.mimeType,
        durationMs: finalOutput.durationMs,
        frameCount: finalOutput.frameCount,
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
        error instanceof Error ? error.message : "Capture could not be saved."
      );
      setCaptureState("error");
      throw error;
    }
  }

  async function runSessionCountdown(event: EventConfig, token: number) {
    setShotProgress(null);
    setCaptureState("countdown");
    return runCountdown(
      event.countdownSeconds,
      token,
      captureTokenRef,
      setCountdown
    );
  }

  return {
    activeMode,
    cameraMessage,
    captureState,
    countdown,
    captureFeedbackKey,
    eventConfig,
    finalOutput,
    isEventLoaded,
    recordingSecondsRemaining,
    savedPhoto,
    shotProgress,
    videoRef,
    handleCameraError,
    handleCameraReady,
    handleModeChange,
    handleRetake,
    handleSave,
    handleStart
  };
}
