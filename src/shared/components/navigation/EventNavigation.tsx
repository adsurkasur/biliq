"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, GalleryHorizontal, Home, Palette, Settings } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/classNames";

interface EventNavigationProps {
  eventSlug?: string;
  activeRoute?: "setup" | "designer" | "booth" | "gallery" | "photo" | "print";
  theme?: "default" | "booth";
}

export function EventNavigation({ eventSlug, activeRoute, theme = "default" }: EventNavigationProps) {
  const pathname = usePathname();

  const getHrefWithReturnTo = (baseHref: string) => {
    if (!pathname || pathname === "/") return baseHref;
    const separator = baseHref.includes("?") ? "&" : "?";
    return `${baseHref}${separator}returnTo=${encodeURIComponent(pathname)}`;
  };

  const isBoothTheme = theme === "booth";
  const btnSize = isBoothTheme ? "icon" : "md";
  const labelClass = isBoothTheme ? "sr-only" : "";

  const getVariant = (route: "events" | "setup" | "booth" | "gallery" | "designer") => {
    if (isBoothTheme) {
      // In booth theme, use ghost for inactive, maybe ghost but opaque for active
      return "ghost";
    }
    if (route === "events") return "secondary";
    if (route === "booth") return activeRoute === "booth" ? "dark" : "secondary";
    return activeRoute === route ? "tonal" : "secondary";
  };

  const getClasses = (route: "events" | "setup" | "booth" | "gallery" | "designer") => {
    return cn(
      buttonClassName({ variant: getVariant(route), size: btnSize }),
      isBoothTheme && "border border-white/10 shadow-none bg-stone-950/60 text-white backdrop-blur-md hover:bg-white/15 active:bg-white/20", // Custom dark glass look
      activeRoute === route && "pointer-events-none opacity-80",
      activeRoute === route && isBoothTheme && "bg-white/20 text-white border-white/20"
    );
  };

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={routes.home}
        className={getClasses("events")}
        title={isBoothTheme ? "Events" : undefined}
      >
        <Home className="h-4 w-4 flex-none" aria-hidden="true" />
        <span className={labelClass}>Events</span>
      </Link>
      
      {eventSlug ? (
        <>
          <Link
            href={getHrefWithReturnTo(routes.setup(eventSlug))}
            className={getClasses("setup")}
            aria-current={activeRoute === "setup" ? "page" : undefined}
            title={isBoothTheme ? "Setup" : undefined}
          >
            <Settings className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Setup</span>
          </Link>
          <Link
            href={getHrefWithReturnTo(routes.booth(eventSlug))}
            className={getClasses("booth")}
            aria-current={activeRoute === "booth" ? "page" : undefined}
            title={isBoothTheme ? "Booth" : undefined}
          >
            <Camera className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Booth</span>
          </Link>
          <Link
            href={getHrefWithReturnTo(routes.gallery(eventSlug))}
            className={getClasses("gallery")}
            aria-current={activeRoute === "gallery" ? "page" : undefined}
            title={isBoothTheme ? "Gallery" : undefined}
          >
            <GalleryHorizontal className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Gallery</span>
          </Link>
          <Link
            href={getHrefWithReturnTo(routes.designer(eventSlug))}
            className={getClasses("designer")}
            aria-current={activeRoute === "designer" ? "page" : undefined}
            title={isBoothTheme ? "Designer" : undefined}
          >
            <Palette className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className={labelClass}>Designer</span>
          </Link>
        </>
      ) : null}
    </nav>
  );
}
