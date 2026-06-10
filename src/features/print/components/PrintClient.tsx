"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { getPhotoById } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { routes } from "@/shared/config/routes";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";

interface PrintClientProps {
  photoId: string;
}

export function PrintClient({ photoId }: PrintClientProps) {
  const [photo, setPhoto] = useState<PhotoRecord | null>(null);
  const [status, setStatus] = useState("Loading print page...");

  useEffect(() => {
    getPhotoById(photoId)
      .then((record) => {
        setPhoto(record ?? null);
        setStatus(record ? "" : "Photo not found in this browser.");
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Photo could not load.");
      });
  }, [photoId]);

  if (status) {
    if (status === "Loading print page...") {
      return (
        <main className="grid min-h-screen place-items-center px-5 py-8">
          <Card className="p-6">
            <Spinner label={status} className="text-[var(--booth-on-surface-variant)]" />
          </Card>
        </main>
      );
    }

    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <EmptyState
          icon={Printer}
          title={status}
          action={
            <Link
              href={routes.home}
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              Events
            </Link>
          }
        >
          Local photos only exist on the device and browser that saved them.
        </EmptyState>
      </main>
    );
  }

  if (!photo) {
    return null;
  }

  function printPhoto() {
    // Silent kiosk printing is intentionally not implemented in the MVP.
    // It requires browser/device setup such as Chrome or Edge kiosk printing mode.
    window.print();
  }

  return (
    <main className="print-shell min-h-screen bg-white px-5 py-8 sm:px-8 lg:px-10">
      <div className="no-print motion-enter mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-[var(--booth-radius-xl)] border border-[var(--booth-outline-variant)]/20 bg-[var(--booth-surface-container-lowest)] p-4 shadow-[var(--booth-elevation-1)]">
        <div className="flex items-center gap-4">
          <BiliqLogo variant="mark" size="sm" />
          <Link
            href={routes.photo(photo.id)}
            className={buttonClassName({ variant: "secondary" })}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Photo
          </Link>
        </div>
        <Button
          type="button"
          onClick={printPhoto}
          variant="primary"
          size="lg"
        >
          <Printer className="h-5 w-5" aria-hidden="true" />
          Print
        </Button>
      </div>

      <img
        src={photo.imageDataUrl}
        alt="Printable photo booth output"
        className="print-image result-reveal mx-auto max-h-[calc(100vh-120px)] w-auto max-w-full rounded-[var(--booth-radius-md)] object-contain shadow-[var(--booth-elevation-3)]"
      />
    </main>
  );
}
