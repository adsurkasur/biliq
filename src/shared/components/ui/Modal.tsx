"use client";

import { type MouseEvent, type ReactNode, useCallback, useEffect } from "react";
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
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop-enter fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "modal-panel-enter w-full max-w-md rounded-[var(--booth-radius-2xl)] bg-[var(--booth-surface-container-lowest)] p-6 shadow-[var(--booth-elevation-4)]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="modal-title"
            className="text-xl font-bold text-[var(--booth-on-surface)]"
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost-surface"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
