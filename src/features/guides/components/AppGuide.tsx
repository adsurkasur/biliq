"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  X
} from "lucide-react";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { Button } from "@/shared/components/ui/Button";

const WELCOME_SEEN_KEY = "biliq-app-welcome-seen.v1";

interface GuideStep {
  title: string;
  description: string;
  selector?: string;
}

interface PageGuide {
  label: string;
  steps: GuideStep[];
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
  const [phase, setPhase] = useState<"welcome" | "tour" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const guide = useMemo(() => getPageGuide(pathname), [pathname]);

  useEffect(() => {
    setPhase(null);
    setIsClosing(false);
    setStep(0);
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

    const selector = guide.steps[step]?.selector;
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
  }, [guide.steps, phase, step]);

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
    setIsClosing(false);
    setPhase(pathname === "/" ? "welcome" : "tour");
  }

  function startTour() {
    markWelcomeSeen();
    setStep(0);
    setIsClosing(false);
    setPhase("tour");
  }

  function goNext() {
    if (step >= guide.steps.length - 1) {
      closeGuide();
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <>
      {!phase ? (
        <button
          type="button"
          onClick={openGuide}
          className="booth-focus-ring no-print fixed bottom-5 right-5 z-[90] inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--booth-outline-variant)]/35 bg-[var(--booth-surface-container-lowest)] px-4 py-2.5 text-sm font-bold text-[var(--booth-on-surface)] shadow-[var(--booth-elevation-3)] transition-all hover:-translate-y-0.5 hover:bg-[var(--booth-primary-container)] active:translate-y-0"
          aria-label={`Open ${guide.label} guide`}
        >
          <HelpCircle className="h-5 w-5 text-[var(--booth-primary)]" />
          Guide
        </button>
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
          guide={guide}
          isClosing={isClosing}
          step={step}
          targetRect={targetRect}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          onClose={closeGuide}
          onNext={goNext}
        />
      ) : null}
    </>
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
            className="pointer-events-none fixed rounded-[var(--booth-radius-lg)] ring-4 ring-[var(--booth-primary)] ring-offset-2 ring-offset-white/80 transition-all"
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
        { title: "Continue an event", description: "Each card follows the same order: Setup, Designer, Booth, then Gallery.", selector: "[data-app-guide='event-list']" },
        { title: "Adjust the app", description: "Theme and motion settings follow this device, including System mode.", selector: "[data-app-guide='app-settings']" }
      ]
    };
  }
  if (pathname === "/setup") {
    return {
      label: "Event Setup",
      steps: [
        { title: "Follow the three-step flow", description: "Set the guest experience once, style the output, then review and save.", selector: "[data-app-guide='setup-progress']" },
        { title: "Work on one decision at a time", description: "The main panel contains the current step. Photo count is defined only in Essentials.", selector: "[data-app-guide='setup-form']" },
        { title: "Check the outcome", description: "The live summary reflects your choices without adding duplicate controls.", selector: "[data-app-guide='setup-summary']" },
        { title: "Move through the event", description: "The same Setup, Designer, Booth, and Gallery order is used throughout Biliq.", selector: "nav[aria-label='Event navigation']" }
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
        { title: "Live guest preview", description: "The camera preview uses the event output ratio so framing stays predictable.", selector: "main" },
        { title: "Guest controls", description: "Guests choose an enabled capture mode, then use the single primary capture button.", selector: "[data-app-guide='capture-controls']" },
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
