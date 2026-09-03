"use client";

import React, { useState, useEffect } from "react";
import { Globe, Search, Command, Sparkles, Activity } from "lucide-react";
import { useTerminalStore, Currency } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import CommandPalette from "@/components/ui/CommandPalette";

export default function TopBar() {
  const { activePanel, language, setLanguage, currency, setCurrency } = useTerminalStore();
  const isAr = language === 'ar';
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPanelDisplayName = () => {
    switch (activePanel) {
      case "hub": return isAr ? "مركز الاستخبارات" : "Intelligence Hub";
      case "news": return isAr ? "موجز الأخبار المالية" : "Market Wire";
      case "research": return isAr ? "أبحاث الذكاء الاصطناعي" : "AI Research Memos";
      case "shariah": return isAr ? "الفحص الشرعي AAOIFI" : "AAOIFI Screening";
      case "screener": return isAr ? "مقارنة الشركات" : "Company Comparator";
      case "bi_report": return isAr ? "تقرير الأعمال الموحد" : "BI Synthesis";
      case "DCF": return isAr ? "نموذج التقييم DCF" : "DCF Valuation";
      case "LBO": return isAr ? "صفقات الاستحواذ LBO" : "LBO Deal Builder";
      case "FS": return isAr ? "القوائم المالية الثلاث" : "3-Statement Model";
      default: return String(activePanel).toUpperCase();
    }
  };

  return (
    <>
      <header className="h-[64px] min-h-[64px] border-b border-[#E2E8F0] bg-white flex items-center justify-between px-6 sticky top-0 z-20 no-print font-sans" dir={isAr ? "rtl" : "ltr"}>
        {/* LEFT: ACTIVE PANEL STATUS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              {getPanelDisplayName()}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-[#E2E8F0] text-xs font-mono text-slate-600">
            <Activity size={12} className="text-emerald" />
            <span>TASI: 12,410.50 (+0.42%)</span>
          </div>
        </div>

        {/* CENTER: PERSISTENT SEARCH COMMAND PILL */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-lg text-xs text-slate-500 transition-all cursor-pointer shadow-2xs max-w-sm w-full mx-4"
        >
          <Search size={13} className="text-slate-400 shrink-0" />
          <span className="truncate flex-1 text-left rtl:text-right font-mono text-xs text-slate-600">
            {isAr ? "ابحث عن أداة نمذجة (Cmd+K)..." : "Search model or command (Cmd+K)..."}
          </span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[10px] font-mono font-bold text-emerald shrink-0">
            <Command size={10} />
            <span>K</span>
          </div>
        </button>

        {/* RIGHT: CURRENCY & LANGUAGE CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Currency Selector */}
          <div className="flex items-center gap-1">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-slate-50 border border-[#E2E8F0] text-xs font-mono font-bold text-slate-900 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald cursor-pointer"
            >
              {['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR', 'USD'].map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {/* EN / AR Language Toggle */}
          <button
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100 text-xs font-mono font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-emerald" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
        </div>
      </header>

      {/* GLOBAL COMMAND PALETTE MODAL */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
      />
    </>
  );
}
