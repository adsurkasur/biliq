"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDefaultEventConfig,
  getEnabledCaptureModes,
  getGifCaptureSettings,
  getVideoCaptureSettings,
  OUTPUT_PRESETS
} from "@/domain/events/defaults";
import {
  getEffectiveOverlayLayers,
  getEventBySlug,
  upsertEventConfig
} from "@/domain/events/storage";
import type {
  CaptureMode,
  EventConfig,
  FramePlacementMode,
  OverlayLayer
} from "@/domain/events/types";
import {
  clampCaptureCount,
  CUSTOM_LAYOUT_ID,
  getRecommendedLayoutIdForCaptureCount
} from "@/domain/layouts/defaultLayouts";
import { calculateFramePlacement } from "@/features/setup/lib/framePlacement";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";
import { createEntityId } from "@/shared/lib/id";
import { getImageDimensions, type ImageDimensions } from "@/shared/lib/image";
import { toSlug } from "@/shared/lib/slug";

type SaveDestination = "home" | "designer" | "booth";

export function useEventSetupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingOverlay, setIsProcessingOverlay] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isExistingEvent, setIsExistingEvent] = useState(false);

  useEffect(() => {
    let isActive = true;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    Promise.resolve(slug ? getEventBySlug(slug) : undefined)
      .then((existing) => {
        if (!isActive) return;
        setEventConfig(
          existing
            ? {
                ...existing,
                framePlacement: existing.framePlacement ?? "stretch",
                captureModes: getEnabledCaptureModes(existing),
                gifSettings: getGifCaptureSettings(existing),
                videoSettings: getVideoCaptureSettings(existing)
              }
            : createDefaultEventConfig()
        );
        setSlugTouched(Boolean(existing));
        setIsExistingEvent(Boolean(existing));
      })
      .catch((error) => {
        if (!isActive) return;
        toast(
          error instanceof Error ? error.message : "The event setup could not load.",
          "error"
        );
        setEventConfig(createDefaultEventConfig());
      })
      .finally(() => {
        if (isActive) setIsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectedPresetId = useMemo(() => {
    if (!eventConfig) {
      return OUTPUT_PRESETS[0].id;
    }

    return (
      OUTPUT_PRESETS.find(
        (preset) =>
          preset.width === eventConfig.outputWidth &&
          preset.height === eventConfig.outputHeight
      )?.id ?? "custom"
    );
  }, [eventConfig]);

  const overlayLayers = useMemo(
    () => (eventConfig ? getEffectiveOverlayLayers(eventConfig) : []),
    [eventConfig]
  );
  const primaryOverlay = overlayLayers[overlayLayers.length - 1];

  function updateConfig(next: Partial<EventConfig>) {
    setEventConfig((current) => (current ? { ...current, ...next } : current));
  }

  function updateEventName(name: string) {
    setEventConfig((current) => {
      if (!current) return current;
      const shouldUpdateSlug = !slugTouched || current.slug === "new-event";
      return {
        ...current,
        name,
        slug: shouldUpdateSlug ? toSlug(name) : current.slug
      };
    });
  }

  function updateEventSlug(slug: string) {
    setSlugTouched(true);
    updateConfig({ slug: toSlug(slug) });
  }

  function handleCaptureCountChange(captureCountValue: number) {
    const captureCount = clampCaptureCount(captureCountValue);
    updateConfig({
      captureCount,
      layoutId: getRecommendedLayoutIdForCaptureCount(captureCount),
      customLayout: undefined
    });
  }

  function toggleCaptureMode(mode: CaptureMode) {
    if (!eventConfig) return;
    const enabledModes = getEnabledCaptureModes(eventConfig);

    if (enabledModes.includes(mode) && enabledModes.length === 1) {
      toast("Keep at least one capture mode enabled.", "info");
      return;
    }

    updateConfig({
      captureModes: enabledModes.includes(mode)
        ? enabledModes.filter((enabledMode) => enabledMode !== mode)
        : [...enabledModes, mode]
    });
  }

  function handleOutputPresetChange(
    presetId: string,
    sourceDimensions?: ImageDimensions | null
  ) {
    const preset = OUTPUT_PRESETS.find((option) => option.id === presetId);
    if (preset) {
      const placement =
        primaryOverlay && sourceDimensions
          ? calculateFramePlacement(
              sourceDimensions.width,
              sourceDimensions.height,
              preset.width,
              preset.height,
              eventConfig?.framePlacement ?? "fit"
            )
          : null;
      updateConfig({
        outputWidth: preset.width,
        outputHeight: preset.height,
        overlayLayers: placement
          ? overlayLayers.map((layer) =>
              layer.id === primaryOverlay.id
                ? {
                    ...layer,
                    ...placement,
                    aspectRatioLocked: eventConfig?.framePlacement !== "stretch",
                    updatedAt: new Date().toISOString()
                  }
                : layer
            )
          : eventConfig?.overlayLayers
      });
    }
  }

  function handleFramePlacementChange(
    framePlacement: FramePlacementMode,
    sourceDimensions?: ImageDimensions | null
  ) {
    if (!eventConfig) return;

    const placement =
      primaryOverlay && sourceDimensions
        ? calculateFramePlacement(
            sourceDimensions.width,
            sourceDimensions.height,
            eventConfig.outputWidth,
            eventConfig.outputHeight,
            framePlacement
          )
        : null;

    updateConfig({
      framePlacement,
      overlayLayers: placement
        ? overlayLayers.map((layer) =>
            layer.id === primaryOverlay.id
              ? {
                  ...layer,
                  ...placement,
                  aspectRatioLocked: framePlacement !== "stretch",
                  updatedAt: new Date().toISOString()
                }
              : layer
          )
        : eventConfig.overlayLayers
    });
  }

  async function handleOverlayUpload(file?: File) {
    if (!file || !eventConfig || isProcessingOverlay) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Choose a PNG, JPG, or WebP image.", "error");
      return;
    }

    setIsProcessingOverlay(true);

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const sourceDimensions = await getImageDimensions(imageDataUrl);
      const existingLayer = overlayLayers.length === 1 ? overlayLayers[0] : undefined;
      const now = new Date().toISOString();
      const framePlacement = eventConfig.framePlacement ?? "fit";
      const placement = calculateFramePlacement(
        sourceDimensions.width,
        sourceDimensions.height,
        eventConfig.outputWidth,
        eventConfig.outputHeight,
        framePlacement
      );
      const nextLayer: OverlayLayer = {
        id: existingLayer?.id ?? createEntityId("layer"),
        assetId: existingLayer?.assetId,
        name: file.name,
        imageDataUrl,
        ...placement,
        rotation: 0,
        opacity: 1,
        zIndex: 0,
        visible: true,
        locked: false,
        aspectRatioLocked: framePlacement !== "stretch",
        createdAt: existingLayer?.createdAt ?? now,
        updatedAt: now
      };

      updateConfig({
        framePlacement,
        overlayDataUrl: undefined,
        overlayLayers: [nextLayer]
      });
      toast(
        overlayLayers.length > 1
          ? "The previous layer stack was replaced with this frame."
          : "Frame ready. Save the event to keep it.",
        "success"
      );
    } catch {
      toast("The image could not be read. Try a different file.", "error");
    } finally {
      setIsProcessingOverlay(false);
    }
  }

  function removeOverlay() {
    updateConfig({ overlayDataUrl: undefined, overlayLayers: [] });
    toast("Frame removed. Save the event to apply this change.", "info");
  }

  async function saveEvent(destination: SaveDestination = "home") {
    if (!eventConfig || isSaving || isProcessingOverlay) {
      return;
    }

    if (!eventConfig.name.trim()) {
      toast("Give this event a name before continuing.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const hasCustomLayout = Boolean(eventConfig.customLayout);
      const captureCount = hasCustomLayout
        ? clampCaptureCount(
            eventConfig.customLayout?.slots.length ?? eventConfig.captureCount
          )
        : clampCaptureCount(eventConfig.captureCount);
      const saved = await upsertEventConfig({
        ...eventConfig,
        name: eventConfig.name.trim(),
        slug: eventConfig.slug || eventConfig.name,
        countdownSeconds: Math.max(0, Math.round(eventConfig.countdownSeconds)),
        captureModes: getEnabledCaptureModes(eventConfig),
        gifSettings: getGifCaptureSettings(eventConfig),
        videoSettings: getVideoCaptureSettings(eventConfig),
        captureCount,
        layoutId: hasCustomLayout
          ? CUSTOM_LAYOUT_ID
          : getRecommendedLayoutIdForCaptureCount(captureCount),
        overlayDataUrl: undefined,
        overlayLayers
      });

      setEventConfig(saved);
      toast("Event saved", "success");

      if (destination === "designer") {
        router.push(routes.designer(saved.slug));
      } else if (destination === "booth") {
        router.push(routes.booth(saved.slug));
      } else {
        router.push(routes.events);
      }
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "The event could not be saved.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    eventConfig,
    handleCaptureCountChange,
    handleFramePlacementChange,
    handleOutputPresetChange,
    handleOverlayUpload,
    isLoaded,
    isExistingEvent,
    isProcessingOverlay,
    isSaving,
    overlayLayers,
    primaryOverlay,
    removeOverlay,
    saveEvent,
    selectedPresetId,
    toggleCaptureMode,
    updateConfig,
    updateEventName,
    updateEventSlug
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Invalid image result"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
