"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { Camera, Home, Settings } from "lucide-react";
import type { EventConfig } from "@/domain/events/types";
import { clampCaptureCount } from "@/domain/layouts/defaultLayouts";
import { CameraPreview } from "@/features/booth/components/CameraPreview";
import { CaptureProgress } from "@/features/booth/components/CaptureProgress";
import { CountdownOverlay } from "@/features/booth/components/CountdownOverlay";
import type { CaptureState, ShotProgress } from "@/features/booth/lib/boothState";
import { routes } from "@/shared/config/routes";

interface BoothCaptureSurfaceProps {
  eventConfig: EventConfig;
  captureState: CaptureState;
  cameraMessage: string;
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
  countdown,
  shotProgress,
  videoRef,
  onCameraReady,
  onCameraError,
  onStart
}: BoothCaptureSurfaceProps) {
  const totalShots = clampCaptureCount(eventConfig.captureCount);
  const canStart = captureState === "ready";

  return (
    <main className="h-dvh overflow-hidden bg-stone-950 text-white">
      <div className="relative flex h-dvh items-center justify-center px-3 py-4 sm:px-5">
        <header className="absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-3 sm:left-5 sm:right-5">
          <div className="min-w-0 rounded-full bg-stone-950/55 px-4 py-2 backdrop-blur">
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-teal-100">
              {eventConfig.name}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={routes.home}
              className="booth-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-950/55 text-white backdrop-blur hover:bg-stone-800"
              aria-label="Events"
              title="Events"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={routes.setup(eventConfig.slug)}
              className="booth-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-950/55 text-white backdrop-blur hover:bg-stone-800"
              aria-label="Setup"
              title="Setup"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
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
          className="max-h-[calc(100dvh-2rem)] max-w-[min(96vw,calc((100dvh-2rem)*0.75))] rounded-xl"
        >
          <CountdownOverlay
            value={countdown}
            label={
              shotProgress
                ? `Photo ${shotProgress.current} of ${shotProgress.total}`
                : undefined
            }
          />

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
              className="booth-focus-ring pointer-events-auto inline-flex min-h-16 items-center gap-3 rounded-full bg-teal-600 px-8 py-4 text-xl font-black text-white shadow-booth hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
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
