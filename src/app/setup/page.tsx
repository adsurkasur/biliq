import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventSetupForm } from "@/features/setup/components/EventSetupForm";
import { routes } from "@/shared/config/routes";

export default function SetupPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Event setup
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              Configure booth event
            </h1>
          </div>
          <Link
            href={routes.home}
            className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Events
          </Link>
        </header>

        <EventSetupForm />
      </div>
    </main>
  );
}
