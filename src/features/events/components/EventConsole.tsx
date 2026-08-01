"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  GalleryHorizontal,
  Image,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Trash2
} from "lucide-react";
import { deleteEventConfig, getEvents } from "@/domain/events/storage";
import type { EventConfig } from "@/domain/events/types";
import { deletePhotosByEventId } from "@/domain/photos/storage";
import { Badge } from "@/shared/components/ui/Badge";
import { Button, buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { PageShell } from "@/shared/components/ui/PageShell";
import { useToast } from "@/shared/components/ui/toast/useToast";
import { routes } from "@/shared/config/routes";
import { BiliqLogo } from "@/shared/components/brand/BiliqLogo";

export function EventConsole() {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EventConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  async function handleDeleteEvent() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    try {
      const deletedPhotos = await deletePhotosByEventId(deleteTarget.id);
      await deleteEventConfig(deleteTarget.id);
      setEvents(getEvents());
      toast(
        `Deleted "${deleteTarget.name}" and ${deletedPhotos} saved photo${
          deletedPhotos === 1 ? "" : "s"
        }.`,
        "success"
      );
      setDeleteTarget(null);
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "The event could not be deleted. Nothing was removed.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageShell>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--booth-outline-variant)]/30 pb-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <BiliqLogo variant="mark" size="sm" />
            <p className="m-0 text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
              Biliq Studio
            </p>
          </div>
          <h1 className="text-3xl font-bold text-[var(--booth-on-surface)] sm:text-4xl">
            Your photo booth events
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--booth-on-surface-variant)]">
            Prepare, test, and launch every event from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={routes.setup()}
            className={buttonClassName({ variant: "primary", size: "lg" })}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Create event
          </Link>
          <Link
            href={routes.settings}
            className={buttonClassName({ variant: "ghost-surface", size: "icon" })}
            title="Settings"
            aria-label="Open app settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {events.length ? (
        <section className="grid gap-4">
          <div className="flex items-center gap-2 text-[var(--booth-on-surface-variant)]">
            <Sparkles className="h-5 w-5 text-[var(--booth-primary)]" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-[var(--booth-on-surface)]">
              Ready to continue
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {events.map((event) => (
              <Card
                as="article"
                key={event.id}
                interactive
                className="motion-card flex flex-col gap-5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-xl font-bold text-[var(--booth-on-surface)]">
                        {event.name}
                      </h3>
                      <Badge tone="teal">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Ready to test
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--booth-on-surface-variant)]">
                      {event.captureCount} photo{event.captureCount > 1 ? "s" : ""} per session · {event.outputWidth} × {event.outputHeight}px
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setDeleteTarget(event)}
                    variant="ghost-surface"
                    size="icon"
                    aria-label={`Delete ${event.name}`}
                    title="Delete event"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-[var(--booth-radius-lg)] bg-[var(--booth-surface-container)] p-3 text-sm">
                  <div className="flex items-center gap-2 text-[var(--booth-on-surface-variant)]">
                    <Palette className="h-4 w-4 flex-none text-[var(--booth-primary)]" />
                    <span>{event.customLayout ? "Custom layout" : "Starter layout"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--booth-on-surface-variant)]">
                    <Image className="h-4 w-4 flex-none text-[var(--booth-primary)]" />
                    <span>
                      {event.overlayLayers?.length
                        ? `${event.overlayLayers.length} overlay${event.overlayLayers.length > 1 ? "s" : ""}`
                        : "No frame"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                  <Link
                    href={routes.booth(event.slug)}
                    className={buttonClassName({ variant: "dark", size: "md" })}
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Test & launch booth
                  </Link>
                  <Link
                    href={routes.designer(event.slug)}
                    className={buttonClassName({ variant: "tonal", size: "sm" })}
                  >
                    <Palette className="h-4 w-4" aria-hidden="true" />
                    Design
                  </Link>
                  <Link
                    href={routes.setup(event.slug)}
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                  <Link
                    href={routes.gallery(event.slug)}
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    <GalleryHorizontal className="h-4 w-4" aria-hidden="true" />
                    Gallery
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={Camera}
          title="Create your first booth event"
          action={
            <Link
              href={routes.setup()}
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Build an event
            </Link>
          }
        >
          Biliq will guide you through capture, layout, frame, and a final booth test.
        </EmptyState>
      )}

      {deleteTarget ? (
        <Modal title="Delete event?" onClose={() => setDeleteTarget(null)}>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-[var(--booth-radius-full)] bg-[var(--booth-error-container)] text-[var(--booth-on-error-container)]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium leading-6 text-[var(--booth-on-surface-variant)]">
              This removes “{deleteTarget.name}”, its local design assets, and saved photos from this browser. This cannot be undone.
            </p>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button type="button" onClick={() => setDeleteTarget(null)} variant="secondary">
              Keep event
            </Button>
            <Button
              type="button"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              variant="danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isDeleting ? "Deleting…" : "Delete event"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
