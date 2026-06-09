"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { getPhotoById } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { routes } from "@/shared/config/routes";

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
    return (
      <main className="grid min-h-screen place-items-center px-5 py-8">
        <div className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-stone-950">{status}</h1>
          <Link
            href={routes.home}
            className="booth-focus-ring mt-6 inline-flex min-h-12 items-center rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Events
          </Link>
        </div>
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
    <main className="print-shell min-h-screen bg-white px-5 py-6 sm:px-8 lg:px-10">
      <div className="no-print mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-5">
        <Link
          href={routes.photo(photo.id)}
          className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Photo
        </Link>
        <button
          type="button"
          onClick={printPhoto}
          className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          <Printer className="h-5 w-5" aria-hidden="true" />
          Print
        </button>
      </div>

      <img
        src={photo.imageDataUrl}
        alt="Printable photo booth output"
        className="print-image mx-auto max-h-[calc(100vh-120px)] w-auto max-w-full rounded-md object-contain shadow-booth"
      />
    </main>
  );
}
