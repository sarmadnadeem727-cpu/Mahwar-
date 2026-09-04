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
  const [baseRev, setBaseRev] = useState<number>(1500);
  const [growthRate, setGrowthRate] = useState<number>(12);
  const [cogsPct, setCogsPct] = useState<number>(55);
  const [opexPct, setOpexPct] = useState<number>(20);

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
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: DRIVERS (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="panel-input p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-emerald" size={22} />
              <div>
                <h2 className="font-mono text-lg font-extrabold text-slate-900 uppercase">
                  {isAr ? "افتراضات القوائم الثلاث" : "3-Statement Drivers"}
                </h2>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
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
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Growth Rate */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "معدل النمو (%)" : "Growth Rate (%)"}</label>
              <input
                type="number"
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* COGS % */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "تكلفة المبيعات (%)" : "COGS (%)"}</label>
              <input
                type="number"
                value={cogsPct}
                onChange={(e) => setCogsPct(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* OpEx % */}
            <div className="flex justify-between items-center">
              <label className="text-slate-700">{isAr ? "المصاريف التشغيلية (%)" : "OpEx (%)"}</label>
              <input
                type="number"
                value={opexPct}
                onChange={(e) => setOpexPct(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-slate-50 border border-[#E2E8F0] focus:border-emerald rounded-md text-right text-slate-900 font-mono text-xs focus:outline-none"
              />
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* GAAP Mode Toggle */}
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">
                {isAr ? "المعيار المحاسبي والزكاة" : "Accounting Standard & Zakat"}
              </label>
              <button
                onClick={() => setGaapMode(gaapMode === "SAUDI_GAAP" ? "IFRS" : "SAUDI_GAAP")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-emerald-border bg-emerald-dim text-emerald font-bold cursor-pointer transition-colors"
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
        <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex justify-between items-center shadow-xs">
          <span className="font-mono text-xs text-slate-700 font-bold uppercase tracking-wider">
            {isAr ? "تصدير القوائم المالية" : "Statement Projections Output"}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald text-white font-mono text-xs font-bold hover:bg-emerald-light transition-colors cursor-pointer uppercase shadow-xs"
            >
              <Download size={13} />
              <span>{t("export_excel", language)}</span>
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-[#E2E8F0] text-slate-700 font-mono text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer uppercase"
            >
              <FileText size={13} />
              <span>{t("export_pdf", language)}</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#E2E8F0] font-mono text-xs gap-2">
          {["income", "balance", "cashflow"].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer uppercase tracking-wider ${
                  active
                    ? "bg-emerald text-white border-t border-x border-[#E2E8F0] font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 bg-slate-50"
                }`}
              >
                {tab === "income" ? t("tab_income", language) : tab === "balance" ? t("tab_balance", language) : t("tab_cashflow", language)}
              </button>
            );
          })}
        </div>

        {/* STATEMENT TABLE */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-xs overflow-x-auto">
          <table className="w-full font-mono text-xs text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600">
                <th className="p-2.5">Financial Metric (SAR M)</th>
                {projections.map((p) => (
                  <th key={p.year} className="p-2.5 text-right">{p.year}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {activeTab === "income" && (
                <>
                  <tr className="bg-emerald-dim font-bold">
                    <td className="p-2.5 text-emerald">Revenue (Driver: +{growthRate}%)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-emerald font-bold">{p.rev.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Cost of Goods Sold (COGS)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-rose-600">-{p.cogs.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold border-t border-[#E2E8F0] bg-slate-50">
                    <td className="p-2.5 text-slate-900">Gross Profit</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-900 font-bold">{p.grossProfit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Operating Expenses (OpEx)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-rose-600">-{p.opex.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold border-t border-[#E2E8F0] bg-slate-50">
                    <td className="p-2.5 text-slate-900">EBITDA</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-900 font-bold">{p.ebitda.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">Depreciation & Amortization</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-600">-{p.da.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold text-slate-900">
                    <td className="p-2.5">Operating Income (EBIT)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-900 font-bold">{p.ebit.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-amber-50 text-amber-900 font-bold">
                    <td className="p-2.5">{gaapMode === "SAUDI_GAAP" ? "Zakat Provision (2.5%)" : "Corporate Tax (20%)"}</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right font-bold">-{p.zakatOrTax.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-dim font-bold text-emerald border-t-2 border-emerald">
                    <td className="p-2.5 text-emerald">Net Income</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-emerald font-extrabold text-sm">{p.netIncome.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}

              {activeTab === "balance" && (
                <>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2.5">Cash & Cash Equivalents</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-emerald font-bold">{p.cash.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="font-bold border-t border-[#E2E8F0] bg-slate-50 text-slate-900">
                    <td className="p-2.5">Total Assets</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-900 font-extrabold">{p.totalAssets.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Total Liabilities & Debt</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-rose-600">{p.debt.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Total Shareholders' Equity</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-slate-700">{p.equity.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}

              {activeTab === "cashflow" && (
                <>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2.5">Operating Cash Flow (CFO)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-emerald font-bold">{p.operatingCF.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Capital Expenditures (CapEx)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-rose-600">-{p.capex.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-dim font-bold text-emerald border-t border-emerald-border">
                    <td className="p-2.5 text-emerald">Net Cash Flow Generation (FCF)</td>
                    {projections.map((p) => (
                      <td key={p.year} className="p-2.5 text-right text-emerald font-bold">{p.fcf.toLocaleString()}</td>
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
