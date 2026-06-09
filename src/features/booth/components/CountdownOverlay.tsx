"use client";

interface CountdownOverlayProps {
  value: number | null;
  label?: string;
  className?: string;
}

export function CountdownOverlay({
  value,
  label,
  className = ""
}: CountdownOverlayProps) {
  if (value === null) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-stone-950/35 ${className}`}
    >
      <div
        key={value}
        className="countdown-pop flex h-40 w-40 items-center justify-center rounded-[var(--booth-radius-full)] border-8 border-white bg-[var(--booth-primary)] text-7xl font-black text-white shadow-[var(--booth-elevation-4)]"
      >
        {value}
      </div>
      {label ? (
        <div className="motion-pop rounded-[var(--booth-radius-full)] bg-white/95 px-5 py-2 text-lg font-bold text-stone-950 shadow-[var(--booth-elevation-3)]">
          {label}
        </div>
      ) : null}
    </div>
  );
}
