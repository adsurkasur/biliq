"use client";

import { useEffect, useState } from "react";
import {
  getWelcomeScreenCanvasSize,
  getWelcomeScreenConfig
} from "@/domain/events/defaults";
import { getEventBySlug, upsertEventConfig } from "@/domain/events/storage";
import type {
  EventConfig,
  OverlayLayer,
  WelcomeScreenConfig,
  WelcomeScreenElement,
  WelcomeScreenOrientation
} from "@/domain/events/types";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { createEntityId } from "@/shared/lib/id";
import { getImageDimensions } from "@/shared/lib/image";

export type WelcomeSelection =
  | { kind: "element"; id: string }
  | { kind: "layer"; id: string };

export function useWelcomeScreenDesigner(eventSlug: string) {
  const { toast } = useToast();
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [welcomeScreen, setWelcomeScreen] = useState<WelcomeScreenConfig | null>(null);
  const [selection, setSelection] = useState<WelcomeSelection>({
    kind: "element",
    id: "welcome-title"
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let active = true;
    getEventBySlug(eventSlug)
      .then((event) => {
        if (!active) return;
        setEventConfig(event ?? null);
        setWelcomeScreen(event ? getWelcomeScreenConfig(event) : null);
      })
      .catch((error) => {
        if (active) {
          toast(error instanceof Error ? error.message : "The welcome screen could not load.", "error");
        }
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [eventSlug]);

  function updateWelcome(updates: Partial<WelcomeScreenConfig>) {
    setWelcomeScreen((current) => (current ? { ...current, ...updates } : current));
    setHasUnsavedChanges(true);
  }

  function updateElement(id: string, updates: Partial<WelcomeScreenElement>) {
    setWelcomeScreen((current) =>
      current
        ? {
            ...current,
            elements: current.elements.map((element) =>
              element.id === id ? { ...element, ...updates } : element
            )
          }
        : current
    );
    setHasUnsavedChanges(true);
  }

  function updateLayer(id: string, updates: Partial<OverlayLayer>) {
    setWelcomeScreen((current) =>
      current
        ? {
            ...current,
            overlayLayers: current.overlayLayers.map((layer) =>
              layer.id === id
                ? { ...layer, ...updates, updatedAt: new Date().toISOString() }
                : layer
            )
          }
        : current
    );
    setHasUnsavedChanges(true);
  }

  function updateOrientation(orientation: WelcomeScreenOrientation) {
    if (!eventConfig) return;
    setWelcomeScreen((current) => {
      if (!current || current.orientation === orientation) return current;
      const { width, height } = getWelcomeScreenCanvasSize(
        eventConfig.outputWidth,
        eventConfig.outputHeight,
        orientation
      );
      const scaleX = width / current.canvasWidth;
      const scaleY = height / current.canvasHeight;
      const scaleText = Math.min(scaleX, scaleY);
      return {
        ...current,
        orientation,
        canvasWidth: width,
        canvasHeight: height,
        overlayLayers: current.overlayLayers.map((layer) => ({
          ...layer,
          x: Math.round(layer.x * scaleX),
          y: Math.round(layer.y * scaleY),
          width: Math.round(layer.width * scaleX),
          height: Math.round(layer.height * scaleY),
          updatedAt: new Date().toISOString()
        })),
        elements: current.elements.map((element) => ({
          ...element,
          x: Math.round(element.x * scaleX),
          y: Math.round(element.y * scaleY),
          width: Math.round(element.width * scaleX),
          height: Math.round(element.height * scaleY),
          fontSize: Math.max(12, Math.round(element.fontSize * scaleText))
        }))
      };
    });
    setHasUnsavedChanges(true);
  }

  async function addFrameLayer(file?: File) {
    if (!file || !welcomeScreen) return;
    if (!file.type.startsWith("image/")) {
      toast("Choose a PNG, JPG, or WebP image.", "error");
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const dimensions = await getImageDimensions(imageDataUrl);
      const scale = Math.min(
        welcomeScreen.canvasWidth / dimensions.width,
        welcomeScreen.canvasHeight / dimensions.height
      );
      const width = Math.round(dimensions.width * scale);
      const height = Math.round(dimensions.height * scale);
      const now = new Date().toISOString();
      const layer: OverlayLayer = {
        id: createEntityId("welcome-layer"),
        name: file.name,
        imageDataUrl,
        x: Math.round((welcomeScreen.canvasWidth - width) / 2),
        y: Math.round((welcomeScreen.canvasHeight - height) / 2),
        width,
        height,
        rotation: 0,
        opacity: 1,
        zIndex: welcomeScreen.overlayLayers.length,
        visible: true,
        locked: false,
        aspectRatioLocked: true,
        createdAt: now,
        updatedAt: now
      };
      updateWelcome({ overlayLayers: [...welcomeScreen.overlayLayers, layer] });
      setSelection({ kind: "layer", id: layer.id });
      toast("Welcome frame layer added.", "success");
    } catch {
      toast("The frame image could not be read.", "error");
    }
  }

  function removeLayer(id: string) {
    updateWelcome({
      overlayLayers: welcomeScreen?.overlayLayers.filter((layer) => layer.id !== id) ?? []
    });
    setSelection({ kind: "element", id: "welcome-title" });
  }

  async function saveWelcomeScreen() {
    if (!eventConfig || !welcomeScreen || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await upsertEventConfig({
        ...eventConfig,
        welcomeScreen: {
          ...welcomeScreen
        }
      });
      setEventConfig(saved);
      setWelcomeScreen(getWelcomeScreenConfig(saved));
      setHasUnsavedChanges(false);
      toast("Welcome screen saved and ready for the booth.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "The welcome screen could not be saved.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    eventConfig,
    welcomeScreen,
    selection,
    isLoaded,
    isSaving,
    hasUnsavedChanges,
    setSelection,
    updateWelcome,
    updateElement,
    updateLayer,
    updateOrientation,
    addFrameLayer,
    removeLayer,
    saveWelcomeScreen
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
