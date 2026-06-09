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
        "motion-toast inline-flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-semibold shadow-sm",
        tone === "success" && "border-teal-200 bg-teal-50 text-teal-900",
        tone === "info" && "border-stone-200 bg-white text-stone-700",
        tone === "error" && "border-red-200 bg-red-50 text-red-900",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
