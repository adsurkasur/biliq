"use client";

import { useEffect } from "react";
import {
  applyMotion,
  applyTheme,
  readMotionPreference,
  readThemeMode
} from "@/features/settings/hooks/useAppPreferences";

export function AppPreferencesProvider() {
  useEffect(() => {
    const sync = () => {
      applyTheme(readThemeMode());
      applyMotion(readMotionPreference());
    };
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleColorChange = () => {
      if (readThemeMode() === "system") applyTheme("system");
    };
    const handleMotionChange = () => {
      if (readMotionPreference() === "system") applyMotion("system");
    };

    sync();
    colorScheme.addEventListener("change", handleColorChange);
    reducedMotion.addEventListener("change", handleMotionChange);
    window.addEventListener("storage", sync);
    return () => {
      colorScheme.removeEventListener("change", handleColorChange);
      reducedMotion.removeEventListener("change", handleMotionChange);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
