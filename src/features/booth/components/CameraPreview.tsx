"use client";

import { type CSSProperties, type ReactNode, type RefObject } from "react";
import { Camera, VideoOff } from "lucide-react";
import { useCameraStream } from "@/features/booth/hooks/useCameraStream";
import { Spinner } from "@/shared/components/ui/Spinner";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  preferredFacingMode?: "environment" | "user";
  outputWidth?: number;
  outputHeight?: number;
  overlayDataUrl?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export function CameraPreview({
  videoRef,
  preferredFacingMode = "environment",
  outputWidth = 1200,
  outputHeight = 1600,
  overlayDataUrl,
  className = "",
  style,
  children,
  onReady,
  onError
}: CameraPreviewProps) {
  const { state, message } = useCameraStream({
    videoRef,
    preferredFacingMode,
    onReady,
    onError
  });

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-stone-950 shadow-booth ${className}`}
      style={{ aspectRatio: `${outputWidth} / ${outputHeight}`, ...style }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {overlayDataUrl ? (
        <img
          src={overlayDataUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill"
        />
      ) : null}

      {state !== "ready" ? (
        <div className="motion-enter absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-stone-950/86 p-8 text-center text-white backdrop-blur-sm">
          {state === "error" ? (
            <VideoOff className="h-12 w-12 text-amber-300" aria-hidden="true" />
          ) : (
            <Camera className="h-12 w-12 text-teal-200" aria-hidden="true" />
          )}
          <p className="max-w-sm text-lg font-semibold leading-snug">{message}</p>
          {state !== "error" ? <Spinner label="Opening camera" /> : null}
        </div>
      ) : null}

      {children ? <div className="absolute inset-0 z-30">{children}</div> : null}
    </div>
  );
}
