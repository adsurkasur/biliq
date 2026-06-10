"use client";

import { useCallback, useState } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastMessage } from "./types";
import { ToastViewport } from "./ToastViewport";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: crypto.randomUUID() }
    ]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}
