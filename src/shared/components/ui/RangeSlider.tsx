import type { CSSProperties, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/classNames";

interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  min: number;
  max: number;
  value: number;
}

export function RangeSlider({ min, max, value, className, style, ...props }: RangeSliderProps) {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const rangeStyle = {
    ...style,
    "--booth-range-progress": `${Math.max(0, Math.min(100, progress))}%`
  } as CSSProperties;

  return (
    <input
      {...props}
      type="range"
      min={min}
      max={max}
      value={value}
      className={cn("booth-range", className)}
      style={rangeStyle}
    />
  );
}
