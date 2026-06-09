"use client";

import Link from "next/link";
import { BoothCaptureSurface } from "@/features/booth/components/BoothCaptureSurface";
import { BoothReviewPanel } from "@/features/booth/components/BoothReviewPanel";
import { useBoothSession } from "@/features/booth/hooks/useBoothSession";
import { routes } from "@/shared/config/routes";

interface BoothClientProps {
  eventSlug: string;
}

export function BoothClient({ eventSlug }: BoothClientProps) {
  const {
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
  } = useBoothSession(eventSlug);

  if (!eventConfig) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <div className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-stone-950">Event not found</h1>
          <p className="mt-3 text-stone-600">
            Create or edit a local event before opening the booth route.
          </p>
          <Link
            href={routes.setup()}
            className="booth-focus-ring mt-6 inline-flex min-h-12 items-center rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Open setup
          </Link>
        </div>
      </main>
    );
  }

  if (!finalOutput) {
    return (
      <BoothCaptureSurface
        eventConfig={eventConfig}
        captureState={captureState}
        cameraMessage={cameraMessage}
        countdown={countdown}
        shotProgress={shotProgress}
        videoRef={videoRef}
        onCameraReady={handleCameraReady}
        onCameraError={handleCameraError}
        onStart={handleStart}
      />
    );
  }

  return (
    <BoothReviewPanel
      cameraMessage={cameraMessage}
      captureState={captureState}
      eventConfig={eventConfig}
      finalOutput={finalOutput}
      savedPhoto={savedPhoto}
      onRetake={handleRetake}
      onSave={handleSave}
    />
  );
}
