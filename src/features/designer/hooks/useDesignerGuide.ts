"use client";

import { useCallback, useState } from "react";

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
  | { phase: "prompt"; isExiting?: boolean }
  | {
      phase: "active";
      step: number;
      completedCheckpoints: DesignerGuideInteraction[];
      isExiting?: boolean;
    };

export const GUIDE_STEP_COUNT = 10;

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

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "true");
    } catch {
      // The guide still works when preference storage is unavailable.
    }
  }, []);

  const openGuide = useCallback(() => {
    setGuideState({ phase: "active", step: 0, completedCheckpoints: [] });
  }, []);

  const closeGuide = useCallback(() => {
    markSeen();
    setGuideState((previous) =>
      previous.phase === "idle" ? previous : { ...previous, isExiting: true }
    );
    setTimeout(() => setGuideState({ phase: "idle" }), 300);
  }, [markSeen]);

  const startGuide = useCallback(() => {
    markSeen();
    setGuideState({ phase: "active", step: 0, completedCheckpoints: [] });
  }, [markSeen]);

  const skipGuide = closeGuide;

  const goNextStep = useCallback(() => {
    setGuideState((previous) => {
      if (previous.phase !== "active") return previous;
      if (previous.step >= GUIDE_STEP_COUNT - 1) {
        markSeen();
        setTimeout(() => setGuideState({ phase: "idle" }), 300);
        return { ...previous, isExiting: true };
      }
      return { ...previous, step: previous.step + 1 };
    });
  }, [markSeen]);

  const goPrevStep = useCallback(() => {
    setGuideState((previous) => {
      if (previous.phase !== "active" || previous.step === 0) return previous;
      return { ...previous, step: previous.step - 1 };
    });
  }, []);

  const completeCheckpoint = useCallback(
    (interaction: DesignerGuideInteraction) => {
      setGuideState((previous) => {
        if (
          previous.phase !== "active" ||
          previous.completedCheckpoints.includes(interaction)
        ) {
          return previous;
        }
        return {
          ...previous,
          completedCheckpoints: [...previous.completedCheckpoints, interaction]
        };
      });
    },
    []
  );

  return {
    guideState,
    openGuide,
    closeGuide,
    startGuide,
    skipGuide,
    goNextStep,
    goPrevStep,
    completeCheckpoint
  };
}
