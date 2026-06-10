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

type SlotNumberField = "x" | "y" | "width" | "height" | "borderRadius";
type LayerNumberField = "x" | "y" | "width" | "height" | "rotation" | "opacity" | "zIndex";

export function useLayoutDesigner(eventSlug: string) {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [layout, setLayout] = useState<LayoutDefinition | null>(null);
  
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayer[]>([]);
  
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  useEffect(() => {
    const event = getEventBySlug(eventSlug) ?? null;
    setEventConfig(event);
    setLayout(event ? getScaledLayoutForEvent(event) : null);
    
    if (event) {
      setOverlayLayers(getEffectiveOverlayLayers(event));
    }

    setIsLoaded(true);
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

        const newLayer: OverlayLayer = {
          id: createEntityId("layer"),
          name: file.name,
          imageDataUrl,
          x: (eventConfig.outputWidth - dimensions.width) / 2,
          y: (eventConfig.outputHeight - dimensions.height) / 2,
          width: dimensions.width,
          height: dimensions.height,
          rotation: 0,
          opacity: 1,
          zIndex: overlayLayers.length,
          visible: true,
          locked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setOverlayLayers((current) => [...current, newLayer]);
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
  }

  function updateOverlayLayer(id: string, updates: Partial<OverlayLayer>) {
    setOverlayLayers((current) =>
      current.map((layer) =>
        layer.id === id ? { ...layer, ...updates, updatedAt: new Date().toISOString() } : layer
      )
    );
  }

  function updateLayerNumber(id: string, field: LayerNumberField, value?: number) {
    if (value === undefined || Number.isNaN(value)) return;
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

    toast(`Reset to the default ${captureCount}-photo layout. Save to apply it.`, "info");
    setLayout(
      normalizeDraftLayout({
        ...preset,
        id: CUSTOM_LAYOUT_ID,
        name: `Custom ${preset.slots.length}-photo layout`
      })
    );
    selectSlot(0);
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
      customLayout,
      overlayLayers
    });

    setEventConfig(saved);
    setLayout(getScaledLayoutForEvent(saved));
    toast("Custom layout and overlays saved", "success");
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
    isLoaded,
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
    updateSlotNumber
  };
}
