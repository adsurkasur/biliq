"use client";

import { useCallback, useEffect, useState } from "react";

const GUIDE_SEEN_KEY = "biliq-designer-guide-seen";

export type GuideState =
  | { phase: "idle" }
  | { phase: "prompt" }
  | { phase: "active"; step: number };

export const GUIDE_STEP_COUNT = 8;

export interface UseDesignerGuideReturn {
  guideState: GuideState;
  openGuide: () => void;
  closeGuide: () => void;
  startGuide: () => void;
  skipGuide: () => void;
  goNextStep: () => void;
  goPrevStep: () => void;
}

export function useDesignerGuide(): UseDesignerGuideReturn {
  const [guideState, setGuideState] = useState<GuideState>({ phase: "idle" });

  // On mount, check localStorage to decide if we show first-time prompt
  useEffect(() => {
    try {
      const seen = localStorage.getItem(GUIDE_SEEN_KEY);
      if (!seen) {
        // Small delay so the designer canvas loads first
        const timer = setTimeout(() => {
          setGuideState({ phase: "prompt" });
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (private browsing etc.) — skip prompt silently
    }
  }, []);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  const openGuide = useCallback(() => {
    setGuideState({ phase: "active", step: 0 });
  }, []);

  const closeGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "idle" });
  }, [markSeen]);

  const startGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "active", step: 0 });
  }, [markSeen]);

  const skipGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "idle" });
  }, [markSeen]);

  const goNextStep = useCallback(() => {
    setGuideState((prev) => {
      if (prev.phase !== "active") return prev;
      if (prev.step >= GUIDE_STEP_COUNT - 1) {
        markSeen();
        return { phase: "idle" };
      }
      return { phase: "active", step: prev.step + 1 };
    });
  }, [markSeen]);

  const goPrevStep = useCallback(() => {
    setGuideState((prev) => {
      if (prev.phase !== "active" || prev.step === 0) return prev;
      return { phase: "active", step: prev.step - 1 };
    });
  }, []);

  return {
    guideState,
    openGuide,
    closeGuide,
    startGuide,
    skipGuide,
    goNextStep,
    goPrevStep,
  };
}
