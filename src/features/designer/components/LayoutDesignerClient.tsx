"use client";

import Link from "next/link";
import { Camera, Save } from "lucide-react";
import { DesignerCanvasPreview } from "@/features/designer/components/DesignerCanvasPreview";
import { DesignerLayerList } from "@/features/designer/components/DesignerLayerList";
import { OverlayLayerEditor } from "@/features/designer/components/OverlayLayerEditor";
import { SlotEditor } from "@/features/designer/components/SlotEditor";
import { useLayoutDesigner } from "@/features/designer/hooks/useLayoutDesigner";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { routes } from "@/shared/config/routes";

interface LayoutDesignerClientProps {
  eventSlug: string;
}

export function LayoutDesignerClient({ eventSlug }: LayoutDesignerClientProps) {
  const {
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
  } = useLayoutDesigner(eventSlug);

  if (!isLoaded) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <Card className="p-6">
          <Spinner label="Loading designer" className="text-[var(--booth-on-surface-variant)]" />
        </Card>
      </main>
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
              Open setup
            </Link>
          }
        >
          Create or edit a local event before opening the designer route.
        </EmptyState>
      </main>
    );
  }

  const selectedLayer = selectedLayerId 
    ? overlayLayers.find(layer => layer.id === selectedLayerId) 
    : null;

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 motion-enter">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BiliqLogo variant="mark" size="sm" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)] m-0">
                Layout designer
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
              {eventConfig.name}
            </h1>
          </div>

          <EventNavigation eventSlug={eventConfig.slug} activeRoute="designer" />
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
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
            />
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

          <div className="grid content-start gap-6">
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
              />
            ) : null}

            {selectedLayer ? (
              <OverlayLayerEditor
                layer={selectedLayer}
                layout={layout}
                onRemoveLayer={removeOverlayLayer}
                onUpdateLayerNumber={updateLayerNumber}
              />
            ) : null}

            <Card className="motion-card flex flex-wrap items-center gap-3 p-5">
              <Button
                type="button"
                onClick={saveLayout}
                variant="primary"
                size="lg"
              >
                <Save className="h-5 w-5" aria-hidden="true" />
                Save designer state
              </Button>
              <span className="text-sm font-medium text-[var(--booth-on-surface-variant)]">
                Saving applies layout and overlay layers to the booth.
              </span>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
