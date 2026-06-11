"use client";

import { useEffect } from "react";
import { applyTheme, applyMotion } from "@/features/settings/hooks/useAppPreferences";

const THEME_KEY = "biliq-theme-mode";
const MOTION_KEY = "biliq-motion-preference";

/**
 * Client component that reads stored preferences and applies them
 * to the <html> element on mount to avoid hydration mismatch.
 * This should be placed inside the root layout as the first client boundary.
 */
export function AppPreferencesProvider() {
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === "dark" || storedTheme === "light") {
        applyTheme(storedTheme);
      }
      const storedMotion = localStorage.getItem(MOTION_KEY);
      if (storedMotion === "reduced" || storedMotion === "full") {
        applyMotion(storedMotion);
      }
    } catch {
      // localStorage unavailable — silent fallback
    }
  }, []);

  return null;
}
