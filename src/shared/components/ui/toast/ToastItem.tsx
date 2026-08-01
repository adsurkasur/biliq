"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/shared/lib/classNames";
import type { ToastMessage } from "./types";
import { useToast } from "./useToast";

interface ToastItemProps {
  toast: ToastMessage;
}

export function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const duration = toast.duration ?? (toast.tone === "error" ? 6000 : 3500);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isExiting, removeToast, toast.id]);

  const Icon =
    toast.tone === "success"
      ? CheckCircle2
      : toast.tone === "error"
      ? TriangleAlert
      : Info;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
      onAnimationEnd={() => {
        if (isExiting) removeToast(toast.id);
      }}
      className={cn(
        "pointer-events-auto flex w-[min(92vw,380px)] items-start gap-3 rounded-[var(--booth-radius-lg)] p-4 shadow-[var(--booth-elevation-3)]",
        isExiting ? "motion-toast-exit" : "motion-toast-enter",
        toast.tone === "success" &&
          "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]",
        toast.tone === "info" &&
          "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface)]",
        toast.tone === "error" &&
          "bg-[var(--booth-error-container)] text-[var(--booth-on-error-container)]",
        toast.tone === "warning" &&
          "bg-[var(--booth-tertiary-container)] text-[var(--booth-on-tertiary-container)]"
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <div className="flex-1 grid gap-1 pt-0.5">
        {toast.title && <h3 className="text-sm font-bold">{toast.title}</h3>}
        {toast.description && <p className="text-sm font-medium opacity-90">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setIsExiting(true)}
        className="booth-focus-ring ml-2 rounded-[var(--booth-radius-full)] p-1 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
