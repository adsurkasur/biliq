"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/shared/lib/classNames";

interface ScrubbableNumberFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function ScrubbableNumberField({
  label,
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  onChange
}: ScrubbableNumberFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartValueRef = useRef(value);
  const dragStartXRef = useRef(0);

  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    if (!isDragging) {
      setInputValue(value.toString());
    }
  }, [value, isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      const deltaX = e.clientX - dragStartXRef.current;
      
      // Sensitivity: 1 pixel = 1 step
      const stepDelta = Math.round(deltaX / 1);
      
      let nextValue = dragStartValueRef.current + stepDelta * step;
      
      // Handle floating point precision issues nicely if step is decimal
      if (step < 1) {
        const precision = Math.max(0, -Math.floor(Math.log10(step)));
        nextValue = Number(nextValue.toFixed(precision));
      }

      if (nextValue < min) nextValue = min;
      if (nextValue > max) nextValue = max;

      if (nextValue !== value) {
        onChange(nextValue);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, value, min, max, step, onChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Prevent accidental text selection while dragging
    e.preventDefault();
    
    setIsDragging(true);
    dragStartValueRef.current = value;
    dragStartXRef.current = e.clientX;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parsed = parseFloat(e.target.value);
    
    if (!Number.isNaN(parsed)) {
      let clamped = parsed;
      if (clamped < min) clamped = min;
      if (clamped > max) clamped = max;
      onChange(clamped);
    }
  };

  const handleInputBlur = () => {
    setInputValue(value.toString());
  };

  return (
    <div className={cn("grid gap-1 text-sm font-semibold text-[var(--booth-on-surface-variant)]", disabled && "opacity-50")}>
      <div 
        className={cn(
          "flex items-center gap-2", 
          !disabled && "cursor-ew-resize select-none touch-none"
        )}
        onPointerDown={handlePointerDown}
        title="Drag left/right to adjust"
      >
        <span className="flex-none">{label}</span>
      </div>
      <input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="booth-focus-ring min-h-11 w-full rounded-[var(--booth-radius-md)] border border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container-lowest)] px-3 py-2 text-[var(--booth-on-surface)] transition-colors focus:border-[var(--booth-primary)] disabled:cursor-not-allowed"
      />
    </div>
  );
}
