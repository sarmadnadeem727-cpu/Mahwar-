"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Download, FileText, ToggleLeft, ToggleRight, BarChart2, Save, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import { useUserContext } from "@/components/providers/UserProvider";
import { PLAN_LIMITS } from "@/lib/billing/plan-limits";
import UpgradeModal from "@/components/ui/UpgradeModal";

export default function ThreeStatementModel() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';
  const { user, subscription } = useUserContext();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"income" | "balance" | "cashflow">("income");
  const [gaapMode, setGaapMode] = useState<"SAUDI_GAAP" | "IFRS">("SAUDI_GAAP");

  // Editable Drivers
  const [baseRev, setBaseRev] = useState<number>(45000);
  const [growthRate, setGrowthRate] = useState<number>(10);
  const [cogsPct, setCogsPct] = useState<number>(65);
  const [opexPct, setOpexPct] = useState<number>(12);

  // Saved Models State
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const [modelName, setModelName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadSavedModels = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("saved_models")
        .select("*")
        .eq("user_id", user.id)
        .eq("model_type", "three_statement");
      if (data) setSavedModels(data);
    } catch (err) {
      console.error("Failed to load Three-Statement models:", err);
    }
  };

  const handleSaveModel = async () => {
    if (!user || !modelName.trim()) return;

    // Check Plan Limits
    const plan = subscription?.plan || 'free';
    const limit = PLAN_LIMITS[plan].savedModelsLimit;
    if (savedModels.length >= limit) {
      setShowUpgradeModal(true);
      return;
    }

    setSaving(true);
    const inputs = {
      baseRev,
      growthRate,
      cogsPct,
      opexPct,
      gaapMode
    };
    try {
      const { error } = await supabase.from("saved_models").insert({
        user_id: user.id,
        model_type: "three_statement",
        ticker: activeTicker,
        name: modelName,
        inputs,
        outputs: { projections }
      });
      if (!error) {
        setModelName("");
        loadSavedModels();
      }
    } catch (err) {
      console.error("Save Three-Statement error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectModel = (model: any) => {
    const { inputs } = model;
    setBaseRev(inputs.baseRev);
    setGrowthRate(inputs.growthRate);
    setCogsPct(inputs.cogsPct);
    setOpexPct(inputs.opexPct);
    if (inputs.gaapMode) {
      setGaapMode(inputs.gaapMode);
    }
  };

  useEffect(() => {
    if (user) {
      loadSavedModels();
    }
  }, [user]);

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

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(projections);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Projections");
    XLSX.writeFile(wb, `MAHWAR_3STATEMENT_${activeTicker}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`MAHWAR 3-STATEMENT MODEL: ${activeTicker}`, 14, 15);
    const headers = [["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]];
    const data = [
      ["Revenue", ...projections.map(p => p.rev.toLocaleString())],
      ["Gross Profit", ...projections.map(p => p.grossProfit.toLocaleString())],
      ["EBITDA", ...projections.map(p => p.ebitda.toLocaleString())],
      ["Zakat / Tax", ...projections.map(p => p.zakatOrTax.toLocaleString())],
      ["Net Income", ...projections.map(p => p.netIncome.toLocaleString())]
    ];
    autoTable(doc, { head: headers, body: data, startY: 25 });
    doc.save(`MAHWAR_3STATEMENT_${activeTicker}.pdf`);
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
      {/* HEADER ACTIONS & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-[var(--emerald)]" size={24} />
            <div>
              <h2 className="font-garamond text-2xl font-bold text-white">
                {t("panel_three_statement", language)}
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Ticker: {activeTicker} · Mode: {gaapMode}
              </span>
            </div>
          </div>

          {/* Saved Models Dropdown */}
          {user && savedModels.length > 0 && (
            <div className="flex items-center gap-2 font-mono text-xs w-full md:w-auto">
              <span className="text-slate-400 font-bold shrink-0">{t("saved_models_lbl", language)}:</span>
              <select
                onChange={(e) => {
                  const m = savedModels.find((model) => model.id === e.target.value);
                  if (m) handleSelectModel(m);
                }}
                className="bg-[#0A0B0D] border border-white/10 text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] cursor-pointer min-w-[150px]"
                defaultValue=""
              >
                <option value="" disabled>-- Load Save --</option>
                {savedModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs w-full xl:w-auto justify-start xl:justify-end">
          {/* GAAP / IFRS TOGGLE */}
          <button
            onClick={() => setGaapMode(gaapMode === "SAUDI_GAAP" ? "IFRS" : "SAUDI_GAAP")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)] font-bold cursor-pointer"
          >
            {gaapMode === "SAUDI_GAAP" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            <span>{gaapMode === "SAUDI_GAAP" ? "Saudi GAAP (Zakat 2.5%)" : "IFRS (Corp Tax 20%)"}</span>
          </button>

          {/* Save Model Inputs */}
          {user && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={t("model_name_placeholder", language)}
                className="bg-[#0A0B0D] border border-white/10 text-xs font-mono text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] max-w-[150px]"
              />
              <button
                onClick={handleSaveModel}
                disabled={saving || !modelName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{t("save_model_btn", language)}</span>
              </button>
            </div>
          )}

          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-600/30 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>{t("export_excel", language)}</span>
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-colors cursor-pointer"
          >
            <FileText size={14} />
            <span>{t("export_pdf", language)}</span>
          </button>
        </div>
      </div>

      {/* STATEMENT TABS */}
      <div className="flex border-b border-white/10 font-mono text-xs gap-2">
        <button
          onClick={() => setActiveTab("income")}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer ${
            activeTab === "income"
              ? "bg-[var(--emerald)] text-white border-t border-x border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {t("tab_income", language)}
        </button>
        <button
          onClick={() => setActiveTab("balance")}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer ${
            activeTab === "balance"
              ? "bg-[var(--emerald)] text-white border-t border-x border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {t("tab_balance", language)}
        </button>
        <button
          onClick={() => setActiveTab("cashflow")}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer ${
            activeTab === "cashflow"
              ? "bg-[var(--emerald)] text-white border-t border-x border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {t("tab_cashflow", language)}
        </button>
      </div>

      {/* TABLE DATA DISPLAY */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
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
                <tr className="bg-[var(--gold)]/10 font-bold">
                  <td className="text-[var(--gold)]">Revenue (Driver: +{growthRate}%)</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-[var(--gold)] font-bold">{p.rev.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Cost of Goods Sold (COGS)</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-red-400">-{p.cogs.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold border-t border-white/10">
                  <td className="text-white">Gross Profit</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-white font-bold">{p.grossProfit.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Operating Expenses (OpEx)</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-slate-300">-{p.opex.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold bg-white/5">
                  <td className="text-[var(--emerald)]">EBITDA</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-[var(--emerald)] font-bold">{p.ebitda.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Depreciation & Amortization</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-slate-400">-{p.da.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="bg-[var(--gold)]/10 font-bold">
                  <td className="text-[var(--gold)]">
                    {gaapMode === "SAUDI_GAAP" ? "Zakat Provision (2.5% Net Assets)" : "Corporate Tax (20%)"}
                  </td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-[var(--gold)] font-bold">-{p.zakatOrTax.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold text-lg bg-[var(--emerald)]/20 border-t-2 border-[var(--emerald)]">
                  <td className="text-white">Net Income</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-white font-extrabold">{p.netIncome.toLocaleString()}</td>
                  ))}
                </tr>
              </>
            )}

            {activeTab === "balance" && (
              <>
                <tr>
                  <td>Cash & Equivalents</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-slate-200">{p.cash.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold bg-white/5">
                  <td className="text-white">Total Assets</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-white font-bold">{p.totalAssets.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Total Liabilities (Debt)</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-red-400">{p.debt.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold bg-[var(--emerald)]/10">
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
                    <td key={p.year} className="text-right text-slate-200">{p.operatingCF.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Capital Expenditures (CapEx)</td>
                  {projections.map((p) => (
                    <td key={p.year} className="text-right text-red-400">-{p.capex.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="font-bold bg-[var(--emerald)]/10">
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

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </motion.div>
  );
}
