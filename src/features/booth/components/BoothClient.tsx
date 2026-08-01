"use client";

import { useState } from "react";
import Link from "next/link";
import { BoothCaptureSurface } from "@/features/booth/components/BoothCaptureSurface";
import { BoothReviewPanel } from "@/features/booth/components/BoothReviewPanel";
import { useBoothSession } from "@/features/booth/hooks/useBoothSession";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { routes } from "@/shared/config/routes";
import { Camera } from "lucide-react";

interface BoothClientProps {
  eventSlug: string;
}

export function BoothClient({ eventSlug }: BoothClientProps) {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isLeavingWelcome, setIsLeavingWelcome] = useState(false);
  const {
    activeMode,
    cameraMessage,
    captureFeedbackKey,
    captureState,
    countdown,
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
  } = useBoothSession(eventSlug);

  if (!isEventLoaded) {
    return (
      <LoadingIndicator 
        variant="page" 
        label="Loading booth…" 
        description="Preparing the event session."
      />
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
        showWelcomeScreen={showWelcomeScreen}
        welcomeScreenExiting={isLeavingWelcome}
        activeMode={activeMode}
        captureState={captureState}
        cameraMessage={cameraMessage}
        captureFeedbackKey={captureFeedbackKey}
        countdown={countdown}
        shotProgress={shotProgress}
        recordingSecondsRemaining={recordingSecondsRemaining}
        videoRef={videoRef}
        onCameraReady={handleCameraReady}
        onCameraError={handleCameraError}
        onModeChange={handleModeChange}
        onEnterBooth={() => {
          if (isLeavingWelcome) return;
          setIsLeavingWelcome(true);
          window.setTimeout(
            () => setShowWelcomeScreen(false),
            document.documentElement.dataset.motion === "reduced" ? 1 : 240
          );
        }}
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
      activeMode={activeMode}
      savedPhoto={savedPhoto}
      onRetake={handleRetake}
      onSave={handleSave}
    />
  );
}
