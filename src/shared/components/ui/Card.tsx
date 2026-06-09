import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "aside" | "section" | "div";
  interactive?: boolean;
}

export function Card({
  as: Component = "section",
  children,
  className,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-lg border border-stone-200 bg-white shadow-sm",
        interactive &&
          "transition-all duration-200 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-booth",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
