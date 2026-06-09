"use client";

import { useEffect, useState } from "react";
import { getImageDimensions, type ImageDimensions } from "@/shared/lib/image";

export function useOverlayDimensions(
  overlayDataUrl?: string
): ImageDimensions | null {
  const [overlayDimensions, setOverlayDimensions] =
    useState<ImageDimensions | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!overlayDataUrl) {
      setOverlayDimensions(null);
      return;
    }

    getImageDimensions(overlayDataUrl)
      .then((dimensions) => {
        if (mounted) {
          setOverlayDimensions(dimensions);
        }
      })
      .catch(() => {
        if (mounted) {
          setOverlayDimensions(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [overlayDataUrl]);

  return overlayDimensions;
}
