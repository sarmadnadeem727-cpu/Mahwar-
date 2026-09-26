"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import SFSymbol from "@/components/ui/SFSymbol";
import { haptics } from "@/lib/audio/haptics";
import { ArrowUpRight, ShieldCheck, TrendingUp, X } from "lucide-react";

export default function AppleQuickLook() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setPanel } = useTerminalStore();
  const isAr = language === "ar";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) haptics.playQuickLook();
          return !prev;
        });
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
          {/* macOS Blur Dimming */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Quick Look Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="relative w-full max-w-lg rounded-[28px] border border-white/20 bg-ink-2/95 backdrop-blur-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden p-6 z-10"
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* macOS Quick Look Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-light shadow-[0_0_8px_var(--emerald-light)] animate-pulse" />
                <span className="font-sans font-semibold text-[13px] text-fg">
                  {isAr ? "المعاينة السريعة (Quick Look)" : "Quick Look Preview"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10.5px] font-mono text-fg-3 border border-white/10">
                  Space
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-fg-3 hover:text-fg transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Look Body */}
            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] text-emerald-light tracking-wider">TASI · 2222.SR</div>
                  <h3 className="font-serif text-2xl font-bold text-fg mt-1">
                    {isAr ? "أرامكو السعودية" : "Saudi Aramco"}
                  </h3>
                  <p className="text-[12px] text-fg-3 mt-0.5 font-sans">
                    {isAr ? "قطاع الطاقة والمشتقات الهيدروكربونية" : "Energy & Integrated Hydrocarbons"}
                  </p>
                </div>
                <div className="text-end">
                  <div className="font-mono text-2xl font-bold text-fg num">28.45 SAR</div>
                  <div className="inline-flex items-center gap-1 text-[11.5px] font-mono text-pos">
                    <TrendingUp size={12} /> +0.85%
                  </div>
                </div>
              </div>

              {/* Quick Multiples Grid */}
              <div className="grid grid-cols-4 gap-2 py-2">
                {[
                  { k: "P/E", v: "14.2x" },
                  { k: "Div Yield", v: "6.8%" },
                  { k: "ROE", v: "24.8%" },
                  { k: "Debt / Assets", v: "18.4%" },
                ].map((m) => (
                  <div key={m.k} className="p-2.5 rounded-xl border border-line/60 bg-ink-3/40 text-center">
                    <div className="text-[10px] text-fg-4 font-mono uppercase">{m.k}</div>
                    <div className="text-[13px] font-semibold text-fg font-mono mt-0.5">{m.v}</div>
                  </div>
                ))}
              </div>

              {/* AAOIFI Compliance Badge */}
              <div className="p-3 rounded-2xl border border-emerald/30 bg-emerald/10 flex items-center gap-2.5 text-[12px] text-emerald-light font-sans">
                <ShieldCheck size={16} className="shrink-0" />
                <span>
                  {isAr
                    ? "فحص أيوفي 21: متوافقة شرعاً (الديون 18.4% < 30%، الأصول الربوية 12.1% < 30%)"
                    : "AAOIFI Standard 21: Compliant (Debt 18.4% < 30%, Liquid interest 12.1% < 30%)"}
                </span>
              </div>

              {/* Quick Launch Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setPanel("screener");
                  }}
                  className="btn-secondary text-[12px] px-4 py-2"
                >
                  <SFSymbol name="filter" size={13} />
                  <span>{isAr ? "افتح الفاحص" : "Open Screener"}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setPanel("DCF");
                  }}
                  className="btn-primary text-[12px] px-4 py-2"
                >
                  <span>{isAr ? "تشغيل تقييم DCF" : "Launch DCF Model"}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
