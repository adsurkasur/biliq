import Link from "next/link";
import { ArrowLeft, Palette, Settings } from "lucide-react";
import { GalleryGrid } from "@/features/gallery/components/GalleryGrid";
import { routes } from "@/shared/config/routes";

interface GalleryPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { eventSlug } = await params;

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              {eventSlug}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              Gallery
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.booth(eventSlug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Booth
            </Link>
            <Link
              href={routes.setup(eventSlug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Setup
            </Link>
            <Link
              href={routes.designer(eventSlug)}
              className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Palette className="h-4 w-4" aria-hidden="true" />
              Designer
            </Link>
          </div>
        </header>

        <GalleryGrid eventSlug={eventSlug} />
      </div>
    </main>
  );
}
