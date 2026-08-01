"use client";

import Link from "next/link";
import { ArrowLeft, Database, Globe, ImageIcon, Layers, Settings } from "lucide-react";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { routes } from "@/shared/config/routes";
import { APP_VERSION_LABEL } from "@/shared/config/appVersion";

interface AboutFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: AboutFeature[] = [
  {
    icon: Settings,
    title: "Event Setup",
    description: "Configure event name, output size, countdown, capture count, and print mode. Multiple events can be managed from the home console.",
  },
  {
    icon: Layers,
    title: "Layout Designer",
    description: "Build the photo layout visually. Drag, resize, and rotate photo slots and overlay images. Snap guides keep things aligned. Save layouts back to the event.",
  },
  {
    icon: ImageIcon,
    title: "Booth Capture",
    description: "Launch the Booth camera view for live event photo capture. Photos are composed onto the configured layout and saved locally.",
  },
  {
    icon: Globe,
    title: "Gallery",
    description: "Browse saved photos, download them, open print previews, or delete them. All photos are stored locally in your browser using IndexedDB.",
  },
  {
    icon: Database,
    title: "Local-First",
    description: "Biliq stores event configurations in localStorage and photos in IndexedDB. No cloud account required. No photos leave your browser unless you explicitly download or print them.",
  },
];

export function AboutClient() {
  return (
    <div className="grid gap-8">
      {/* Identity section */}
      <Card className="motion-card grid gap-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--booth-primary)]">
            Local-first photo booth system
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--booth-on-surface)]">
            What is Biliq?
          </h2>
        </div>

        <p className="text-[var(--booth-on-surface-variant)] leading-relaxed">
          <strong className="text-[var(--booth-on-surface)]">Biliq</strong> is derived from{" "}
          <em>bilik</em>, an Indonesian word meaning a small personal enclosure or booth — much like the intimate space of a traditional photo booth.
        </p>
        <p className="text-[var(--booth-on-surface-variant)] leading-relaxed">
          It is a browser-based event photo booth system designed to run locally, without cloud services, user accounts, or a backend. All event data and photos remain in your browser.
        </p>
        <p className="text-sm font-medium text-[var(--booth-primary)]">
          Biliq {APP_VERSION_LABEL} · Active development · PT ACS property.
        </p>
      </Card>

      {/* Feature highlights */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--booth-on-surface-variant)]">
          How it works
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="motion-card flex gap-4 p-5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)]">
                  <Icon className="h-4 w-4 text-[var(--booth-on-primary-container)]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--booth-on-surface)]">{f.title}</p>
                  <p className="mt-1 text-sm text-[var(--booth-on-surface-variant)] leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Local storage note */}
      <Card className="motion-card grid gap-3 p-6 border border-[var(--booth-outline-variant)]/30">
        <p className="text-sm font-semibold text-[var(--booth-on-surface)]">
          Local storage disclaimer
        </p>
        <p className="text-sm text-[var(--booth-on-surface-variant)] leading-relaxed">
          All data is stored exclusively in this browser. Clearing browser storage, switching browsers, or using a private window will result in data loss. There is currently no export, sync, or backup system. This is by design for the prototype stage.
        </p>
      </Card>

    </div>
  );
}
