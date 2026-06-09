import { cn } from "@/shared/lib/classNames";

interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = "Loading", className }: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 text-sm font-semibold", className)}>
      <span
        className="h-5 w-5 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
