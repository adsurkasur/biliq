"use client";

import { useCallback, useEffect, useState } from "react";

const GUIDE_SEEN_KEY = "biliq-designer-guide-seen";

export type DesignerGuideInteraction =
  | "move"
  | "resize"
  | "rotate"
  | "snap"
  | "property-edit"
  | "save";

export type GuideState =
  | { phase: "idle" }
  | { phase: "prompt" }
  | { phase: "active"; step: number; completedCheckpoints: DesignerGuideInteraction[] };

export const GUIDE_STEP_COUNT = 8;

export interface UseDesignerGuideReturn {
  guideState: GuideState;
  openGuide: () => void;
  closeGuide: () => void;
  startGuide: () => void;
  skipGuide: () => void;
  goNextStep: () => void;
  goPrevStep: () => void;
  completeCheckpoint: (interaction: DesignerGuideInteraction) => void;
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
    setGuideState({ phase: "active", step: 0, completedCheckpoints: [] });
  }, []);

  const closeGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "idle" });
  }, [markSeen]);

  const startGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "active", step: 0, completedCheckpoints: [] });
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
      return { phase: "active", step: prev.step + 1, completedCheckpoints: prev.completedCheckpoints };
    });
  }, [markSeen]);

  const goPrevStep = useCallback(() => {
    setGuideState((prev) => {
      if (prev.phase !== "active" || prev.step === 0) return prev;
      return { phase: "active", step: prev.step - 1, completedCheckpoints: prev.completedCheckpoints };
    });
  }, []);

  const completeCheckpoint = useCallback((interaction: DesignerGuideInteraction) => {
    setGuideState((prev) => {
      if (prev.phase !== "active") return prev;
      if (prev.completedCheckpoints.includes(interaction)) return prev;
      return {
        ...prev,
        completedCheckpoints: [...prev.completedCheckpoints, interaction],
      };
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
    completeCheckpoint,
  };
}
