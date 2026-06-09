import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/classNames";

interface ModalProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, title, onClose, className }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/60 px-4 py-6 backdrop-blur-sm motion-enter">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "motion-pop w-full max-w-md rounded-lg bg-white p-5 shadow-booth",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-bold text-stone-950">
            {title}
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="h-9 w-9 rounded-md"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
