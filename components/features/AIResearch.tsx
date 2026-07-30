"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download, Copy, Check, Send, History, Cpu, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import { useUserContext } from "@/components/providers/UserProvider";
import UpgradeModal from "@/components/ui/UpgradeModal";

export default function AIResearch() {
  const { activeTicker, setTicker, language } = useTerminalStore();
  const isAr = language === 'ar';
  const { user } = useUserContext();
  const supabase = createClient();

  const [inputTicker, setInputTicker] = useState(activeTicker);
  const [customQuery, setCustomQuery] = useState("");
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dbHistory, setDbHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("ai_research_reports")
        .select("id, ticker, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        // Group by ticker to get unique list
        const unique: any[] = [];
        const seen = new Set();
        for (const item of data) {
          if (!seen.has(item.ticker)) {
            seen.add(item.ticker);
            unique.push(item);
          }
        }
        setDbHistory(unique.slice(0, 5));
      }
    } catch (err) {
      console.error("Error loading research history:", err);
    }
  };

  const loadSavedReport = async (reportId: string) => {
    try {
      const { data } = await supabase
        .from("ai_research_reports")
        .select("content, ticker")
        .eq("id", reportId)
        .single();
      if (data) {
        setReportMarkdown(data.content);
        setInputTicker(data.ticker);
        setTicker(data.ticker);
      }
    } catch (err) {
      console.error("Error loading saved report:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const handleGenerateReport = async (target: string = inputTicker) => {
    if (!target) return;
    setIsGenerating(true);
    setReportMarkdown("");

    try {
      // Step 0: Check DB Cache
      if (user) {
        const { data: cached } = await supabase
          .from("ai_research_reports")
          .select("content")
          .eq("user_id", user.id)
          .eq("ticker", target)
          .eq("language", language)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cached?.content) {
          setReportMarkdown(cached.content);
          setIsGenerating(false);
          return;
        }
      }

      // Step 1: Fetch fundamentals
      const fundRes = await fetch(`/api/market/fundamentals?ticker=${target}`);
      const fundData = await fundRes.json();

      // Step 2: Stream AI response
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: target,
          fundamentals: fundData,
          query: customQuery,
          language
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error("AI research generation service failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Handle SSE stream lines
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") break;
            try {
              const parsed = JSON.parse(raw);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              accumulated += text;
              setReportMarkdown(accumulated);
            } catch {
              // ignore parse errors on partial chunks
            }
          } else if (line.trim()) {
            try {
              const parsed = JSON.parse(line.trim());
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              accumulated += text;
              setReportMarkdown(accumulated);
            } catch {
              // raw chunk
            }
          }
        }
      }

      // Save newly generated report to DB cache
      if (user && accumulated) {
        await supabase.from("ai_research_reports").insert({
          user_id: user.id,
          ticker: target,
          language,
          content: accumulated
        });
        loadHistory();
      }
    } catch (error) {
      console.error("AI Research Error:", error);
      setReportMarkdown(
        isAr 
          ? "### ⚠️ خطأ في خدمة الأبحاث\nتعذر توليد التقرير في الوقت الحالي. يرجى التأكد من مفتاح Gemini API والمحاولة مرة أخرى."
          : "### ⚠️ Research Service Error\nUnable to generate research memo. Please verify Gemini API key configuration."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`MAHWAR INSTITUTIONAL RESEARCH: ${inputTicker}`, 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Author: Muhammad Sarmad Nadeem`, 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    const splitText = doc.splitTextToSize(reportMarkdown.replace(/#/g, ""), 180);
    doc.setFontSize(9);
    doc.text(splitText, 14, 40);
    doc.save(`MAHWAR_EQUITY_RESEARCH_${inputTicker}.pdf`);
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN (40% = 5 COLS) */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Sparkles className="text-[var(--gold)] shrink-0" size={24} />
            <div>
              <h2 className="font-garamond text-2xl font-bold text-white">
                {t("ai_research_title", language)}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                {t("model_badge", language)}
              </p>
            </div>
          </div>

          {/* Ticker Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t("ai_ticker_label", language)}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputTicker}
                onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
                placeholder="e.g. 2222.SR, 1120.SR"
                className="terminal-input flex-1 uppercase"
              />
              <button
                onClick={() => setTicker(inputTicker)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono text-white rounded cursor-pointer"
              >
                Set Active
              </button>
            </div>
          </div>

          {/* Research Query Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Custom Research Query (Optional)
            </label>
            <textarea
              rows={3}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={t("ai_query_placeholder", language)}
              className="terminal-input w-full resize-none text-xs"
            />
          </div>

          {/* Model Badge Notice */}
          <div className="p-3 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[11px] font-mono text-[var(--gold)] flex items-center gap-2">
            <Cpu size={14} className="shrink-0" />
            <span>Gemini 2.5 Flash + Real-Time Search Grounding Enabled</span>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleGenerateReport(inputTicker)}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0E7C69] to-[#12A189] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0E7C69]/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Streaming Research Memo...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>{t("generate_memo", language)}</span>
              </>
            )}
          </button>
        </div>

        {/* Recent Search History */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <History size={14} />
            <span>{t("recent_searches", language)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dbHistory.length > 0 ? (
              dbHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadSavedReport(item.id)}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--emerald)]/20 border border-white/10 hover:border-[var(--emerald)] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                >
                  {item.ticker}
                </button>
              ))
            ) : (
              ["2222.SR", "1120.SR", "1180.SR", "2010.SR", "7010.SR"].map((tck) => (
                <button
                  key={tck}
                  onClick={() => {
                    setInputTicker(tck);
                    setTicker(tck);
                    handleGenerateReport(tck);
                  }}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--emerald)]/20 border border-white/10 hover:border-[var(--emerald)] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                >
                  {tck}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (60% = 7 COLS) */}
      <div className="col-span-12 lg:col-span-7 space-y-4">
        {/* REPORT ACTION HEADER */}
        <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--gold)]" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {inputTicker} Institutional Memo Output
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!reportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[var(--pos)]" /> : <Copy size={13} />}
              <span>{t("copy_report", language)}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!reportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--emerald)] hover:bg-emerald-600 text-xs font-mono font-bold text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>{t("download_pdf", language)}</span>
            </button>
          </div>
        </div>

        {/* STREAMING MARKDOWN PANEL */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 min-h-[500px] max-h-[700px] overflow-y-auto font-sans leading-relaxed text-slate-200 space-y-4">
          {reportMarkdown ? (
            <div className="prose prose-invert max-w-none prose-headings:font-garamond prose-headings:text-[var(--gold)] prose-h1:text-2xl prose-h2:text-xl prose-p:text-xs prose-p:leading-relaxed prose-li:text-xs">
              <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
              <Sparkles size={40} className="text-slate-600 animate-pulse" />
              <div>
                <p className="font-mono text-sm font-bold text-slate-400">
                  {isAr ? "جاهز لتوليد تقرير الأبحاث بالذكاء الاصطناعي" : "Ready to Generate AI Equity Memo"}
                </p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  {isAr 
                    ? "انقر على زر 'توليد مذكرة التقييم' لبدء التدفّق المباشر عبر Gemini 2.5."
                    : "Click 'Generate Equity Memo' to stream institutional thesis for " + inputTicker
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </motion.div>
  );
}
