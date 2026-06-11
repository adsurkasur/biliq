"use client";

import { useEffect, useCallback, useMemo } from "react";
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
import {
  useGuideTargetRect,
  type GuideTargetRect,
} from "@/features/designer/hooks/useGuideTargetRect";
import { GuideVisualHint, type GuideHintType } from "@/features/designer/components/GuideVisualHint";

// ---------------------------------------------------------------------------
// Guide step definitions
// ---------------------------------------------------------------------------

interface GuideStep {
  title: string;
  icon: React.ElementType;
  target: string | string[]; // data-guide-target value(s)
  hintType?: GuideHintType;
  body: React.ReactNode;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Welcome to the Designer",
    icon: HelpCircle,
    target: "designer-canvas",
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
    target: ["photo-slot", "designer-canvas"],
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
    target: ["photo-slot", "designer-canvas"],
    hintType: "move",
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
    target: ["resize-handles", "photo-slot", "designer-canvas"],
    hintType: "resize",
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
    target: ["rotation-handle", "resize-handles", "photo-slot", "designer-canvas"],
    hintType: "rotate",
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
    target: ["canvas-viewport", "designer-canvas"],
    hintType: "snap",
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
    target: "property-panel",
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
    target: "save-layout",
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
// Panel position logic
// ---------------------------------------------------------------------------

type PanelPlacement = "right" | "left" | "bottom" | "top";

const PANEL_WIDTH = 384; // max-w-sm ≈ 384px
const PANEL_GAP = 16;

function computePanelPlacement(targetRect: GuideTargetRect | null): {
  placement: PanelPlacement;
  style: React.CSSProperties;
} {
  if (!targetRect) {
    // No target — center at bottom
    return {
      placement: "bottom",
      style: {
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: PANEL_WIDTH,
        width: "calc(100% - 32px)",
      },
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Space available on each side
  const spaceRight = vw - targetRect.right;
  const spaceLeft = targetRect.left;
  const spaceBottom = vh - targetRect.bottom;
  const spaceTop = targetRect.top;

  // Prefer right, then left, then bottom, then top
  if (spaceRight >= PANEL_WIDTH + PANEL_GAP * 2) {
    return {
      placement: "right",
      style: {
        position: "fixed",
        top: Math.max(16, Math.min(targetRect.top, vh - 420)),
        left: targetRect.right + PANEL_GAP,
        maxWidth: PANEL_WIDTH,
        width: Math.min(PANEL_WIDTH, spaceRight - PANEL_GAP * 2),
      },
    };
  }

  if (spaceLeft >= PANEL_WIDTH + PANEL_GAP * 2) {
    return {
      placement: "left",
      style: {
        position: "fixed",
        top: Math.max(16, Math.min(targetRect.top, vh - 420)),
        right: vw - targetRect.left + PANEL_GAP,
        maxWidth: PANEL_WIDTH,
        width: Math.min(PANEL_WIDTH, spaceLeft - PANEL_GAP * 2),
      },
    };
  }

  if (spaceBottom >= 200) {
    return {
      placement: "bottom",
      style: {
        position: "fixed",
        top: targetRect.bottom + PANEL_GAP,
        left: Math.max(16, Math.min(targetRect.left, vw - PANEL_WIDTH - 16)),
        maxWidth: PANEL_WIDTH,
        width: "calc(100% - 32px)",
      },
    };
  }

  if (spaceTop >= 200) {
    return {
      placement: "top",
      style: {
        position: "fixed",
        bottom: vh - targetRect.top + PANEL_GAP,
        left: Math.max(16, Math.min(targetRect.left, vw - PANEL_WIDTH - 16)),
        maxWidth: PANEL_WIDTH,
        width: "calc(100% - 32px)",
      },
    };
  }

  // Final fallback — bottom-center, above viewport bottom
  return {
    placement: "bottom",
    style: {
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: PANEL_WIDTH,
      width: "calc(100% - 32px)",
    },
  };
}

// ---------------------------------------------------------------------------
// Spotlight overlay with target cutout
// ---------------------------------------------------------------------------

function GuideSpotlight({ rect }: { rect: GuideTargetRect | null }) {
  if (!rect) return null;

  const pad = 8;
  const r = 12;

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{ transition: "opacity 200ms ease" }}
    >
      {/* Dimmed overlay with cutout */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="guide-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - pad}
              y={rect.top - pad}
              width={rect.width + pad * 2}
              height={rect.height + pad * 2}
              rx={r}
              ry={r}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.45)"
          mask="url(#guide-spotlight-mask)"
        />
      </svg>

      {/* Highlight ring around target */}
      <div
        className="absolute rounded-[var(--booth-radius-lg)] ring-2 ring-[var(--booth-primary)]/60 ring-offset-2 ring-offset-transparent"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          transition: "top 300ms ease, left 300ms ease, width 300ms ease, height 300ms ease",
        }}
      />
    </div>
  );
}

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
// First-time prompt (unchanged)
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
// Contextual step panel
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

  // Track target rect for this step
  const targetRect = useGuideTargetRect(currentStep.target);

  // Compute panel placement
  const { style: panelStyle } = useMemo(
    () => computePanelPlacement(targetRect),
    [targetRect]
  );

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

  // Scroll target into view if it is off-screen
  useEffect(() => {
    const targets = Array.isArray(currentStep.target) ? currentStep.target : [currentStep.target];
    let el: Element | null = null;
    for (const t of targets) {
      el = document.querySelector(`[data-guide-target="${t}"]`);
      if (el) break;
    }
    
    if (el) {
      const rect = el.getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!inView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep.target, step]);

  return (
    <>
      {/* Spotlight overlay — allows clicks through except on dimmed areas */}
      <GuideSpotlight rect={targetRect} />

      {/* Visual hints based on step */}
      <GuideVisualHint type={currentStep.hintType ?? null} targetRect={targetRect} />

      {/* Clickable backdrop to dismiss — sits behind the panel but above spotlight */}
      <div
        className="fixed inset-0 z-[61]"
        onClick={onClose}
        aria-hidden="true"
        style={{ cursor: "default" }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Designer Guide: ${currentStep.title}`}
        className={cn(
          "z-[62] rounded-[var(--booth-radius-2xl)]",
          "bg-[var(--booth-surface-container-lowest)] shadow-[var(--booth-elevation-4)]",
          "motion-enter"
        )}
        style={{ ...panelStyle, outline: "none" }}
        onClick={(e) => e.stopPropagation()}
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
    </>
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
