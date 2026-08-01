import { Expand, Magnet, MoveHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/classNames";

interface CanvasShortcutHintsProps {
  className?: string;
}

const shortcuts = [
  { key: "Shift", label: "Axis / ratio", icon: MoveHorizontal },
  { key: "Alt", label: "Resize from center", icon: Expand },
  { key: "Ctrl/Cmd", label: "Free placement", icon: Magnet }
] as const;

export function CanvasShortcutHints({ className }: CanvasShortcutHintsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[var(--booth-radius-lg)] border border-[var(--booth-outline-variant)]/25 bg-[var(--booth-surface-container)]/75 p-2",
        className
      )}
      aria-label="Canvas keyboard shortcuts"
    >
      {shortcuts.map(({ key, label, icon: Icon }) => (
        <span
          key={key}
          className="inline-flex min-h-8 items-center gap-2 rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container-lowest)] px-2.5 py-1.5 text-xs font-semibold text-[var(--booth-on-surface-variant)] shadow-[var(--booth-elevation-1)]"
        >
          <Icon className="h-3.5 w-3.5 text-[var(--booth-primary)]" aria-hidden="true" />
          <kbd className="rounded-md border border-[var(--booth-outline-variant)]/45 bg-[var(--booth-surface-container-high)] px-1.5 py-0.5 font-mono text-[10px] font-black text-[var(--booth-on-surface)]">
            {key}
          </kbd>
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}
