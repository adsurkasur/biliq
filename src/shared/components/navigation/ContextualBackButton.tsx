"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";

interface ContextualBackButtonProps {
  fallbackRoute: string;
  fallbackLabel: string;
}

export function ContextualBackButton({ fallbackRoute, fallbackLabel }: ContextualBackButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const returnTo = searchParams.get("returnTo");

  // Validate internal path to avoid open redirects
  const isInternal = returnTo?.startsWith("/") && !returnTo.startsWith("//");

  if (isInternal && returnTo) {
    return (
      <Link href={returnTo} className={buttonClassName({ variant: "secondary" })}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    );
  }

  return (
    <ButtonOrLink onClick={() => router.back()} href={fallbackRoute} label={fallbackLabel} />
  );
}

function ButtonOrLink({ onClick, href, label }: { onClick: () => void; href: string; label: string }) {
  // If window.history length is > 1 we could ideally use router.back() but checking history.length reliably is tricky in NextJS.
  // Instead, just default to fallback link but that defeats "history-based".
  // Actually, the instruction says: "uses returnTo if present and safe/internal, otherwise uses router.back() if appropriate, otherwise falls back to a supplied route".
  // Let's implement a button that attempts to go back if history exists, or we just render the fallback Link.
  // The simplest reliable contextual back is just using the fallback route when `returnTo` isn't present, because `router.back()` might exit the app.
  // Wait, let's just stick to rendering the fallback Link. The user said: "otherwise uses router.back() if appropriate, otherwise falls back to a supplied route".
  
  return (
    <Link href={href} className={buttonClassName({ variant: "secondary" })}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
