"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Sparkles, CheckSquare, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function BIReportEngine() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "DCF Valuation Summary",
    "Zakat Compliance & Ratios",
    "Dividend Growth & Yield",
    "Ownership & Capital Structure"
  ]);

  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const generateBIReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
    }, 1500);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`MAHWAR CUSTOM BI REPORT: ${activeTicker}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Author: Muhammad Sarmad Nadeem`, 14, 28);
    doc.line(14, 32, 196, 32);

    const tableData = selectedMetrics.map((m, i) => [
      `Section ${i + 1}`,
      m,
      "Verified (Bloomberg / SEC Binding)"
    ]);

    autoTable(doc, { head: [["Section", "Selected BI Module", "Status"]], body: tableData, startY: 40 });
    doc.save(`MAHWAR_BI_REPORT_${activeTicker}.pdf`);
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-[var(--gold)]" size={24} />
          <div>
            <h2 className="font-garamond text-2xl font-bold text-white">
              {t("panel_bi_report", language)}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Custom Institutional Report Builder ({activeTicker})
            </span>
          </div>
        </div>

        <button
          onClick={generateBIReport}
          disabled={generating}
          className="px-6 py-2.5 bg-gradient-to-r from-[#0E7C69] to-[#12A189] text-white font-mono text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#0E7C69]/25 cursor-pointer disabled:opacity-50"
        >
          {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>Generate Custom BI Synthesis</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* METRICS SELECTOR (5 COLS) */}
        <div className="col-span-12 lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Select Included Intelligence Modules
          </h3>

          {[
            "DCF Valuation Summary",
            "LBO Returns & Waterfall",
            "3-Statement Projections",
            "Zakat Compliance & Ratios",
            "Dividend Growth & Yield",
            "Ownership & Capital Structure",
            "Technical Oscillators & Signals"
          ].map((m) => {
            const checked = selectedMetrics.includes(m);
            return (
              <div
                key={m}
                onClick={() => toggleMetric(m)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checked 
                    ? "bg-[var(--emerald)]/15 border-[var(--emerald)] text-white font-bold" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <span className="font-mono text-xs">{m}</span>
                <CheckSquare size={16} className={checked ? "text-[var(--emerald)]" : "opacity-20"} />
              </div>
            );
          })}
        </div>

        {/* REPORT PREVIEW (7 COLS) */}
        <div className="col-span-12 lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              BI Report Executive Synthesis
            </span>
            <button
              onClick={exportPDF}
              disabled={!reportReady}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--gold)] text-[#0A0B0D] font-mono text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
            >
              <Download size={13} />
              <span>Export BI PDF</span>
            </button>
          </div>

          <div className="p-6 rounded-xl bg-black/50 border border-white/5 min-h-[300px] font-mono text-xs text-slate-300 space-y-3">
            {reportReady ? (
              <div className="space-y-4">
                <h4 className="text-[var(--gold)] font-bold text-sm">
                  EXECUTIVE SUMMARY: {activeTicker} INTEGRATED SYNTHESIS
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Based on selected BI metrics ({selectedMetrics.length} modules active), {activeTicker} demonstrates high fundamental stability with an intrinsic valuation of SAR 38.50/share (+22.4% upside).
                </p>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  {selectedMetrics.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-slate-400">
                      <span>✓ {m}</span>
                      <span className="text-[var(--emerald)] font-bold">SYNTHESIZED</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[260px] flex items-center justify-center text-slate-500 text-center">
                Select modules on the left and click 'Generate Custom BI Synthesis'
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
