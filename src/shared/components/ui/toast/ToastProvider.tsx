"use client";

import { useCallback, useRef, useState } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastMessage } from "./types";
import { ToastViewport } from "./ToastViewport";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const queuedToasts = useRef<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    setToasts((current) => {
      const isDuplicate = [...current, ...queuedToasts.current].some(
        (item) =>
          item.title === toast.title &&
          item.description === toast.description &&
          item.tone === toast.tone
      );
      if (isDuplicate) return current;

      const message = { ...toast, id: crypto.randomUUID() };
      if (current.length < 3) return [...current, message];

      queuedToasts.current = [...queuedToasts.current, message].slice(-12);
      return current;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => {
      const remaining = current.filter((toast) => toast.id !== id);
      if (remaining.length === current.length) return current;
      const next = queuedToasts.current.shift();
      return next ? [...remaining, next] : remaining;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}
