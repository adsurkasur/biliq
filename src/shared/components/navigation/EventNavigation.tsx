"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, GalleryHorizontal, LayoutGrid, Palette, Pencil } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/classNames";

type EventRoute = "setup" | "designer" | "booth" | "gallery";

interface EventNavigationProps {
  eventSlug?: string;
  activeRoute?: EventRoute | "photo" | "print";
  theme?: "default" | "booth";
  prefixActions?: React.ReactNode;
  children?: React.ReactNode;
}

export function EventNavigation({
  eventSlug,
  activeRoute,
  theme = "default",
  prefixActions,
  children
}: EventNavigationProps) {
  const pathname = usePathname();

  const withReturnTo = (href: string) => {
    if (!pathname || pathname === "/") return href;
    return `${href}${href.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(pathname)}`;
  };

  const eventItems = eventSlug
    ? [
        { id: "setup" as const, label: "Setup", icon: Pencil, href: withReturnTo(routes.setup(eventSlug)) },
        { id: "designer" as const, label: "Designer", icon: Palette, href: withReturnTo(routes.designer(eventSlug)) },
        { id: "booth" as const, label: "Booth", icon: Camera, href: routes.booth(eventSlug) },
        { id: "gallery" as const, label: "Gallery", icon: GalleryHorizontal, href: withReturnTo(routes.gallery(eventSlug)) }
      ]
    : [];

  if (theme === "booth") {
    const baseClass = cn(
      buttonClassName({ variant: "ghost", size: "icon" }),
      "border border-white/10 bg-stone-950/60 text-white shadow-none backdrop-blur-md hover:bg-white/15 active:bg-white/20"
    );

    return (
      <nav className="flex gap-1.5" aria-label="Event navigation">
        {prefixActions}
        <Link href={routes.home} className={baseClass} title="Events">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Events</span>
        </Link>
        {eventItems.map(({ id, label, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            title={label}
            aria-current={activeRoute === id ? "page" : undefined}
            className={cn(
              baseClass,
              activeRoute === id && "pointer-events-none border-white/25 bg-white/20 ring-2 ring-white/20"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </Link>
        ))}
        {children}
      </nav>
    );
  }

  const classesFor = (route?: EventRoute) =>
    cn(
      buttonClassName({
        variant: route && activeRoute === route ? "tonal" : "secondary",
        size: "sm"
      }),
      route && activeRoute === route &&
        "pointer-events-none ring-2 ring-[var(--booth-primary)]/30"
    );

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Event navigation">
      {prefixActions}
      <Link href={routes.home} className={classesFor()}>
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Events
      </Link>
      {eventItems.map(({ id, label, icon: Icon, href }) => (
        <Link
          key={id}
          href={href}
          className={classesFor(id)}
          aria-current={activeRoute === id ? "page" : undefined}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
      {children}
    </nav>
  );
}
