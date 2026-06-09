"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, GalleryHorizontal, Pencil, Plus, Settings } from "lucide-react";
import { getEvents } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import { routes } from "@/shared/config/routes";

export function EventConsole() {
  const [events, setEvents] = useState<EventConfig[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Local Web Photo Booth
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 sm:text-4xl">
              Event console
            </h1>
          </div>
          <Link
            href={routes.setup()}
            className="booth-focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            New event
          </Link>
        </header>

        {events.length ? (
          <section className="grid gap-4">
            <div className="flex items-center gap-2 text-stone-700">
              <Settings className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-stone-950">Local events</h2>
            </div>

            <div className="grid gap-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-stone-950">
                      {event.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-stone-500">
                      /booth/{event.slug} | {event.outputWidth} x {event.outputHeight}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:flex">
                    <Link
                      href={routes.booth(event.slug)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-800"
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Booth
                    </Link>
                    <Link
                      href={routes.gallery(event.slug)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
                      Gallery
                    </Link>
                    <Link
                      href={routes.setup(event.slug)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-stone-300 bg-white/70 p-8 text-center">
            <div className="max-w-md">
              <Camera className="mx-auto h-12 w-12 text-teal-700" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold text-stone-950">
                Create the first event
              </h2>
              <p className="mt-3 text-stone-600">
                Set the event name, output size, countdown, overlay, and print mode.
              </p>
              <Link
                href={routes.setup()}
                className="booth-focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Start setup
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
