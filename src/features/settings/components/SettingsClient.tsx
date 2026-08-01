"use client";

import Link from "next/link";
import { Info, Moon, Sun, SunMoon, Zap, ZapOff, Activity } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { buttonClassName } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { routes } from "@/shared/config/routes";
import {
  useAppPreferences,
  type ThemeMode,
  type MotionPreference,
} from "@/features/settings/hooks/useAppPreferences";

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={isActive ? "tonal" : "secondary"}
            size="sm"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className={isActive ? "ring-2 ring-[var(--booth-primary)]/30 pointer-events-none" : ""}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

export function SettingsClient() {
  const {
    themeMode,
    motionPreference,
    resolvedTheme,
    resolvedMotion,
    setThemeMode,
    setMotionPreference
  } = useAppPreferences();

  return (
    <div className="motion-stagger grid gap-6">
      {/* Appearance */}
      <Card className="motion-card grid gap-5 p-6" data-app-guide="theme-settings">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Appearance
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            Theme mode
          </h2>
          <p className="mt-1.5 text-sm text-[var(--booth-on-surface-variant)]">
            Choose how Biliq looks. System follows your device setting. Changes take effect immediately.
          </p>
        </div>

        <SegmentedControl<ThemeMode>
          label="Theme mode"
          value={themeMode}
          onChange={setThemeMode}
          options={[
            { value: "system", label: "System", icon: SunMoon },
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
          ]}
        />

        <p className="rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] px-4 py-3 text-sm text-[var(--booth-on-surface-variant)]">
          Currently using <strong className="text-[var(--booth-on-surface)]">{resolvedTheme} mode</strong>
          {themeMode === "system" ? " from your device setting." : "."}
        </p>
      </Card>

      {/* Motion */}
      <Card className="motion-card grid gap-5 p-6" data-app-guide="motion-settings">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Accessibility
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            Motion preference
          </h2>
          <p className="mt-1.5 text-sm text-[var(--booth-on-surface-variant)]">
            Reduce non-essential animations if they cause discomfort. System respects your OS setting. Reduced minimizes transitions and animations throughout the app.
          </p>
        </div>

        <SegmentedControl<MotionPreference>
          label="Motion preference"
          value={motionPreference}
          onChange={setMotionPreference}
          options={[
            { value: "system", label: "System", icon: Activity },
            { value: "reduced", label: "Reduced", icon: ZapOff },
            { value: "full", label: "Full", icon: Zap },
          ]}
        />

        <p className="rounded-[var(--booth-radius-md)] bg-[var(--booth-surface-container)] px-4 py-3 text-sm text-[var(--booth-on-surface-variant)]">
          Currently using <strong className="text-[var(--booth-on-surface)]">{resolvedMotion} motion</strong>
          {motionPreference === "system" ? " from your device setting." : "."}
        </p>
      </Card>

      {/* Help & About */}
      <Card className="motion-card grid gap-4 p-6" data-app-guide="help-settings">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
            Help
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
            About Biliq
          </h2>
          <p className="mt-1.5 text-sm text-[var(--booth-on-surface-variant)]">
            Learn about this app — its purpose, local-first design, and version information.
          </p>
        </div>
        <div>
          <Link href={routes.about} className={buttonClassName({ variant: "tonal", size: "sm" })}>
            <Info className="h-4 w-4" aria-hidden="true" />
            View About
          </Link>
        </div>
      </Card>
    </div>
  );
}
