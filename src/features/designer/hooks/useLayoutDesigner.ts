"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_LAYOUT_ID,
  getLayoutForCaptureCount,
  getScaledLayoutForEvent,
  MAX_CAPTURE_COUNT,
  normalizeLayoutDefinition,
  scaleLayoutDefinition
} from "@/domain/layouts/defaultLayouts";
import type { LayoutDefinition, LayoutSlot, SlotFit } from "@/domain/layouts/types";
import { getEventBySlug, upsertEventConfig } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import { getImageDimensions, type ImageDimensions } from "@/shared/lib/image";

type SlotNumberField = "x" | "y" | "width" | "height" | "borderRadius";

export function useLayoutDesigner(eventSlug: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [layout, setLayout] = useState<LayoutDefinition | null>(null);
  const [overlayFileName, setOverlayFileName] = useState("");
  const [overlayDimensions, setOverlayDimensions] = useState<ImageDimensions | null>(
    null
  );
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const event = getEventBySlug(eventSlug) ?? null;
    setEventConfig(event);
    setLayout(event ? getScaledLayoutForEvent(event) : null);
    setOverlayFileName(event?.overlayDataUrl ? "Stored overlay" : "");
    setIsLoaded(true);
  }, [eventSlug]);

  useEffect(() => {
    let isActive = true;

    if (!eventConfig?.overlayDataUrl) {
      setOverlayDimensions(null);
      return () => {
        isActive = false;
      };
    }

    getImageDimensions(eventConfig.overlayDataUrl)
      .then((dimensions) => {
        if (isActive) {
          setOverlayDimensions(dimensions);
        }
      })
      .catch(() => {
        if (isActive) {
          setOverlayDimensions(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [eventConfig?.overlayDataUrl]);

  function handleOverlayUpload(file?: File) {
    if (!file) {
      return;
    }

    setStatus("");
    setOverlayFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEventConfig((current) =>
          current ? { ...current, overlayDataUrl: reader.result as string } : current
        );
      }
    };
    reader.readAsDataURL(file);
  }

  function removeOverlay() {
    setStatus("");
    setOverlayFileName("");
    setEventConfig((current) =>
      current ? { ...current, overlayDataUrl: undefined } : current
    );
  }

  function addSlot() {
    const nextSelectedIndex = layout?.slots.length ?? 0;
    updateLayout((current) => {
      if (!current || current.slots.length >= MAX_CAPTURE_COUNT) {
        return current;
      }

      const width = Math.round(current.canvasWidth * 0.72);
      const height = Math.round(current.canvasHeight * 0.22);
      const nextSlot: LayoutSlot = {
        x: Math.round((current.canvasWidth - width) / 2),
        y: Math.round((current.canvasHeight - height) / 2),
        width,
        height,
        fit: "cover",
        borderRadius: 0
      };

      return normalizeDraftLayout({
        ...current,
        name: `Custom ${current.slots.length + 1}-photo layout`,
        slots: [...current.slots, nextSlot]
      });
    });
    setSelectedSlotIndex(Math.min(nextSelectedIndex, MAX_CAPTURE_COUNT - 1));
    setStatus("Added a photo slot. Save to apply it to the booth.");
  }

  function removeSlot(index: number) {
    updateLayout((current) => {
      if (!current || current.slots.length <= 1) {
        return current;
      }

      const nextLayout = normalizeDraftLayout({
        ...current,
        name: `Custom ${current.slots.length - 1}-photo layout`,
        slots: current.slots.filter((_, slotIndex) => slotIndex !== index)
      });
      setSelectedSlotIndex((currentIndex) =>
        Math.min(currentIndex, nextLayout.slots.length - 1)
      );
      return nextLayout;
    });
    setStatus("Removed a photo slot. Save to apply it to the booth.");
  }

  function updateSlotNumber(index: number, field: SlotNumberField, value?: number) {
    updateLayout((current) => {
      if (!current) {
        return current;
      }

      const slots = current.slots.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [field]: value
            }
          : slot
      );

      return normalizeDraftLayout({ ...current, slots });
    });
  }

  function updateSlotFit(index: number, fit: SlotFit) {
    updateLayout((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        slots: current.slots.map((slot, slotIndex) =>
          slotIndex === index ? { ...slot, fit } : slot
        )
      };
    });
  }

  function resetToDefaultLayout(captureCount: number) {
    if (!eventConfig) {
      return;
    }

    const preset = scaleLayoutDefinition(
      getLayoutForCaptureCount(captureCount),
      eventConfig.outputWidth,
      eventConfig.outputHeight
    );

    setStatus(`Reset to the default ${captureCount}-photo layout. Save to apply it.`);
    setLayout(
      normalizeDraftLayout({
        ...preset,
        id: CUSTOM_LAYOUT_ID,
        name: `Custom ${preset.slots.length}-photo layout`
      })
    );
    setSelectedSlotIndex(0);
  }

  function saveLayout() {
    if (!eventConfig || !layout) {
      return;
    }

    const customLayout = normalizeLayoutDefinition(
      {
        ...layout,
        id: CUSTOM_LAYOUT_ID,
        name: layout.name || `Custom ${layout.slots.length}-photo layout`
      },
      {
        canvasWidth: eventConfig.outputWidth,
        canvasHeight: eventConfig.outputHeight,
        id: CUSTOM_LAYOUT_ID,
        name: layout.name || `Custom ${layout.slots.length}-photo layout`
      }
    );

    const saved = upsertEventConfig({
      ...eventConfig,
      layoutId: CUSTOM_LAYOUT_ID,
      captureCount: customLayout.slots.length,
      customLayout
    });

    setEventConfig(saved);
    setLayout(getScaledLayoutForEvent(saved));
    setStatus(
      `Saved custom ${customLayout.slots.length}-photo layout for ${saved.name}.`
    );
  }

  function updateLayout(
    updater: (current: LayoutDefinition | null) => LayoutDefinition | null
  ) {
    setStatus("");
    setLayout(updater);
  }

  function normalizeDraftLayout(nextLayout: LayoutDefinition): LayoutDefinition {
    return normalizeLayoutDefinition(nextLayout, {
      canvasWidth: nextLayout.canvasWidth,
      canvasHeight: nextLayout.canvasHeight,
      id: nextLayout.id,
      name: nextLayout.name
    });
  }

  return {
    eventConfig,
    isLoaded,
    layout,
    overlayDimensions,
    overlayFileName,
    selectedSlotIndex,
    status,
    addSlot,
    handleOverlayUpload,
    removeOverlay,
    removeSlot,
    resetToDefaultLayout,
    saveLayout,
    setSelectedSlotIndex,
    updateSlotFit,
    updateSlotNumber
  };
}
