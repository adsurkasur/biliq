"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, GalleryHorizontal, LayoutGrid, Palette, Pencil, Settings } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/classNames";

interface EventNavigationProps {
  eventSlug?: string;
  activeRoute?: "setup" | "designer" | "booth" | "gallery" | "photo" | "print";
  theme?: "default" | "booth";
  prefixActions?: React.ReactNode;
  children?: React.ReactNode;
}

export function EventNavigation({ eventSlug, activeRoute, theme = "default", prefixActions, children }: EventNavigationProps) {
  const pathname = usePathname();

  const getHrefWithReturnTo = (baseHref: string) => {
    if (!pathname || pathname === "/") return baseHref;
    const separator = baseHref.includes("?") ? "&" : "?";
    return `${baseHref}${separator}returnTo=${encodeURIComponent(pathname)}`;
  };

  const isBoothTheme = theme === "booth";
  const btnSize = isBoothTheme ? "icon" : "sm";
  const labelClass = isBoothTheme ? "sr-only" : "";

  if (isBoothTheme) {
    // Minimal dark glass style for booth — icon-only
    const boothBtnClass = cn(
      buttonClassName({ variant: "ghost", size: "icon" }),
      "border border-white/10 shadow-none bg-stone-950/60 text-white backdrop-blur-md hover:bg-white/15 active:bg-white/20"
    );
    const boothBtnActive = cn(boothBtnClass, "bg-white/20 text-white border-white/20 pointer-events-none opacity-80");

    return (
      <nav className="flex gap-1.5" aria-label="Event navigation">
        {prefixActions}
        <Link href={routes.home} className={boothBtnClass} title="Events">
          <LayoutGrid className="h-4 w-4 flex-none" aria-hidden="true" />
          <span className="sr-only">Events</span>
        </Link>
        {eventSlug ? (
          <>
            <Link href={routes.booth(eventSlug)} className={activeRoute === "booth" ? boothBtnActive : boothBtnClass} title="Booth" aria-current={activeRoute === "booth" ? "page" : undefined}>
              <Camera className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="sr-only">Booth</span>
            </Link>
            <Link href={getHrefWithReturnTo(routes.setup(eventSlug))} className={activeRoute === "setup" ? boothBtnActive : boothBtnClass} title="Setup" aria-current={activeRoute === "setup" ? "page" : undefined}>
              <Pencil className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="sr-only">Setup</span>
            </Link>
            <Link href={getHrefWithReturnTo(routes.designer(eventSlug))} className={activeRoute === "designer" ? boothBtnActive : boothBtnClass} title="Designer" aria-current={activeRoute === "designer" ? "page" : undefined}>
              <Palette className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="sr-only">Designer</span>
            </Link>
            <Link href={getHrefWithReturnTo(routes.gallery(eventSlug))} className={activeRoute === "gallery" ? boothBtnActive : boothBtnClass} title="Gallery" aria-current={activeRoute === "gallery" ? "page" : undefined}>
              <GalleryHorizontal className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="sr-only">Gallery</span>
            </Link>
          </>
        ) : null}
        {children}
      </nav>
    );
  }

  // Default theme — standard navigation with proper prominence hierarchy
  // Order: Events → Booth → Setup → Designer → Gallery
  const getVariant = (route: "events" | "setup" | "booth" | "gallery" | "designer") => {
    if (route === "events") return "tonal"; // visually distinct — returns to top-level
    if (route === "booth") return activeRoute === "booth" ? "dark" : "dark"; // always dark — capture environment
    return activeRoute === route ? "tonal" : "secondary";
  };

  const getClasses = (route: "events" | "setup" | "booth" | "gallery" | "designer") => {
    return cn(
      buttonClassName({ variant: getVariant(route), size: btnSize }),
      activeRoute === route && "pointer-events-none opacity-80 ring-2 ring-[var(--booth-primary)]/30"
    );
  };

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Event navigation">
      {prefixActions}

      {/* Events — tonal, visually distinct from peers */}
      <Link href={routes.home} className={getClasses("events")}>
        <LayoutGrid className="h-4 w-4 flex-none" aria-hidden="true" />
        <span className={labelClass}>Events</span>
      </Link>

      {eventSlug ? (
        <>
          {/* Booth — dark button, always prominent */}
          <Link
            href={routes.booth(eventSlug)}
            className={getClasses("booth")}
            aria-current={activeRoute === "booth" ? "page" : undefined}
          >
            <Camera className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Booth</span>
          </Link>

          {/* Setup — calmer, secondary/tonal */}
          <Link
            href={getHrefWithReturnTo(routes.setup(eventSlug))}
            className={getClasses("setup")}
            aria-current={activeRoute === "setup" ? "page" : undefined}
          >
            <Pencil className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Setup</span>
          </Link>

          {/* Designer */}
          <Link
            href={getHrefWithReturnTo(routes.designer(eventSlug))}
            className={getClasses("designer")}
            aria-current={activeRoute === "designer" ? "page" : undefined}
          >
            <Palette className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Designer</span>
          </Link>

          {/* Gallery */}
          <Link
            href={getHrefWithReturnTo(routes.gallery(eventSlug))}
            className={getClasses("gallery")}
            aria-current={activeRoute === "gallery" ? "page" : undefined}
          >
            <GalleryHorizontal className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Gallery</span>
          </Link>
        </>
      ) : null}
      {children}
    </nav>
  );
}
