"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useTerminalStore, Currency } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";

export default function TopBar() {
  const { activePanel, language, setLanguage, currency, setCurrency } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <header className="h-[64px] min-h-[64px] border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-20 no-print" dir={isAr ? "rtl" : "ltr"}>
      {/* LEFT: PANEL TITLE */}
      <div className="flex items-center gap-6">
        <h1 className="font-mono text-xs font-bold uppercase tracking-widest text-[#171717] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse"></span>
          <span>{activePanel.toUpperCase()}</span>
        </h1>
      </div>

      {/* RIGHT: CURRENCY & LANGUAGE CONTROLS */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Currency Selector */}
        <div className="flex items-center gap-1">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] cursor-pointer"
          >
            {['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR', 'USD'].map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* EN / AR Language Toggle */}
        <button
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <Globe size={13} className="text-[var(--emerald)]" />
          <span>{isAr ? "English" : "العربية"}</span>
        </button>
      </div>
    </header>
  );
}
