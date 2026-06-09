import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventSetupForm } from "@/features/setup/components/EventSetupForm";
import { buttonClassName } from "@/shared/components/ui/Button";
import { PageShell } from "@/shared/components/ui/PageShell";
import { routes } from "@/shared/config/routes";

export default function SetupPage() {
  return (
    <PageShell maxWidth="6xl">
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
            className={buttonClassName({ variant: "secondary" })}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Events
          </Link>
        </header>

        <EventSetupForm />
    </PageShell>
  );
}
