import Link from "next/link";
import { ArrowDown, Camera, Palette, Sparkles } from "lucide-react";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";
import { buttonClassName } from "@/shared/components/ui/Button";
import { routes } from "@/shared/config/routes";

const workflow = [
  {
    icon: Sparkles,
    title: "Shape the guest flow",
    description: "Choose photo, GIF, boomerang, or video and guide every guest from welcome to capture."
  },
  {
    icon: Palette,
    title: "Make it unmistakably yours",
    description: "Build the welcome screen, photo layout, frames, and overlays on precise visual canvases."
  },
  {
    icon: Camera,
    title: "Run it with confidence",
    description: "Open the booth, capture locally, and keep every event organized from one operator studio."
  }
] as const;

export function HomeWelcome() {
  return (
    <header
      className="relative isolate min-h-[min(86dvh,780px)] overflow-hidden border-b border-[var(--booth-outline-variant)]/25 px-5 py-8 sm:px-8 lg:px-10"
      data-app-guide="home-welcome"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-[var(--booth-primary-container)]/40 blur-3xl" />
        <div className="absolute bottom-[8%] right-[6%] h-80 w-80 rounded-full bg-[var(--booth-tertiary-container)]/25 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--booth-primary)]/40 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[calc(min(86dvh,780px)-4rem)] max-w-7xl flex-col justify-between gap-12">
        <nav className="flex items-center justify-between" aria-label="Welcome navigation">
          <span className="flex items-center gap-3" aria-label="Biliq">
            <BiliqLogo variant="mark" size="md" />
            <span className="text-xl font-black tracking-[-0.03em] text-[var(--booth-on-surface)]">Biliq</span>
          </span>
          <Link
            href={routes.about}
            className="booth-focus-ring rounded-full px-4 py-2 text-sm font-bold text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)]"
          >
            About Biliq
          </Link>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,.95fr)]">
          <div className="motion-enter max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--booth-primary-container)] px-4 py-2 text-sm font-bold text-[var(--booth-on-primary-container)]">
              <Sparkles className="h-4 w-4" />
              Photo booth experiences, thoughtfully built
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.04em] text-[var(--booth-on-surface)] sm:text-6xl lg:text-7xl">
              Build a booth guests understand instantly.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-[var(--booth-on-surface-variant)] sm:text-lg">
              Biliq brings setup, branded welcome screens, visual layout design, live capture, and local galleries into one calm workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#event-studio"
                data-app-guide="open-studio"
                className={buttonClassName({ variant: "primary", size: "lg", className: "whitespace-nowrap" })}
              >
                Open event studio
                <ArrowDown className="h-5 w-5" />
              </a>
              <Link
                href={routes.setup()}
                data-app-guide="create-event"
                className={buttonClassName({ variant: "secondary", size: "lg", className: "whitespace-nowrap" })}
              >
                Create a new event
              </Link>
            </div>
          </div>

          <div className="motion-stagger grid gap-3">
            {workflow.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group grid grid-cols-[auto_1fr] gap-4 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/25 bg-[var(--booth-surface-container-lowest)]/80 p-5 shadow-[var(--booth-elevation-1)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[var(--booth-elevation-2)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-[var(--booth-radius-lg)] bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--booth-primary)]">
                    0{index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--booth-on-surface)]">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--booth-on-surface-variant)]">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <a
          href="#event-studio"
          className="booth-focus-ring mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container)] hover:text-[var(--booth-on-surface)]"
        >
          Your events are below
          <ArrowDown className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
