"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlignCenter,
  Camera,
  Check,
  Circle,
  HelpCircle,
  Maximize2,
  Save,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { DesignerCanvasPreview } from "@/features/designer/components/DesignerCanvasPreview";
import { DesignerGuide } from "@/features/designer/components/DesignerGuide";
import { DesignerLayerList } from "@/features/designer/components/DesignerLayerList";
import { OverlayLayerEditor } from "@/features/designer/components/OverlayLayerEditor";
import { SlotEditor } from "@/features/designer/components/SlotEditor";
import { useLayoutDesigner } from "@/features/designer/hooks/useLayoutDesigner";
import { useDesignerGuide } from "@/features/designer/hooks/useDesignerGuide";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/classNames";

interface LayoutDesignerClientProps {
  eventSlug: string;
}

export function LayoutDesignerClient({ eventSlug }: LayoutDesignerClientProps) {
  const [advancedMode, setAdvancedMode] = useState(false);
  const {
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
  } = useLayoutDesigner(eventSlug);
  const {
    guideState,
    openGuide,
    closeGuide,
    startGuide,
    skipGuide,
    goNextStep,
    goPrevStep,
    completeCheckpoint
  } = useDesignerGuide();

  if (!isLoaded) {
    return (
      <LoadingIndicator
        variant="page"
        label="Opening Designer…"
        description="Loading the canvas and event assets."
      />
    );
  }

  if (!eventConfig || !layout) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <EmptyState
          icon={Camera}
          title="Event not found"
          action={
            <Link
              href={routes.setup()}
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              Create an event
            </Link>
          }
        >
          Create or open an event before using Designer.
        </EmptyState>
      </main>
    );
  }

  const selectedLayer = selectedLayerId
    ? overlayLayers.find((layer) => layer.id === selectedLayerId)
    : null;
  const selectedSlot =
    selectedSlotIndex !== null ? layout.slots[selectedSlotIndex] : null;

  function fitLayerToCanvas() {
    if (!selectedLayer) return;
    updateLayerNumber(selectedLayer.id, "x", 0);
    updateLayerNumber(selectedLayer.id, "y", 0);
    updateLayerNumber(selectedLayer.id, "width", eventConfig!.outputWidth);
    updateLayerNumber(selectedLayer.id, "height", eventConfig!.outputHeight);
  }

  function centerLayer() {
    if (!selectedLayer) return;
    updateLayerNumber(
      selectedLayer.id,
      "x",
      Math.round((eventConfig!.outputWidth - selectedLayer.width) / 2)
    );
    updateLayerNumber(
      selectedLayer.id,
      "y",
      Math.round((eventConfig!.outputHeight - selectedLayer.height) / 2)
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-5 motion-enter">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-5">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <BiliqLogo variant="mark" size="sm" />
              <p className="m-0 text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
                Visual Designer
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
                {eventConfig.name}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  hasUnsavedChanges
                    ? "bg-[var(--booth-tertiary-container)] text-[var(--booth-on-tertiary-container)]"
                    : "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]"
                )}
              >
                {hasUnsavedChanges ? (
                  <Circle className="h-2.5 w-2.5 fill-current" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              </span>
            </div>
          </div>

          <EventNavigation
            eventSlug={eventConfig.slug}
            activeRoute="designer"
            prefixActions={
              <Button
                type="button"
                variant="ghost-surface"
                size="sm"
                onClick={openGuide}
              >
                <HelpCircle className="h-4 w-4" />
                Guide
              </Button>
            }
          />
        </header>

        <Card elevation={0} className="flex flex-wrap items-center justify-between gap-4 border border-[var(--booth-outline-variant)]/35 p-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full bg-[var(--booth-surface-container)] p-1" aria-label="Designer mode">
              <button
                type="button"
                className={cn(
                  "booth-focus-ring rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  !advancedMode
                    ? "bg-[var(--booth-surface-container-lowest)] text-[var(--booth-on-surface)] shadow-[var(--booth-elevation-1)]"
                    : "text-[var(--booth-on-surface-variant)]"
                )}
                onClick={() => setAdvancedMode(false)}
                aria-pressed={!advancedMode}
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                Simple
              </button>
              <button
                type="button"
                className={cn(
                  "booth-focus-ring rounded-full px-4 py-2 text-sm font-bold transition-colors",
                  advancedMode
                    ? "bg-[var(--booth-surface-container-lowest)] text-[var(--booth-on-surface)] shadow-[var(--booth-elevation-1)]"
                    : "text-[var(--booth-on-surface-variant)]"
                )}
                onClick={() => setAdvancedMode(true)}
                aria-pressed={advancedMode}
              >
                <SlidersHorizontal className="mr-2 inline h-4 w-4" />
                Advanced
              </button>
            </div>
            <p className="hidden text-sm text-[var(--booth-on-surface-variant)] md:block">
              Drag items directly on the canvas. Use Advanced only for exact values.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={isSaving || !hasUnsavedChanges}
            onClick={() => {
              void saveLayout();
              completeCheckpoint("save");
            }}
            data-guide-target="save-layout"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving…" : hasUnsavedChanges ? "Save design" : "Saved"}
          </Button>
        </Card>

        <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(360px,1fr)_300px] 2xl:grid-cols-[260px_minmax(460px,1fr)_340px]">
          <div className="grid gap-5 lg:sticky lg:top-5">
            <DesignerLayerList
              layout={layout}
              overlayLayers={overlayLayers}
              selectedSlotIndex={selectedSlotIndex}
              selectedLayerId={selectedLayerId}
              onSelectSlot={selectSlot}
              onSelectLayer={selectLayer}
              onToggleLayerVisibility={toggleLayerVisibility}
              onToggleLayerLock={toggleLayerLock}
              onUploadLayer={addOverlayLayer}
            />
          </div>

          <div className="min-w-0" data-guide-target="designer-canvas">
            <DesignerCanvasPreview
              eventConfig={eventConfig}
              layout={layout}
              overlayLayers={overlayLayers}
              selectedSlotIndex={selectedSlotIndex}
              selectedLayerId={selectedLayerId}
              onSelectSlot={selectSlot}
              onSelectLayer={selectLayer}
              onUpdateSlotNumber={updateSlotNumber}
              onUpdateLayerNumber={updateLayerNumber}
              onInteraction={completeCheckpoint}
            />
          </div>

          <div className="grid gap-5 lg:sticky lg:top-5" data-guide-target="property-panel">
            {advancedMode ? (
              <>
                {selectedSlotIndex !== null ? (
                  <SlotEditor
                    layout={layout}
                    selectedSlotIndex={selectedSlotIndex}
                    onAddSlot={addSlot}
                    onRemoveSlot={removeSlot}
                    onResetToDefault={resetToDefaultLayout}
                    onSelectSlot={selectSlot}
                    onUpdateSlotFit={updateSlotFit}
                    onUpdateSlotNumber={updateSlotNumber}
                    onUpdateSlotBoolean={updateSlotBoolean}
                  />
                ) : null}

                {selectedLayer ? (
                  <OverlayLayerEditor
                    layer={selectedLayer}
                    layout={layout}
                    onRemoveLayer={removeOverlayLayer}
                    onUpdateLayerNumber={updateLayerNumber}
                    onUpdateLayerBoolean={updateLayerBoolean}
                  />
                ) : null}
              </>
            ) : (
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-primary)]">
                  Quick controls
                </p>
                {selectedLayer ? (
                  <div className="mt-2 grid gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedLayer.name}</h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                        Drag this layer on the canvas, or use a quick alignment action.
                      </p>
                    </div>
                    <Button type="button" variant="tonal" onClick={fitLayerToCanvas}>
                      <Maximize2 className="h-4 w-4" />
                      Fit to canvas
                    </Button>
                    <Button type="button" variant="secondary" onClick={centerLayer}>
                      <AlignCenter className="h-4 w-4" />
                      Center layer
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeOverlayLayer(selectedLayer.id)}
                    >
                      Remove layer
                    </Button>
                  </div>
                ) : selectedSlot && selectedSlotIndex !== null ? (
                  <div className="mt-2 grid gap-5">
                    <div>
                      <h2 className="text-xl font-bold">Photo {selectedSlotIndex + 1}</h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                        Drag to move, then pull a corner to resize. Choose how the camera image fills this area.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={selectedSlot.fit === "cover" ? "tonal" : "secondary"}
                        onClick={() => updateSlotFit(selectedSlotIndex, "cover")}
                      >
                        Fill area
                      </Button>
                      <Button
                        type="button"
                        variant={selectedSlot.fit === "contain" ? "tonal" : "secondary"}
                        onClick={() => updateSlotFit(selectedSlotIndex, "contain")}
                      >
                        Show all
                      </Button>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-bold">Quick layout</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((count) => (
                          <button
                            key={count}
                            type="button"
                            className="booth-focus-ring rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] px-2 py-3 text-sm font-bold hover:bg-[var(--booth-primary-container)]"
                            onClick={() => resetToDefaultLayout(count)}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)] p-4 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                    Select a photo area or overlay layer to edit it.
                  </div>
                )}
              </Card>
            )}

            <Card elevation={0} className="border border-[var(--booth-outline-variant)]/35 p-4 text-sm">
              <p className="font-bold">Canvas {eventConfig.outputWidth} × {eventConfig.outputHeight}px</p>
              <p className="mt-1 text-[var(--booth-on-surface-variant)]">
                {layout.slots.length} photo area{layout.slots.length > 1 ? "s" : ""} · {overlayLayers.length} overlay{overlayLayers.length !== 1 ? "s" : ""}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <DesignerGuide
        guideState={guideState}
        onClose={closeGuide}
        onStart={startGuide}
        onSkip={skipGuide}
        onNext={goNextStep}
        onBack={goPrevStep}
      />
    </main>
  );
}
