"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleHelp,
  Film,
  ImagePlus,
  Images,
  LayoutTemplate,
  Maximize2,
  Minimize2,
  MoveDiagonal2,
  Palette,
  Play,
  Repeat2,
  Save,
  Sparkles,
  Trash2
} from "lucide-react";
import { OUTPUT_PRESETS } from "@/domain/events/defaults";
import {
  getEnabledCaptureModes,
  getGifCaptureSettings,
  getWelcomeScreenConfig,
  getVideoCaptureSettings
} from "@/domain/events/defaults";
import {
  CAPTURE_MODE_DESCRIPTIONS,
  CAPTURE_MODE_LABELS
} from "@/domain/events/captureModes";
import type { CaptureMode, FramePlacementMode } from "@/domain/events/types";
import {
  clampCaptureCount,
  getLayoutById
} from "@/domain/layouts/defaultLayouts";
import { hasAspectRatioMismatch } from "@/features/setup/lib/framePlacement";
import { CAPTURE_COUNT_OPTIONS } from "@/features/setup/lib/eventFormDefaults";
import { useEventSetupForm } from "@/features/setup/hooks/useEventSetupForm";
import { useOverlayDimensions } from "@/features/setup/hooks/useOverlayDimensions";
import { Badge } from "@/shared/components/ui/Badge";
import { AnimatedAspectBox } from "@/shared/components/ui/AnimatedAspectBox";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { cn } from "@/shared/lib/classNames";
import { formatAspectRatio } from "@/shared/lib/validation";
import { routes } from "@/shared/config/routes";

const STEPS = [
  { label: "Essentials", helper: "Name and capture" },
  { label: "Look & layout", helper: "Format and frame" },
  { label: "Review", helper: "Save and test" }
] as const;

const inputClass =
  "booth-focus-ring min-h-12 w-full rounded-[var(--booth-radius-md)] border border-transparent bg-[var(--booth-surface-container)] px-4 py-3 text-[var(--booth-on-surface)] transition-colors hover:bg-[var(--booth-surface-container-high)] focus:border-[var(--booth-primary)] focus:bg-[var(--booth-surface-container-lowest)]";

const CAPTURE_MODE_OPTIONS: Array<{
  id: CaptureMode;
  icon: typeof Camera;
}> = [
  { id: "photo", icon: Camera },
  { id: "gif", icon: Images },
  { id: "boomerang", icon: Repeat2 },
  { id: "video", icon: Film }
];

