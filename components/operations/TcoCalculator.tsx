// components/operations/TcoCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Coins, Award, DollarSign, Layers, Plus, Trash2, HelpCircle, 
  ArrowRight, FileSpreadsheet, CheckCircle2, TrendingDown 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { TcoOption, TcoCalculation, AuditData } from "@/lib/operations/types";
import { computeTco, generateTcoAudit } from "@/lib/operations/tco";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

const INITIAL_OPTIONS: TcoOption[] = [
  {
    id: "opt-1",
    name: "Model Alpha (Higher CapEx, Efficient)",
    purchasePrice: 450000,
    installationCost: 35000,
    annualOperatingCost: 42000,
    annualMaintenanceCost: 15000,
    usefulLifeYears: 8,
    salvageValue: 60000,
    discountRatePct: 8.0,
  },
  {
    id: "opt-2",
    name: "Model Beta (Budget Sticker, Higher OpEx)",
    purchasePrice: 320000,
    installationCost: 40000,
    annualOperatingCost: 68000,
    annualMaintenanceCost: 28000,
    usefulLifeYears: 8,
    salvageValue: 25000,
    discountRatePct: 8.0,
  },
];

export default function TcoCalculator() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [options, setOptions] = useState<TcoOption[]>(INITIAL_OPTIONS);
  const [activeOptionId, setActiveOptionId] = useState<string>("opt-1");

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeIndex = options.findIndex((o) => o.id === activeOptionId);
  const currentOption = options[activeIndex >= 0 ? activeIndex : 0];
  const currentCalc = computeTco(currentOption);

  // Compute all options and rank
  const evaluatedOptions = options.map((opt) => ({
    option: opt,
    calc: computeTco(opt),
  }));

  // Sort by lowest Net TCO PV (lowest lifecycle cost wins)
  evaluatedOptions.sort((a, b) => a.calc.netTcoPv - b.calc.netTcoPv);
  const winningOption = evaluatedOptions[0];
  const costSavingsVsRunnerUp =
    evaluatedOptions.length > 1
      ? evaluatedOptions[1].calc.netTcoPv - winningOption.calc.netTcoPv
      : 0;

  // Sync to sessionAnalyses
  useEffect(() => {
    updateSessionAnalysis("tco", {
      inputs: { options },
      outputs: { winningOptionName: winningOption.option.name, winningTco: winningOption.calc.netTcoPv },
      computedAt: new Date().toISOString(),
    });
  }, [options, winningOption]);

  const updateActiveField = (field: keyof TcoOption, val: any) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === activeOptionId ? { ...o, [field]: val } : o))
    );
  };

  const addOption = () => {
    if (options.length >= 4) return;
    const nextIdx = options.length + 1;
    const newOpt: TcoOption = {
      id: `opt-${Date.now()}`,
      name: `Equipment Option ${nextIdx}`,
      purchasePrice: 380000,
      installationCost: 35000,
      annualOperatingCost: 50000,
      annualMaintenanceCost: 20000,
      usefulLifeYears: currentOption.usefulLifeYears,
      salvageValue: 40000,
      discountRatePct: currentOption.discountRatePct,
    };
    setOptions([...options, newOpt]);
    setActiveOptionId(newOpt.id);
  };

  const removeOption = (id: string) => {
    if (options.length <= 1) return;
    const remaining = options.filter((o) => o.id !== id);
    setOptions(remaining);
    setActiveOptionId(remaining[0].id);
  };

  const handleExportExcel = () => {
    const summaryRows = evaluatedOptions.map(({ option, calc }, idx) => ({
      Rank: idx + 1,
      "Option Name": option.name,
      "Purchase Price": option.purchasePrice,
      "Installation Cost": option.installationCost,
      "Annual Operating Cost": option.annualOperatingCost,
      "Annual Maintenance Cost": option.annualMaintenanceCost,
      "Useful Life (Years)": option.usefulLifeYears,
      "Discount Rate (%)": option.discountRatePct,
      "Salvage Value": option.salvageValue,
      "PV of Operating Costs": calc.pvAnnualOperating,
      "PV of Maintenance Costs": calc.pvAnnualMaintenance,
      "PV of Salvage Credit": calc.pvSalvage,
      "Net Present Value TCO": calc.netTcoPv,
      "Undiscounted Total Cost": calc.undiscountedTotal,
    }));
    exportToExcel([{ name: "TCO Comparison", data: summaryRows }], "MAHWAR_Total_Cost_of_Ownership");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("tco-container", "MAHWAR_Total_Cost_of_Ownership");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateTcoAudit(currentOption, currentCalc);

  // Stacked chart data comparing all options
  const comparisonChartData = evaluatedOptions.map(({ option, calc }) => ({
    name: option.name,
    "Purchase Price": option.purchasePrice,
    "Installation": option.installationCost,
    "PV Operating": calc.pvAnnualOperating,
    "PV Maintenance": calc.pvAnnualMaintenance,
    "Less PV Salvage": -calc.pvSalvage,
  }));

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="tco-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="COST & SOURCING"
        categoryTagAr="التكاليف والتوريد"
        title="Total Cost of Ownership (TCO) Lifecycle Model"
        titleAr="حاسبة التكلفة الإجمالية للملكية ودورة الحياة (TCO)"
        subtitle="Evaluate capital acquisitions on a discounted present-value basis across operating lifespan"
        subtitleAr="تقييم المشتريات الرأسمالية والمعدات على أساس القيمة الحالية المخصومة لكامل تكاليف التشغيل والصيانة"
        icon={<Coins size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => setOptions(INITIAL_OPTIONS)}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* WINNER HIGHLIGHT BANNER */}
      <div className="p-4 bg-emerald/10 border border-emerald/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald text-ink-0">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald uppercase tracking-wider">
                {isAr ? "الخيار الأفضل اقتصادياً" : "Optimal Capital Procurement Decision"}
              </span>
            </div>
            <h3 className="font-serif text-base font-bold text-fg">
              {winningOption.option.name}
            </h3>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs text-fg-3 block">Lowest Net TCO (PV):</span>
          <span className="text-xl font-extrabold text-emerald">
            {currency} {winningOption.calc.netTcoPv.toLocaleString()}
          </span>
          {costSavingsVsRunnerUp > 0 && (
            <span className="text-[10px] text-emerald font-bold block">
              Saves {currency} {costSavingsVsRunnerUp.toLocaleString()} vs next best
            </span>
          )}
        </div>
      </div>

      {/* KPI HIGHLIGHT CARDS (ACTIVE OPTION) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {currentOption.name} (TCO PV)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {currentCalc.netTcoPv.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Present value @ {currentOption.discountRatePct}% over {currentOption.usefulLifeYears} yrs
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            Upfront CapEx (Price + Setup)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {(currentOption.purchasePrice + currentOption.installationCost).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {((((currentOption.purchasePrice + currentOption.installationCost) / currentCalc.netTcoPv) * 100).toFixed(0))}% of lifecycle burden
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            PV Recurring (Op & Maint)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {currentCalc.pvAnnualTotal.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Op: {currency} {currentCalc.pvAnnualOperating.toLocaleString()} | Maint: {currency} {currentCalc.pvAnnualMaintenance.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            Terminal Salvage Credit (PV)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald">
              -{currency} {currentCalc.pvSalvage.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {currency} {currentOption.salvageValue.toLocaleString()} nominal at Year {currentOption.usefulLifeYears}
          </span>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            {/* OPTION SELECTOR TABS */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                {isAr ? "خيارات المعدات والأصول" : "Equipment / Asset Options"}
              </span>
              <div className="flex items-center gap-1.5">
                {options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setActiveOptionId(o.id)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer truncate max-w-[120px] ${
                      activeOptionId === o.id
                        ? "bg-emerald text-ink-0"
                        : "bg-ink-3 text-fg-2 hover:bg-ink-4"
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
                {options.length < 4 && (
                  <button
                    onClick={addOption}
                    className="p-1 rounded bg-ink-3 hover:bg-ink-4 text-emerald"
                    title="Add Asset Option"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-fg-2 font-medium block mb-1">Option Name / Model</label>
                <input
                  type="text"
                  value={currentOption.name}
                  onChange={(e) => updateActiveField("name", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Purchase Price ({currency})</label>
                  <input
                    type="number"
                    value={currentOption.purchasePrice}
                    onChange={(e) => updateActiveField("purchasePrice", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Installation / Setup ({currency})</label>
                  <input
                    type="number"
                    value={currentOption.installationCost}
                    onChange={(e) => updateActiveField("installationCost", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Annual Operating Cost ({currency})</label>
                  <input
                    type="number"
                    value={currentOption.annualOperatingCost}
                    onChange={(e) => updateActiveField("annualOperatingCost", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-fg-3 block mt-0.5">Energy, consumables</span>
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Annual Maintenance ({currency})</label>
                  <input
                    type="number"
                    value={currentOption.annualMaintenanceCost}
                    onChange={(e) => updateActiveField("annualMaintenanceCost", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-fg-3 block mt-0.5">Servicing & spare parts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Lifespan (Yrs)</label>
                  <input
                    type="number"
                    value={currentOption.usefulLifeYears}
                    onChange={(e) => updateActiveField("usefulLifeYears", Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Salvage Value</label>
                  <input
                    type="number"
                    value={currentOption.salvageValue}
                    onChange={(e) => updateActiveField("salvageValue", Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Discount Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentOption.discountRatePct}
                    onChange={(e) => updateActiveField("discountRatePct", Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {options.length > 1 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => removeOption(currentOption.id)}
                    className="text-neg hover:text-neg flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Option</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMPARISON STACK & LEADERBOARD (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TCO STACKED LIFECYCLE CHART */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مقارنة شلال التكلفة الإجمالية لدورة الحياة" : "Discounted Lifecycle Cost Breakdown"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "مقارنة بين تكلفة الشراء المبدئية وتكاليف التشغيل المستقبلية المخصومة" : "Shows how low purchase price options can cost significantly more over lifespan"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                PRESENT VALUE
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                  <XAxis dataKey="name" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Bar dataKey="Purchase Price" stackId="a" fill="#17a88a" />
                  <Bar dataKey="Installation" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="PV Operating" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="PV Maintenance" stackId="a" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RANKED TCO LEADERBOARD TABLE */}
          <div className="panel-data p-5">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider mb-3">
              {isAr ? "جدول تصنيف الخيارات الاستثمارية" : "Lifecycle Procurement Leaderboard"}
            </h3>

            <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-line bg-ink-3 text-fg-3">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Option</th>
                  <th className="py-2 px-3 text-right">CapEx</th>
                  <th className="py-2 px-3 text-right">PV Op & Maint</th>
                  <th className="py-2 px-3 text-right font-bold text-emerald">Net TCO (PV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {evaluatedOptions.map(({ option, calc }, idx) => (
                  <tr key={option.id} className="hover:bg-ink-3 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-fg">
                      {idx === 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald text-ink-0 text-[10px]">#1 WIN</span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-fg font-sans">{option.name}</td>
                    <td className="py-2.5 px-3 text-right">{currency} {(option.purchasePrice + option.installationCost).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">{currency} {calc.pvAnnualTotal.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald text-sm">
                      {currency} {calc.netTcoPv.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 p-3 bg-ink-3 rounded-lg border border-line text-xs text-fg-2 font-sans">
              <span className="font-bold text-fg block mb-0.5">
                {isAr ? "تحليل قرار الشراء" : "Procurement Analysis:"}
              </span>
              {costSavingsVsRunnerUp > 0
                ? isAr
                  ? `الخيار الفائز (${winningOption.option.name}) يوفر ${currency} ${costSavingsVsRunnerUp.toLocaleString()} على مدار دورة حياته بفضل كفاءته التشغيلية حتى وإن كان سعر الشراء المبدئي أعلى.`
                  : `Selecting ${winningOption.option.name} unlocks ${currency} ${costSavingsVsRunnerUp.toLocaleString()} in net lifecycle cost avoidance compared to alternatives.`
                : "Enter multiple asset options above to benchmark lifecycle procurement alternatives."}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULA AUDIT MODAL */}
      <FormulaAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditData={auditData}
        isAr={isAr}
      />
    </motion.div>
  );
}
