"use client";

import Link from "next/link";
import { BoothCaptureSurface } from "@/features/booth/components/BoothCaptureSurface";
import { BoothReviewPanel } from "@/features/booth/components/BoothReviewPanel";
import { useBoothSession } from "@/features/booth/hooks/useBoothSession";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { routes } from "@/shared/config/routes";
import { Camera } from "lucide-react";

interface BoothClientProps {
  eventSlug: string;
}

export function BoothClient({ eventSlug }: BoothClientProps) {
  const {
    cameraMessage,
    captureFeedbackKey,
    captureState,
    countdown,
    eventConfig,
    finalOutput,
    isEventLoaded,
    savedPhoto,
    shotProgress,
    videoRef,
    handleCameraError,
    handleCameraReady,
    handleRetake,
    handleSave,
    handleStart
  } = useBoothSession(eventSlug);

  if (!isEventLoaded) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <Card className="p-6">
          <Spinner label="Loading booth" className="text-stone-600" />
        </Card>
      </main>
    );
  }

  if (!eventConfig) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <EmptyState
          icon={Camera}
          title="Event not found"
          action={
            <Link
              href={routes.setup()}
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              Open setup
            </Link>
          }
        >
          Create or edit a local event before opening the booth route.
        </EmptyState>
      </main>
    );
  }

  if (!finalOutput) {
    return (
      <BoothCaptureSurface
        eventConfig={eventConfig}
        captureState={captureState}
        cameraMessage={cameraMessage}
        captureFeedbackKey={captureFeedbackKey}
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
