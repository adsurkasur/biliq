"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDefaultEventConfig,
  OUTPUT_PRESETS
} from "@/domain/events/defaults";
import {
  ensureUniqueSlug,
  getEventBySlug,
  upsertEventConfig
} from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import {
  clampCaptureCount,
  getLayoutById,
  getRecommendedLayoutIdForCaptureCount
} from "@/domain/layouts/defaultLayouts";
import { routes } from "@/shared/config/routes";

export function useEventSetupForm() {
  const router = useRouter();
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [status, setStatus] = useState("");
  const [overlayFileName, setOverlayFileName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    const existing = slug ? getEventBySlug(slug) : undefined;

    setEventConfig(existing ?? createDefaultEventConfig());
    setOverlayFileName(existing?.overlayDataUrl ? "Stored overlay" : "");
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

  function updateConfig(next: Partial<EventConfig>) {
    setEventConfig((current) => (current ? { ...current, ...next } : current));
  }

  function handleCaptureCountChange(captureCountValue: number) {
    const captureCount = clampCaptureCount(captureCountValue);
    updateConfig({
      captureCount,
      layoutId: getRecommendedLayoutIdForCaptureCount(captureCount)
    });
  }

  function handleLayoutChange(layoutId: string) {
    const layout = getLayoutById(layoutId);
    updateConfig({
      layoutId: layout.id,
      captureCount: layout.slots.length
    });
  }

  function handleOutputPresetChange(presetId: string) {
    const preset = OUTPUT_PRESETS.find((option) => option.id === presetId);
    if (preset) {
      updateConfig({
        outputWidth: preset.width,
        outputHeight: preset.height
      });
    }
  }

  function handleOverlayUpload(file?: File) {
    if (!file) {
      return;
    }

    setOverlayFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateConfig({ overlayDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function removeOverlay() {
    setOverlayFileName("");
    updateConfig({ overlayDataUrl: undefined });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventConfig) {
      return;
    }

    const captureCount = clampCaptureCount(eventConfig.captureCount);
    const slug = ensureUniqueSlug(eventConfig.slug || eventConfig.name, eventConfig.id);
    const saved = upsertEventConfig({
      ...eventConfig,
      name: eventConfig.name.trim() || "Untitled Event",
      slug,
      countdownSeconds: Math.max(0, Math.round(eventConfig.countdownSeconds)),
      captureCount,
      layoutId: getRecommendedLayoutIdForCaptureCount(captureCount)
    });

    setStatus("Event saved");
    router.push(routes.booth(saved.slug));
  }

  return {
    eventConfig,
    overlayFileName,
    selectedPresetId,
    status,
    handleCaptureCountChange,
    handleLayoutChange,
    handleOutputPresetChange,
    handleOverlayUpload,
    handleSubmit,
    removeOverlay,
    updateConfig
  };
}
