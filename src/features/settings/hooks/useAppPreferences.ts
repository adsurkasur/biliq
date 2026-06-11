"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type MotionPreference = "system" | "reduced" | "full";

const THEME_KEY = "biliq-theme-mode";
const MOTION_KEY = "biliq-motion-preference";

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
    // ignore
  }
}

export function useAppPreferences() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [motionPreference, setMotionPreferenceState] = useState<MotionPreference>("system");

  useEffect(() => {
    const storedTheme = safeRead(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeModeState(storedTheme);
    }
    const storedMotion = safeRead(MOTION_KEY);
    if (storedMotion === "reduced" || storedMotion === "full") {
      setMotionPreferenceState(storedMotion);
    }
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    safeWrite(THEME_KEY, mode);
    applyTheme(mode);
  }, []);

  const setMotionPreference = useCallback((pref: MotionPreference) => {
    setMotionPreferenceState(pref);
    safeWrite(MOTION_KEY, pref);
    applyMotion(pref);
  }, []);

  return { themeMode, motionPreference, setThemeMode, setMotionPreference };
}

export function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;
  if (mode === "dark") {
    html.setAttribute("data-theme", "dark");
  } else if (mode === "light") {
    html.setAttribute("data-theme", "light");
  } else {
    html.removeAttribute("data-theme");
  }
}

export function applyMotion(pref: MotionPreference) {
  const html = document.documentElement;
  if (pref === "reduced") {
    html.setAttribute("data-motion", "reduced");
  } else if (pref === "full") {
    html.setAttribute("data-motion", "full");
  } else {
    html.removeAttribute("data-motion");
  }
}
