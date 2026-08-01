import { EventSetupForm } from "@/features/setup/components/EventSetupForm";
import { PageShell } from "@/shared/components/ui/PageShell";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";

interface SetupPageProps {
  searchParams: Promise<{ slug?: string }>;
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const { slug } = await searchParams;

  return (
    <PageShell>
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BiliqLogo variant="mark" size="sm" />
              <p className="m-0 text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
                Event builder
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
              Build an event guests will love
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-[var(--booth-on-surface-variant)]">
              Start simple, preview every choice, and open advanced controls only when you need them.
            </p>
          </div>
          <EventNavigation eventSlug={slug} activeRoute="setup" />
        </header>

        <EventSetupForm />
    </PageShell>
  );
}
