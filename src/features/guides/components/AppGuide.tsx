"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Settings,
  Sparkles,
  X
} from "lucide-react";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { Button } from "@/shared/components/ui/Button";
import { APP_VERSION_LABEL } from "@/shared/config/appVersion";
import { routes } from "@/shared/config/routes";

const WELCOME_SEEN_KEY = "biliq-app-welcome-seen.v1";

interface GuideStep {
  title: string;
  description: string;
  selector?: string;
}

interface PageGuide {
  label: string;
  steps: GuideStep[];
  topics?: GuideTopic[];
}

interface GuideTopic {
  id: string;
  label: string;
  description: string;
  steps: GuideStep[];
  prepareEvent?: { name: string; detail?: Record<string, unknown> };
}

interface TargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function AppGuide() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"welcome" | "menu" | "tour" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState(0);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const guide = useMemo(() => getPageGuide(pathname), [pathname]);
  const activeGuide = useMemo(() => {
    const topic = guide.topics?.find((candidate) => candidate.id === activeTopicId);
    return topic ? { label: topic.label, steps: topic.steps } : guide;
  }, [activeTopicId, guide]);

  useEffect(() => {
    setPhase(null);
    setIsClosing(false);
    setStep(0);
    setActiveTopicId(null);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (localStorage.getItem(WELCOME_SEEN_KEY)) return;
    } catch {
      // The welcome guide can still be opened manually.
      return;
    }
    const timer = window.setTimeout(() => setPhase("welcome"), 450);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (phase !== "tour") {
      setTargetRect(null);
      return;
    }

    const selector = activeGuide.steps[step]?.selector;
    const target = selector ? document.querySelector<HTMLElement>(selector) : null;

    const updateRect = () => {
      if (!target) {
        setTargetRect(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      });
    };

    if (target) {
      const rect = target.getBoundingClientRect();
      if (rect.top < 12 || rect.bottom > window.innerHeight - 12) {
        target.scrollIntoView({
          behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth",
          block: "center"
        });
      }
    }

    updateRect();
    const delayedUpdate = window.setTimeout(updateRect, 380);
    const observer = target ? new ResizeObserver(updateRect) : null;
    if (target) observer?.observe(target);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.clearTimeout(delayedUpdate);
      observer?.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeGuide.steps, phase, step]);

  useEffect(() => {
    if (!phase) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGuide();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function markWelcomeSeen() {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, "true");
    } catch {
      // Device-local persistence is optional.
    }
  }

  function closeGuide() {
    if (isClosing) return;
    if (phase === "welcome") markWelcomeSeen();
    setIsClosing(true);
    window.setTimeout(
      () => {
        setPhase(null);
        setStep(0);
        setActiveTopicId(null);
        setIsClosing(false);
      },
      document.documentElement.dataset.motion === "reduced" ? 1 : 220
    );
  }

  function openGuide() {
    if (pathname.startsWith("/designer/")) {
      window.dispatchEvent(new CustomEvent("biliq:open-designer-guide"));
      return;
    }
    setStep(0);
    setActiveTopicId(null);
    setIsClosing(false);
    setPhase(
      pathname === "/"
        ? "welcome"
        : guide.topics && guide.topics.length > 1
          ? "menu"
          : "tour"
    );
  }

  function startTour() {
    markWelcomeSeen();
    setStep(0);
    setActiveTopicId(null);
    setIsClosing(false);
    setPhase("tour");
  }

  function goNext() {
    if (step >= activeGuide.steps.length - 1) {
      closeGuide();
      return;
    }
    setStep((current) => current + 1);
  }

  function openTopic(topic: GuideTopic) {
    setActiveTopicId(topic.id);
    setStep(0);
    if (topic.prepareEvent) {
      window.dispatchEvent(
        new CustomEvent(topic.prepareEvent.name, { detail: topic.prepareEvent.detail })
      );
    }
    window.setTimeout(() => setPhase("tour"), 80);
  }

  return (
    <>
      {!phase ? (
        <div className={`motion-pop no-print fixed right-4 z-[90] flex items-center gap-1.5 rounded-full border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container-lowest)]/92 p-1.5 shadow-[var(--booth-elevation-3)] backdrop-blur-md ${pathname.startsWith("/booth/") ? "top-20" : "bottom-4"}`}>
          <Link
            href={routes.about}
            className="booth-focus-ring rounded-full px-2.5 py-2 text-xs font-bold text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)]"
            aria-label={`Biliq ${APP_VERSION_LABEL}. Open About`}
          >
            {APP_VERSION_LABEL}
          </Link>
          {pathname !== routes.settings ? (
            <Link
              href={`${routes.settings}?returnTo=${encodeURIComponent(pathname)}`}
              data-app-guide="global-settings"
              className="booth-focus-ring inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)]"
              aria-label="Open app settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={openGuide}
            className="booth-focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--booth-primary-container)] px-3 py-2 text-sm font-bold text-[var(--booth-on-primary-container)] hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
            aria-label={`Open ${guide.label} guide`}
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </button>
        </div>
      ) : null}

      {phase === "welcome" ? (
        <div className={`fixed inset-0 z-[130] grid place-items-center bg-stone-950/65 p-4 backdrop-blur-sm ${isClosing ? "motion-guide-backdrop-exit" : "motion-guide-backdrop"}`}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="biliq-welcome-title"
            className={`${isClosing ? "motion-guide-panel-exit" : "motion-guide-panel"} w-full max-w-xl rounded-[var(--booth-radius-2xl)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container-lowest)] p-6 shadow-[var(--booth-elevation-4)] sm:p-8`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <BiliqLogo variant="mark" size="sm" />
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--booth-primary)]">
                  Welcome to Biliq
                </p>
              </div>
              <button
                type="button"
                onClick={closeGuide}
                className="booth-focus-ring rounded-full p-2 text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)]"
                aria-label="Close guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid h-14 w-14 place-items-center rounded-full bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 id="biliq-welcome-title" className="mt-4 text-3xl font-bold text-[var(--booth-on-surface)]">
              Your booth, from setup to guest-ready
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
              Biliq keeps the main workflow simple. You can always reopen this guide from the Guide button.
            </p>

            <ol className="mt-6 grid gap-2 sm:grid-cols-4">
              {["Create event", "Set experience", "Design output", "Open booth"].map((item, index) => (
                <li key={item} className="rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] p-3 text-sm font-bold">
                  <span className="mb-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--booth-primary)] text-xs text-[var(--booth-on-primary)]">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={closeGuide}>
                Explore myself
              </Button>
              <Button type="button" variant="primary" onClick={startTour}>
                Start quick tour
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {phase === "tour" ? (
        <GuideTour
          guide={activeGuide}
          isClosing={isClosing}
          step={step}
          targetRect={targetRect}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onClose={closeGuide}
          onNext={goNext}
        />
      ) : null}

      {phase === "menu" && guide.topics ? (
        <GuideMenu
          label={guide.label}
          topics={guide.topics}
          isClosing={isClosing}
          onClose={closeGuide}
          onSelect={openTopic}
        />
      ) : null}
    </>
  );
}

function GuideMenu({
  label,
  topics,
  isClosing,
  onClose,
  onSelect
}: {
  label: string;
  topics: GuideTopic[];
  isClosing: boolean;
  onClose: () => void;
  onSelect: (topic: GuideTopic) => void;
}) {
  return (
    <div className={`fixed inset-0 z-[130] grid place-items-center bg-stone-950/65 p-4 backdrop-blur-sm ${isClosing ? "motion-guide-backdrop-exit" : "motion-guide-backdrop"}`}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${label} guide topics`}
        className={`${isClosing ? "motion-guide-panel-exit" : "motion-guide-panel"} w-full max-w-2xl rounded-[var(--booth-radius-2xl)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container-lowest)] p-6 shadow-[var(--booth-elevation-4)]`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-primary)]">{label} guide</p>
            <h2 className="mt-2 text-2xl font-bold">What would you like to learn?</h2>
            <p className="mt-2 text-sm text-[var(--booth-on-surface-variant)]">Choose a focused walkthrough. You can return and open another topic anytime.</p>
          </div>
          <button type="button" onClick={onClose} className="booth-focus-ring rounded-full p-2 hover:bg-[var(--booth-surface-container)]" aria-label="Close guide topics">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="motion-stagger mt-6 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelect(topic)}
              className="booth-focus-ring rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-low)] p-4 text-left hover:-translate-y-0.5 hover:border-[var(--booth-primary)] hover:bg-[var(--booth-primary-container)]/15"
            >
              <span className="font-bold text-[var(--booth-on-surface)]">{topic.label}</span>
              <span className="mt-1 block text-sm leading-5 text-[var(--booth-on-surface-variant)]">{topic.description}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--booth-primary)]">
                {topic.steps.length} steps <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function GuideTour({
  guide,
  isClosing,
  step,
  targetRect,
  onBack,
  onClose,
  onNext
}: {
  guide: PageGuide;
  isClosing: boolean;
  step: number;
  targetRect: TargetRect | null;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}) {
  const current = guide.steps[step];
  const padding = 8;
  const targetIsLow = targetRect ? targetRect.top > window.innerHeight * 0.48 : false;

  return (
    <div className={`fixed inset-0 z-[130] ${isClosing ? "motion-guide-backdrop-exit" : ""}`} role="dialog" aria-modal="true" aria-label={`${guide.label} guide`}>
      {targetRect ? (
        <>
          <div className="fixed left-0 right-0 top-0 bg-stone-950/65 transition-all" style={{ height: Math.max(0, targetRect.top - padding) }} />
          <div className="fixed left-0 bg-stone-950/65 transition-all" style={{ top: Math.max(0, targetRect.top - padding), width: Math.max(0, targetRect.left - padding), height: targetRect.height + padding * 2 }} />
          <div className="fixed right-0 bg-stone-950/65 transition-all" style={{ top: Math.max(0, targetRect.top - padding), width: Math.max(0, window.innerWidth - targetRect.right - padding), height: targetRect.height + padding * 2 }} />
          <div className="fixed bottom-0 left-0 right-0 bg-stone-950/65 transition-all" style={{ top: targetRect.bottom + padding }} />
          <div
            className="pointer-events-none fixed rounded-[var(--booth-radius-lg)] ring-4 ring-[var(--booth-primary)] ring-offset-2 ring-offset-[var(--booth-guide-ring-offset)] transition-all"
            style={{
              top: targetRect.top - padding,
              left: targetRect.left - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-stone-950/65" />
      )}

      <section
        className={`${isClosing ? "motion-guide-panel-exit" : "motion-guide-panel"} fixed left-4 right-4 z-[140] mx-auto w-auto max-w-md rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container-lowest)] p-5 shadow-[var(--booth-elevation-4)] ${targetIsLow ? "top-5" : "bottom-5"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--booth-primary)]">
              {guide.label} · {step + 1} of {guide.steps.length}
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--booth-on-surface)]">{current.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="booth-focus-ring rounded-full p-2 text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)]"
            aria-label="Close guide"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--booth-on-surface-variant)]">
          {current.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {guide.steps.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${index === step ? "w-6 bg-[var(--booth-primary)]" : "w-2 bg-[var(--booth-outline-variant)]"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button type="button" variant="secondary" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : null}
            <Button type="button" variant="primary" size="sm" onClick={onNext}>
              {step === guide.steps.length - 1 ? (
                <>
                  Done
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function getPageGuide(pathname: string): PageGuide {
  if (pathname === "/") {
    return {
      label: "Events",
      steps: [
        { title: "Your event workspace", description: "Every event lives here, with one clear path from setup to booth operation.", selector: "[data-app-guide='page-header']" },
        { title: "Create an event", description: "Start here. Biliq will ask only for the guest experience first, then visual output.", selector: "[data-app-guide='create-event']" },
        { title: "Continue an event", description: "Each card follows the same order: Setup, Welcome, Designer, Booth, then Gallery.", selector: "[data-app-guide='event-list']" },
        { title: "Adjust the app", description: "Theme and motion settings follow this device. Settings stays available from every page.", selector: "[data-app-guide='global-settings']" }
      ]
    };
  }
  if (pathname === "/setup") {
    return {
      label: "Event Setup",
      steps: [
        { title: "Follow the three-step flow", description: "Set the guest experience once, style the output, then review and save.", selector: "[data-app-guide='setup-progress']" },
        { title: "Check the outcome", description: "The live summary reflects your choices without adding duplicate controls.", selector: "[data-app-guide='setup-summary']" },
        { title: "Move through the event", description: "Setup, Welcome, Designer, Booth, and Gallery always appear in the same workflow order.", selector: "nav[aria-label='Event navigation']" }
      ],
      topics: [
        {
          id: "setup-workflow",
          label: "Setup workflow",
          description: "Understand the three steps, live summary, navigation, and safe draft behavior.",
          prepareEvent: { name: "biliq:guide-setup-step", detail: { step: 0 } },
          steps: [
            { title: "Three focused steps", description: "Essentials controls the guest experience, Look & layout controls the visual output, and Review is the only place that saves and launches.", selector: "[data-app-guide='setup-progress']" },
            { title: "One main work area", description: "Only the current step contains editable controls, which prevents the same decision from appearing twice.", selector: "[data-app-guide='setup-form']" },
            { title: "Live summary", description: "This is read-only confirmation. It updates instantly but does not change the booth until you save.", selector: "[data-app-guide='setup-summary']" },
            { title: "Event navigation", description: "Use the stable workflow order to move between configuration, the welcome screen, design, operation, and results.", selector: "nav[aria-label='Event navigation']" }
          ]
        },
        {
          id: "capture-modes",
          label: "Photo, GIF & Video",
          description: "Learn what every guest capture mode does and which settings affect it.",
          prepareEvent: { name: "biliq:guide-setup-step", detail: { step: 0 } },
          steps: [
            { title: "Capture modes", description: "Photo creates a composed still image. GIF records a short looping sequence. Boomerang plays that sequence forward and backward. Video records a timed clip and can include microphone audio.", selector: "[data-app-guide='capture-modes']" },
            { title: "Photo session count", description: "This setting exists only for Photo. It controls both how many times the countdown runs and how many photo areas the starting layout receives.", selector: "[data-app-guide='photo-count']" },
            { title: "GIF and Boomerang timing", description: "Frames controls smoothness and capture length. Playback speed controls the delay between frames. Both settings are shared by GIF and Boomerang.", selector: "[data-app-guide='animation-settings']" },
            { title: "Video recording", description: "Choose a short duration for fast guest turnover. Enable microphone only when the venue and consent flow support audio recording.", selector: "[data-app-guide='video-settings']" },
            { title: "Countdown", description: "The countdown gives guests time to pose before each Photo, or before an animation/video session begins. Zero starts immediately.", selector: "[data-app-guide='countdown-setting']" }
          ]
        },
        {
          id: "output-frame",
          label: "Output & event frame",
          description: "Understand portrait, square, landscape, plus Fit, Fill, and Stretch behavior.",
          prepareEvent: { name: "biliq:guide-setup-step", detail: { step: 1 } },
          steps: [
            { title: "Output format", description: "Tablet Portrait is best for vertical booths and prints, Square is flexible for social sharing, and Landscape suits wide displays. Changing format recalculates the frame preview.", selector: "[data-app-guide='output-format']" },
            { title: "Fit", description: "Fit preserves the complete frame and its proportions. If the aspect ratios differ, empty space can remain around it.", selector: "[data-app-guide='frame-fit']" },
            { title: "Fill", description: "Fill preserves proportions and covers the entire canvas. Parts of the frame can be cropped outside the canvas edge.", selector: "[data-app-guide='frame-fill']" },
            { title: "Stretch", description: "Stretch forces the image to the exact output dimensions. It never leaves gaps, but a mismatched frame can look distorted.", selector: "[data-app-guide='frame-stretch']" },
            { title: "Aspect-ratio warning", description: "When this warning appears, compare Fit and Fill first. Use Stretch only when the artwork was intentionally designed to scale non-proportionally.", selector: "[data-app-guide='frame-ratio-warning']" },
            { title: "Welcome screen", description: "The guest welcome screen has its own canvas and frame. Its camera remains live by default and does not alter the final photo frame.", selector: "[data-app-guide='welcome-screen-setting']" }
          ]
        },
        {
          id: "save-launch",
          label: "Save & launch",
          description: "Review what will be saved and choose the correct next destination.",
          prepareEvent: { name: "biliq:guide-setup-step", detail: { step: 2 } },
          steps: [
            { title: "Final review", description: "Confirm capture modes, countdown, output dimensions, layout, and design layers before saving.", selector: "[data-app-guide='setup-review']" },
            { title: "Choose the next step", description: "Save event returns to the dashboard, Fine-tune design opens the output canvas, and Test booth starts the camera experience.", selector: "[data-app-guide='setup-save-actions']" }
          ]
        }
      ]
    };
  }
  if (pathname.startsWith("/welcome/")) {
    return {
      label: "Welcome Screen",
      steps: [
        { title: "Welcome canvas", description: "This canvas is shown before guests enter the booth. The real booth keeps its camera active behind these elements.", selector: "[data-app-guide='welcome-canvas']" },
        { title: "Move and transform", description: "Drag an item to move it. Side handles resize one axis, corner handles resize both, and the top handle rotates. Hold Shift for proportions or Alt to resize from the center.", selector: "[data-app-guide='welcome-canvas']" },
        { title: "Screen elements", description: "Select the title, subtitle, start button, or a custom frame layer. Eye controls hide items; frame locks prevent accidental canvas movement.", selector: "[data-app-guide='welcome-elements']" },
        { title: "Precise properties", description: "Edit wording, position, size, rotation, opacity, and colors here. Canvas dragging and property values always update the same selected item.", selector: "[data-app-guide='welcome-properties']" },
        { title: "Camera behavior", description: "Keep the live camera visible for the familiar mirror-like Lumabooth experience, or hide it for a branded splash screen.", selector: "[data-app-guide='welcome-camera']" },
        { title: "Save to the booth", description: "Save applies the welcome screen to this event without changing the final photo output design.", selector: "[data-app-guide='welcome-save']" }
      ]
    };
  }
  if (pathname.startsWith("/designer/")) {
    return {
      label: "Designer",
      steps: [
        { title: "Designer", description: "Use the interactive Designer guide for canvas tools.", selector: "main" }
      ]
    };
  }
  if (pathname.startsWith("/gallery/")) {
    return {
      label: "Gallery",
      steps: [
        { title: "Saved captures", description: "This gallery contains captures saved by this event on the current browser and device.", selector: "[data-app-guide='gallery-content']" },
        { title: "Open, download, print, or remove", description: "Each capture keeps its essential actions together. Video and animations skip printing.", selector: "[data-app-guide='gallery-actions']" },
        { title: "Return to the event workflow", description: "Use the consistent event navigation to adjust setup, design, or reopen the booth.", selector: "nav[aria-label='Event navigation']" }
      ]
    };
  }
  if (pathname.startsWith("/booth/")) {
    return {
      label: "Booth",
      steps: [
        { title: "Live guest preview", description: "The camera opens on the branded welcome screen first. Guests tap its Start button to enter capture; disabled welcome screens go straight to capture.", selector: "main" },
        { title: "Guest controls", description: "After Start, guests choose an enabled capture mode and use the single primary capture button. The configured countdown then guides the session.", selector: "[data-app-guide='capture-controls']" },
        { title: "Operator navigation", description: "These compact controls return to Setup, Designer, and Gallery without crowding the guest flow.", selector: "nav[aria-label='Event navigation']" }
      ]
    };
  }
  if (pathname === "/settings") {
    return {
      label: "Settings",
      steps: [
        { title: "Theme", description: "System now resolves to your device's current light or dark setting and updates when it changes.", selector: "[data-app-guide='theme-settings']" },
        { title: "Motion", description: "System follows reduced-motion accessibility settings. Full and Reduced explicitly override it.", selector: "[data-app-guide='motion-settings']" },
        { title: "Help and product details", description: "Open About for local-first storage and version information.", selector: "[data-app-guide='help-settings']" }
      ]
    };
  }
  if (pathname.startsWith("/photo/")) {
    return {
      label: "Capture Detail",
      steps: [
        { title: "Captured result", description: "Review the full saved output here before sharing or printing.", selector: "[data-app-guide='capture-result']" },
        { title: "Guest handoff", description: "Download, share, print eligible photos, or scan the QR code from this action area.", selector: "[data-app-guide='capture-actions']" }
      ]
    };
  }
  if (pathname.startsWith("/print/")) {
    return {
      label: "Print",
      steps: [
        { title: "Print controls", description: "Return to the capture or open the browser print dialog from this operator toolbar.", selector: "[data-app-guide='print-toolbar']" },
        { title: "Print preview", description: "Only the image is included when printing; guide and operator controls are automatically hidden.", selector: "[data-app-guide='print-image']" }
      ]
    };
  }
  if (pathname === "/about") {
    return {
      label: "About",
      steps: [
        { title: "How Biliq works", description: "This page explains product ownership, local-first behavior, and current app information.", selector: "main" },
        { title: "Return when ready", description: "Use the back control to return to Settings without losing your place.", selector: "header" }
      ]
    };
  }
  return {
    label: "Biliq",
    steps: [
      { title: "This page", description: "The main content and actions for the current Biliq workflow are kept together here.", selector: "main" },
      { title: "Navigation", description: "Use the page header to return or continue to the next part of the workflow.", selector: "header" }
    ]
  };
}
