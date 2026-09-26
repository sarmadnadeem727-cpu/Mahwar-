"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SFSymbol from "@/components/ui/SFSymbol";
import { haptics } from "@/lib/audio/haptics";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useTheme } from "next-themes";
import { Volume2, VolumeX, Sliders, Moon, Sun, Globe, Shield, RefreshCw } from "lucide-react";

interface AppleControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export default function AppleControlCenter({ isOpen, onClose }: AppleControlCenterProps) {
  const { language, setLanguage, toast } = useTerminalStore();
  const { theme, setTheme } = useTheme();
  const isAr = language === "ar";
  const ref = useRef<HTMLDivElement>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [accountingFramework, setAccountingFramework] = useState<"IFRS" | "SOCPA" | "AAOIFI">("AAOIFI");
  const [zakatMode, setZakatMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<"15s" | "30s" | "manual">("15s");

  useEffect(() => {
    setSoundEnabled(haptics.isEnabled());
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    haptics.setEnabled(next);
    toast(
      next
        ? isAr
          ? "تم تفعيل الأصوات اللمسية"
          : "Apple Haptic Audio enabled"
        : isAr
        ? "تم كتم الأصوات"
        : "Haptic Audio muted",
      "ok"
    );
  };

  const handleFrameworkChange = (f: "IFRS" | "SOCPA" | "AAOIFI") => {
    haptics.playTap();
    setAccountingFramework(f);
    toast(
      isAr
        ? `المعايير المطبقة: ${f}`
        : `Accounting standards: ${f}`,
      "ok"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-12 end-2 md:end-4 w-[320px] rounded-3xl border border-white/20 bg-ink-2/95 backdrop-blur-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.22)] p-4 z-50 no-print"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <span className="font-sans font-semibold text-[13px] text-fg flex items-center gap-2">
              <Sliders size={14} className="text-emerald-light" />
              {isAr ? "مركز التحكم" : "Control Center"}
            </span>
            <span className="text-[10.5px] font-mono text-fg-3">macOS Sequoia</span>
          </div>

          <div className="space-y-3 font-sans">
            {/* Audio & Haptics Control */}
            <div className="p-3 rounded-2xl border border-line/70 bg-ink-3/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${soundEnabled ? "bg-emerald/15 text-emerald-light border border-emerald/30" : "bg-ink-4 text-fg-4"}`}>
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-fg">{isAr ? "أصوات لمسية" : "Haptic Audio"}</div>
                  <div className="text-[10px] text-fg-3">{soundEnabled ? (isAr ? "مفعّلة (Web Audio)" : "Synthesized clicks") : (isAr ? "مكتومة" : "Muted")}</div>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${soundEnabled ? "bg-emerald" : "bg-ink-4"}`}
              >
                <motion.span
                  layout
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${soundEnabled ? (isAr ? "-translate-x-5" : "translate-x-5") : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Accounting Framework Switcher */}
            <div className="p-3 rounded-2xl border border-line/70 bg-ink-3/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-medium text-fg flex items-center gap-1.5">
                  <Shield size={12} className="text-gold" />
                  {isAr ? "المعايير المحاسبية" : "Standards"}
                </span>
                <span className="text-[10px] font-mono text-emerald-light font-semibold">{accountingFramework}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-ink-1/60 rounded-xl border border-line/50">
                {(["AAOIFI", "SOCPA", "IFRS"] as const).map((framework) => (
                  <button
                    key={framework}
                    onClick={() => handleFrameworkChange(framework)}
                    className={`py-1 rounded-lg text-[10.5px] font-semibold transition-all ${accountingFramework === framework ? "bg-emerald text-white shadow-sm" : "text-fg-3 hover:text-fg"}`}
                  >
                    {framework}
                  </button>
                ))}
              </div>
            </div>

            {/* Zakat 2.5% Toggle */}
            <div className="p-3 rounded-2xl border border-line/70 bg-ink-3/40 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-fg">{isAr ? "حساب الزكاة 2.5%" : "2.5% Zakat Rule"}</div>
                <div className="text-[10px] text-fg-3">{isAr ? "دون درع ضريبي" : "No tax shield"}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={zakatMode}
                onClick={() => {
                  haptics.playSwitch(!zakatMode);
                  setZakatMode(!zakatMode);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${zakatMode ? "bg-emerald" : "bg-ink-4"}`}
              >
                <motion.span
                  layout
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${zakatMode ? (isAr ? "-translate-x-5" : "translate-x-5") : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Quick Utility Toggles (Theme & Language) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  haptics.playTap();
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="p-2.5 rounded-2xl border border-line/70 bg-ink-3/40 flex items-center gap-2 hover:bg-ink-3/70 transition-colors"
              >
                {theme === "dark" ? <Sun size={14} className="text-gold" /> : <Moon size={14} className="text-emerald-light" />}
                <span className="text-[11.5px] font-medium text-fg">{theme === "dark" ? (isAr ? "فاتح" : "Light") : (isAr ? "داكن" : "Dark")}</span>
              </button>

              <button
                onClick={() => {
                  haptics.playTap();
                  setLanguage(isAr ? "en" : "ar");
                }}
                className="p-2.5 rounded-2xl border border-line/70 bg-ink-3/40 flex items-center gap-2 hover:bg-ink-3/70 transition-colors"
              >
                <Globe size={14} className="text-emerald-light" />
                <span className="text-[11.5px] font-medium text-fg">{isAr ? "English" : "العربية"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
