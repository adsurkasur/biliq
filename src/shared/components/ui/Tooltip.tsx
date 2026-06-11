"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/classNames";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delayMs?: number;
}

export function Tooltip({ content, children, delayMs = 300 }: TooltipProps) {
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  }, []);

  const closeTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(openTooltip, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    closeTooltip();
  };

  const handleFocus = () => {
    openTooltip();
  };

  const handleBlur = () => {
    closeTooltip();
  };

  const handleClick = () => {
    // Toggle on tap, useful for touch devices
    if (isOpen) {
      closeTooltip();
    } else {
      openTooltip();
    }
  };

  // Close on Escape or Outside interaction
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTooltip();
    };

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node)
      ) {
        closeTooltip();
      }
    };
    
    // Update position on scroll/resize
    const updatePos = () => {
      if (triggerRef.current) {
        setRect(triggerRef.current.getBoundingClientRect());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isOpen, closeTooltip]);

  const child = React.Children.only(children) as React.ReactElement<any>;
  const childProps = child.props as any;

  const clonedChild = React.cloneElement(child, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      const { ref } = child as any;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    onMouseEnter: (e: any) => {
      handleMouseEnter();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: any) => {
      handleMouseLeave();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: any) => {
      handleFocus();
      childProps.onFocus?.(e);
    },
    onBlur: (e: any) => {
      handleBlur();
      childProps.onBlur?.(e);
    },
    onClick: (e: any) => {
      handleClick();
      childProps.onClick?.(e);
    },
    "aria-describedby": isOpen ? tooltipId : childProps["aria-describedby"],
  } as any);

  return (
    <>
      {clonedChild}
      {isMounted && isOpen && rect && createPortal(
        <div
          id={tooltipId}
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "fixed z-[100] max-w-[240px] rounded-[var(--booth-radius-md)] px-2.5 py-1.5 text-xs font-medium leading-relaxed",
            "bg-[var(--booth-surface-container-highest)] text-[var(--booth-on-surface)] shadow-[var(--booth-elevation-2)]",
            "pointer-events-none motion-enter border border-[var(--booth-outline-variant)]/20"
          )}
          style={{
            top: rect.top < 40 ? rect.bottom + 8 : rect.top - 8,
            left: rect.left + rect.width / 2,
            transform: rect.top < 40 ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            // Simple bound checking to keep it in viewport horizontally roughly
            marginLeft: rect.left + rect.width / 2 < 120 ? "calc(120px - (100vw / 2))" : 0 // heuristic if needed, but standard is fine
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
