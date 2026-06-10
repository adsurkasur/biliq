"use client";

import Link from "next/link";
import { ArrowLeft, Camera, GalleryHorizontal, Save, Settings } from "lucide-react";
import { DesignerCanvasPreview } from "@/features/designer/components/DesignerCanvasPreview";
import { DesignerOverlayPanel } from "@/features/designer/components/DesignerOverlayPanel";
import { SlotEditor } from "@/features/designer/components/SlotEditor";
import { useLayoutDesigner } from "@/features/designer/hooks/useLayoutDesigner";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";

interface LayoutDesignerClientProps {
  eventSlug: string;
}

export function LayoutDesignerClient({ eventSlug }: LayoutDesignerClientProps) {
  const {
    eventConfig,
    isLoaded,
    layout,
    overlayDimensions,
    overlayFileName,
    selectedSlotIndex,
    addSlot,
    handleOverlayUpload,
    removeOverlay,
    removeSlot,
    resetToDefaultLayout,
    saveLayout,
    setSelectedSlotIndex,
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

          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.home}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Events
            </Link>
            <Link
              href={routes.setup(eventConfig.slug)}
              className={buttonClassName({ variant: "secondary" })}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Setup
            </Link>
            <Link
              href={routes.booth(eventConfig.slug)}
              className={buttonClassName({ variant: "dark" })}
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Booth
            </Link>
            <Link
              href={routes.gallery(eventConfig.slug)}
              className={buttonClassName({ variant: "secondary" })}
            >
              <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
              Gallery
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
            <DesignerCanvasPreview
              eventConfig={eventConfig}
              layout={layout}
              selectedSlotIndex={selectedSlotIndex}
              onSelectSlot={setSelectedSlotIndex}
            />
            <DesignerOverlayPanel
              outputWidth={eventConfig.outputWidth}
              outputHeight={eventConfig.outputHeight}
              overlayDataUrl={eventConfig.overlayDataUrl}
              overlayDimensions={overlayDimensions}
              overlayFileName={overlayFileName}
              onUpload={handleOverlayUpload}
              onRemove={removeOverlay}
            />
          </div>

          <div className="grid content-start gap-6">
            <SlotEditor
              layout={layout}
              selectedSlotIndex={selectedSlotIndex}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onResetToDefault={resetToDefaultLayout}
              onSelectSlot={setSelectedSlotIndex}
              onUpdateSlotFit={updateSlotFit}
              onUpdateSlotNumber={updateSlotNumber}
            />

            <Card className="motion-card flex flex-wrap items-center gap-3 p-5">
              <Button
                type="button"
                onClick={saveLayout}
                variant="primary"
                size="lg"
              >
                <Save className="h-5 w-5" aria-hidden="true" />
                Save custom layout
              </Button>
              <span className="text-sm font-medium text-[var(--booth-on-surface-variant)]">
                Saving syncs capture count to the number of slots.
              </span>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
