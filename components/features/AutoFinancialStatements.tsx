"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileCheck, ArrowRight, RefreshCw, CheckCircle2, Download, Layers, BarChart3, Sparkles, Sliders
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function AutoFinancialStatements() {
  const { language, setPanel, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  // Guided Form Inputs
  const [baseRevenue, setBaseRevenue] = useState<number>(1200); // SAR M
  const [growthRate, setGrowthRate] = useState<number>(8.0); // %
  const [cogsMargin, setCogsMargin] = useState<number>(55.0); // %
  const [opexMargin, setOpexMargin] = useState<number>(15.0); // %
  const [taxZakatRate, setTaxZakatRate] = useState<number>(2.5); // % (Saudi Zakat)
  const [capexPct, setCapexPct] = useState<number>(10.0); // % of Rev
  const [dnaPct, setDnaPct] = useState<number>(6.0); // % of Rev
  const [startingCash, setStartingCash] = useState<number>(250); // SAR M
  const [startingDebt, setStartingDebt] = useState<number>(400); // SAR M

  const [activeTab, setActiveTab] = useState<"IS" | "BS" | "CF">("IS");

  // Generate 5-Year Linked Statements
  const years = [2025, 2026, 2027, 2028, 2029];
  
  let currentRev = baseRevenue;
  let cumCash = startingCash;
  let cumRetainedEarnings = 500;

  const projectionData = years.map((yr, idx) => {
    if (idx > 0) {
      currentRev *= (1 + growthRate / 100);
    }
    const cogs = currentRev * (cogsMargin / 100);
    const grossProfit = currentRev - cogs;
    const opex = currentRev * (opexMargin / 100);
    const ebitda = grossProfit - opex;
    const dna = currentRev * (dnaPct / 100);
    const ebit = ebitda - dna;
    const taxZakat = Math.max(0, ebit * (taxZakatRate / 100));
    const netIncome = ebit - taxZakat;

    const capex = currentRev * (capexPct / 100);
    const deltaNwc = currentRev * 0.01;
    const ocf = netIncome + dna - deltaNwc;
    const fcf = ocf - capex;

    cumCash += fcf;
    cumRetainedEarnings += netIncome;

    const netPpe = 600 + (idx + 1) * (capex - dna);
    const totalAssets = cumCash + netPpe;
    const debt = startingDebt;
    const equity = totalAssets - debt;

    return {
      year: yr,
      revenue: Number(currentRev.toFixed(1)),
      cogs: Number(cogs.toFixed(1)),
      grossProfit: Number(grossProfit.toFixed(1)),
      opex: Number(opex.toFixed(1)),
      ebitda: Number(ebitda.toFixed(1)),
      dna: Number(dna.toFixed(1)),
      ebit: Number(ebit.toFixed(1)),
      taxZakat: Number(taxZakat.toFixed(1)),
      netIncome: Number(netIncome.toFixed(1)),
      ocf: Number(ocf.toFixed(1)),
      capex: Number(capex.toFixed(1)),
      fcf: Number(fcf.toFixed(1)),
      cash: Number(cumCash.toFixed(1)),
      netPpe: Number(netPpe.toFixed(1)),
      totalAssets: Number(totalAssets.toFixed(1)),
      debt: Number(debt.toFixed(1)),
      equity: Number(equity.toFixed(1)),
    };
  });

  useEffect(() => {
    updateSessionAnalysis("autoStatements", {
      inputs: { baseRevenue, growthRate, cogsMargin, opexMargin, taxZakatRate, capexPct },
      outputs: { projectionData },
      computedAt: new Date().toISOString()
    });
  }, [baseRevenue, growthRate, cogsMargin, opexMargin, taxZakatRate, capexPct]);

  const sendToDcf = () => {
    setPanel("DCF");
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-slate-800"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
            <FileCheck size={24} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-heading">
              {isAr ? "محرك توليد القوائم المالية التلقائي" : "Guided Auto-Generated Financial Statements"}
            </h1>
            <p className="text-xs text-slate-muted font-sans font-medium">
              {isAr ? "أسرع طريقة لبناء القوائم المترابطة (الدخل، الميزانية، التدفقات) عبر إدخال المتغيرات الأساسية" : "Fastest zero-formula way to build linked Income, Balance Sheet, and Cash Flow statements"}
            </p>
          </div>
        </div>

        <button
          onClick={sendToDcf}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald hover:bg-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs group"
        >
          <span>{isAr ? "إرسال إلى نموذج DCF" : "Export to DCF Engine"}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GUIDED INPUT FORM */}
        <div className="bg-white p-5 rounded-xl border border-surface-border space-y-4 shadow-xs">
          <h3 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider border-b border-surface-border pb-3 flex items-center gap-2">
            <Sliders size={14} className="text-emerald" />
            <span>{isAr ? "إدخال المؤشرات الرئيسية" : "Core Operational Inputs"}</span>
          </h3>

          <div className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="text-slate-body font-medium block mb-1">Base Year Revenue (SAR M)</label>
              <input
                type="number"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs font-bold text-slate-heading"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Annual Revenue Growth Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">COGS / Revenue (%)</label>
              <input
                type="number"
                step="0.5"
                value={cogsMargin}
                onChange={(e) => setCogsMargin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">OPEX / Revenue (%)</label>
              <input
                type="number"
                step="0.5"
                value={opexMargin}
                onChange={(e) => setOpexMargin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Saudi Zakat / Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxZakatRate}
                onChange={(e) => setTaxZakatRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">CapEx / Revenue (%)</label>
              <input
                type="number"
                step="0.5"
                value={capexPct}
                onChange={(e) => setCapexPct(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL STATEMENTS VIEWER */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-xs space-y-4">
            
            {/* STATEMENT SELECTOR TABS */}
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("IS")}
                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "IS" ? "bg-emerald text-white" : "bg-surface-subtle border border-surface-border text-slate-muted"
                  }`}
                >
                  Income Statement
                </button>
                <button
                  onClick={() => setActiveTab("CF")}
                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "CF" ? "bg-emerald text-white" : "bg-surface-subtle border border-surface-border text-slate-muted"
                  }`}
                >
                  Cash Flow Statement
                </button>
                <button
                  onClick={() => setActiveTab("BS")}
                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "BS" ? "bg-emerald text-white" : "bg-surface-subtle border border-surface-border text-slate-muted"
                  }`}
                >
                  Balance Sheet
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald font-bold bg-emerald-dim px-2.5 py-1 rounded border border-emerald-border">
                <CheckCircle2 size={12} />
                <span>3-STATEMENTS LINKED</span>
              </div>
            </div>

            {/* TAB TABLE DATA */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-subtle text-slate-muted">
                    <th className="py-2.5 px-3">Line Item (SAR M)</th>
                    {projectionData.map(d => (
                      <th key={d.year} className="py-2.5 px-3 text-right">{d.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {activeTab === "IS" && (
                    <>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-heading">Revenue</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right font-bold">{d.revenue}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">COGS</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-muted">({d.cogs})</td>)}
                      </tr>
                      <tr className="bg-surface-subtle font-bold">
                        <td className="py-2 px-3 text-slate-heading">Gross Profit</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-emerald">{d.grossProfit}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">OPEX</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-muted">({d.opex})</td>)}
                      </tr>
                      <tr className="font-bold">
                        <td className="py-2 px-3 text-slate-heading">EBITDA</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-heading">{d.ebitda}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">D&A</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-muted">({d.dna})</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">Zakat / Tax (2.5%)</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-muted">({d.taxZakat})</td>)}
                      </tr>
                      <tr className="bg-emerald-dim font-bold text-emerald border-t border-emerald-border">
                        <td className="py-2.5 px-3">NET INCOME</td>
                        {projectionData.map(d => <td key={d.year} className="py-2.5 px-3 text-right text-sm">{d.netIncome}</td>)}
                      </tr>
                    </>
                  )}

                  {activeTab === "CF" && (
                    <>
                      <tr className="font-bold">
                        <td className="py-2 px-3 text-slate-heading">Net Income</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right">{d.netIncome}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">+ Depreciation & Amortization</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right">{d.dna}</td>)}
                      </tr>
                      <tr className="bg-surface-subtle font-bold">
                        <td className="py-2 px-3 text-slate-heading">Operating Cash Flow (OCF)</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-emerald">{d.ocf}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">Capital Expenditures (CapEx)</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-slate-muted">({d.capex})</td>)}
                      </tr>
                      <tr className="bg-emerald-dim font-bold text-emerald border-t border-emerald-border">
                        <td className="py-2.5 px-3">FREE CASH FLOW (FCF)</td>
                        {projectionData.map(d => <td key={d.year} className="py-2.5 px-3 text-right text-sm">{d.fcf}</td>)}
                      </tr>
                    </>
                  )}

                  {activeTab === "BS" && (
                    <>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-heading">Cash & Equivalents</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right text-emerald font-bold">{d.cash}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">Net PP&E</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right">{d.netPpe}</td>)}
                      </tr>
                      <tr className="bg-surface-subtle font-bold">
                        <td className="py-2 px-3 text-slate-heading">TOTAL ASSETS</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right">{d.totalAssets}</td>)}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-muted">Total Debt</td>
                        {projectionData.map(d => <td key={d.year} className="py-2 px-3 text-right">{d.debt}</td>)}
                      </tr>
                      <tr className="bg-emerald-dim font-bold text-emerald">
                        <td className="py-2.5 px-3">SHAREHOLDERS' EQUITY</td>
                        {projectionData.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.equity}</td>)}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
