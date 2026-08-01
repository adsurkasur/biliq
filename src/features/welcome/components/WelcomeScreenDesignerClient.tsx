"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  Check,
  Circle,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Info,
  Lock,
  RectangleHorizontal,
  RectangleVertical,
  Save,
  Sparkles,
  Trash2,
  Unlock
} from "lucide-react";
import type { OverlayLayer, WelcomeScreenElement } from "@/domain/events/types";
import { WelcomeCanvas } from "@/features/welcome/components/WelcomeCanvas";
import { useWelcomeScreenDesigner } from "@/features/welcome/hooks/useWelcomeScreenDesigner";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { CanvasShortcutHints } from "@/shared/components/ui/CanvasShortcutHints";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { RangeSlider } from "@/shared/components/ui/RangeSlider";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/classNames";
import { isCanvasObjectOutOfBounds } from "@/features/designer/lib/canvasBounds";

const inputClass =
  "booth-focus-ring min-h-11 w-full rounded-[var(--booth-radius-md)] border border-transparent bg-[var(--booth-surface-container)] px-3 py-2.5 text-[var(--booth-on-surface)] transition-colors hover:bg-[var(--booth-surface-container-high)] focus:border-[var(--booth-primary)] focus:bg-[var(--booth-surface-container-lowest)]";
const compactSelectClass =
  "booth-focus-ring min-h-10 w-full rounded-[var(--booth-radius-md)] border border-transparent bg-[var(--booth-surface-container)] px-3 py-2 text-sm font-semibold text-[var(--booth-on-surface)] transition-colors hover:bg-[var(--booth-surface-container-high)] focus:border-[var(--booth-primary)] sm:w-44";

interface WelcomeScreenDesignerClientProps {
  eventSlug: string;
}

