"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleKey?: any;
  descKey?: any;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  titleKey = "upgrade_modal_title",
  descKey = "upgrade_modal_desc"
}: UpgradeModalProps) {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      ></div>

      {/* Content Container */}
      <div 
        className={`max-w-md w-full glass-panel p-6 rounded-2xl border border-[var(--gold)]/30 bg-[#0F1113]/95 relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200 font-mono text-xs ${
          isAr ? "font-cairo" : ""
        }`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-3">
          <div className="p-3 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)]">
            <ShieldAlert size={28} />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-garamond uppercase tracking-wider">
              {t(titleKey, language)}
            </h3>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              {t(descKey, language)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/pricing"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E7C69] to-[#12A189] hover:brightness-110 text-white font-bold uppercase tracking-wider shadow-lg shadow-[#0E7C69]/20 text-center flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{t("upgrade_now", language)}</span>
          </Link>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t("cancel_action", language)}
          </button>
        </div>
      </div>
    </div>
  );
}
