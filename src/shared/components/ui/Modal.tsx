"use client";

import { type MouseEvent, type ReactNode, useCallback, useEffect, useState } from "react";
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
  const [isClosing, setIsClosing] = useState(false);

  const triggerClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
      }, 250); // Match CSS exit animation duration
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        triggerClose();
      }
    },
    [triggerClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      triggerClose();
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-6 backdrop-blur-sm",
        isClosing ? "modal-backdrop-exit" : "modal-backdrop-enter"
      )}
      onClick={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "w-full max-w-md rounded-[var(--booth-radius-2xl)] bg-[var(--booth-surface-container-lowest)] p-6 shadow-[var(--booth-elevation-4)]",
          isClosing ? "modal-panel-exit" : "modal-panel-enter",
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
            onClick={triggerClose}
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