export function WelcomeScreenDesignerClient({ eventSlug }: WelcomeScreenDesignerClientProps) {
  const [isOrientationAnimating, setIsOrientationAnimating] = useState(false);
  const orientationTimerRef = useRef<number | null>(null);
  const {
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
    copyFromOrientation,
    addFrameLayer,
    removeLayer,
    saveWelcomeScreen
  } = useWelcomeScreenDesigner(eventSlug);

  useEffect(() => () => {
    if (orientationTimerRef.current) window.clearTimeout(orientationTimerRef.current);
  }, []);

  function changeOrientation(orientation: "portrait" | "landscape") {
    if (!welcomeScreen || welcomeScreen.orientation === orientation) return;
    if (orientationTimerRef.current) window.clearTimeout(orientationTimerRef.current);
    setIsOrientationAnimating(true);
    updateOrientation(orientation);
    orientationTimerRef.current = window.setTimeout(() => setIsOrientationAnimating(false), 560);
  }

  if (!isLoaded) {
    return (
      <LoadingIndicator
        variant="page"
        label="Opening welcome screen…"
        description="Preparing the live camera canvas and event assets."
      />
    );
  }

  if (!eventConfig || !welcomeScreen) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <EmptyState
          icon={Sparkles}
          title="Event not found"
          action={
            <Link href={routes.setup()} className={buttonClassName({ variant: "primary", size: "lg" })}>
              Create an event
            </Link>
          }
        >
          Save an event before designing its guest welcome screen.
        </EmptyState>
      </main>
    );
  }

  const selectedElement =
    selection.kind === "element"
      ? welcomeScreen.elements.find((element) => element.id === selection.id) ?? null
      : null;
  const selectedLayer =
    selection.kind === "layer"
      ? welcomeScreen.overlayLayers.find((layer) => layer.id === selection.id) ?? null
      : null;

  return (
    <main className="min-h-screen overflow-x-hidden px-5 py-8 sm:px-8 lg:px-10">
      <div className="motion-enter mx-auto grid max-w-[1700px] gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-5">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <BiliqLogo variant="mark" size="sm" />
              <p className="m-0 text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
                Guest experience
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
                Welcome screen · {eventConfig.name}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  hasUnsavedChanges
                    ? "bg-[var(--booth-tertiary-container)] text-[var(--booth-on-tertiary-container)]"
                    : "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]"
                )}
              >
                {hasUnsavedChanges ? <Circle className="h-2.5 w-2.5 fill-current" /> : <Check className="h-3.5 w-3.5" />}
                {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              </span>
            </div>
          </div>
          <EventNavigation eventSlug={eventConfig.slug} activeRoute="welcome" />
        </header>

        <Card
          elevation={0}
          className="flex flex-wrap items-center justify-between gap-4 border border-[var(--booth-outline-variant)]/35 p-3"
          data-app-guide="welcome-camera"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={welcomeScreen.enabled ? "tonal" : "secondary"}
              onClick={() => updateWelcome({ enabled: !welcomeScreen.enabled })}
              aria-pressed={welcomeScreen.enabled}
            >
              <Sparkles className="h-4 w-4" />
              {welcomeScreen.enabled ? "Welcome enabled" : "Welcome skipped"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={welcomeScreen.showCamera ? "tonal" : "secondary"}
              onClick={() => updateWelcome({ showCamera: !welcomeScreen.showCamera })}
              aria-pressed={welcomeScreen.showCamera}
            >
              <Camera className="h-4 w-4" />
              {welcomeScreen.showCamera ? "Live camera on" : "Camera hidden"}
            </Button>
            <div
              className="inline-flex rounded-full bg-[var(--booth-surface-container)] p-1"
              role="group"
              aria-label="Welcome orientation"
              data-app-guide="welcome-orientation"
            >
              <Button
                type="button"
                size="sm"
                variant={welcomeScreen.orientation === "portrait" ? "tonal" : "ghost-surface"}
                onClick={() => changeOrientation("portrait")}
                aria-pressed={welcomeScreen.orientation === "portrait"}
                className="min-h-9 px-3"
              >
                <RectangleVertical className="h-4 w-4" />
                Portrait
              </Button>
              <Button
                type="button"
                size="sm"
                variant={welcomeScreen.orientation === "landscape" ? "tonal" : "ghost-surface"}
                onClick={() => changeOrientation("landscape")}
                aria-pressed={welcomeScreen.orientation === "landscape"}
                className="min-h-9 px-3"
              >
                <RectangleHorizontal className="h-4 w-4" />
                Landscape
              </Button>
            </div>
            <select
              className={compactSelectClass}
              value={welcomeScreen.cameraFacingMode}
              onChange={(event) => updateWelcome({ cameraFacingMode: event.target.value as "user" | "environment" })}
              aria-label="Welcome camera"
            >
              <option value="user">Front camera</option>
              <option value="environment">Rear camera</option>
            </select>
            <select
              className={compactSelectClass}
              value={welcomeScreen.cameraFit}
              onChange={(event) => updateWelcome({ cameraFit: event.target.value as "cover" | "contain" })}
              aria-label="Camera fit"
            >
              <option value="cover">Fill canvas</option>
              <option value="contain">Fit camera</option>
            </select>
          </div>

          <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
            <Link href={routes.booth(eventConfig.slug)} className={buttonClassName({ variant: "secondary", size: "sm" })}>
              Test in Booth
            </Link>
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isSaving || !hasUnsavedChanges}
              onClick={() => void saveWelcomeScreen()}
              data-app-guide="welcome-save"
            >
              <Save className="h-5 w-5" />
              {isSaving ? "Saving…" : hasUnsavedChanges ? "Save welcome" : "Saved"}
            </Button>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)] px-4 py-3 text-sm">
            <div className="flex min-w-0 items-start gap-2 text-[var(--booth-on-surface-variant)]">
              <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--booth-primary)]" />
              <p className="leading-5">
                Portrait and landscape use separate layouts. Configure both, or copy and adapt the other orientation.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                copyFromOrientation(
                  welcomeScreen.orientation === "portrait" ? "landscape" : "portrait"
                )
              }
            >
              <Copy className="h-4 w-4" />
              Copy from {welcomeScreen.orientation === "portrait" ? "Landscape" : "Portrait"}
            </Button>
          </div>
        </Card>

        {!welcomeScreen.enabled ? (
          <div className="motion-section rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] px-5 py-4 text-sm text-[var(--booth-on-surface-variant)]">
            The canvas remains editable, but guests will go directly to capture while the welcome screen is disabled.
          </div>
        ) : null}

        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[280px_minmax(420px,1fr)_320px]">
          <WelcomeElementList
            elements={welcomeScreen.elements}
            layers={welcomeScreen.overlayLayers}
            selectedElement={selectedElement}
            selectedLayer={selectedLayer}
            onSelectElement={(id) => setSelection({ kind: "element", id })}
            onSelectLayer={(id) => setSelection({ kind: "layer", id })}
            onUpdateElement={updateElement}
            onUpdateLayer={updateLayer}
            onUpload={addFrameLayer}
            canvasWidth={welcomeScreen.canvasWidth}
            canvasHeight={welcomeScreen.canvasHeight}
          />

          <WelcomeCanvas
            config={welcomeScreen}
            selection={selection}
            isOrientationAnimating={isOrientationAnimating}
            onSelect={setSelection}
            onUpdateElement={updateElement}
            onUpdateLayer={updateLayer}
          />

          <div className="motion-section grid gap-5 xl:sticky xl:top-5" data-app-guide="welcome-properties">
            {selectedElement ? (
              <WelcomeElementEditor element={selectedElement} onUpdate={updateElement} />
            ) : selectedLayer ? (
              <WelcomeLayerEditor layer={selectedLayer} onUpdate={updateLayer} onRemove={removeLayer} />
            ) : (
              <Card className="p-5 text-sm text-[var(--booth-on-surface-variant)]">
                Select an element or frame layer to edit it.
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function WelcomeElementList({
  elements,
  layers,
  selectedElement,
  selectedLayer,
  onSelectElement,
  onSelectLayer,
  onUpdateElement,
  onUpdateLayer,
  onUpload,
  canvasWidth,
  canvasHeight
}: {
  elements: WelcomeScreenElement[];
  layers: OverlayLayer[];
  selectedElement: WelcomeScreenElement | null;
  selectedLayer: OverlayLayer | null;
  onSelectElement: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<WelcomeScreenElement>) => void;
  onUpdateLayer: (id: string, updates: Partial<OverlayLayer>) => void;
  onUpload: (file?: File) => void;
  canvasWidth: number;
  canvasHeight: number;
}) {
  return (
    <Card className="motion-card min-w-0 overflow-hidden xl:sticky xl:top-5" data-app-guide="welcome-elements">
      <div className="border-b border-[var(--booth-outline-variant)]/30 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">Canvas elements</p>
        <h2 className="mt-1 text-xl font-bold">Guest welcome</h2>
      </div>
      <div className="grid gap-2 p-4">
        {elements.map((element) => (
          <ElementRow
            key={element.id}
            label={elementLabel(element)}
            selected={selectedElement?.id === element.id}
            visible={element.visible}
            outOfBounds={isCanvasObjectOutOfBounds(element, canvasWidth, canvasHeight)}
            onSelect={() => onSelectElement(element.id)}
            onToggle={() => onUpdateElement(element.id, { visible: !element.visible })}
          />
        ))}

        <p className="mt-3 border-t border-[var(--booth-outline-variant)]/30 pt-4 text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
          Custom frame layers
        </p>
        {layers.length ? layers.slice().sort((a, b) => b.zIndex - a.zIndex).map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-[var(--booth-radius-md)] border p-2",
              selectedLayer?.id === layer.id
                ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
                : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)]"
            )}
          >
            <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-semibold" onClick={() => onSelectLayer(layer.id)}>
              {layer.name}
            </button>
            {isCanvasObjectOutOfBounds(layer, canvasWidth, canvasHeight) ? (
              <OutOfBoundsIndicator />
            ) : null}
            <button
              type="button"
              className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container-highest)]"
              onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
              aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
            >
              {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container-highest)]"
              onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
              aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
            >
              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        )) : (
          <p className="rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] p-3 text-xs leading-5 text-[var(--booth-on-surface-variant)]">
            Add a transparent PNG to create a branded border or foreground frame.
          </p>
        )}
      </div>
      <div className="border-t border-[var(--booth-outline-variant)]/30 p-4">
        <label className="booth-focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)] px-4 py-2.5 text-sm font-semibold text-[var(--booth-on-primary-container)] transition-all hover:brightness-110 active:scale-95">
          <ImagePlus className="h-4 w-4" />
          Add welcome frame
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </Card>
  );
}

