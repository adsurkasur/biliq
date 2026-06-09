import type { ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/shared/lib/classNames";

type ToastTone = "success" | "info" | "error";

interface ToastProps {
  children: ReactNode;
  tone?: ToastTone;
  className?: string;
}

export function Toast({ children, tone = "info", className }: ToastProps) {
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "error" ? TriangleAlert : Info;

  return (
    <div
      role="status"
      className={cn(
        "motion-toast inline-flex items-start gap-3 rounded-[var(--booth-radius-lg)] px-4 py-3 text-sm font-semibold shadow-[var(--booth-elevation-2)]",
        tone === "success" &&
          "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]",
        tone === "info" &&
          "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface)]",
        tone === "error" &&
          "bg-[var(--booth-error-container)] text-[var(--booth-on-error-container)]",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
