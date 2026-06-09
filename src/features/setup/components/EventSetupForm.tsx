"use client";

import Link from "next/link";
import { Palette, Save } from "lucide-react";
import { OUTPUT_PRESETS } from "@/domain/events/defaults";
import {
  clampCaptureCount,
  CUSTOM_LAYOUT_ID,
  defaultLayouts,
  getLayoutById
} from "@/domain/layouts/defaultLayouts";
import { CAPTURE_COUNT_OPTIONS } from "@/features/setup/lib/eventFormDefaults";
import { useEventSetupForm } from "@/features/setup/hooks/useEventSetupForm";
import { useOverlayDimensions } from "@/features/setup/hooks/useOverlayDimensions";
import { OverlayAssetInfo } from "@/features/setup/components/OverlayAssetInfo";
import { OutputPresetInfo } from "@/features/setup/components/OutputPresetInfo";
import { Button } from "@/shared/components/ui/Button";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Toast } from "@/shared/components/ui/Toast";
import { routes } from "@/shared/config/routes";

export function EventSetupForm() {
  const {
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
  } = useEventSetupForm();

  const overlayDimensions = useOverlayDimensions(eventConfig?.overlayDataUrl);

  if (!eventConfig) {
    return (
      <Card className="p-6">
        <Spinner label="Loading setup" className="text-stone-600" />
      </Card>
    );
  }

  const selectedLayout = eventConfig.customLayout ?? getLayoutById(eventConfig.layoutId);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="motion-card grid gap-5 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Event details
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-950">
            Capture session
          </h2>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-stone-800" htmlFor="event-name">
            Event name
          </label>
          <input
            id="event-name"
            className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
            value={eventConfig.name}
            onChange={(event) =>
              updateConfig({
                name: event.target.value,
                slug:
                  eventConfig.slug === "new-event"
                    ? event.target.value
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    : eventConfig.slug
              })
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-stone-800" htmlFor="event-slug">
            Event slug
          </label>
          <input
            id="event-slug"
            className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
            value={eventConfig.slug}
            onChange={(event) => updateConfig({ slug: event.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-stone-800"
              htmlFor="countdown"
            >
              Countdown seconds
            </label>
            <input
              id="countdown"
              type="number"
              min={0}
              max={10}
              className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
              value={eventConfig.countdownSeconds}
              onChange={(event) =>
                updateConfig({ countdownSeconds: Number(event.target.value) })
              }
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-stone-800"
              htmlFor="capture-count"
            >
              Capture count
            </label>
            <select
              id="capture-count"
              className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
              value={clampCaptureCount(eventConfig.captureCount)}
              onChange={(event) =>
                handleCaptureCountChange(Number(event.target.value))
              }
            >
              {CAPTURE_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count} photo{count > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-stone-800"
              htmlFor="output-preset"
            >
              Output size
            </label>
            <select
              id="output-preset"
              className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
              value={selectedPresetId}
              onChange={(event) => handleOutputPresetChange(event.target.value)}
            >
              {selectedPresetId === "custom" ? (
                <option value="custom">
                  Custom - {eventConfig.outputWidth} x {eventConfig.outputHeight}
                </option>
              ) : null}
              {OUTPUT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} - {preset.width} x {preset.height}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-stone-800" htmlFor="layout">
              Layout preset
            </label>
            <select
              id="layout"
              className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
              value={eventConfig.layoutId}
              onChange={(event) => handleLayoutChange(event.target.value)}
            >
              {eventConfig.customLayout ? (
                <option value={CUSTOM_LAYOUT_ID}>
                  Custom layout - {eventConfig.customLayout.slots.length} photo
                  {eventConfig.customLayout.slots.length > 1 ? "s" : ""}
                </option>
              ) : null}
              {defaultLayouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <OutputPresetInfo
          outputWidth={eventConfig.outputWidth}
          outputHeight={eventConfig.outputHeight}
          layoutName={selectedLayout.name}
        />

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-stone-800" htmlFor="printer">
            Printer mode
          </label>
          <select
            id="printer"
            className="booth-focus-ring min-h-12 rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-950 transition focus:border-teal-700"
            value={eventConfig.printerMode}
            onChange={() => updateConfig({ printerMode: "browser-print" })}
          >
            <option value="browser-print">Browser print</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
          >
            <Save className="h-5 w-5" aria-hidden="true" />
            Save and open booth
          </Button>
          {eventConfig.slug !== "new-event" ? (
            <Link
              href={routes.designer(eventConfig.slug)}
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              <Palette className="h-5 w-5" aria-hidden="true" />
              Open designer
            </Link>
          ) : null}
          {status ? (
            <Toast tone="success">{status}</Toast>
          ) : null}
        </div>
      </Card>

      <OverlayAssetInfo
        outputWidth={eventConfig.outputWidth}
        outputHeight={eventConfig.outputHeight}
        overlayDataUrl={eventConfig.overlayDataUrl}
        overlayFileName={overlayFileName}
        overlayDimensions={overlayDimensions}
        onUpload={handleOverlayUpload}
        onRemove={removeOverlay}
      />
    </form>
  );
}