function ElementRow({ label, selected, visible, outOfBounds, onSelect, onToggle }: {
  label: string;
  selected: boolean;
  visible: boolean;
  outOfBounds: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={cn(
      "flex min-w-0 items-center gap-2 rounded-[var(--booth-radius-md)] border p-2",
      selected
        ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
        : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)]"
    )}>
      <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-semibold" onClick={onSelect}>
        {label}
      </button>
      {outOfBounds ? <OutOfBoundsIndicator /> : null}
      <button
        type="button"
        className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container-highest)]"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      >
        {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}

function OutOfBoundsIndicator() {
  return (
    <Tooltip
      content="Part of this element is outside the canvas and will be cropped in the booth output."
      delayMs={180}
      touchHold
    >
      <span
        role="img"
        tabIndex={0}
        aria-label="Element is outside the canvas"
        className="booth-focus-ring grid h-7 w-7 flex-none place-items-center rounded-full bg-[var(--booth-tertiary-container)] text-[var(--booth-on-tertiary-container)]"
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      </span>
    </Tooltip>
  );
}

function WelcomeElementEditor({
  element,
  onUpdate
}: {
  element: WelcomeScreenElement;
  onUpdate: (id: string, updates: Partial<WelcomeScreenElement>) => void;
}) {
  const updateNumber = (field: keyof WelcomeScreenElement, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) onUpdate(element.id, { [field]: parsed });
  };

  return (
    <Card className="motion-card p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">Element properties</p>
      <h2 className="mt-1 text-xl font-bold">{elementLabel(element)}</h2>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold">
          Text
          <textarea className={cn(inputClass, "min-h-24 resize-y")} value={element.text} onChange={(event) => onUpdate(element.id, { text: event.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X" value={element.x} onChange={(value) => updateNumber("x", value)} />
          <NumberField label="Y" value={element.y} onChange={(value) => updateNumber("y", value)} />
          <NumberField label="Width" value={element.width} min={24} onChange={(value) => updateNumber("width", value)} />
          <NumberField label="Height" value={element.height} min={24} onChange={(value) => updateNumber("height", value)} />
          <NumberField label="Font size" value={element.fontSize} min={12} onChange={(value) => updateNumber("fontSize", value)} />
          <NumberField label="Rotation" value={element.rotation} onChange={(value) => updateNumber("rotation", value)} />
        </div>
        <label className="grid gap-1.5 text-sm font-semibold">
          Opacity · {Math.round(element.opacity * 100)}%
          <RangeSlider min={0} max={1} step={0.05} value={element.opacity} onChange={(event) => updateNumber("opacity", event.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Text color" value={element.color} onChange={(color) => onUpdate(element.id, { color })} />
          {element.type === "start-button" ? (
            <ColorField label="Button color" value={element.backgroundColor ?? "#A7D8CF"} onChange={(backgroundColor) => onUpdate(element.id, { backgroundColor })} />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function WelcomeLayerEditor({
  layer,
  onUpdate,
  onRemove
}: {
  layer: OverlayLayer;
  onUpdate: (id: string, updates: Partial<OverlayLayer>) => void;
  onRemove: (id: string) => void;
}) {
  const updateNumber = (field: keyof OverlayLayer, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) onUpdate(layer.id, { [field]: parsed });
  };
  return (
    <Card className="motion-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">Frame properties</p>
          <h2 className="mt-1 truncate text-xl font-bold">{layer.name}</h2>
        </div>
        <Button type="button" variant="danger" size="icon" onClick={() => onRemove(layer.id)} aria-label={`Remove ${layer.name}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <NumberField label="X" value={layer.x} onChange={(value) => updateNumber("x", value)} />
        <NumberField label="Y" value={layer.y} onChange={(value) => updateNumber("y", value)} />
        <NumberField label="Width" value={layer.width} min={24} onChange={(value) => updateNumber("width", value)} />
        <NumberField label="Height" value={layer.height} min={24} onChange={(value) => updateNumber("height", value)} />
        <NumberField label="Rotation" value={layer.rotation} onChange={(value) => updateNumber("rotation", value)} />
      </div>
      <label className="mt-4 grid gap-1.5 text-sm font-semibold">
        Opacity · {Math.round(layer.opacity * 100)}%
        <RangeSlider min={0} max={1} step={0.05} value={layer.opacity} onChange={(event) => updateNumber("opacity", event.target.value)} />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={Boolean(layer.aspectRatioLocked)} onChange={(event) => onUpdate(layer.id, { aspectRatioLocked: event.target.checked })} />
        Lock aspect ratio when resizing corners
      </label>
    </Card>
  );
}

function NumberField({ label, value, min, onChange }: { label: string; value: number; min?: number; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
      {label}
      <input className={inputClass} type="number" min={min} value={Math.round(value * 100) / 100} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
      {label}
      <span className="flex items-center gap-2 rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] p-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
        <span className="text-xs font-semibold normal-case text-[var(--booth-on-surface)]">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

function elementLabel(element: WelcomeScreenElement): string {
  if (element.type === "start-button") return "Start button";
  if (element.type === "subtitle") return "Subtitle";
  return "Title";
}
