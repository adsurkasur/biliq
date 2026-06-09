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
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        tone === "neutral" && "bg-stone-100 text-stone-700",
        tone === "teal" && "bg-teal-50 text-teal-800",
        tone === "amber" && "bg-amber-50 text-amber-800",
        tone === "red" && "bg-red-50 text-red-800",
        tone === "dark" && "bg-stone-900 text-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
