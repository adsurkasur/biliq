import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

type ButtonVariant = "primary" | "secondary" | "dark" | "danger" | "ghost";
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
    "booth-focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out",
    "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "min-h-10 rounded-md px-3 py-2 text-sm",
    size === "md" && "min-h-11 rounded-md px-4 py-2",
    size === "lg" && "min-h-12 rounded-md px-5 py-3",
    size === "icon" && "h-10 w-10 rounded-full p-0",
    variant === "primary" &&
      "bg-teal-700 text-white shadow-sm hover:bg-teal-800 hover:shadow-md",
    variant === "secondary" &&
      "border border-stone-300 bg-white text-stone-800 shadow-sm hover:bg-stone-100 hover:shadow-md",
    variant === "dark" &&
      "bg-stone-900 text-white shadow-sm hover:bg-stone-800 hover:shadow-md",
    variant === "danger" &&
      "border border-red-200 bg-white text-red-700 shadow-sm hover:bg-red-50 hover:shadow-md",
    variant === "ghost" && "bg-white/10 text-white backdrop-blur hover:bg-white/18",
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
