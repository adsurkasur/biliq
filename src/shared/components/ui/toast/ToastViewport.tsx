"use client";

import { useToast } from "./useToast";
import { ToastItem } from "./ToastItem";

export function ToastViewport() {
  const { toasts } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col items-center justify-end gap-3 p-4 sm:w-auto sm:items-end sm:p-0"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))"
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
