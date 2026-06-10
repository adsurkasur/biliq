"use client";

import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { toasts, addToast, removeToast } = context;

  const toast = (message: string, tone: "success" | "error" | "info" | "warning" = "info", title?: string, duration?: number) => {
    addToast({ description: message, tone, title, duration });
  };

  return { toasts, toast, addToast, removeToast };
}
