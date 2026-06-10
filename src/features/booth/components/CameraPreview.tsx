"use client";

import { type CSSProperties, type ReactNode, type RefObject } from "react";
import { Camera, VideoOff } from "lucide-react";
import { useCameraStream } from "@/features/booth/hooks/useCameraStream";
import { Spinner } from "@/shared/components/ui/Spinner";
import type { EventConfig } from "@/domain/events/types";
import { getEffectiveOverlayLayers } from "@/domain/events/storage";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  preferredFacingMode?: "environment" | "user";
  outputWidth?: number;
  outputHeight?: number;
  eventConfig?: EventConfig;
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
  eventConfig,
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

  const overlayLayers = eventConfig ? getEffectiveOverlayLayers(eventConfig) : [];
  const visibleLayers = overlayLayers.filter((layer) => layer.visible).sort((a, b) => a.zIndex - b.zIndex);

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

      {visibleLayers.map((layer) => {
        const leftPercent = (layer.x / outputWidth) * 100;
        const topPercent = (layer.y / outputHeight) * 100;
        const widthPercent = (layer.width / outputWidth) * 100;
        const heightPercent = (layer.height / outputHeight) * 100;

        return (
          <img
            key={layer.id}
            src={layer.imageDataUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute z-10 object-fill"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              width: `${widthPercent}%`,
              height: `${heightPercent}%`,
              transform: `rotate(${layer.rotation}deg)`,
              opacity: layer.opacity,
              zIndex: 10 + layer.zIndex
            }}
          />
        );
      })}

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
