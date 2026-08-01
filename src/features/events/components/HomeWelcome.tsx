import Link from "next/link";
import { Aperture, ArrowRight, Camera, Layers3, Sparkles } from "lucide-react";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { buttonClassName } from "@/shared/components/ui/Button";
import { routes } from "@/shared/config/routes";

export function HomeWelcome() {
  return (
    <main
      className="relative isolate min-h-dvh overflow-hidden px-5 py-8 sm:px-8 lg:px-10"
      data-app-guide="home-welcome"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-[14%] h-[30rem] w-[30rem] rounded-full bg-[var(--booth-primary-container)]/35 blur-[110px]" />
        <div className="absolute -right-32 bottom-[6%] h-[28rem] w-[28rem] rounded-full bg-[var(--booth-tertiary-container)]/20 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--booth-primary)]/35 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col">
        <nav className="flex items-center justify-between gap-4" aria-label="Home navigation">
          <span className="flex items-center gap-3" aria-label="Biliq">
            <BiliqLogo variant="mark" size="md" />
            <span className="text-xl font-black tracking-[-0.03em] text-[var(--booth-on-surface)]">Biliq</span>
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={routes.events}
              className="booth-focus-ring rounded-full px-3 py-2 text-sm font-bold text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)] sm:px-4"
            >
              Events
            </Link>
            <Link
              href={routes.about}
              className="booth-focus-ring rounded-full px-3 py-2 text-sm font-bold text-[var(--booth-on-surface-variant)] hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)] sm:px-4"
            >
              About
            </Link>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,.9fr)_minmax(480px,1.1fr)] lg:gap-16 lg:py-16">
          <div className="motion-enter max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--booth-primary)]/20 bg-[var(--booth-primary-container)]/65 px-4 py-2 text-sm font-black text-[var(--booth-on-primary-container)] shadow-[var(--booth-elevation-1)]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Welcome to Biliq
            </p>
            <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-[-0.045em] text-[var(--booth-on-surface)] sm:text-6xl lg:text-[4.5rem]">
              Your photo booth studio is ready.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[var(--booth-on-surface-variant)] sm:text-lg">
              Build the guest flow, welcome screen, branded output, and live booth from one focused workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={routes.events}
                data-app-guide="open-studio"
                className={buttonClassName({ variant: "primary", size: "lg", className: "whitespace-nowrap" })}
              >
                Enter event studio
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={routes.setup()}
                data-app-guide="create-event"
                className={buttonClassName({ variant: "secondary", size: "lg", className: "whitespace-nowrap" })}
              >
                Create new event
              </Link>
            </div>
          </div>

          <div className="motion-card relative mx-auto w-full max-w-2xl" aria-hidden="true">
            <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-[var(--booth-primary-container)]/25 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container-lowest)]/90 p-3 shadow-[var(--booth-elevation-4)] backdrop-blur-xl sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-[var(--booth-primary)]">
                  <Aperture className="h-4 w-4" />
                  Guest welcome
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--booth-outline-variant)]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--booth-primary)]/55" />
                </div>
              </div>
              <div className="booth-checkerboard relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-[var(--booth-outline-variant)]/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(74,124,115,.32),transparent_46%),linear-gradient(180deg,rgba(18,18,16,.12),rgba(18,18,16,.72))]" />
                <Camera className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                <span className="absolute left-5 top-5 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-white/60" />
                <span className="absolute right-5 top-5 h-10 w-10 rounded-tr-2xl border-r-2 border-t-2 border-white/60" />
                <span className="absolute bottom-5 left-5 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2 border-white/60" />
                <span className="absolute bottom-5 right-5 h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-white/60" />
                <div className="absolute inset-x-5 bottom-7 text-center text-white">
                  <p className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">Welcome to your event</p>
                  <p className="mt-1 text-sm font-semibold text-white/72">The camera is ready when your guests are.</p>
                  <span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-black text-stone-950 shadow-lg">
                    Start
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-bold text-[var(--booth-on-surface-variant)] sm:text-xs">
                <span className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--booth-surface-container)] px-2 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--booth-primary)]" /> Welcome
                </span>
                <span className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--booth-surface-container)] px-2 py-2.5">
                  <Layers3 className="h-3.5 w-3.5 text-[var(--booth-primary)]" /> Design
                </span>
                <span className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--booth-primary-container)] px-2 py-2.5 text-[var(--booth-on-primary-container)]">
                  <Camera className="h-3.5 w-3.5" /> Booth
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--booth-outline-variant)]/20 pt-5 text-xs font-semibold text-[var(--booth-on-surface-variant)]">
          <span>Built for calm, guest-ready operations.</span>
          <span>PT ACS property</span>
        </footer>
      </div>
    </main>
  );
}
