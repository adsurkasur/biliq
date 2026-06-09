import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

type BadgeTone = "neutral" | "teal" | "amber" | "red" | "dark";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({
  children,
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--booth-radius-full)] px-3 py-1 text-xs font-bold uppercase tracking-wide",
        tone === "neutral" &&
          "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface-variant)]",
        tone === "teal" &&
          "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]",
        tone === "amber" &&
          "bg-[var(--booth-tertiary-container)] text-[var(--booth-on-tertiary-container)]",
        tone === "red" &&
          "bg-[var(--booth-error-container)] text-[var(--booth-on-error-container)]",
        tone === "dark" &&
          "bg-[var(--booth-on-surface)] text-[var(--booth-surface)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
