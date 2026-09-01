"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Download, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function ThreeStatementModel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<"income" | "balance" | "cashflow">("income");
  const [gaapMode, setGaapMode] = useState<"SAUDI_GAAP" | "IFRS">("SAUDI_GAAP");

  // Editable Drivers
  const [baseRev, setBaseRev] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);
  const [cogsPct, setCogsPct] = useState<number>(0);
  const [opexPct, setOpexPct] = useState<number>(0);

  // Projections 5Y
  const projections = [1, 2, 3, 4, 5].map((yr) => {
    const rev = baseRev * Math.pow(1 + growthRate / 100, yr);
    const cogs = rev * (cogsPct / 100);
    const grossProfit = rev - cogs;
    const opex = rev * (opexPct / 100);
    const ebitda = grossProfit - opex;
    const da = ebitda * 0.18;
    const ebit = ebitda - da;
    
    // Zakat Treatment: 2.5% of Zakat Base (Net Assets) vs Corporate Tax 20% for IFRS
    const zakatBase = ebitda * 2.2;
    const zakatOrTax = gaapMode === "SAUDI_GAAP" ? zakatBase * 0.025 : ebit * 0.20;
    const netIncome = ebit - zakatOrTax;

    const cash = 12000 + yr * 2500;
    const receivables = rev * 0.15;
    const totalAssets = cash + receivables + 60000;
    const debt = 25000;
    const equity = totalAssets - debt;

    const operatingCF = ebitda - zakatOrTax;
    const capex = rev * 0.08;
    const fcf = operatingCF - capex;

    return {
      year: `Year ${yr}`,
      rev: Math.round(rev),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      opex: Math.round(opex),
      ebitda: Math.round(ebitda),
      da: Math.round(da),
      ebit: Math.round(ebit),
      zakatOrTax: Math.round(zakatOrTax),
      netIncome: Math.round(netIncome),
      cash: Math.round(cash),
      totalAssets: Math.round(totalAssets),
      debt: Math.round(debt),
      equity: Math.round(equity),
      operatingCF: Math.round(operatingCF),
      capex: Math.round(capex),
      fcf: Math.round(fcf)
    };
  });

  // Save changes to terminal session state
  useEffect(() => {
    updateSessionAnalysis("threeStatement", {
      inputs: {
        baseRev,
        growthRate,
        cogsPct,
        opexPct,
        gaapMode
      },
      outputs: {
        projections
      },
      computedAt: new Date().toISOString()
    });
  }, [baseRev, growthRate, cogsPct, opexPct, gaapMode]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(projections);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Projections");
    XLSX.writeFile(wb, `MAHWAR_3STATEMENT.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`MAHWAR 3-STATEMENT MODEL`, 14, 15);
    const headers = [["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]];
    const data = [
      ["Revenue", ...projections.map(p => p.rev.toLocaleString())],
      ["Gross Profit", ...projections.map(p => p.grossProfit.toLocaleString())],
      ["EBITDA", ...projections.map(p => p.ebitda.toLocaleString())],
      ["Zakat / Tax", ...projections.map(p => p.zakatOrTax.toLocaleString())],
      ["Net Income", ...projections.map(p => p.netIncome.toLocaleString())]
    ];
    autoTable(doc, { head: headers, body: data, startY: 25 });
    doc.save(`MAHWAR_3STATEMENT.pdf`);
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
      {/* LEFT COLUMN: DRIVERS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-[var(--emerald)]" size={22} />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#171717]">
                  {isAr ? "افتراضات القوائم الثلاث" : "3-Statement Drivers"}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {isAr ? "مدخلات التنبؤات والنموذج" : "Forecast Drivers"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Base Revenue */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "الإيرادات الأساسية" : "Base Revenue (M)"}</label>
              <input
                type="number"
                value={baseRev}
                onChange={(e) => setBaseRev(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            {/* Growth Rate */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "معدل النمو (%)" : "Growth Rate (%)"}</label>
              <input
                type="number"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            {/* COGS % */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "تكلفة المبيعات (%)" : "COGS (%)"}</label>
              <input
                type="number"
                value={cogsPct}
                onChange={(e) => setCogsPct(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            {/* OpEx % */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "المصاريف التشغيلية (%)" : "OpEx (%)"}</label>
              <input
                type="number"
                value={opexPct}
                onChange={(e) => setOpexPct(Number(e.target.value))}
                className="terminal-input w-24 text-right"
              />
            </div>

            <hr className="border-slate-200" />

            {/* GAAP Mode Toggle */}
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">
                {isAr ? "المعيار المحاسبي والزكاة" : "Accounting Standard & Zakat"}
              </label>
              <button
                onClick={() => setGaapMode(gaapMode === "SAUDI_GAAP" ? "IFRS" : "SAUDI_GAAP")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--emerald)]/20 bg-emerald-50/50 text-[var(--emerald)] font-bold cursor-pointer transition-colors"
              >
                <span>{gaapMode === "SAUDI_GAAP" ? "Saudi GAAP (Zakat 2.5%)" : "IFRS (Corp Tax 20%)"}</span>
                {gaapMode === "SAUDI_GAAP" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEWS & EXPORTS (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
          <span className="font-mono text-xs text-slate-550 font-bold uppercase tracking-wider">
            {isAr ? "تصدير القوائم المالية" : "Statement Projections Output"}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-[var(--emerald)] font-mono text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>{t("export_excel", language)}</span>
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FileText size={13} />
              <span>{t("export_pdf", language)}</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 font-mono text-xs gap-2">
          {["income", "balance", "cashflow"].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer ${
                  active
                    ? "bg-[var(--emerald)] text-white border-t border-x border-slate-200 font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab === "income" ? t("tab_income", language) : tab === "balance" ? t("tab_balance", language) : t("tab_cashflow", language)}
              </button>
            );
          })}
        </div>

        {/* STATEMENT TABLE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Financial Metric (SAR M)</th>
                {projections.map((p) => (
                  <th key={p.year} className="text-right">{p.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === "income" && (
                <>
                  <tr className="bg-emerald-50/40 font-bold">
                    <td className="text-[var(--emerald)]">Revenue (Driver: +{growthRate}%)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.rev.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Cost of Goods Sold (COGS)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-red-650">-{p.cogs.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold border-t border-slate-200">
                    <td className="text-[#171717]">Gross Profit</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[#171717] font-bold">{p.grossProfit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Operating Expenses (OpEx)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-slate-700">-{p.opex.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold bg-slate-50/70">
                    <td className="text-[var(--emerald)]">EBITDA</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.ebitda.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Depreciation & Amortization</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-slate-500">-{p.da.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="text-slate-700">
                      {gaapMode === "SAUDI_GAAP" ? "Zakat Provision (2.5% Net Assets)" : "Corporate Tax (20%)"}
                    </td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-slate-800 font-bold">-{p.zakatOrTax.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold text-lg bg-emerald-50 border-t-2 border-[var(--emerald)]">
                    <td className="text-[#171717]">Net Income</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[#171717] font-extrabold">{p.netIncome.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}

              {activeTab === "balance" && (
                <>
                  <tr>
                    <td>Cash & Equivalents</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-slate-800">{p.cash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold bg-slate-50/70">
                    <td className="text-[#171717]">Total Assets</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[#171717] font-bold">{p.totalAssets.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Total Liabilities (Debt)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-red-650">{p.debt.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold bg-emerald-50/50">
                    <td className="text-[var(--emerald)]">Shareholders' Equity</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.equity.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}

              {activeTab === "cashflow" && (
                <>
                  <tr>
                    <td>Operating Cash Flow</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-slate-800">{p.operatingCF.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Capital Expenditures (CapEx)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-red-650">-{p.capex.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold bg-emerald-50/50">
                    <td className="text-[var(--emerald)]">Free Cash Flow (FCF)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.fcf.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
