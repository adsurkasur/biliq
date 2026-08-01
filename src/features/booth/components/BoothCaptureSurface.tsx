"use client";

import type { RefObject } from "react";
import { Camera, Images, Repeat2, Video } from "lucide-react";
import {
  getEnabledCaptureModes,
  getWelcomeScreenConfig,
  getVideoCaptureSettings
} from "@/domain/events/defaults";
import { getCaptureModeLabel } from "@/domain/events/captureModes";
import type { CaptureMode, EventConfig } from "@/domain/events/types";
import { getCaptureCountForEvent } from "@/domain/layouts/defaultLayouts";
import { CameraPreview } from "@/features/booth/components/CameraPreview";
import { CaptureProgress } from "@/features/booth/components/CaptureProgress";
import { CountdownOverlay } from "@/features/booth/components/CountdownOverlay";
import type { CaptureState, ShotProgress } from "@/features/booth/lib/boothState";
import { routes } from "@/shared/config/routes";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";

interface BoothCaptureSurfaceProps {
  eventConfig: EventConfig;
  showWelcomeScreen: boolean;
  welcomeScreenExiting: boolean;
  activeMode: CaptureMode;
  captureState: CaptureState;
  cameraMessage: string;
  captureFeedbackKey: number;
  countdown: number | null;
  shotProgress: ShotProgress | null;
  recordingSecondsRemaining: number | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onCameraReady: () => void;
  onCameraError: (message: string) => void;
  onModeChange: (mode: CaptureMode) => void;
  onEnterBooth: () => void;
  onStart: () => void;
}

