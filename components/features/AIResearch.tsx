"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import ReactMarkdown from "react-markdown";

export default function AIResearch() {
  const { language, updateSessionAnalysis, sessionAnalyses } = useTerminalStore();
  const isAr = language === 'ar';

  const [companyName, setCompanyName] = useState("");
  const [financialsSummary, setFinancialsSummary] = useState("");
  const [question, setQuestion] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [memoResult, setMemoResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const responseEndRef = useRef<HTMLDivElement>(null);

  // Restore previous memo if exists
  useEffect(() => {
    if (sessionAnalyses.researchMemo?.content) {
      setMemoResult(sessionAnalyses.researchMemo.content);
    }
  }, []);

  const triggerAIAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setMemoResult("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          financialsSummary,
          question,
          language
        }),
      });

      if (!res.ok) {
        throw new Error(isAr ? "فشل الاتصال بالخادم الذكي" : "Failed to establish AI stream connection");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let completedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          completedText += chunk;
          setMemoResult(completedText);
          responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }

      // Save to Zustand store
      updateSessionAnalysis("researchMemo", {
        content: completedText,
        computedAt: new Date().toISOString()
      });

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: CONTEXT INPUTS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[var(--emerald)]" size={22} />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#171717]">
                  {isAr ? "أبحاث الذكاء الاصطناعي" : "AI Research Context"}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {isAr ? "تحليل Gemini 2.5 الفوري" : "Powered by Gemini 2.5 Flash"}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={triggerAIAnalysis} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "اسم الشركة والقطاع" : "Company Name & Sector"}</label>
              <input
                type="text"
                placeholder={isAr ? "مثال: الكابلات السعودية - مواد أساسية" : "e.g. Saudi Cables - Materials"}
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "ملخص البيانات المالية" : "Financials / Key Figures"}</label>
              <textarea
                rows={5}
                placeholder={isAr ? "الإيرادات: 450M، الهامش: 25%، صافي الديون: 120M..." : "Revenue: 450M, Margin: 25%, Net Debt: 120M..."}
                value={financialsSummary}
                onChange={(e) => setFinancialsSummary(e.target.value)}
                className="terminal-input w-full font-mono text-xs py-2 h-[120px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">{isAr ? "سؤال محدد أو توجيه" : "Specific Prompt / Question"}</label>
              <input
                type="text"
                placeholder={isAr ? "حلل مخاطر الديون وهامش التصفية..." : "Analyze debt risks and exit margin..."}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="terminal-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !companyName.trim()}
              className="w-full py-3 rounded-lg bg-[var(--emerald)] hover:bg-[#12A189] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isAr ? "إرسال التوجيه والتحليل" : "Stream Research Memo"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: AI RESPONSE STREAM (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
          <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--emerald)]" />
            <span>{isAr ? "مذكرة الأبحاث الاستثمارية الذكية" : "Sovereign AI Investment Memo Output"}</span>
          </h3>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2 mb-4">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4 font-sans text-xs text-slate-850 leading-relaxed pr-2">
            {!memoResult && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-32 space-y-2 font-mono">
                <HelpCircle size={32} className="opacity-40 text-slate-400" />
                <p>{isAr ? "أدخل سياق الشركة والبيانات اليدوية لبث المذكرة." : "Enter company context and financials summary to stream AI memo analysis."}</p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#171717] prose-headings:font-bold prose-h1:text-sm prose-h2:text-xs prose-p:text-[11px] prose-li:text-[11px] prose-strong:text-[#171717]">
                <ReactMarkdown>{memoResult}</ReactMarkdown>
                {loading && (
                  <span className="inline-block w-2.5 h-4 bg-[var(--emerald)] animate-pulse ml-1" />
                )}
              </div>
            )}
            <div ref={responseEndRef} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
