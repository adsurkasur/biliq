"use client";

import { useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
  HelpCircle,
  Move,
  CornerRightDown,
  RotateCw,
  Magnet,
  SlidersHorizontal,
  Save,
  Camera,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { cn } from "@/shared/lib/classNames";
import {
  type GuideState,
  GUIDE_STEP_COUNT,
} from "@/features/designer/hooks/useDesignerGuide";

// ---------------------------------------------------------------------------
// Guide step definitions
// ---------------------------------------------------------------------------

interface GuideStep {
  title: string;
  icon: React.ElementType;
  body: React.ReactNode;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Welcome to the Designer",
    icon: HelpCircle,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          The <strong className="text-[var(--booth-on-surface)]">Designer</strong> lets you build the photo layout for your event. You control where photos appear, what overlay images are applied, and how everything is positioned, sized, and rotated.
        </p>
        <p className="mt-3 text-[var(--booth-on-surface-variant)]">
          When you save the layout here, it applies directly to the Booth capture and the final printed output. This guide walks you through all the tools available.
        </p>
      </div>
    ),
  },
  {
    title: "Photo Slots",
    icon: Camera,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          <strong className="text-[var(--booth-on-surface)]">Photo slots</strong> (Photo 1, Photo 2, …) are the areas where captured photos will be placed in the final output.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Each slot has a visible outline so you can see its boundaries while designing.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            The outline is a preview guide only — it will not appear in photos or prints.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Click a Photo slot on the canvas or in the Hierarchy panel to select it.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Move Elements",
    icon: Move,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          Drag any Photo slot or overlay directly on the canvas to reposition it.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Click and drag to move freely.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Hold <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Shift</kbd> while dragging to lock movement to one axis — horizontal or vertical — whichever direction you move first.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Resize Elements",
    icon: CornerRightDown,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          Select an element on the canvas to reveal corner resize handles. Drag a corner to resize it.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Hold <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Shift</kbd> while resizing to lock the aspect ratio.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Hold <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Alt</kbd> (or <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Option</kbd> on Mac) to resize from the center outward.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            You can also type exact values into the Property Panel on the right.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Rotate Elements",
    icon: RotateCw,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          Select an element to see the rotation handle — a small circle that appears above the element. Drag it in a circle to rotate freely.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Rotation applies to both overlay layers and Photo slots.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            You can also set a precise rotation angle in the Property Panel.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Snapping",
    icon: Magnet,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          As you drag or resize, elements automatically snap to helpful alignment points.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Snaps to canvas edges, canvas center, and the edges and centers of other elements.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Blue alignment guides appear when snapping is active.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Hold <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Ctrl</kbd> (or <kbd className="rounded bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 text-xs font-mono text-[var(--booth-on-surface)]">Cmd</kbd> on Mac) to bypass snapping temporarily for free placement.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Property Panel",
    icon: SlidersHorizontal,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          When you select a Photo slot or overlay, the <strong className="text-[var(--booth-on-surface)]">Property Panel</strong> appears on the right with precise controls.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Type exact numbers for position (X, Y), size (W, H), and rotation.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Click and drag horizontally on any numeric field to scrub the value up or down smoothly.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Use the Aspect Ratio Lock toggle to keep the proportions fixed while resizing.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Save and Use in Booth",
    icon: Save,
    body: (
      <div>
        <p className="text-[var(--booth-on-surface-variant)]">
          When your layout is ready, click <strong className="text-[var(--booth-on-surface)]">Save designer state</strong> at the bottom of the Property Panel.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[var(--booth-on-surface-variant)]">
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            Saving applies the current layout and overlay layers to the Booth.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            The layout controls where photos are placed in captured and printed outputs.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-[var(--booth-primary)]">•</span>
            You can return to the Designer anytime to adjust and re-save.
          </li>
        </ul>
        <p className="mt-4 text-sm font-medium text-[var(--booth-primary)]">
          You&apos;re all set. Happy designing!
        </p>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DesignerGuideProps {
  guideState: GuideState;
  onClose: () => void;
  onStart: () => void;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// First-time prompt
// ---------------------------------------------------------------------------

function GuidePrompt({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <Modal title="New to the Designer?" onClose={onSkip}>
      <p className="mt-3 text-[var(--booth-on-surface-variant)]">
        This is your first time opening the Designer. Would you like a quick walkthrough of the tools and interactions?
      </p>
      <p className="mt-2 text-sm text-[var(--booth-on-surface-variant)]">
        It only takes a minute and you can skip anytime.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" variant="primary" size="md" onClick={onStart}>
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Start guide
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Step panel
// ---------------------------------------------------------------------------

function GuidePanel({
  step,
  onClose,
  onNext,
  onBack,
}: {
  step: number;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const currentStep = GUIDE_STEPS[step];
  const StepIcon = currentStep.icon;
  const isFirst = step === 0;
  const isLast = step === GUIDE_STEP_COUNT - 1;

  // Escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-6 sm:pb-0"
      style={{ pointerEvents: "none" }}
    >
      {/* Panel — positioned at bottom on mobile, floating lower-center on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Designer Guide: ${currentStep.title}`}
        className={cn(
          "pointer-events-auto relative w-full max-w-md rounded-[var(--booth-radius-2xl)]",
          "bg-[var(--booth-surface-container-lowest)] shadow-[var(--booth-elevation-4)]",
          "motion-enter"
        )}
        style={{ outline: "none" }}
      >
        {/* Close button */}
        <button
          type="button"
          className="booth-focus-ring absolute right-4 top-4 rounded-full p-1.5 text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container-high)] hover:text-[var(--booth-on-surface)]"
          onClick={onClose}
          aria-label="Close guide"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pr-12">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)]">
            <StepIcon className="h-4 w-4 text-[var(--booth-on-primary-container)]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
              Step {step + 1} of {GUIDE_STEP_COUNT}
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-[var(--booth-on-surface)] leading-snug">
              {currentStep.title}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mt-3 h-1 rounded-full bg-[var(--booth-surface-container-high)]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[var(--booth-primary)] transition-all duration-[var(--booth-duration-medium)] ease-[var(--booth-ease-standard)]"
            style={{ width: `${((step + 1) / GUIDE_STEP_COUNT) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-sm leading-relaxed">
          {currentStep.body}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--booth-outline-variant)]/30 px-5 py-4">
          <Button
            type="button"
            variant="ghost-surface"
            size="sm"
            onClick={onBack}
            disabled={isFirst}
            aria-label="Previous step"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {/* Step dots */}
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: GUIDE_STEP_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-[var(--booth-duration-short)]",
                    i === step
                      ? "w-4 h-1.5 bg-[var(--booth-primary)]"
                      : "w-1.5 h-1.5 bg-[var(--booth-outline-variant)]"
                  )}
                />
              ))}
            </div>
          </div>

          {isLast ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClose}
              aria-label="Finish guide"
            >
              Done
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="tonal"
              size="sm"
              onClick={onNext}
              aria-label="Next step"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function DesignerGuide({
  guideState,
  onClose,
  onStart,
  onSkip,
  onNext,
  onBack,
}: DesignerGuideProps) {
  if (guideState.phase === "idle") return null;

  if (guideState.phase === "prompt") {
    return <GuidePrompt onStart={onStart} onSkip={onSkip} />;
  }

  // phase === "active"
  return (
    <GuidePanel
      step={guideState.step}
      onClose={onClose}
      onNext={onNext}
      onBack={onBack}
    />
  );
}
