import { Suspense } from "react";
import { PageShell } from "@/shared/components/ui/PageShell";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { AboutClient } from "@/features/settings/components/AboutClient";
import { ContextualBackButton } from "@/shared/components/navigation/ContextualBackButton";
import { routes } from "@/shared/config/routes";

export const metadata = {
  title: "About – Biliq",
  description: "About Biliq — a local-first browser-based event photo booth system.",
};

export default function AboutPage() {
  return (
    <PageShell maxWidth="6xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BiliqLogo variant="mark" size="sm" />
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)] m-0">
              Biliq
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
            About
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--booth-on-surface-variant)]">
            Local-first browser-based event photo booth system.
          </p>
        </div>
        <Suspense fallback={<div className="h-9 w-20" />}>
          <ContextualBackButton fallbackRoute={routes.settings} fallbackLabel="Settings" />
        </Suspense>
      </header>

      <AboutClient />
    </PageShell>
  );
}
