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
        <div className="rounded-full bg-stone-950/65 px-5 py-2 text-lg font-bold text-white backdrop-blur">
          Photo {shotProgress.current} of {shotProgress.total}
        </div>
      ) : null}

      {isBusy ? (
        <div className="rounded-full bg-white/95 px-5 py-2 text-base font-bold text-stone-950 shadow-booth">
          {getStateLabel(captureState)}
        </div>
      ) : null}

      {captureState === "error" && cameraMessage ? (
        <div className="max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-booth">
          {cameraMessage}
        </div>
      ) : null}
    </>
  );
}
