import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action
}: EmptyStateProps) {
  return (
    <Card className="motion-enter grid min-h-[420px] place-items-center border-dashed border-[var(--booth-outline-variant)] bg-[var(--booth-surface-container-low)] p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[var(--booth-radius-full)] bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[var(--booth-on-surface)]">
          {title}
        </h2>
        <p className="mt-3 text-[var(--booth-on-surface-variant)]">{children}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </Card>
  );
}
