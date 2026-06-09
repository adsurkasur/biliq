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
} from "lucide-react";
import { deleteEventConfig, getEvents } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import { deletePhotosByEventId } from "@/domain/photos/storage";
import { Badge } from "@/shared/components/ui/Badge";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { Toast } from "@/shared/components/ui/Toast";
import { routes } from "@/shared/config/routes";

export function EventConsole() {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EventConfig | null>(null);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
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
      setStatusTone("success");
      setStatus(
        `Deleted "${deleteTarget.name}" and ${deletedPhotos} saved photo${
          deletedPhotos === 1 ? "" : "s"
        }.`
      );
      setDeleteTarget(null);
    } catch (error) {
      setStatusTone("error");
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

        {status ? <Toast tone={statusTone}>{status}</Toast> : null}

        {events.length ? (
          <section className="grid gap-4">
            <div className="flex items-center gap-2 text-stone-700">
              <Settings className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-stone-950">Local events</h2>
            </div>

            <div className="grid gap-3">
              {events.map((event) => (
                <Card
                  as="article"
                  key={event.id}
                  interactive
                  className="motion-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-stone-950">
                        {event.name}
                      </h3>
                      <Badge tone={event.customLayout ? "teal" : "neutral"}>
                        {event.customLayout ? "Custom layout" : "Preset"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-stone-500">
                      /booth/{event.slug} · {event.outputWidth} x {event.outputHeight}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Link
                      href={routes.booth(event.slug)}
                      className={buttonClassName({ variant: "dark" })}
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Booth
                    </Link>
                    <Link
                      href={routes.gallery(event.slug)}
                      className={buttonClassName({ variant: "secondary" })}
                    >
                      <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
                      Gallery
                    </Link>
                    <Link
                      href={routes.designer(event.slug)}
                      className={buttonClassName({ variant: "secondary" })}
                    >
                      <Palette className="h-4 w-4" aria-hidden="true" />
                      Designer
                    </Link>
                    <Link
                      href={routes.setup(event.slug)}
                      className={buttonClassName({ variant: "secondary" })}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Link>
                    <Button
                      type="button"
                      onClick={() => setDeleteTarget(event)}
                      variant="danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            icon={Camera}
            title="Create the first event"
            action={
              <Link
                href={routes.setup()}
                className={buttonClassName({ variant: "primary", size: "lg" })}
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Start setup
              </Link>
            }
          >
            Set the event name, output size, countdown, overlay, and print mode.
          </EmptyState>
        )}
      </div>

      {deleteTarget ? (
        <Modal title="Delete event?" onClose={() => setDeleteTarget(null)}>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium leading-6 text-stone-600">
                This removes "{deleteTarget.name}" from this browser and deletes the
                saved local photos for this event. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => setDeleteTarget(null)}
              variant="secondary"
            >
              Keep event
            </Button>
            <Button
              type="button"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              variant="danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isDeleting ? "Deleting..." : "Delete event"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
