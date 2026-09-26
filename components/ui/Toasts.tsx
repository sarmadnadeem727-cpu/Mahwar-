"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore } from "@/store/useTerminalStore";

const ICON = { ok: CheckCircle2, warn: AlertTriangle, err: XCircle } as const;
const DOT_COLOR = {
  ok: "bg-emerald-light shadow-[0_0_8px_var(--emerald-light)]",
  warn: "bg-warn shadow-[0_0_8px_var(--warn)]",
  err: "bg-neg shadow-[0_0_8px_var(--neg)]",
} as const;

/**
 * Apple Dynamic Island Live Activity Toasts.
 * Floats top-centre, expanding smoothly from a pill with authentic Apple spring motion.
 * Reference: references/hig/live-activities.md & notifications.md
 */
export default function Toasts() {
  const { toasts, dismiss, language } = useTerminalStore(
    useShallow((s) => ({
      toasts: s.toasts,
      dismiss: s.dismissToast,
      language: s.language,
    }))
  );
  const isAr = language === "ar";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 sm:top-5 z-[140] flex flex-col items-center gap-2 px-4 no-print"
      aria-live="polite"
      dir={isAr ? "rtl" : "ltr"}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const tone = t.tone ?? "ok";
          const Icon = ICON[tone];
          const dot = DOT_COLOR[tone];

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.82, y: -24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -16 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
                mass: 0.6,
              }}
              className="pointer-events-auto apple-island px-4 py-2 sm:py-2.5 flex items-center gap-3 max-w-md w-auto shadow-[var(--glass-dock-shadow)] border border-line"
              role="status"
            >
              {/* Dynamic Island Pulse Dot & Icon */}
              <div className="relative flex items-center justify-center shrink-0">
                <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
              </div>
              <Icon size={15} className={`shrink-0 ${tone === "err" ? "text-neg" : tone === "warn" ? "text-warn" : "text-emerald-light"}`} />

              {/* Message text */}
              <span className="text-[12.5px] font-medium text-fg flex-1 min-w-0 pr-1">
                {t.text}
              </span>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                className="apple-touch-target min-w-[28px] min-h-[28px] -mr-1 p-1 rounded-full text-fg-3 hover:text-fg hover:bg-ink-3/40 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

