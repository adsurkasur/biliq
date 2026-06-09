import type { CaptureState, ShotProgress } from "@/features/booth/lib/boothState";
import { getStateLabel } from "@/features/booth/lib/boothState";

interface CaptureProgressProps {
  captureState: CaptureState;
  countdown: number | null;
  cameraMessage: string;
  shotProgress: ShotProgress | null;
}

export function CaptureProgress({
  captureState,
  countdown,
  cameraMessage,
  shotProgress
}: CaptureProgressProps) {
  const isBusy =
    captureState === "countdown" ||
    captureState === "capturing" ||
    captureState === "processing";

  return (
    <>
      {shotProgress && countdown === null ? (
        <div className="motion-pop flex flex-col items-center gap-2 rounded-[var(--booth-radius-2xl)] border border-white/10 bg-stone-950/65 px-5 py-3 text-white shadow-[var(--booth-elevation-3)] backdrop-blur-md">
          <div className="text-lg font-bold">
            Photo {shotProgress.current} of {shotProgress.total}
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

      {isBusy ? (
        <div className="motion-pop rounded-[var(--booth-radius-full)] bg-white/95 px-5 py-2 text-base font-bold text-stone-950 shadow-[var(--booth-elevation-3)]">
          {getStateLabel(captureState)}
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
