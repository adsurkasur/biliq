"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  GalleryHorizontal,
  Palette,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X
} from "lucide-react";
import { deleteEventConfig, getEvents } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import { deletePhotosByEventId } from "@/domain/photos/storage";
import { routes } from "@/shared/config/routes";

export function EventConsole() {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EventConfig | null>(null);
  const [status, setStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  async function handleDeleteEvent() {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setStatus("");

    try {
      const deletedPhotos = await deletePhotosByEventId(deleteTarget.id);
      deleteEventConfig(deleteTarget.id);
      setEvents(getEvents());
      setStatus(
        `Deleted "${deleteTarget.name}" and ${deletedPhotos} saved photo${
          deletedPhotos === 1 ? "" : "s"
        }.`
      );
      setDeleteTarget(null);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The event could not be deleted. Nothing was removed."
      );
    } finally {
      setIsDeleting(false);
    }
  }

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

        {status ? (
          <div className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm">
            {status}
          </div>
        ) : null}

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

                  <div className="grid grid-cols-2 gap-2 sm:flex">
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
                      href={routes.designer(event.slug)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      <Palette className="h-4 w-4" aria-hidden="true" />
                      Designer
                    </Link>
                    <Link
                      href={routes.setup(event.slug)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(event)}
                      className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </button>
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

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/55 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-booth"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-red-50 text-red-700">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="delete-event-title"
                    className="text-xl font-bold text-stone-950"
                  >
                    Delete event?
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-stone-600">
                    This removes "{deleteTarget.name}" from this browser and deletes
                    the saved local photos for this event. This cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="booth-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-700 hover:bg-stone-100"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="booth-focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-stone-100"
              >
                Keep event
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="booth-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete event"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
