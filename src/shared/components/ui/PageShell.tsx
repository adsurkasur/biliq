import type { ReactNode } from "react";
import { cn } from "@/shared/lib/classNames";

interface PageShellProps {
  children: ReactNode;
  maxWidth?: "6xl" | "7xl";
  className?: string;
}

export function PageShell({
  children,
  maxWidth = "7xl",
  className
}: PageShellProps) {
  return (
    <main className={cn("min-h-screen px-5 py-8 sm:px-8 lg:px-10", className)}>
      <div
        className={cn(
          "mx-auto grid gap-8 motion-enter",
          maxWidth === "6xl" ? "max-w-6xl" : "max-w-7xl"
        )}
      >
        {children}
      </div>
    </main>
  );
}
