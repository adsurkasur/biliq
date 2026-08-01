"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type MotionPreference = "system" | "reduced" | "full";
export type ResolvedTheme = "light" | "dark";
export type ResolvedMotion = "reduced" | "full";

export const THEME_KEY = "biliq-theme-mode";
export const MOTION_KEY = "biliq-motion-preference";

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences still apply for the current page when storage is unavailable.
  }
}

export function readThemeMode(): ThemeMode {
  const value = safeRead(THEME_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function readMotionPreference(): MotionPreference {
  const value = safeRead(MOTION_KEY);
  return value === "reduced" || value === "full" ? value : "system";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveMotion(preference: MotionPreference): ResolvedMotion {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "reduced"
    : "full";
}

export function applyTheme(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode);
  const html = document.documentElement;
  html.setAttribute("data-theme-mode", mode);
  html.setAttribute("data-theme", resolved);
  return resolved;
}

export function applyMotion(preference: MotionPreference): ResolvedMotion {
  const resolved = resolveMotion(preference);
  const html = document.documentElement;
  html.setAttribute("data-motion-mode", preference);
  html.setAttribute("data-motion", resolved);
  return resolved;
}

export function useAppPreferences() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [motionPreference, setMotionPreferenceState] =
    useState<MotionPreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [resolvedMotion, setResolvedMotion] = useState<ResolvedMotion>("full");

  useEffect(() => {
    const sync = () => {
      const nextTheme = readThemeMode();
      const nextMotion = readMotionPreference();
      setThemeModeState(nextTheme);
      setMotionPreferenceState(nextMotion);
      setResolvedTheme(applyTheme(nextTheme));
      setResolvedMotion(applyMotion(nextMotion));
    };

    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleColorChange = () => {
      if (readThemeMode() === "system") {
        setResolvedTheme(applyTheme("system"));
      }
    };
    const handleMotionChange = () => {
      if (readMotionPreference() === "system") {
        setResolvedMotion(applyMotion("system"));
      }
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

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    safeWrite(THEME_KEY, mode);
    setResolvedTheme(applyTheme(mode));
  }, []);

  const setMotionPreference = useCallback((preference: MotionPreference) => {
    setMotionPreferenceState(preference);
    safeWrite(MOTION_KEY, preference);
    setResolvedMotion(applyMotion(preference));
  }, []);

  return {
    themeMode,
    motionPreference,
    resolvedTheme,
    resolvedMotion,
    setThemeMode,
    setMotionPreference
  };
}
