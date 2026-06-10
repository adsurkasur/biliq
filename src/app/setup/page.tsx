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
    <PageShell maxWidth="6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BiliqLogo variant="mark" size="sm" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)] m-0">
                Event setup
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
              Configure booth event
            </h1>
          </div>
          <EventNavigation eventSlug={slug} activeRoute="setup" />
        </header>

        <EventSetupForm />
    </PageShell>
  );
}
