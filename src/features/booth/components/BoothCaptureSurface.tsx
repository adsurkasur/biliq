"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { Camera, Home, Palette, Settings } from "lucide-react";
import type { EventConfig } from "@/domain/events/types";
import { getCaptureCountForEvent } from "@/domain/layouts/defaultLayouts";
import { CameraPreview } from "@/features/booth/components/CameraPreview";
import { CaptureProgress } from "@/features/booth/components/CaptureProgress";
import { CountdownOverlay } from "@/features/booth/components/CountdownOverlay";
import type { CaptureState, ShotProgress } from "@/features/booth/lib/boothState";
import { routes } from "@/shared/config/routes";

interface BoothCaptureSurfaceProps {
  eventConfig: EventConfig;
  captureState: CaptureState;
  cameraMessage: string;
  captureFeedbackKey: number;
  countdown: number | null;
  shotProgress: ShotProgress | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onCameraReady: () => void;
  onCameraError: (message: string) => void;
  onStart: () => void;
}

export function BoothCaptureSurface({
  eventConfig,
  captureState,
  cameraMessage,
  captureFeedbackKey,
  countdown,
  shotProgress,
  videoRef,
  onCameraReady,
  onCameraError,
  onStart
}: BoothCaptureSurfaceProps) {
  const totalShots = getCaptureCountForEvent(eventConfig);
  const canStart = captureState === "ready";
  const frameRatio = eventConfig.outputWidth / eventConfig.outputHeight;
  const frameHeightRatio = eventConfig.outputHeight / eventConfig.outputWidth;

  return (
    <main className="h-dvh overflow-hidden bg-stone-950 text-white">
      <div className="relative flex h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(0,121,107,0.12),transparent_32rem)]">
        <header className="motion-enter absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-3 sm:left-5 sm:right-5">
          <div className="min-w-0 rounded-[var(--booth-radius-full)] border border-white/10 bg-stone-950/60 px-4 py-2 shadow-[var(--booth-elevation-2)] backdrop-blur-md">
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-teal-200">
              {eventConfig.name}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={routes.home}
              className="booth-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--booth-radius-full)] border border-white/10 bg-stone-950/60 text-white backdrop-blur-md transition-all hover:bg-white/15 active:scale-95"
              aria-label="Events"
              title="Events"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={routes.setup(eventConfig.slug)}
              className="booth-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--booth-radius-full)] border border-white/10 bg-stone-950/60 text-white backdrop-blur-md transition-all hover:bg-white/15 active:scale-95"
              aria-label="Setup"
              title="Setup"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={routes.designer(eventConfig.slug)}
              className="booth-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--booth-radius-full)] border border-white/10 bg-stone-950/60 text-white backdrop-blur-md transition-all hover:bg-white/15 active:scale-95"
              aria-label="Designer"
              title="Designer"
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <CameraPreview
          videoRef={videoRef}
          preferredFacingMode="environment"
          outputWidth={eventConfig.outputWidth}
          outputHeight={eventConfig.outputHeight}
          overlayDataUrl={eventConfig.overlayDataUrl}
          onReady={onCameraReady}
          onError={onCameraError}
          className="booth-viewfinder-enter rounded-none ring-1 ring-white/10 sm:rounded-[var(--booth-radius-xl)]"
          style={{
            width: `min(100vw, calc(100dvh * ${frameRatio}))`,
            height: `min(100dvh, calc(100vw * ${frameHeightRatio}))`,
            maxWidth: "100vw",
            maxHeight: "100dvh"
          }}
        >
          <CountdownOverlay
            value={countdown}
            label={
              shotProgress
                ? `Photo ${shotProgress.current} of ${shotProgress.total}`
                : undefined
            }
          />

          {captureFeedbackKey > 0 ? (
            <div
              key={captureFeedbackKey}
              className="capture-flash pointer-events-none absolute inset-0 z-40 bg-white"
              aria-hidden="true"
            />
          ) : null}

          {captureFeedbackKey > 0 && captureState === "processing" ? (
            <div
              key={`pulse-${captureFeedbackKey}`}
              className="capture-success-pulse pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-[var(--booth-radius-full)] bg-white/95 px-5 py-2 text-lg font-black text-stone-950 shadow-[var(--booth-elevation-3)]"
            >
              Captured
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-5 text-center">
            <CaptureProgress
              captureState={captureState}
              countdown={countdown}
              cameraMessage={cameraMessage}
              shotProgress={shotProgress}
            />

            <button
              type="button"
              disabled={!canStart}
              onClick={onStart}
              className="booth-focus-ring booth-start-enter pointer-events-auto inline-flex min-h-16 items-center gap-3 rounded-[var(--booth-radius-full)] bg-[var(--booth-primary)] px-8 py-4 text-xl font-black text-white shadow-[var(--booth-elevation-3)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:animate-none disabled:opacity-40"
            >
              <Camera className="h-7 w-7" aria-hidden="true" />
              {totalShots > 1 ? `Start ${totalShots} Photos` : "Start"}
            </button>
          </div>
        </CameraPreview>
      </div>
    </main>
  );
}
