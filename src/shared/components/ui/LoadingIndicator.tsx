import { cn } from "@/shared/lib/classNames";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Card } from "@/shared/components/ui/Card";

interface LoadingIndicatorProps {
  variant?: "inline" | "section" | "page";
  label?: string;
  description?: string;
  className?: string;
}

export function LoadingIndicator({
  variant = "inline",
  label = "Loading…",
  description,
  className,
}: LoadingIndicatorProps) {
  if (variant === "inline") {
    return (
      <div 
        className={cn("inline-flex items-center gap-2", className)}
        role="status"
        aria-live="polite"
      >
        <Spinner label={label} className="text-[var(--booth-on-surface-variant)]" />
      </div>
    );
  }

  if (variant === "section") {
    return (
      <Card 
        className={cn("flex flex-col items-center justify-center p-8 text-center", className)}
        role="status"
        aria-live="polite"
      >
        <Spinner label="" className="text-[var(--booth-primary)] mb-4 scale-125" />
        <h3 className="text-lg font-semibold text-[var(--booth-on-surface)]">{label}</h3>
        {description && (
          <p className="mt-2 text-sm text-[var(--booth-on-surface-variant)] max-w-sm">
            {description}
          </p>
        )}
      </Card>
    );
  }

  // variant === "page"
  return (
    <main 
      className={cn("grid min-h-screen place-items-center px-5 py-8", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <Spinner label="" className="text-[var(--booth-primary)] mb-6 scale-150" />
        <h2 className="text-2xl font-bold text-[var(--booth-on-surface)]">{label}</h2>
        {description && (
          <p className="mt-3 text-base text-[var(--booth-on-surface-variant)]">
            {description}
          </p>
        )}
      </div>
    </main>
  );
}
