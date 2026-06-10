import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

type CardElevation = 0 | 1 | 2;

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "aside" | "section" | "div";
  interactive?: boolean;
  elevation?: CardElevation;
}

export function Card({
  as: Component = "section",
  children,
  className,
  interactive = false,
  elevation = 1,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-[var(--booth-radius-xl)] bg-[var(--booth-surface-container-lowest)]",
        elevation === 0 && "shadow-none",
        elevation === 1 && "shadow-[var(--booth-elevation-1)]",
        elevation === 2 && "shadow-[var(--booth-elevation-2)]",
        interactive &&
          "transition-all duration-[var(--booth-duration-short)] ease-[var(--booth-ease-standard)] hover:shadow-[var(--booth-elevation-3)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
