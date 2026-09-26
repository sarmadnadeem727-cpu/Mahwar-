"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";

interface AppleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

/**
 * Apple HIG Sheet & Modal Dialog.
 * On mobile (<md), renders as an iOS bottom sheet with grabber handle and drag-to-dismiss.
 * On desktop (>=md), smoothly morphs into a centered Liquid Glass modal card.
 * Reference: references/hig/sheets.md & modality.md
 */
export default function AppleSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = "max-h-[85vh]",
  className = "",
}: AppleSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-6 no-print">
          {/* Dimming backdrop (Apple 35-40% dark dimming layer) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Sheet / Dialog Surface */}
          <motion.div
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            className={`relative z-10 w-full max-w-2xl rounded-t-[28px] md:rounded-[24px] liquid-glass shadow-[var(--shadow-modal)] border border-line flex flex-col overflow-hidden ${maxHeight} ${className}`}
          >
            {/* iOS Grabber (visible on mobile) */}
            <div className="md:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.2 rounded-full bg-fg-4/40" />
            </div>

            {/* Sheet Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-line/60">
              <div>
                <h3 className="font-serif text-lg font-semibold text-fg">{title}</h3>
                {subtitle && <p className="text-xs text-fg-3 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="apple-touch-target p-2 rounded-full text-fg-3 hover:text-fg hover:bg-ink-3/50 transition-colors"
                aria-label="Close sheet"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