export function EventSetupForm() {
  const {
    eventConfig,
    handleCaptureCountChange,
    handleFramePlacementChange,
    handleOutputPresetChange,
    handleOverlayUpload,
    isExistingEvent,
    isLoaded,
    isProcessingOverlay,
    isSaving,
    overlayLayers,
    primaryOverlay,
    removeOverlay,
    saveEvent,
    selectedPresetId,
    toggleCaptureMode,
    updateConfig,
    updateEventName,
    updateEventSlug
  } = useEventSetupForm();
  const [step, setStep] = useState(0);
  const overlayDimensions = useOverlayDimensions(primaryOverlay?.imageDataUrl);

  useEffect(() => {
    const handleGuideStep = (event: Event) => {
      const requestedStep = (event as CustomEvent<{ step?: number }>).detail?.step;
      if (requestedStep === 0 || requestedStep === 1 || requestedStep === 2) {
        setStep(requestedStep);
      }
    };
    window.addEventListener("biliq:guide-setup-step", handleGuideStep);
    return () => window.removeEventListener("biliq:guide-setup-step", handleGuideStep);
  }, []);

  if (!isLoaded || !eventConfig) {
    return (
      <Card className="p-8">
        <LoadingIndicator
          variant="inline"
          label="Preparing your event…"
          className="w-full justify-center"
        />
      </Card>
    );
  }

  const selectedLayout = eventConfig.customLayout ?? getLayoutById(eventConfig.layoutId);
  const enabledCaptureModes = getEnabledCaptureModes(eventConfig);
  const gifSettings = getGifCaptureSettings(eventConfig);
  const videoSettings = getVideoCaptureSettings(eventConfig);
  const welcomeScreen = getWelcomeScreenConfig(eventConfig);
  const framePlacement = eventConfig.framePlacement ?? "fit";
  const frameHasRatioMismatch = Boolean(
    overlayDimensions &&
      hasAspectRatioMismatch(
        overlayDimensions.width,
        overlayDimensions.height,
        eventConfig.outputWidth,
        eventConfig.outputHeight
      )
  );
  function goNext() {
    if (step === 0 && !eventConfig?.name.trim()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  return (
    <div className="grid gap-6">
      <Card elevation={0} className="border border-[var(--booth-outline-variant)]/35 p-3" data-app-guide="setup-progress">
        <ol className="grid gap-2 md:grid-cols-3" aria-label="Event setup progress">
          {STEPS.map((item, index) => {
            const isActive = index === step;
            const isComplete = index < step;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    "booth-focus-ring flex w-full items-center gap-3 rounded-[var(--booth-radius-lg)] px-4 py-3 text-left transition-colors",
                    isActive
                      ? "bg-[var(--booth-primary)] text-[var(--booth-on-primary)]"
                      : "hover:bg-[var(--booth-surface-container)]"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold",
                      isActive
                        ? "bg-white/18 text-white"
                        : isComplete
                          ? "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]"
                          : "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface-variant)]"
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{item.label}</span>
                    <span
                      className={cn(
                        "block text-xs",
                        isActive ? "text-white/75" : "text-[var(--booth-on-surface-variant)]"
                      )}
                    >
                      {item.helper}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden" data-app-guide="setup-form">
          <div className="border-b border-[var(--booth-outline-variant)]/25 px-6 py-5 sm:px-8">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]">
                {step === 0 ? (
                  <Sparkles className="h-5 w-5" />
                ) : step === 1 ? (
                  <Palette className="h-5 w-5" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--booth-primary)]">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--booth-on-surface)]">
                  {step === 0
                    ? "Start with the experience"
                    : step === 1
                      ? "Make it look like your event"
                      : "Everything looks ready"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                  {step === 0
                    ? "Choose the details guests will actually feel. Technical settings stay out of the way."
                    : step === 1
                      ? "Pick a format and add a frame. You can fine-tune every layer in Designer later."
                      : "Save the event, open Designer for precision, or launch a booth test now."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {step === 0 ? (
              <div className="motion-section grid gap-8" key="setup-essentials">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--booth-on-surface)]">
                    Event name
                  </span>
                  <input
                    className={inputClass}
                    value={eventConfig.name}
                    onChange={(event) => updateEventName(event.target.value)}
                    placeholder="e.g. Rina & Budi Wedding"
                    autoFocus
                    required
                  />
                  <span className="text-xs text-[var(--booth-on-surface-variant)]">
                    This is what your operator will see on the event dashboard.
                  </span>
                </label>

                <fieldset className="grid gap-3" data-app-guide="capture-modes">
                  <div>
                    <legend className="text-sm font-bold text-[var(--booth-on-surface)]">
                      What can guests create?
                    </legend>
                    <p className="mt-1 text-xs text-[var(--booth-on-surface-variant)]">
                      Enable one focused experience or let guests choose at the booth.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {CAPTURE_MODE_OPTIONS.map(({ id, icon: Icon }) => {
                      const isEnabled = enabledCaptureModes.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleCaptureMode(id)}
                          className={cn(
                            "booth-focus-ring rounded-[var(--booth-radius-lg)] border p-4 text-left transition-all",
                            isEnabled
                              ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/35 shadow-[0_0_0_2px_var(--booth-state-hover-primary)]"
                              : "border-[var(--booth-outline-variant)]/45 hover:border-[var(--booth-primary)] hover:bg-[var(--booth-surface-container)]"
                          )}
                          aria-pressed={isEnabled}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--booth-surface-container-high)] text-[var(--booth-primary)]">
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
                                isEnabled
                                  ? "bg-[var(--booth-primary)] text-[var(--booth-on-primary)]"
                                  : "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface-variant)]"
                              )}
                            >
                              {isEnabled ? "On" : "Off"}
                            </span>
                          </span>
                          <span className="mt-4 block font-bold">
                            {CAPTURE_MODE_LABELS[id]}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--booth-on-surface-variant)]">
                            {CAPTURE_MODE_DESCRIPTIONS[id]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {enabledCaptureModes.includes("photo") ? (
                <fieldset className="grid gap-3" data-app-guide="photo-count">
                  <legend className="text-sm font-bold text-[var(--booth-on-surface)]">
                    How many photos in each session?
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {CAPTURE_COUNT_OPTIONS.map((count) => {
                      const isSelected = clampCaptureCount(eventConfig.captureCount) === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleCaptureCountChange(count)}
                          className={cn(
                            "booth-focus-ring rounded-[var(--booth-radius-lg)] border p-4 text-left transition-all",
                            isSelected
                              ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/35 shadow-[0_0_0_2px_var(--booth-state-hover-primary)]"
                              : "border-[var(--booth-outline-variant)]/45 hover:border-[var(--booth-primary)] hover:bg-[var(--booth-surface-container)]"
                          )}
                          aria-pressed={isSelected}
                        >
                          <span className="mb-4 grid h-12 grid-cols-2 gap-1 rounded-lg bg-[var(--booth-surface-container-high)] p-1.5">
                            {Array.from({ length: count }).map((_, index) => (
                              <span
                                key={index}
                                className="rounded bg-[var(--booth-primary)]/55"
                              />
                            ))}
                          </span>
                          <span className="block text-lg font-bold">{count}</span>
                          <span className="text-xs text-[var(--booth-on-surface-variant)]">
                            {count === 1 ? "photo" : "photos"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                ) : null}

                {enabledCaptureModes.some((mode) => mode === "gif" || mode === "boomerang") ? (
                  <section className="grid gap-4 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)] p-5 sm:grid-cols-2" data-app-guide="animation-settings">
                    <div className="sm:col-span-2">
                      <h3 className="font-bold">Animation timing</h3>
                      <p className="mt-1 text-xs text-[var(--booth-on-surface-variant)]">
                        These settings apply to both GIF and Boomerang sessions.
                      </p>
                    </div>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Frames</span>
                      <select
                        className={inputClass}
                        value={gifSettings.frameCount}
                        onChange={(event) =>
                          updateConfig({
                            gifSettings: {
                              ...gifSettings,
                              frameCount: Number(event.target.value)
                            }
                          })
                        }
                      >
                        {[4, 6, 8, 10, 12].map((count) => (
                          <option key={count} value={count}>
                            {count} frames
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Playback speed</span>
                      <select
                        className={inputClass}
                        value={gifSettings.frameDelayMs}
                        onChange={(event) =>
                          updateConfig({
                            gifSettings: {
                              ...gifSettings,
                              frameDelayMs: Number(event.target.value)
                            }
                          })
                        }
                      >
                        <option value={120}>Fast</option>
                        <option value={220}>Balanced</option>
                        <option value={350}>Relaxed</option>
                        <option value={500}>Slow</option>
                      </select>
                    </label>
                  </section>
                ) : null}

                {enabledCaptureModes.includes("video") ? (
                  <section className="grid gap-4 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)] p-5 sm:grid-cols-2" data-app-guide="video-settings">
                    <div>
                      <h3 className="font-bold">Video recording</h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--booth-on-surface-variant)]">
                        Records directly in the browser using the best format supported by the device.
                      </p>
                    </div>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Duration</span>
                      <select
                        className={inputClass}
                        value={videoSettings.durationSeconds}
                        onChange={(event) =>
                          updateConfig({
                            videoSettings: {
                              ...videoSettings,
                              durationSeconds: Number(event.target.value)
                            }
                          })
                        }
                      >
                        {[5, 10, 15, 30, 60].map((seconds) => (
                          <option key={seconds} value={seconds}>
                            {seconds} seconds
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-3 rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-lowest)] p-4 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={videoSettings.includeAudio}
                        onChange={(event) =>
                          updateConfig({
                            videoSettings: {
                              ...videoSettings,
                              includeAudio: event.target.checked
                            }
                          })
                        }
                        className="h-5 w-5 accent-[var(--booth-primary)]"
                      />
                      <span>
                        <span className="block text-sm font-bold">Record microphone audio</span>
                        <span className="block text-xs text-[var(--booth-on-surface-variant)]">
                          The booth device will request microphone permission.
                        </span>
                      </span>
                    </label>
                  </section>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
                  <label className="grid gap-2" data-app-guide="countdown-setting">
                    <span className="text-sm font-bold text-[var(--booth-on-surface)]">
                      Countdown
                    </span>
                    <select
                      className={inputClass}
                      value={eventConfig.countdownSeconds}
                      onChange={(event) =>
                        updateConfig({ countdownSeconds: Number(event.target.value) })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5, 7, 10].map((seconds) => (
                        <option key={seconds} value={seconds}>
                          {seconds === 0
                            ? "No countdown"
                            : `${seconds} second${seconds === 1 ? "" : "s"}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <details className="self-end overflow-hidden rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)]">
                    <summary className="booth-focus-ring flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[var(--booth-on-surface)]">
                      <span>Advanced event address</span>
                      <span className="min-w-0 truncate text-xs font-medium text-[var(--booth-on-surface-variant)]">
                        /{eventConfig.slug}
                      </span>
                    </summary>
                    <label className="grid gap-2 px-4 pb-4 pt-1">
                      <span className="text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                        Event slug
                      </span>
                      <input
                        className={inputClass}
                        value={eventConfig.slug}
                        onChange={(event) => updateEventSlug(event.target.value)}
                      />
                    </label>
                  </details>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="motion-section grid gap-8" key="setup-look-layout">
                <fieldset className="grid gap-3" data-app-guide="output-format">
                  <legend className="text-sm font-bold text-[var(--booth-on-surface)]">
                    Output format
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {OUTPUT_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleOutputPresetChange(preset.id, overlayDimensions)}
                          className={cn(
                            "booth-focus-ring flex items-center gap-4 rounded-[var(--booth-radius-lg)] border p-4 text-left transition-all",
                            isSelected
                              ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/35"
                              : "border-[var(--booth-outline-variant)]/45 hover:border-[var(--booth-primary)]"
                          )}
                          aria-pressed={isSelected}
                        >
                          <span
                            className="block h-14 flex-none rounded-md border-2 border-[var(--booth-primary)]/65 bg-[var(--booth-primary-container)]/40"
                            style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
                          />
                          <span>
                            <span className="block font-bold">{preset.label}</span>
                            <span className="text-xs text-[var(--booth-on-surface-variant)]">
                              {formatAspectRatio(preset.width, preset.height)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <section className="grid gap-4 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)] p-5 sm:grid-cols-[1fr_220px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-5 w-5 text-[var(--booth-primary)]" />
                      <h3 className="font-bold">Event frame</h3>
                      <Badge tone="neutral">Optional</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                      Upload a transparent PNG, then choose how it sits on the output. The photo layout already follows the session count from Step 1.
                    </p>
                    <fieldset className="mt-4 grid gap-2" data-app-guide="frame-placement">
                      <legend className="text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
                        Frame placement
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {([
                          { id: "fit", label: "Fit", helper: "Show all", icon: Minimize2 },
                          { id: "fill", label: "Fill", helper: "Crop edges", icon: Maximize2 },
                          { id: "stretch", label: "Stretch", helper: "Fill exactly", icon: MoveDiagonal2 }
                        ] as const).map(({ id, label, helper, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            data-app-guide={`frame-${id}`}
                            className={cn(
                              "booth-focus-ring rounded-[var(--booth-radius-md)] border p-3 text-left transition-all",
                              framePlacement === id
                                ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/35"
                                : "border-[var(--booth-outline-variant)]/45 bg-[var(--booth-surface-container-lowest)] hover:border-[var(--booth-primary)]"
                            )}
                            aria-pressed={framePlacement === id}
                            onClick={() =>
                              handleFramePlacementChange(
                                id as FramePlacementMode,
                                overlayDimensions
                              )
                            }
                          >
                            <Icon className="h-4 w-4 text-[var(--booth-primary)]" />
                            <span className="mt-2 block text-sm font-bold">{label}</span>
                            <span className="block text-xs text-[var(--booth-on-surface-variant)]">
                              {helper}
                            </span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className="booth-focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--booth-primary)] px-5 py-2.5 font-semibold text-[var(--booth-on-primary)]">
                        <ImagePlus className="h-4 w-4" />
                        {isProcessingOverlay
                          ? "Reading image…"
                          : primaryOverlay
                            ? "Replace frame"
                            : "Upload frame"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={isProcessingOverlay}
                          onChange={(event) => handleOverlayUpload(event.target.files?.[0])}
                        />
                      </label>
                      {primaryOverlay ? (
                        <Button type="button" variant="danger" onClick={removeOverlay}>
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    {primaryOverlay ? (
                      <div className="mt-4 text-xs text-[var(--booth-on-surface-variant)]">
                        <p className="font-bold text-[var(--booth-on-surface)]">
                          {primaryOverlay.name}
                        </p>
                        <p>
                          {overlayDimensions
                            ? `Source ${overlayDimensions.width} × ${overlayDimensions.height}px · ${framePlacement} on ${eventConfig.outputWidth} × ${eventConfig.outputHeight}px`
                            : "Checking image…"}
                        </p>
                        {frameHasRatioMismatch ? (
                          <div className="mt-3 flex items-start gap-2 rounded-[var(--booth-radius-md)] bg-[var(--booth-tertiary-container)] p-3 text-[var(--booth-on-tertiary-container)]" data-app-guide="frame-ratio-warning">
                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                            <p>
                              Aspect ratios differ. {framePlacement === "fit"
                                ? "Fit keeps the full frame and may leave empty space."
                                : framePlacement === "fill"
                                  ? "Fill keeps proportions but crops the frame edges."
                                  : "Stretch fills the canvas but can distort the frame."}
                            </p>
                          </div>
                        ) : null}
                        {overlayLayers.length > 1 ? (
                          <p className="mt-1 text-[var(--booth-tertiary)]">
                            Uploading here replaces the current {overlayLayers.length}-layer design.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <AnimatedAspectBox
                    aspectWidth={eventConfig.outputWidth}
                    aspectHeight={eventConfig.outputHeight}
                    className="booth-checkerboard relative w-full overflow-hidden rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/35"
                  >
                    {primaryOverlay ? (
                      <img
                        src={primaryOverlay.imageDataUrl}
                        alt="Current event frame preview"
                        className="absolute max-w-none object-fill"
                        style={{
                          left: `${(primaryOverlay.x / eventConfig.outputWidth) * 100}%`,
                          top: `${(primaryOverlay.y / eventConfig.outputHeight) * 100}%`,
                          width: `${(primaryOverlay.width / eventConfig.outputWidth) * 100}%`,
                          height: `${(primaryOverlay.height / eventConfig.outputHeight) * 100}%`
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center p-5 text-center text-xs font-semibold text-[var(--booth-on-surface)]">
                        <span className="rounded-full bg-[var(--booth-surface-container-lowest)]/90 px-3 py-2 shadow-[var(--booth-elevation-1)] backdrop-blur-sm">
                          Your frame preview appears here
                        </span>
                      </div>
                    )}
                  </AnimatedAspectBox>
                </section>

                <section className="grid gap-5 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)] p-5 sm:grid-cols-[1fr_auto] sm:items-center" data-app-guide="welcome-screen-setting">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--booth-primary)]" />
                      <h3 className="font-bold">Guest welcome screen</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                      Show a branded start screen before capture. It has a separate canvas and keeps the live camera visible by default.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={welcomeScreen.enabled}
                          onChange={(event) =>
                            updateConfig({
                              welcomeScreen: { ...welcomeScreen, enabled: event.target.checked }
                            })
                          }
                          className="h-5 w-5 accent-[var(--booth-primary)]"
                        />
                        Enable welcome screen
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={welcomeScreen.showCamera}
                          onChange={(event) =>
                            updateConfig({
                              welcomeScreen: { ...welcomeScreen, showCamera: event.target.checked }
                            })
                          }
                          className="h-5 w-5 accent-[var(--booth-primary)]"
                        />
                        Show live camera
                      </label>
                    </div>
                  </div>
                  {isExistingEvent ? (
                    <Link
                      href={routes.welcome(eventConfig.slug)}
                      className={buttonClassName({ variant: "tonal", size: "lg" })}
                    >
                      <Palette className="h-5 w-5" />
                      Edit welcome canvas
                    </Link>
                  ) : (
                    <p className="max-w-48 rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] p-3 text-xs leading-5 text-[var(--booth-on-surface-variant)]">
                      Save this new event first, then open its welcome canvas.
                    </p>
                  )}
                </section>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="motion-section grid gap-5" key="setup-review" data-app-guide="setup-review">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewItem
                    icon={Sparkles}
                    label="Event"
                    value={eventConfig.name}
                  />
                  <ReviewItem
                    icon={Camera}
                    label="Capture"
                    value={`${enabledCaptureModes
                      .map((mode) => CAPTURE_MODE_LABELS[mode])
                      .join(", ")} · ${eventConfig.countdownSeconds}s countdown`}
                  />
                  <ReviewItem
                    icon={LayoutTemplate}
                    label="Output"
                    value={`${eventConfig.outputWidth} × ${eventConfig.outputHeight}px · ${selectedLayout.name}`}
                  />
                  <ReviewItem
                    icon={Palette}
                    label="Design"
                    value={
                      overlayLayers.length
                        ? `${overlayLayers.length} overlay layer${overlayLayers.length > 1 ? "s" : ""}`
                        : "No frame — clean photo output"
                    }
                  />
                </div>

                <div className="rounded-[var(--booth-radius-xl)] bg-[var(--booth-primary-container)]/30 p-5">
                  <div className="flex items-start gap-3">
                    <CircleHelp className="mt-0.5 h-5 w-5 flex-none text-[var(--booth-primary)]" />
                    <div>
                      <h3 className="font-bold">What happens next?</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
                        Save returns to your event dashboard. Designer opens precision controls for layers and photo slots. Test booth opens the camera experience.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3" data-app-guide="setup-save-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    disabled={isSaving || isProcessingOverlay}
                    onClick={() => saveEvent("home")}
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? "Saving…" : "Save event"}
                  </Button>
                  <Button
                    type="button"
                    variant="tonal"
                    size="lg"
                    disabled={isSaving || isProcessingOverlay}
                    onClick={() => saveEvent("designer")}
                  >
                    <Palette className="h-5 w-5" />
                    Fine-tune design
                  </Button>
                  <Button
                    type="button"
                    variant="dark"
                    size="lg"
                    disabled={isSaving || isProcessingOverlay}
                    onClick={() => saveEvent("booth")}
                  >
                    <Play className="h-5 w-5" />
                    Test booth
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {step < 2 ? (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--booth-outline-variant)]/25 bg-[var(--booth-surface-container-low)] px-6 py-4 sm:px-8">
              <Button
                type="button"
                variant="ghost-surface"
                disabled={step === 0}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!eventConfig.name.trim()}
                onClick={goNext}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-t border-[var(--booth-outline-variant)]/25 px-6 py-4 sm:px-8">
              <Button
                type="button"
                variant="ghost-surface"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to design
              </Button>
            </div>
          )}
        </Card>

        <Card className="sticky top-6 overflow-hidden p-5" data-app-guide="setup-summary">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-primary)]">
                Live summary
              </p>
              <h3 className="mt-1 font-bold">{eventConfig.name || "Untitled event"}</h3>
            </div>
            <Badge tone={isExistingEvent ? "teal" : "neutral"}>
              {isExistingEvent ? "Saved event" : "New draft"}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            <SummaryRow
              label="Modes"
              value={enabledCaptureModes
                .map((mode) => CAPTURE_MODE_LABELS[mode])
                .join(", ")}
            />
            <SummaryRow
              label="Session"
              value={enabledCaptureModes.includes("photo")
                ? `${eventConfig.captureCount} photo${eventConfig.captureCount === 1 ? "" : "s"} · ${eventConfig.countdownSeconds}s timer`
                : `${eventConfig.countdownSeconds}s timer`}
            />
            <SummaryRow
              label="Output"
              value={`${eventConfig.outputWidth} × ${eventConfig.outputHeight}`}
            />
            <SummaryRow
              label="Frame"
              value={overlayLayers.length ? `${framePlacement} · ${overlayLayers.length} layer` : "None"}
            />
          </div>

          <div className="mt-5 rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)] p-4 text-xs leading-5 text-[var(--booth-on-surface-variant)]">
            <p className="font-bold text-[var(--booth-on-surface)]">Safe to experiment</p>
            <p className="mt-1">
              Nothing changes in the booth until you save from the Review step.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--booth-outline-variant)]/25 pb-3 text-sm last:border-0 last:pb-0">
      <span className="text-[var(--booth-on-surface-variant)]">{label}</span>
      <span className="text-right font-bold text-[var(--booth-on-surface)]">{value}</span>
    </div>
  );
}

function ReviewItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
}) {
  return (
    <Card elevation={0} className="border border-[var(--booth-outline-variant)]/35 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold leading-5">{value}</p>
        </div>
      </div>
    </Card>
  );
}
