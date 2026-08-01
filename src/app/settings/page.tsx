import { Suspense } from "react";
import { PageShell } from "@/shared/components/ui/PageShell";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { SettingsClient } from "@/features/settings/components/SettingsClient";
import { ContextualBackButton } from "@/shared/components/navigation/ContextualBackButton";
import { routes } from "@/shared/config/routes";

export const metadata = {
  title: "Settings – Biliq",
  description: "Customize your Biliq experience: theme, motion, and accessibility preferences.",
};

export default function SettingsPage() {
  return (
    <PageShell>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BiliqLogo variant="mark" size="sm" />
            <p className="m-0 text-sm font-semibold tracking-wide text-[var(--booth-primary)]">
              Biliq
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
            Settings
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--booth-on-surface-variant)]">
            Appearance, accessibility, and help.
          </p>
        </div>
        <Suspense fallback={<div className="h-9 w-20" />}>
          <ContextualBackButton fallbackRoute={routes.events} fallbackLabel="Events" />
        </Suspense>
      </header>

      <SettingsClient />
    </PageShell>
  );
}