export function BoothCaptureSurface({
  eventConfig,
  showWelcomeScreen,
  welcomeScreenExiting,
  activeMode,
  captureState,
  cameraMessage,
  captureFeedbackKey,
  countdown,
  shotProgress,
  recordingSecondsRemaining,
  videoRef,
  onCameraReady,
  onCameraError,
  onModeChange,
  onEnterBooth,
  onStart
}: BoothCaptureSurfaceProps) {
  const totalShots = getCaptureCountForEvent(eventConfig);
  const enabledModes = getEnabledCaptureModes(eventConfig);
  const canStart = captureState === "ready";
  const welcomeScreen = getWelcomeScreenConfig(eventConfig);
  const isWelcomeVisible = showWelcomeScreen && welcomeScreen.enabled;
  const activeCanvasWidth = isWelcomeVisible
    ? welcomeScreen.canvasWidth
    : eventConfig.outputWidth;
  const activeCanvasHeight = isWelcomeVisible
    ? welcomeScreen.canvasHeight
    : eventConfig.outputHeight;
  const frameRatio = activeCanvasWidth / activeCanvasHeight;
  const frameHeightRatio = activeCanvasHeight / activeCanvasWidth;

  return (
    <main className="h-dvh overflow-hidden bg-stone-950 text-white">
      <div className="relative flex h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(0,121,107,0.12),transparent_32rem)]">
        <header className="motion-enter absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-3 sm:left-5 sm:right-5">
          <div className="min-w-0 rounded-[var(--booth-radius-full)] border border-white/10 bg-stone-950/60 px-4 py-2 shadow-[var(--booth-elevation-2)] backdrop-blur-md">
            <p className="truncate text-sm font-semibold uppercase tracking-wide text-teal-200">
              {eventConfig.name}
            </p>
          </div>

          <EventNavigation eventSlug={eventConfig.slug} activeRoute="booth" theme="booth" />
        </header>

        <CameraPreview
          videoRef={videoRef}
          preferredFacingMode={isWelcomeVisible ? welcomeScreen.cameraFacingMode : "environment"}
          outputWidth={activeCanvasWidth}
          outputHeight={activeCanvasHeight}
          eventConfig={eventConfig}
          overlayLayers={isWelcomeVisible ? [] : undefined}
          videoVisible={isWelcomeVisible ? welcomeScreen.showCamera : true}
          videoFit={isWelcomeVisible ? welcomeScreen.cameraFit : "cover"}
          includeAudio={getVideoCaptureSettings(eventConfig).includeAudio}
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
          {isWelcomeVisible ? (
            <WelcomeScreenOverlay
              config={welcomeScreen}
              isExiting={welcomeScreenExiting}
              onEnterBooth={onEnterBooth}
            />
          ) : (
            <div className="motion-section" key="capture-experience">
              <CountdownOverlay
                value={countdown}
                label={
                  shotProgress
                    ? `${activeMode === "photo" ? "Photo" : "Frame"} ${shotProgress.current} of ${shotProgress.total}`
                    : getCaptureModeLabel(activeMode)
                }
              />
            </div>
          )}

          {!isWelcomeVisible && captureFeedbackKey > 0 ? (
            <div
              key={captureFeedbackKey}
              className="capture-flash pointer-events-none absolute inset-0 z-40 bg-white"
              aria-hidden="true"
            />
          ) : null}

          {!isWelcomeVisible && captureFeedbackKey > 0 && captureState === "processing" ? (
            <div
              key={`pulse-${captureFeedbackKey}`}
              className="capture-success-pulse pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-[var(--booth-radius-full)] bg-white/95 px-5 py-2 text-lg font-black text-stone-950 shadow-[var(--booth-elevation-3)]"
            >
              Captured
            </div>
          ) : null}

          {!isWelcomeVisible ? (
          <div data-app-guide="capture-controls" className="motion-section pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-5 text-center">
            {canStart && enabledModes.length > 1 ? (
              <div
                className="pointer-events-auto grid max-w-2xl grid-cols-2 gap-2 rounded-[var(--booth-radius-2xl)] border border-white/10 bg-stone-950/72 p-2 shadow-[var(--booth-elevation-3)] backdrop-blur-md sm:grid-cols-4"
                aria-label="Choose capture mode"
              >
                {enabledModes.map((mode) => {
                  const Icon = modeIcon(mode);
                  const isActive = mode === activeMode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onModeChange(mode)}
                      className={`booth-focus-ring flex min-h-14 items-center justify-center gap-2 rounded-[var(--booth-radius-xl)] px-4 py-3 text-sm font-black transition-all ${
                        isActive
                          ? "bg-white text-stone-950 shadow-lg"
                          : "text-white hover:bg-white/12"
                      }`}
                      aria-pressed={isActive}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {getCaptureModeLabel(mode)}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <CaptureProgress
              activeMode={activeMode}
              captureState={captureState}
              countdown={countdown}
              cameraMessage={cameraMessage}
              shotProgress={shotProgress}
              recordingSecondsRemaining={recordingSecondsRemaining}
            />

            <button
              type="button"
              disabled={!canStart}
              onClick={onStart}
              className="booth-focus-ring booth-start-enter pointer-events-auto inline-flex min-h-16 items-center gap-3 rounded-[var(--booth-radius-full)] bg-[var(--booth-primary)] px-8 py-4 text-xl font-black text-white shadow-[var(--booth-elevation-3)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:animate-none disabled:opacity-40"
            >
              {activeMode === "video" ? (
                <Video className="h-7 w-7" aria-hidden="true" />
              ) : activeMode === "gif" ? (
                <Images className="h-7 w-7" aria-hidden="true" />
              ) : activeMode === "boomerang" ? (
                <Repeat2 className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Camera className="h-7 w-7" aria-hidden="true" />
              )}
              {startButtonLabel(activeMode, totalShots)}
            </button>
          </div>
          ) : null}
        </CameraPreview>
      </div>
    </main>
  );
}

function WelcomeScreenOverlay({
  config,
  isExiting,
  onEnterBooth
}: {
  config: ReturnType<typeof getWelcomeScreenConfig>;
  isExiting: boolean;
  onEnterBooth: () => void;
}) {
  return (
    <div
      className={`${isExiting ? "motion-welcome-exit" : "motion-section"} absolute inset-0`}
      key="welcome-experience"
      style={{
        backgroundColor: config.showCamera ? undefined : config.backgroundColor,
        containerType: "inline-size"
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: config.showCamera
            ? "linear-gradient(to bottom, rgba(0,0,0,.48), rgba(0,0,0,.06) 45%, rgba(0,0,0,.58))"
            : config.backgroundColor
        }}
      />

      {config.overlayLayers.filter((layer) => layer.visible).map((layer) => (
        <img
          key={layer.id}
          src={layer.imageDataUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute object-fill"
          style={{
            left: `${(layer.x / config.canvasWidth) * 100}%`,
            top: `${(layer.y / config.canvasHeight) * 100}%`,
            width: `${(layer.width / config.canvasWidth) * 100}%`,
            height: `${(layer.height / config.canvasHeight) * 100}%`,
            transform: `rotate(${layer.rotation}deg)`,
            opacity: layer.opacity,
            zIndex: 10 + layer.zIndex
          }}
        />
      ))}

      {config.elements.filter((element) => element.visible).map((element) => {
        const style = {
          left: `${(element.x / config.canvasWidth) * 100}%`,
          top: `${(element.y / config.canvasHeight) * 100}%`,
          width: `${(element.width / config.canvasWidth) * 100}%`,
          height: `${(element.height / config.canvasHeight) * 100}%`,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity,
          color: element.color,
          backgroundColor: element.type === "start-button" ? element.backgroundColor : "transparent",
          borderRadius: element.borderRadius,
          fontSize: `clamp(14px, ${(element.fontSize / config.canvasWidth) * 100}cqw, ${element.fontSize}px)`,
          fontWeight: element.fontWeight,
          zIndex: 40
        };

        if (element.type === "start-button") {
          return (
            <button
              key={element.id}
              type="button"
              onClick={onEnterBooth}
              className="booth-focus-ring booth-start-enter absolute grid place-items-center px-4 text-center leading-tight shadow-[var(--booth-elevation-3)] transition-all hover:brightness-110 active:scale-95"
              style={style}
            >
              {element.text}
            </button>
          );
        }

        return (
          <div
            key={element.id}
            className="pointer-events-none absolute grid place-items-center px-3 text-center leading-tight"
            style={style}
          >
            {element.text}
          </div>
        );
      })}
    </div>
  );
}

function modeIcon(mode: CaptureMode) {
  if (mode === "gif") return Images;
  if (mode === "boomerang") return Repeat2;
  if (mode === "video") return Video;
  return Camera;
}

function startButtonLabel(mode: CaptureMode, totalShots: number): string {
  if (mode === "photo") {
    return totalShots > 1 ? `Start ${totalShots} Photos` : "Take Photo";
  }

  return `Start ${getCaptureModeLabel(mode)}`;
}
