"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";

interface ContextualBackButtonProps {
  fallbackRoute: string;
  fallbackLabel: string;
}

export function ContextualBackButton({ fallbackRoute, fallbackLabel }: ContextualBackButtonProps) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  // Validate internal path to avoid open redirects
  const isInternal = returnTo?.startsWith("/") && !returnTo.startsWith("//");

  if (isInternal && returnTo) {
    return (
      <Link href={returnTo} className={buttonClassName({ variant: "secondary", size: "sm" })}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    );
  }

  return (
    <Link href={fallbackRoute} className={buttonClassName({ variant: "secondary", size: "sm" })}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {fallbackLabel}
    </Link>
  );
}
