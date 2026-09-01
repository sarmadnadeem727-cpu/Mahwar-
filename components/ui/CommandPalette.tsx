"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, Sparkles, ArrowRight, CornerDownLeft, 
  BarChart3, Layers, FileSpreadsheet, ShieldCheck, Filter, 
  FileText, Globe, Newspaper, X, Loader2, Bot, AlertCircle
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
    icon: <BarChart3 className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "market_intel",
    name: "Market Intelligence & GCC Live News",
    nameAr: "استخبارات السوق وأخبار الخليج المباشرة",
    category: "Intelligence",
    categoryAr: "الاستخبارات",
    keywords: ["news", "market", "gcc", "marketaux", "finlight", "saudi", "uae", "qatar", "أخبار", "السوق", "الخليج"],
    icon: <Newspaper className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "DCF",
    name: "DCF Valuation Engine (5-Year)",
    nameAr: "محرك تقييم التدفقات النقدية (DCF)",
    category: "Sovereign Valuation",
    categoryAr: "التقييم السيادي",
    keywords: ["dcf", "valuation", "discounted cash flow", "wacc", "terminal growth", "intrinsic", "تدفقات", "خصم", "تقييم"],
    icon: <BarChart3 className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "LBO",
    name: "LBO Deal Builder & Private Equity IRR",
    nameAr: "باني صفقات الاستحواذ المدعوم بالديون (LBO)",
    category: "Private Equity",
    categoryAr: "الاستثمار الخاص",
    keywords: ["lbo", "private equity", "irr", "moic", "debt waterfall", "leverage", "استحواذ", "ديون", "عائد"],
    icon: <Layers className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "FS",
    name: "3-Statement Model (IFRS & Saudi GAAP Zakat)",
    nameAr: "نموذج القوائم المالية الثلاث (معالجة الزكاة IFRS)",
    category: "Financial Accounting",
    categoryAr: "المحاسبة المالية",
    keywords: ["three statement", "income", "balance sheet", "cash flow", "zakat", "gaap", "ifrs", "قوائم", "دخل", "ميزانية", "زكاة"],
    icon: <FileSpreadsheet className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "shariah",
    name: "AAOIFI Shariah Compliance Screening",
    nameAr: "الفحص الشرعي وفق معيار أيوفي (AAOIFI 21)",
    category: "Compliance",
    categoryAr: "الامتثال الشرعي",
    keywords: ["shariah", "aaoifi", "halal", "purification", "debt ratio", "compliance", "شرعي", "أيوفي", "تطهير", "حلال"],
    icon: <ShieldCheck className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "screener",
    name: "Company Comparator & Peer Matrix",
    nameAr: "مقارنة الشركات ومصفوفة الأقران",
    category: "Analysis",
    categoryAr: "التحليلات",
    keywords: ["comparator", "screener", "peer", "multiples", "comparison", "matrix", "مقارنة", "شركات", "أقران"],
    icon: <Filter className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "research",
    name: "AI Equity Research Memos (Gemini 2.5)",
    nameAr: "مذكرات أبحاث الأسهم بالذكاء الاصطناعي",
    category: "Research",
    categoryAr: "الأبحاث",
    keywords: ["research", "memo", "gemini", "ai", "report", "analyst", "بحث", "تقرير", "مذكرة"],
    icon: <Sparkles className="text-[var(--emerald)]" size={16} />
  },
  {
    id: "bi_report",
    name: "Consolidated BI Report & PDF Export",
    nameAr: "محرك تقارير الأعمال وتصدير PDF",
    category: "Export & Reporting",
    categoryAr: "التقارير والتصدير",
    keywords: ["bi report", "export", "pdf", "synthesis", "consolidation", "تقرير", "تصدير"],
    icon: <FileText className="text-[var(--emerald)]" size={16} />
  }
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { language, setPanel, sessionAnalyses } = useTerminalStore();
  const isAr = language === 'ar';

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Focus on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setAiAnswer("");
      setAiError(null);
      setSelectedIndex(0);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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

  // Check if query is likely a question or research topic
  const isQuestionQuery = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 4) return false;
    const questionMarkers = [
      "what", "how", "why", "when", "where", "who", "which", "explain", "summarize", "analyze", "calculate",
      "wacc", "aramco", "sabic", "stc", "irr", "zakat", "aaoifi", "formula", "meaning",
      "ما", "ماذا", "كيف", "لماذا", "متى", "أين", "من", "اشرح", "لخص", "حلل", "احسب", "الزكاة", "أرامكو", "أيوفي", "معايير"
    ];
    return questionMarkers.some(m => q.includes(m)) || q.endsWith("?") || q.endsWith("؟") || q.split(" ").length >= 3;
  }, [query]);

  // Trigger Gemini AI Search stream
  const triggerAiSearch = async () => {
    if (!query.trim() || isAiStreaming) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAiStreaming(true);
    setAiAnswer("");
    setAiError(null);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          locale: isAr ? 'ar' : 'en'
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (textChunk) {
                partialAnswer += textChunk;
                setAiAnswer(partialAnswer);
              }
            } catch (e) {
              // Non-JSON SSE chunk
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("AI Search error:", err);
        setAiError(err.message || (isAr ? "تعذر إكمال استعلام الذكاء الاصطناعي" : "AI query could not be completed"));
      }
    } finally {
      setIsAiStreaming(false);
    }
  };

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
      } else if (isQuestionQuery) {
        triggerAiSearch();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm no-print"
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
          <div className="flex items-center px-4 border-b border-slate-200 bg-slate-50/70">
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
              placeholder={isAr ? "ابحث عن أداة، أو اطرح سؤالاً مالياً لـ Gemini (مثلاً: ما هي نسبة التطهير الشرعية؟)..." : "Search tool, financial model, or ask Gemini (e.g. explain WACC formula or AAOIFI)..."}
              className="w-full px-3 py-4 text-xs sm:text-sm bg-transparent text-[#171717] focus:outline-none font-sans placeholder:text-slate-400 placeholder:text-xs"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mr-2"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 font-bold">
              <span>ESC</span>
            </div>
          </div>

          {/* CONTENT RESULTS AREA */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* AI QUESTION PROMPT BANNER */}
            {isQuestionQuery && (
              <div className="p-3.5 bg-slate-50 border border-[var(--emerald)]/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--emerald)]">
                    <Sparkles size={14} className={isAiStreaming ? "animate-spin" : ""} />
                    <span>{isAr ? "استعلام الذكاء الاصطناعي المؤسسي (Gemini 2.5 Flash)" : "AI Terminal Answer (Gemini 2.5 Flash)"}</span>
                  </div>
                  {!isAiStreaming && !aiAnswer && (
                    <button
                      onClick={triggerAiSearch}
                      className="px-2.5 py-1 bg-[var(--emerald)] hover:bg-[#12A189] text-white text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{isAr ? "اسأل الآن" : "Ask AI"}</span>
                      <CornerDownLeft size={10} />
                    </button>
                  )}
                </div>

                {isAiStreaming && !aiAnswer && (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-500 font-mono">
                    <Loader2 size={13} className="animate-spin text-[var(--emerald)]" />
                    <span>{isAr ? "جاري استنتاج الإجابة المؤسسية عبر Gemini..." : "Synthesizing institutional response via Gemini..."}</span>
                  </div>
                )}

                {aiAnswer && (
                  <div className="text-xs text-slate-800 leading-relaxed font-sans pt-1 border-t border-slate-200/60 whitespace-pre-wrap">
                    {aiAnswer}
                    {isAiStreaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-[var(--emerald)] ml-1 animate-pulse align-middle" />
                    )}
                  </div>
                )}

                {aiError && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-mono pt-1">
                    <AlertCircle size={13} />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>
            )}

            {/* LOCAL TOOLS & MODELS MATCHES */}
            <div>
              <div className="px-2 pb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>{isAr ? "الأدوات والنماذج المتوفرة" : "Terminal Tools & Models"}</span>
                <span className="text-[9px] font-normal">{localMatches.length} {isAr ? "نتيجة" : "matches"}</span>
              </div>

              {localMatches.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-mono">
                  {isAr ? "لا توجد أداة مطابقة مباشرة. اضغط على استعلام الذكاء الاصطناعي أعلاه." : "No local tool matches. Ask the Gemini AI assistant above."}
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
                            ? "bg-[var(--emerald)]/10 text-[var(--emerald)] font-bold border border-[var(--emerald)]/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-md ${isSelected ? "bg-white text-[var(--emerald)]" : "bg-slate-100 text-slate-500"}`}>
                            {tool.icon}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold block truncate">
                              {isAr ? tool.nameAr : tool.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {isAr ? tool.categoryAr : tool.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-mono text-[var(--emerald)] flex items-center gap-1 font-bold">
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
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">↓</kbd>
                <span>{isAr ? "للتنقل" : "Navigate"}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">↵</kbd>
                <span>{isAr ? "للاختيار" : "Select"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[var(--emerald)] font-bold">
              <Sparkles size={11} />
              <span>Mahwar AI Search v2.5</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
