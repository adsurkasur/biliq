"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { routes } from "@/shared/config/routes";

interface PrintButtonProps {
  photoId?: string;
  disabled?: boolean;
  className?: string;
}

export function PrintButton({ photoId, disabled, className }: PrintButtonProps) {
  const router = useRouter();
  const isDisabled = disabled || !photoId;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (photoId) {
          router.push(routes.print(photoId));
        }
      }}
      className={
        className ??
        "booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <Printer className="h-5 w-5" aria-hidden="true" />
      Print
    </button>
  );
}
