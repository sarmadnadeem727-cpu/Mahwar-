"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore } from "@/store/useTerminalStore";

const ICON = { ok: CheckCircle2, warn: AlertTriangle, err: XCircle } as const;
const TONE = { ok: "text-emerald-light border-emerald/40", warn: "text-warn border-warn/40", err: "text-neg border-neg/40" } as const;

/** Bottom-centre toast stack driven by `useTerminalStore().toast()`. */
export default function Toasts() {
  const { toasts, dismiss } = useTerminalStore(useShallow((s) => ({ toasts: s.toasts, dismiss: s.dismissToast })));
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] lg:bottom-10 z-[70] flex flex-col items-center gap-2 px-4 no-print" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const tone = t.tone ?? "ok";
          const Icon = ICON[tone];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-center gap-2.5 max-w-md w-full sm:w-auto px-3.5 py-2.5 rounded-lg border bg-ink-2/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] ${TONE[tone]}`}
              role="status"
            >
              <Icon size={15} className="shrink-0" />
              <span className="text-[12px] text-fg flex-1 min-w-0">{t.text}</span>
              <button onClick={() => dismiss(t.id)} className="text-fg-3 hover:text-fg" aria-label="Dismiss"><X size={13} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
