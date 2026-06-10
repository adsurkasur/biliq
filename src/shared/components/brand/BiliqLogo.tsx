import { cn } from "@/shared/lib/classNames";

export type BiliqLogoVariant = "mark" | "lockup" | "monochrome";
export type BiliqLogoSize = "sm" | "md" | "lg" | "xl";

interface BiliqLogoProps {
  variant?: BiliqLogoVariant;
  size?: BiliqLogoSize;
  className?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

const lockupSizeMap = {
  sm: { width: 60, height: 24 },
  md: { width: 80, height: 32 },
  lg: { width: 120, height: 48 },
  xl: { width: 160, height: 64 },
};

export function BiliqLogo({ variant = "mark", size = "md", className }: BiliqLogoProps) {
  let src = "/brand/biliq-mark.svg";
  let dimensions = sizeMap[size];

  if (variant === "lockup") {
    src = "/brand/biliq-lockup.svg";
    dimensions = lockupSizeMap[size];
  } else if (variant === "monochrome") {
    src = "/brand/biliq-mark-monochrome.svg";
  }

  return (
    <img
      src={src}
      alt="Biliq Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={cn("select-none object-contain pointer-events-none block", className)}
    />
  );
}
