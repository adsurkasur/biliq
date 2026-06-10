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
      className="pointer-events-none fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse items-center justify-end gap-3 p-4 sm:right-0 sm:top-0 sm:bottom-auto sm:flex-col sm:items-end sm:p-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
