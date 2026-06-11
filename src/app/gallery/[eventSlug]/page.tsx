import { PageShell } from "@/shared/components/ui/PageShell";
import { EventNavigation } from "@/shared/components/navigation/EventNavigation";
import { GalleryGrid } from "@/features/gallery/components/GalleryGrid";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";

interface GalleryPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { eventSlug } = await params;

  return (
    <PageShell>
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BiliqLogo variant="mark" size="sm" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)] m-0">
                {eventSlug}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
              Gallery
            </h1>
          </div>
          <EventNavigation eventSlug={eventSlug} activeRoute="gallery" />
        </header>

        <GalleryGrid eventSlug={eventSlug} />
    </PageShell>
  );
}
