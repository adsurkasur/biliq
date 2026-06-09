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
    <Card className="motion-enter grid min-h-[420px] place-items-center border-dashed bg-white/80 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-700">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-stone-950">{title}</h2>
        <p className="mt-3 text-stone-600">{children}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </Card>
  );
}
