import { getCaptureModeLabel } from "@/domain/events/captureModes";
import type { CaptureMode } from "@/domain/events/types";
import type { CaptureState, ShotProgress } from "@/features/booth/lib/boothState";
import { getStateLabel } from "@/features/booth/lib/boothState";

interface CaptureProgressProps {
  activeMode: CaptureMode;
  captureState: CaptureState;
  countdown: number | null;
  cameraMessage: string;
  shotProgress: ShotProgress | null;
  recordingSecondsRemaining: number | null;
}

export function CaptureProgress({
  activeMode,
  captureState,
  countdown,
  cameraMessage,
  shotProgress,
  recordingSecondsRemaining
}: CaptureProgressProps) {
  const isBusy =
    captureState === "countdown" ||
    captureState === "capturing" ||
    captureState === "recording" ||
    captureState === "processing";

  return (
    <>
      {shotProgress && countdown === null ? (
        <div className="motion-pop flex flex-col items-center gap-2 rounded-[var(--booth-radius-2xl)] border border-white/10 bg-stone-950/65 px-5 py-3 text-white shadow-[var(--booth-elevation-3)] backdrop-blur-md">
          <div className="text-lg font-bold">
            {activeMode === "photo" ? "Photo" : "Frame"} {shotProgress.current} of{" "}
            {shotProgress.total}
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: shotProgress.total }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-[var(--booth-radius-full)] transition-all duration-300 ${
                  index < shotProgress.current
                    ? "scale-110 bg-teal-300"
                    : "bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {captureState === "recording" && recordingSecondsRemaining !== null ? (
        <div className="motion-pop flex items-center gap-3 rounded-[var(--booth-radius-full)] bg-red-600 px-5 py-2 text-base font-black text-white shadow-[var(--booth-elevation-3)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-white" aria-hidden="true" />
          Recording {recordingSecondsRemaining}s
        </div>
      ) : null}

      {isBusy && captureState !== "recording" ? (
        <div className="motion-pop rounded-[var(--booth-radius-full)] bg-white/95 px-5 py-2 text-base font-bold text-stone-950 shadow-[var(--booth-elevation-3)]">
          {captureState === "capturing"
            ? `Capturing ${getCaptureModeLabel(activeMode)}`
            : getStateLabel(captureState)}
        </div>
      ) : null}

      {captureState === "error" && cameraMessage ? (
        <div className="motion-pop max-w-md rounded-[var(--booth-radius-lg)] bg-[var(--booth-error-container)] px-4 py-3 text-sm font-semibold text-[var(--booth-on-error-container)] shadow-[var(--booth-elevation-3)]">
          {cameraMessage}
        </div>
      ) : null}
    </>
  );
}
