"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HardDrive, Download, Upload, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore } from "@/store/useTerminalStore";
import { downloadSession, pickSessionFile } from "@/lib/session";

/**
 * SessionMenu — the browser-local session controls (export / import / wipe).
 * There is no account behind this: everything it touches is localStorage on
 * this device, and the copy says so.
 */
export default function SessionMenu({ isAr }: { isAr: boolean }) {
  const { importSession, clearSession, toast, savedCount } = useTerminalStore(
    useShallow((s) => ({ importSession: s.importSession, clearSession: s.clearSessionAnalyses, toast: s.toast, savedCount: Object.keys(s.sessionAnalyses).length }))
  );
  const [open, setOpen] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setConfirmWipe(false); return; }
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onImport = async () => {
    const file = await pickSessionFile();
    if (!file) return;
    const count = importSession(file, "merge");
    toast(count > 0 ? (isAr ? `تم استيراد ${count} تحليلاً` : `Imported ${count} analyses`) : (isAr ? "ملف جلسة غير صالح" : "Not a valid Mahwar session file"), count > 0 ? "ok" : "err");
    setOpen(false);
  };

  const onWipe = () => {
    if (!confirmWipe) { setConfirmWipe(true); return; }
    clearSession();
    toast(isAr ? "تم مسح الجلسة من هذا المتصفح" : "Session wiped from this browser", "warn");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-ink-1/90 border border-line-strong hover:border-emerald/40 text-[11px] font-mono text-fg-2 hover:text-fg transition-colors"
        aria-label={isAr ? "الجلسة" : "Session"} aria-expanded={open}
      >
        <HardDrive size={12} className="text-emerald-light" />
        <span className="hidden sm:inline">{isAr ? "الجلسة" : "Session"}</span>
        <span className="font-mono text-[10px] text-fg-3 num">{savedCount}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute top-10 end-0 w-72 rounded-2xl border border-line liquid-glass shadow-[var(--shadow-modal)] p-2 z-50"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="px-2.5 py-2 border-b border-line mb-1">
              <div className="text-[13px] text-fg">{isAr ? "جلسة محلية — بلا حساب" : "Local session — no account"}</div>
              <div className="text-[11px] text-fg-3 leading-relaxed mt-0.5">
                {isAr
                  ? "كل التحليلات محفوظة في هذا المتصفح فقط. لا شيء يُرسل إلى خادم."
                  : "Everything is stored in this browser only. Nothing is ever sent to a server."}
              </div>
            </div>
            <MenuItem icon={<Download size={13} />} onClick={() => { downloadSession(); setOpen(false); }}>{isAr ? "تنزيل الجلسة (JSON)" : "Download session (JSON)"}</MenuItem>
            <MenuItem icon={<Upload size={13} />} onClick={onImport}>{isAr ? "استيراد جلسة" : "Import session"}</MenuItem>
            <MenuItem icon={<Trash2 size={13} />} onClick={onWipe} tone="neg">
              {confirmWipe ? (isAr ? "اضغط مرة أخرى للتأكيد" : "Click again to confirm") : (isAr ? "مسح كل التحليلات" : "Wipe every saved analysis")}
            </MenuItem>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, children, onClick, tone }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; tone?: "neg" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-[12px] text-start hover:bg-ink-4 ${tone === "neg" ? "text-neg" : "text-fg-2 hover:text-fg"}`}>
      {icon} {children}
    </button>
  );
}
