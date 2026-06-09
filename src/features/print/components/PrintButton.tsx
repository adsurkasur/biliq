"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
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
    <Button
      type="button"
      disabled={isDisabled}
      variant="secondary"
      size="lg"
      onClick={() => {
        if (photoId) {
          router.push(routes.print(photoId));
        }
      }}
      className={className}
    >
      <Printer className="h-5 w-5" aria-hidden="true" />
      Print
    </Button>
  );
}
