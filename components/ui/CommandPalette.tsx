"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CornerDownLeft, Sparkles,
  BarChart3, Layers, FileSpreadsheet, ShieldCheck, 
  FileText, X, Dices, Calculator, FileCheck
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocalTool {
  id: PanelType;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  keywords: string[];
  icon: React.ReactNode;
}

const STATIC_TOOLS: LocalTool[] = [
  {
    id: "hub",
    name: "Intelligence Hub & Overview",
    nameAr: "لوحة التحكم ومركز الاستخبارات",
    category: "Platform",
    categoryAr: "المنصة",
    keywords: ["hub", "home", "dashboard", "overview", "main", "مركز", "الرئيسية"],
    icon: <BarChart3 className="text-emerald" size={16} />
  },
  {
    id: "DCF",
    name: "DCF Valuation Engine (5-Year)",
    nameAr: "محرك تقييم التدفقات النقدية (DCF)",
    category: "Sovereign Valuation",
    categoryAr: "التقييم السيادي",
    keywords: ["dcf", "valuation", "discounted cash flow", "wacc", "terminal growth", "intrinsic", "تدفقات", "خصم", "تقييم"],
    icon: <BarChart3 className="text-emerald" size={16} />
  },
  {
    id: "LBO",
    name: "LBO Deal Builder & Private Equity IRR",
    nameAr: "باني صفقات الاستحواذ المدعوم بالديون (LBO)",
    category: "Private Equity",
    categoryAr: "الاستثمار الخاص",
    keywords: ["lbo", "private equity", "irr", "moic", "debt waterfall", "leverage", "استحواذ", "ديون", "عائد"],
    icon: <Layers className="text-emerald" size={16} />
  },
  {
    id: "FS",
    name: "3-Statement Model (IFRS & Saudi GAAP Zakat)",
    nameAr: "نموذج القوائم المالية الثلاث (معالجة الزكاة IFRS)",
    category: "Financial Accounting",
    categoryAr: "المحاسبة المالية",
    keywords: ["three statement", "income", "balance sheet", "cash flow", "zakat", "gaap", "ifrs", "قوائم", "دخل", "ميزانية", "زكاة"],
    icon: <FileSpreadsheet className="text-emerald" size={16} />
  },
  {
    id: "custom_model",
    name: "Custom Model Builder (Excel-Style)",
    nameAr: "باني النماذج المخصصة (أسلوب إكسل)",
    category: "Financial Modeling",
    categoryAr: "النمذجة المالية",
    keywords: ["custom model", "excel", "spreadsheet", "builder", "formula", "grid", "نموذج", "إكسل", "جدول"],
    icon: <FileSpreadsheet className="text-emerald" size={16} />
  },
  {
    id: "monte_carlo",
    name: "Monte Carlo Valuation Simulation",
    nameAr: "محاكاة مونتي كارلو للتقييم",
    category: "Valuation Simulation",
    categoryAr: "محاكاة التقييم",
    keywords: ["monte carlo", "simulation", "probabilistic", "histogram", "p10", "p50", "p90", "مونتي كارلو", "محاكاة"],
    icon: <Dices className="text-emerald" size={16} />
  },
  {
    id: "acquisition_cost",
    name: "M&A Acquisition Cost Calculator",
    nameAr: "حاسبة تكاليف الاستحواذ والاندماج",
    category: "M&A Deals",
    categoryAr: "صفقات الاستحواذ",
    keywords: ["acquisition", "cost", "m&a", "mergers", "fees", "waterfall", "استحواذ", "تكاليف"],
    icon: <Calculator className="text-emerald" size={16} />
  },
  {
    id: "auto_statements",
    name: "Auto-Generated Financial Statements",
    nameAr: "القوائم المالية المولدة تلقائياً",
    category: "Financial Statements",
    categoryAr: "القوائم المالية",
    keywords: ["auto statements", "generate", "linked", "financial statements", "توليد", "قوائم"],
    icon: <FileCheck className="text-emerald" size={16} />
  },
  {
    id: "shariah",
    name: "AAOIFI Shariah Compliance Screening",
    nameAr: "الفحص الشرعي وفق معيار أيوفي (AAOIFI 21)",
    category: "Compliance",
    categoryAr: "الامتثال الشرعي",
    keywords: ["shariah", "aaoifi", "halal", "purification", "debt ratio", "compliance", "شرعي", "أيوفي", "تطهير", "حلال"],
    icon: <ShieldCheck className="text-emerald" size={16} />
  },
  {
    id: "bi_report",
    name: "Consolidated BI Report & PDF Export",
    nameAr: "محرك تقارير الأعمال وتصدير PDF",
    category: "Export & Reporting",
    categoryAr: "التقارير والتصدير",
    keywords: ["bi report", "export", "pdf", "synthesis", "consolidation", "تقرير", "تصدير"],
    icon: <FileText className="text-emerald" size={16} />
  }
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { language, setPanel } = useTerminalStore();
  const isAr = language === 'ar';

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter tools locally
  const localMatches = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return STATIC_TOOLS;
    return STATIC_TOOLS.filter(t => {
      const matchName = t.name.toLowerCase().includes(q) || t.nameAr.includes(q);
      const matchCat = t.category.toLowerCase().includes(q) || t.categoryAr.includes(q);
      const matchKeys = t.keywords.some(k => k.toLowerCase().includes(q));
      return matchName || matchCat || matchKeys;
    });
  }, [query]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(localMatches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(localMatches.length, 1)) % Math.max(localMatches.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (localMatches.length > 0 && selectedIndex < localMatches.length) {
        setPanel(localMatches[selectedIndex].id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm no-print font-sans"
        onClick={onClose}
        dir={isAr ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* SEARCH INPUT BAR */}
          <div className="flex items-center px-4 border-b border-slate-200 bg-white">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={isAr ? "ابحث عن أداة أو نموذج مالي (مثلاً: DCF, LBO, فحص شرعي)..." : "Search tool or financial engine (e.g. DCF, LBO, Monte Carlo)..."}
              className="w-full px-3 py-4 text-xs sm:text-sm bg-transparent text-slate-900 focus:outline-none font-sans placeholder:text-slate-400"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer mr-2"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 font-bold">
              <span>ESC</span>
            </div>
          </div>

          {/* CONTENT RESULTS AREA */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-50">
            <div>
              <div className="px-2 pb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>{isAr ? "الأدوات والنماذج المتوفرة" : "Sovereign Financial Tools"}</span>
                <span className="text-[10px] font-bold text-emerald">{localMatches.length} {isAr ? "أداة" : "tools"}</span>
              </div>

              {localMatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-sans">
                  {isAr ? "لا توجد أداة مطابقة." : "No tool matches found."}
                </div>
              ) : (
                <div className="space-y-1">
                  {localMatches.map((tool, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => {
                          setPanel(tool.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-dim text-emerald font-bold border border-emerald-border shadow-2xs"
                            : "text-slate-800 hover:bg-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-white text-emerald border border-emerald-border" : "bg-white border border-slate-200 text-slate-500"}`}>
                            {tool.icon}
                          </div>
                          <div className="truncate">
                            <span className="font-bold block truncate">
                              {isAr ? tool.nameAr : tool.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {isAr ? tool.categoryAr : tool.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-mono text-emerald flex items-center gap-1 font-bold">
                              <span>{isAr ? "فتح" : "Open"}</span>
                              <CornerDownLeft size={11} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER SHORTCUT HINTS */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[10px]">↓</kbd>
                <span>{isAr ? "للتنقل" : "Navigate"}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[10px]">↵</kbd>
                <span>{isAr ? "للاختيار" : "Select"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald font-bold">
              <Sparkles size={12} />
              <span>Mahwar Sovereign v2.5</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
