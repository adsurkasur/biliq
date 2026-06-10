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
}

export function EventNavigation({ eventSlug, activeRoute }: EventNavigationProps) {
  const pathname = usePathname();
  const returnToQuery = `?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={routes.home}
        className={buttonClassName({ variant: "secondary" })}
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Events
      </Link>
      
      {eventSlug ? (
        <>
          <Link
            href={`${routes.setup(eventSlug)}${returnToQuery}`}
            className={cn(buttonClassName({ variant: activeRoute === "setup" ? "tonal" : "secondary" }), activeRoute === "setup" && "pointer-events-none opacity-80")}
            aria-current={activeRoute === "setup" ? "page" : undefined}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Setup
          </Link>
          <Link
            href={`${routes.booth(eventSlug)}${returnToQuery}`}
            className={cn(buttonClassName({ variant: activeRoute === "booth" ? "dark" : "secondary" }), activeRoute === "booth" && "pointer-events-none opacity-80")}
            aria-current={activeRoute === "booth" ? "page" : undefined}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Booth
          </Link>
          <Link
            href={`${routes.gallery(eventSlug)}${returnToQuery}`}
            className={cn(buttonClassName({ variant: activeRoute === "gallery" ? "tonal" : "secondary" }), activeRoute === "gallery" && "pointer-events-none opacity-80")}
            aria-current={activeRoute === "gallery" ? "page" : undefined}
          >
            <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
            Gallery
          </Link>
          <Link
            href={`${routes.designer(eventSlug)}${returnToQuery}`}
            className={cn(buttonClassName({ variant: activeRoute === "designer" ? "tonal" : "secondary" }), activeRoute === "designer" && "pointer-events-none opacity-80")}
            aria-current={activeRoute === "designer" ? "page" : undefined}
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
            Designer
          </Link>
        </>
      ) : null}
    </nav>
  );
}
