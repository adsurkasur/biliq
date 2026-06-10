import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tonal"
  | "dark"
  | "danger"
  | "ghost"
  | "ghost-surface";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function buttonClassName({
  variant = "secondary",
  size = "md",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "booth-focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-all",
    "duration-[var(--booth-duration-short)] ease-[var(--booth-ease-standard)]",
    "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "min-h-10 rounded-[var(--booth-radius-full)] px-4 py-2 text-sm",
    size === "md" && "min-h-11 rounded-[var(--booth-radius-full)] px-5 py-2.5",
    size === "lg" && "min-h-12 rounded-[var(--booth-radius-full)] px-6 py-3",
    size === "icon" && "h-10 w-10 rounded-[var(--booth-radius-full)] p-0",
    variant === "primary" &&
      "bg-[var(--booth-primary)] text-[var(--booth-on-primary)] shadow-[var(--booth-elevation-1)] hover:shadow-[var(--booth-elevation-2)] hover:brightness-110",
    variant === "tonal" &&
      "bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)] hover:shadow-[var(--booth-elevation-1)]",
    variant === "secondary" &&
      "bg-[var(--booth-surface-container-high)] text-[var(--booth-on-surface)] shadow-[var(--booth-elevation-1)] hover:bg-[var(--booth-surface-container-high-alt)] hover:shadow-[var(--booth-elevation-2)]",
    variant === "dark" &&
      "bg-[var(--booth-on-surface)] text-[var(--booth-surface)] shadow-[var(--booth-elevation-1)] hover:shadow-[var(--booth-elevation-2)]",
    variant === "danger" &&
      "bg-[var(--booth-error-container)] text-[var(--booth-on-error-container)] hover:shadow-[var(--booth-elevation-1)]",
    variant === "ghost" &&
      "bg-white/10 text-white backdrop-blur hover:bg-white/18",
    variant === "ghost-surface" &&
      "bg-transparent text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container-high)]",
    className
  );
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
