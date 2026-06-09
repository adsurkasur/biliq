"use client";

import Link from "next/link";
import { ArrowLeft, Camera, GalleryHorizontal, Save, Settings } from "lucide-react";
import { DesignerCanvasPreview } from "@/features/designer/components/DesignerCanvasPreview";
import { DesignerOverlayPanel } from "@/features/designer/components/DesignerOverlayPanel";
import { SlotEditor } from "@/features/designer/components/SlotEditor";
import { useLayoutDesigner } from "@/features/designer/hooks/useLayoutDesigner";
import { routes } from "@/shared/config/routes";

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
    status,
    addSlot,
    handleOverlayUpload,
    removeOverlay,
    removeSlot,
    resetToDefaultLayout,
    saveLayout,
    updateSlotFit,
    updateSlotNumber
  } = useLayoutDesigner(eventSlug);

  if (!isLoaded) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <p className="text-sm font-semibold text-stone-600">Loading designer...</p>
      </main>
    );
  }

  if (!eventConfig || !layout) {
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <div className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-stone-950">Event not found</h1>
          <p className="mt-3 text-stone-600">
            Create or edit a local event before opening the designer route.
          </p>
          <Link
            href={routes.setup()}
            className="booth-focus-ring mt-6 inline-flex min-h-12 items-center rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Open setup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Layout designer
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              {eventConfig.name}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.home}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Events
            </Link>
            <Link
              href={routes.setup(eventConfig.slug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Setup
            </Link>
            <Link
              href={routes.booth(eventConfig.slug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-800"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Booth
            </Link>
            <Link
              href={routes.gallery(eventConfig.slug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
              Gallery
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
            <DesignerCanvasPreview eventConfig={eventConfig} layout={layout} />
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
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onResetToDefault={resetToDefaultLayout}
              onUpdateSlotFit={updateSlotFit}
              onUpdateSlotNumber={updateSlotNumber}
            />

            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={saveLayout}
                className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
              >
                <Save className="h-5 w-5" aria-hidden="true" />
                Save custom layout
              </button>
              {status ? (
                <span className="text-sm font-semibold text-teal-800">{status}</span>
              ) : (
                <span className="text-sm font-medium text-stone-600">
                  Saving syncs capture count to the number of slots.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
