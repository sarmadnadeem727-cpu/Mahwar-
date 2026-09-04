"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, ArrowRight, CornerDownLeft, Sparkles,
  BarChart3, Layers, FileSpreadsheet, ShieldCheck, Filter, 
  FileText, X
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
    icon: <BarChart3 className="text-terminal-emerald" size={16} />
  },
  {
    id: "DCF",
    name: "DCF Valuation Engine (5-Year)",
    nameAr: "محرك تقييم التدفقات النقدية (DCF)",
    category: "Sovereign Valuation",
    categoryAr: "التقييم السيادي",
    keywords: ["dcf", "valuation", "discounted cash flow", "wacc", "terminal growth", "intrinsic", "تدفقات", "خصم", "تقييم"],
    icon: <BarChart3 className="text-terminal-emerald" size={16} />
  },
  {
    id: "LBO",
    name: "LBO Deal Builder & Private Equity IRR",
    nameAr: "باني صفقات الاستحواذ المدعوم بالديون (LBO)",
    category: "Private Equity",
    categoryAr: "الاستثمار الخاص",
    keywords: ["lbo", "private equity", "irr", "moic", "debt waterfall", "leverage", "استحواذ", "ديون", "عائد"],
    icon: <Layers className="text-terminal-emerald" size={16} />
  },
  {
    id: "FS",
    name: "3-Statement Model (IFRS & Saudi GAAP Zakat)",
    nameAr: "نموذج القوائم المالية الثلاث (معالجة الزكاة IFRS)",
    category: "Financial Accounting",
    categoryAr: "المحاسبة المالية",
    keywords: ["three statement", "income", "balance sheet", "cash flow", "zakat", "gaap", "ifrs", "قوائم", "دخل", "ميزانية", "زكاة"],
    icon: <FileSpreadsheet className="text-terminal-emerald" size={16} />
  },
  {
    id: "shariah",
    name: "AAOIFI Shariah Compliance Screening",
    nameAr: "الفحص الشرعي وفق معيار أيوفي (AAOIFI 21)",
    category: "Compliance",
    categoryAr: "الامتثال الشرعي",
    keywords: ["shariah", "aaoifi", "halal", "purification", "debt ratio", "compliance", "شرعي", "أيوفي", "تطهير", "حلال"],
    icon: <ShieldCheck className="text-terminal-emerald" size={16} />
  },
  {
    id: "screener",
    name: "Company Comparator & Peer Matrix",
    nameAr: "مقارنة الشركات ومصفوفة الأقران",
    category: "Analysis",
    categoryAr: "التحليلات",
    keywords: ["comparator", "screener", "peer", "multiples", "comparison", "matrix", "مقارنة", "شركات", "أقران"],
    icon: <Filter className="text-terminal-emerald" size={16} />
  },
  {
    id: "bi_report",
    name: "Consolidated BI Report & PDF Export",
    nameAr: "محرك تقارير الأعمال وتصدير PDF",
    category: "Export & Reporting",
    categoryAr: "التقارير والتصدير",
    keywords: ["bi report", "export", "pdf", "synthesis", "consolidation", "تقرير", "تصدير"],
    icon: <FileText className="text-terminal-emerald" size={16} />
  }
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { language, setPanel } = useTerminalStore();
  const isAr = language === 'ar';

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Determine local matches instantly
  const localMatches = React.useMemo(() => {
    if (!query.trim()) return STATIC_TOOLS;
    const cleanQ = query.toLowerCase().trim();
    return STATIC_TOOLS.filter(tool => {
      const matchName = tool.name.toLowerCase().includes(cleanQ);
      const matchNameAr = tool.nameAr.includes(cleanQ);
      const matchCategory = tool.category.toLowerCase().includes(cleanQ) || tool.categoryAr.includes(cleanQ);
      const matchKeyword = tool.keywords.some(k => k.toLowerCase().includes(cleanQ));
      return matchName || matchNameAr || matchCategory || matchKeyword;
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
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md no-print font-mono"
        onClick={onClose}
        dir={isAr ? "rtl" : "ltr"}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl bg-[#0B0E14] rounded-sm border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* SEARCH INPUT BAR */}
          <div className="flex items-center px-4 border-b border-[#1E293B] bg-[#121721]">
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
              placeholder={isAr ? "ابحث عن أداة أو نموذج مالي (مثلاً: DCF, LBO, فحص شرعي)..." : "Search tool or financial engine (e.g. DCF, LBO, Shariah, Comparator)..."}
              className="w-full px-3 py-4 text-xs sm:text-sm bg-transparent text-white focus:outline-none font-mono placeholder:text-slate-500 placeholder:text-xs"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 hover:bg-[#161C28] rounded text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-sm border border-[#1E293B] bg-[#0B0E14] text-[10px] font-mono text-terminal-emerald font-bold">
              <span>ESC</span>
            </div>
          </div>

          {/* CONTENT RESULTS AREA */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-[#0B0E14]">
            {/* LOCAL TOOLS & MODELS MATCHES */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>{isAr ? "الأدوات والنماذج المتوفرة" : "CAD Engine Workbench Tools"}</span>
                <span className="text-[9px] font-normal text-terminal-emerald font-bold">{localMatches.length} {isAr ? "نتيجة" : "matches"}</span>
              </div>

              {localMatches.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  {isAr ? "لا توجد أداة مطابقة." : "No local tool matches."}
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
                        className={`px-3 py-2.5 rounded-sm flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-terminal-emerald-dim text-terminal-emerald font-bold border border-terminal-border-emerald"
                            : "text-slate-300 hover:bg-[#121721] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-sm ${isSelected ? "bg-[#0B0E14] text-terminal-emerald border border-terminal-emerald" : "bg-[#121721] text-slate-400"}`}>
                            {tool.icon}
                          </div>
                          <div className="truncate">
                            <span className="font-bold block truncate uppercase">
                              {isAr ? tool.nameAr : tool.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {isAr ? tool.categoryAr : tool.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-mono text-terminal-emerald flex items-center gap-1 font-bold">
                              <span>{isAr ? "فتح" : "Open"}</span>
                              <CornerDownLeft size={10} />
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
          <div className="px-4 py-2.5 bg-[#121721] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-sm bg-[#0B0E14] border border-[#1E293B] font-bold text-white">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded-sm bg-[#0B0E14] border border-[#1E293B] font-bold text-white">↓</kbd>
                <span>{isAr ? "للتنقل" : "Navigate"}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-sm bg-[#0B0E14] border border-[#1E293B] font-bold text-white">↵</kbd>
                <span>{isAr ? "للاختيار" : "Select"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-terminal-emerald font-bold">
              <Sparkles size={11} />
              <span>Mahwar CAD Engine v2.5</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
