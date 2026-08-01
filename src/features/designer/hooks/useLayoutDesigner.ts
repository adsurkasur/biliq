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
import { getEventBySlug, upsertEventConfig, getEffectiveOverlayLayers } from "@/domain/events/storage";
import type { EventConfig, OverlayLayer } from "@/domain/events/types";
import { getImageDimensions } from "@/shared/lib/image";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { createEntityId } from "@/shared/lib/id";

type SlotNumberField = "x" | "y" | "width" | "height" | "rotation" | "borderRadius";
type LayerNumberField = "x" | "y" | "width" | "height" | "rotation" | "opacity" | "zIndex";

export function useLayoutDesigner(eventSlug: string) {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [layout, setLayout] = useState<LayoutDefinition | null>(null);
  
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayer[]>([]);
  
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let isActive = true;

    getEventBySlug(eventSlug)
      .then((event) => {
        if (!isActive) return;
        const resolvedEvent = event ?? null;
        setEventConfig(resolvedEvent);
        setLayout(resolvedEvent ? getScaledLayoutForEvent(resolvedEvent) : null);
        setOverlayLayers(
          resolvedEvent ? getEffectiveOverlayLayers(resolvedEvent) : []
        );
      })
      .catch((error) => {
        if (isActive) {
          toast(
            error instanceof Error ? error.message : "The designer could not load.",
            "error"
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, [eventSlug]);

  function selectSlot(index: number) {
    setSelectedSlotIndex(index);
    setSelectedLayerId(null);
  }

  function selectLayer(id: string) {
    setSelectedLayerId(id);
    setSelectedSlotIndex(null);
  }

  async function addOverlayLayer(file?: File) {
    if (!file || !eventConfig) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const imageDataUrl = reader.result;
        let dimensions = { width: eventConfig.outputWidth, height: eventConfig.outputHeight };
        
        try {
          dimensions = await getImageDimensions(imageDataUrl);
        } catch {
          // fallback to output size
        }

        const scale = Math.min(
          1,
          eventConfig.outputWidth / dimensions.width,
          eventConfig.outputHeight / dimensions.height
        );
        const fittedWidth = Math.max(1, Math.round(dimensions.width * scale));
        const fittedHeight = Math.max(1, Math.round(dimensions.height * scale));
        const newLayer: OverlayLayer = {
          id: createEntityId("layer"),
          name: file.name,
          imageDataUrl,
          x: Math.round((eventConfig.outputWidth - fittedWidth) / 2),
          y: Math.round((eventConfig.outputHeight - fittedHeight) / 2),
          width: fittedWidth,
          height: fittedHeight,
          rotation: 0,
          opacity: 1,
          zIndex: overlayLayers.length,
          visible: true,
          locked: false,
          aspectRatioLocked: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setOverlayLayers((current) => [...current, newLayer]);
        setHasUnsavedChanges(true);
        selectLayer(newLayer.id);
        toast("Overlay layer added", "success");
      }
    };
    reader.readAsDataURL(file);
  }

  function removeOverlayLayer(id: string) {
    setOverlayLayers((current) => current.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
    toast("Overlay layer removed", "info");
    setHasUnsavedChanges(true);
  }

  function updateOverlayLayer(id: string, updates: Partial<OverlayLayer>) {
    setOverlayLayers((current) =>
      current.map((layer) =>
        layer.id === id ? { ...layer, ...updates, updatedAt: new Date().toISOString() } : layer
      )
    );
    setHasUnsavedChanges(true);
  }

  function updateLayerNumber(id: string, field: LayerNumberField, value?: number) {
    if (value === undefined || Number.isNaN(value)) return;
    updateOverlayLayer(id, { [field]: value });
  }

  function updateLayerBoolean(id: string, field: "aspectRatioLocked", value: boolean) {
    updateOverlayLayer(id, { [field]: value });
  }

  function toggleLayerVisibility(id: string) {
    const layer = overlayLayers.find((l) => l.id === id);
    if (layer) {
      updateOverlayLayer(id, { visible: !layer.visible });
    }
  }

  function toggleLayerLock(id: string) {
    const layer = overlayLayers.find((l) => l.id === id);
    if (layer) {
      updateOverlayLayer(id, { locked: !layer.locked });
    }
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
    selectSlot(Math.min(nextSelectedIndex, MAX_CAPTURE_COUNT - 1));
    toast("Added a photo slot. Save to apply it to the booth.", "info");
    setHasUnsavedChanges(true);
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
      selectSlot(Math.min(selectedSlotIndex ?? 0, nextLayout.slots.length - 1));
      return nextLayout;
    });
    toast("Removed a photo slot. Save to apply it to the booth.", "info");
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  }

  function updateSlotBoolean(index: number, field: "aspectRatioLocked", value: boolean) {
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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

    toast(`Reset to the default ${captureCount}-photo layout. Save to apply it.`, "info");
    setLayout(
      normalizeDraftLayout({
        ...preset,
        id: CUSTOM_LAYOUT_ID,
        name: `Custom ${preset.slots.length}-photo layout`
      })
    );
    setHasUnsavedChanges(true);
    selectSlot(0);
  }

  async function saveLayout() {
    if (!eventConfig || !layout || isSaving) {
      return;
    }

    setIsSaving(true);

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

    try {
      const saved = await upsertEventConfig({
        ...eventConfig,
        layoutId: CUSTOM_LAYOUT_ID,
        captureCount: customLayout.slots.length,
        customLayout,
        overlayDataUrl: undefined,
        overlayLayers
      });

      setEventConfig(saved);
      setLayout(getScaledLayoutForEvent(saved));
      setOverlayLayers(getEffectiveOverlayLayers(saved));
      setHasUnsavedChanges(false);
      toast("Design saved and ready for the booth", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "The design could not be saved.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateLayout(
    updater: (current: LayoutDefinition | null) => LayoutDefinition | null
  ) {
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
    hasUnsavedChanges,
    isLoaded,
    isSaving,
    layout,
    overlayLayers,
    selectedSlotIndex,
    selectedLayerId,
    addOverlayLayer,
    removeOverlayLayer,
    updateOverlayLayer,
    updateLayerNumber,
    toggleLayerVisibility,
    toggleLayerLock,
    addSlot,
    removeSlot,
    resetToDefaultLayout,
    saveLayout,
    selectSlot,
    selectLayer,
    updateSlotFit,
    updateSlotNumber,
    updateSlotBoolean,
    updateLayerBoolean
  };
}
