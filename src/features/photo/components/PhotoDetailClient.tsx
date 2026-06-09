"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getPhotoById } from "@/domain/photos/storage";
import type { PhotoRecord } from "@/domain/photos/types";
import { PrintButton } from "@/features/print/components/PrintButton";
import { QrPreview } from "@/shared/components/QrPreview";
import { routes } from "@/shared/config/routes";
import { createQrValue } from "@/shared/lib/createQrValue";
import { downloadDataUrl, photoFilename } from "@/shared/lib/download";

interface PhotoDetailClientProps {
  photoId: string;
}

export function PhotoDetailClient({ photoId }: PhotoDetailClientProps) {
  const [photo, setPhoto] = useState<PhotoRecord | null>(null);
  const [status, setStatus] = useState("Loading photo...");

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
          <p className="mt-3 text-stone-600">
            Local photos only exist on the device and browser that saved them.
          </p>
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

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              {photo.eventSlug}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              Photo
            </h1>
          </div>
          <Link
            href={routes.gallery(photo.eventSlug)}
            className="booth-focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Gallery
          </Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <img
              src={photo.imageDataUrl}
              alt="Saved photo booth output"
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-md object-contain"
            />
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Saved
              </p>
              <p className="mt-1 font-semibold text-stone-950">
                {new Date(photo.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadDataUrl(
                      photo.imageDataUrl,
                      photoFilename(photo.eventSlug, photo.id)
                    )
                  }
                  className="booth-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download
                </button>
                <PrintButton photoId={photo.id} />
              </div>
            </div>

            <QrPreview value={createQrValue(photo.id)} />
          </aside>
        </div>
      </div>
    </main>
  );
}
