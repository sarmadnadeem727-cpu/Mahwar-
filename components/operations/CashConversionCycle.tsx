// components/operations/CashConversionCycle.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingDown, TrendingUp, HelpCircle, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { CCCPeriodInput, CCCOutput, AuditData } from "@/lib/operations/types";
import { computePeriodCCC, generateCCCAudit } from "@/lib/operations/ccc";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

const INITIAL_PERIODS: CCCPeriodInput[] = [
  {
    periodId: "p1",
    periodLabel: "2023 (A)",
    revenue: 4500000,
    cogs: 2800000,
    useBeginningEnding: false,
    averageInventory: 550000,
    averageAR: 720000,
    averageAP: 480000,
    daysInPeriod: 365,
  },
  {
    periodId: "p2",
    periodLabel: "2024 (A)",
    revenue: 5200000,
    cogs: 3100000,
    useBeginningEnding: false,
    averageInventory: 590000,
    averageAR: 780000,
    averageAP: 560000,
    daysInPeriod: 365,
  },
  {
    periodId: "p3",
    periodLabel: "2025 (E)",
    revenue: 6000000,
    cogs: 3500000,
    useBeginningEnding: false,
    averageInventory: 620000,
    averageAR: 810000,
    averageAP: 680000,
    daysInPeriod: 365,
  },
];

export default function CashConversionCycle() {
  const { language, currency, sessionAnalyses, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [periods, setPeriods] = useState<CCCPeriodInput[]>(() => {
    if (sessionAnalyses.ccc?.inputs?.periods) {
      return sessionAnalyses.ccc.inputs.periods;
    }
    return INITIAL_PERIODS;
  });

  const [activePeriodId, setActivePeriodId] = useState<string>(periods[periods.length - 1]?.periodId || "p3");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute outputs for each period
  const computedOutputs: CCCOutput[] = periods.map((p) => computePeriodCCC(p));
  const activeIndex = periods.findIndex((p) => p.periodId === activePeriodId);
  const currentPeriod = periods[activeIndex >= 0 ? activeIndex : 0];
  const currentOutput = computedOutputs[activeIndex >= 0 ? activeIndex : 0];

  // YoY improvement calculation
  let yoyDeltaCCC: number | null = null;
  if (activeIndex > 0) {
    const prevCCC = computedOutputs[activeIndex - 1].ccc;
    yoyDeltaCCC = Number((currentOutput.ccc - prevCCC).toFixed(1));
  }

  // Update session state
  useEffect(() => {
    updateSessionAnalysis("ccc", {
      inputs: { periods },
      outputs: { activeOutput: currentOutput, allOutputs: computedOutputs },
      computedAt: new Date().toISOString(),
    });
  }, [periods, currentOutput?.ccc]);

  // Validation
  let validationError = "";
  if (currentPeriod.cogs <= 0) {
    validationError = isAr ? "يجب أن تكون تكلفة المبيعات (COGS) أكبر من الصفر." : "COGS must be greater than zero to compute DIO and DPO.";
  } else if (currentPeriod.revenue <= 0) {
    validationError = isAr ? "يجب أن تكون الإيرادات أكبر من الصفر لحساب DSO." : "Revenue must be greater than zero to compute DSO.";
  }

  // Handle pull from 3-Statement or Auto Statements
  const canPullFromStatements = Boolean(
    sessionAnalyses.threeStatement?.outputs?.projections || sessionAnalyses.autoStatements
  );

  const pullFromStatements = () => {
    if (sessionAnalyses.threeStatement?.outputs?.projections) {
      const proj = sessionAnalyses.threeStatement.outputs.projections;
      const newPeriods: CCCPeriodInput[] = proj.slice(0, 3).map((yr: any, idx: number) => ({
        periodId: `proj-${idx}`,
        periodLabel: yr.year || `Year ${idx + 1}`,
        revenue: yr.rev * 1000000,
        cogs: yr.cogs * 1000000,
        useBeginningEnding: false,
        averageInventory: Math.round(yr.cogs * 1000000 * 0.18),
        averageAR: Math.round(yr.rev * 1000000 * 0.15),
        averageAP: Math.round(yr.cogs * 1000000 * 0.16),
        daysInPeriod: 365,
      }));
      setPeriods(newPeriods);
      setActivePeriodId(newPeriods[newPeriods.length - 1].periodId);
    }
  };

  const updateActiveField = (field: keyof CCCPeriodInput, value: any) => {
    setPeriods((prev) =>
      prev.map((p) => (p.periodId === activePeriodId ? { ...p, [field]: value } : p))
    );
  };

  const addPeriod = () => {
    const nextIdx = periods.length + 1;
    const newP: CCCPeriodInput = {
      periodId: `p-${Date.now()}`,
      periodLabel: `Yr ${nextIdx}`,
      revenue: Math.round(currentPeriod.revenue * 1.08),
      cogs: Math.round(currentPeriod.cogs * 1.08),
      useBeginningEnding: false,
      averageInventory: Math.round(currentPeriod.averageInventory * 1.05),
      averageAR: Math.round(currentPeriod.averageAR * 1.05),
      averageAP: Math.round(currentPeriod.averageAP * 1.05),
      daysInPeriod: 365,
    };
    setPeriods([...periods, newP]);
    setActivePeriodId(newP.periodId);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) return;
    const filtered = periods.filter((p) => p.periodId !== id);
    setPeriods(filtered);
    setActivePeriodId(filtered[filtered.length - 1].periodId);
  };

  const handleExportExcel = () => {
    const data = periods.map((p, idx) => {
      const out = computedOutputs[idx];
      return {
        Period: p.periodLabel,
        Revenue: p.revenue,
        COGS: p.cogs,
        Inventory: p.averageInventory,
        AR: p.averageAR,
        AP: p.averageAP,
        "Days in Period": p.daysInPeriod,
        "DIO (Days)": out.dio,
        "DSO (Days)": out.dso,
        "DPO (Days)": out.dpo,
        "CCC (Days)": out.ccc,
      };
    });
    exportToExcel([{ name: "CCC Summary", data }], "MAHWAR_Cash_Conversion_Cycle");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("ccc-container", "MAHWAR_Cash_Conversion_Cycle");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateCCCAudit(currentPeriod, currentOutput);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="ccc-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="WORKING CAPITAL"
        categoryTagAr="رأس المال العامل"
        title="Cash Conversion Cycle (CCC) Engine"
        titleAr="محرك دورة التحويل النقدي (CCC)"
        subtitle="Measure how long working capital is tied up from procurement to customer cash collection"
        subtitleAr="قياس مدة تجميد السيولة النقدية في دورة العمليات من الشراء إلى التحصيل النقدي"
        icon={<RefreshCw size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => setPeriods(INITIAL_PERIODS)}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* STATEMENTS INTEGRATION BANNER */}
      {canPullFromStatements && (
        <div className="p-3.5 bg-emerald/5 border border-emerald/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-fg-2">
            <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />
            <span>
              {isAr
                ? "تم العثور على نموذج القوائم المالية الثلاث النشط في الجلسة."
                : "Active 3-Statement Model found in your session workspace."}
            </span>
          </div>
          <button
            onClick={pullFromStatements}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald text-ink-0 rounded text-[11px] font-mono font-bold hover:bg-emerald-light transition-colors cursor-pointer shrink-0"
          >
            <span>{isAr ? "استيراد البيانات من النموذج" : "Auto-Populate from 3-Statement Model"}</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      )}

      {/* KPI HIGHLIGHT CARDS (CURRENT PERIOD) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* CCC MASTER CARD */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-emerald uppercase font-bold">
              {isAr ? "دورة التحويل النقدي (CCC)" : "Cash Conversion Cycle"}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-ink-2 text-emerald border border-emerald/30">
              {currentPeriod.periodLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald">{currentOutput.ccc}</span>
            <span className="text-xs font-bold text-emerald">{isAr ? "يوم" : "Days"}</span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 font-sans font-medium">
            {yoyDeltaCCC !== null ? (
              yoyDeltaCCC <= 0 ? (
                <span className="text-emerald font-bold flex items-center gap-0.5">
                  <TrendingDown size={12} /> {Math.abs(yoyDeltaCCC)} days faster (improved)
                </span>
              ) : (
                <span className="text-neg font-bold flex items-center gap-0.5">
                  <TrendingUp size={12} /> +{yoyDeltaCCC} days slower (cash tied longer)
                </span>
              )
            ) : (
              <span className="text-fg-3">{isAr ? "المعيار الأقصر هو الأفضل" : "Shorter cycle frees liquidity"}</span>
            )}
          </div>
        </div>

        {/* DIO */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "دوران المخزون (DIO)" : "Days Inventory (DIO)"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{currentOutput.dio}</span>
            <span className="text-xs font-bold text-fg-3">{isAr ? "يوم" : "Days"}</span>
          </div>
          <span className="text-[10px] text-fg-3 block mt-2 font-sans font-medium">
            {isAr ? "مدة بقاء البضاعة بالمستودع" : "Holding duration before sale"}
          </span>
        </div>

        {/* DSO */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "أيام تحصيل المبيعات (DSO)" : "Days Sales Out. (DSO)"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{currentOutput.dso}</span>
            <span className="text-xs font-bold text-fg-3">{isAr ? "يوم" : "Days"}</span>
          </div>
          <span className="text-[10px] text-fg-3 block mt-2 font-sans font-medium">
            {isAr ? "سرعة تحصيل مستحقات العملاء" : "Credit collection turnaround"}
          </span>
        </div>

        {/* DPO */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "أيام سداد الموردين (DPO)" : "Days Payable Out. (DPO)"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{currentOutput.dpo}</span>
            <span className="text-xs font-bold text-fg-3">{isAr ? "يوم" : "Days"}</span>
          </div>
          <span className="text-[10px] text-fg-3 block mt-2 font-sans font-medium">
            {isAr ? "تمويل ائتماني مجاني من الموردين" : "Vendor financing leverage"}
          </span>
        </div>
      </div>

      {/* VALIDATION ERROR */}
      {validationError && <InlineError message={validationError} isAr={isAr} />}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            {/* PERIOD SELECTOR TABS */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                {isAr ? "الفترة المالية النشطة" : "Active Period Inputs"}
              </span>
              <div className="flex items-center gap-1.5">
                {periods.map((p) => (
                  <button
                    key={p.periodId}
                    onClick={() => setActivePeriodId(p.periodId)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      activePeriodId === p.periodId
                        ? "bg-emerald text-ink-0"
                        : "bg-ink-3 text-fg-2 hover:bg-ink-4"
                    }`}
                  >
                    {p.periodLabel}
                  </button>
                ))}
                <button
                  onClick={addPeriod}
                  className="p-1 rounded bg-ink-3 hover:bg-ink-4 text-emerald"
                  title={isAr ? "إضافة فترة جديدة" : "Add Period"}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* PERIOD FORM INPUTS */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">
                    {isAr ? "تسمية الفترة" : "Period Label"}
                  </label>
                  <input
                    type="text"
                    value={currentPeriod.periodLabel}
                    onChange={(e) => updateActiveField("periodLabel", e.target.value)}
                    className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">
                    {isAr ? "أيام الفترة" : "Days in Period"}
                  </label>
                  <select
                    value={currentPeriod.daysInPeriod}
                    onChange={(e) => updateActiveField("daysInPeriod", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  >
                    <option value={365}>365 (Annual)</option>
                    <option value={90}>90 (Quarterly)</option>
                    <option value={30}>30 (Monthly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الإيرادات السنوية" : "Annual Revenue"} ({currency})
                </label>
                <input
                  type="number"
                  value={currentPeriod.revenue}
                  onChange={(e) => updateActiveField("revenue", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "تكلفة البضاعة المباعة (COGS)" : "Cost of Goods Sold (COGS)"} ({currency})
                </label>
                <input
                  type="number"
                  value={currentPeriod.cogs}
                  onChange={(e) => updateActiveField("cogs", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              {/* INVENTORY INPUT WITH TOGGLE */}
              <div className="p-3 bg-ink-3 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-fg">
                    {isAr ? "المخزون السلعي" : "Inventory"}
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-fg-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentPeriod.useBeginningEnding}
                      onChange={(e) => updateActiveField("useBeginningEnding", e.target.checked)}
                      className="rounded text-emerald"
                    />
                    <span>{isAr ? "أول + آخر المدة" : "Beg / End Split"}</span>
                  </label>
                </div>

                {currentPeriod.useBeginningEnding ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-fg-3 block mb-0.5">Beginning</span>
                      <input
                        type="number"
                        value={currentPeriod.beginningInventory || 0}
                        onChange={(e) => updateActiveField("beginningInventory", Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-fg-3 block mb-0.5">Ending</span>
                      <input
                        type="number"
                        value={currentPeriod.endingInventory || 0}
                        onChange={(e) => updateActiveField("endingInventory", Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={currentPeriod.averageInventory}
                    onChange={(e) => updateActiveField("averageInventory", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-ink-2 border border-line font-mono text-xs font-bold"
                  />
                )}
              </div>

              {/* ACCOUNTS RECEIVABLE */}
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الذمم المدينة / العملاء (AR)" : "Accounts Receivable (AR)"} ({currency})
                </label>
                <input
                  type="number"
                  value={currentPeriod.averageAR}
                  onChange={(e) => updateActiveField("averageAR", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              {/* ACCOUNTS PAYABLE */}
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الذمم الدائنة / الموردين (AP)" : "Accounts Payable (AP)"} ({currency})
                </label>
                <input
                  type="number"
                  value={currentPeriod.averageAP}
                  onChange={(e) => updateActiveField("averageAP", Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              {periods.length > 1 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => removePeriod(currentPeriod.periodId)}
                    className="text-neg hover:text-neg flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{isAr ? "حذف هذه الفترة" : "Delete Period"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OUTPUTS & TREND CHART COLUMN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* MULTI-PERIOD TREND CHART */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مسار تطور دورة التحويل النقدي عبر الفترات" : "CCC Component Multi-Period Trajectory"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "مقارنة DIO و DSO و DPO ومحصلة CCC" : "Line trend for DIO, DSO, DPO and net CCC days"}
                </p>
              </div>
              <span className="label-pill text-fg-3 font-mono text-[10px]">
                {periods.length} {isAr ? "فترات" : "Periods"}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={computedOutputs.map((o) => ({
                    period: o.periodLabel,
                    DIO: o.dio,
                    DSO: o.dso,
                    DPO: o.dpo,
                    CCC: o.ccc,
                  }))}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="period" stroke={T.colors.slate} fontSize={10} fontFamily="monospace" />
                  <YAxis stroke={T.colors.slate} fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: T.colors.surface, borderColor: "var(--line)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [`${val} Days`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Line type="monotone" dataKey="DIO" stroke={T.series[1]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="DSO" stroke={T.series[2]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="DPO" stroke={T.series[3]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="CCC" stroke={T.colors.emerald} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PERIODS COMPARISON TABLE */}
          <div className="panel-data p-5">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider mb-3">
              {isAr ? "جدول مقارنة المؤشرات عبر الفترات" : "Working Capital Cycle Multi-Period Table"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-line bg-ink-3 text-fg-3">
                    <th className="py-2 px-3">Period</th>
                    <th className="py-2 px-3 text-right">DIO (Days)</th>
                    <th className="py-2 px-3 text-right">DSO (Days)</th>
                    <th className="py-2 px-3 text-right">DPO (Days)</th>
                    <th className="py-2 px-3 text-right font-bold text-emerald">CCC (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {computedOutputs.map((out) => (
                    <tr
                      key={out.periodLabel}
                      className={`hover:bg-ink-3 transition-colors cursor-pointer ${
                        out.periodLabel === currentPeriod.periodLabel ? "bg-emerald/5 font-bold" : ""
                      }`}
                      onClick={() => {
                        const target = periods.find((p) => p.periodLabel === out.periodLabel);
                        if (target) setActivePeriodId(target.periodId);
                      }}
                    >
                      <td className="py-2.5 px-3 font-medium text-fg flex items-center gap-1.5">
                        {out.periodLabel === currentPeriod.periodLabel && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                        )}
                        <span>{out.periodLabel}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">{out.dio}</td>
                      <td className="py-2.5 px-3 text-right">{out.dso}</td>
                      <td className="py-2.5 px-3 text-right">{out.dpo}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald text-sm">
                        {out.ccc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-ink-3 rounded-lg border border-line text-xs font-sans text-fg-2 space-y-1">
              <div className="font-bold text-fg flex items-center gap-1.5">
                <HelpCircle size={14} className="text-emerald" />
                <span>{isAr ? "التفسير العملي للنتائج" : "Managerial Interpretation"}</span>
              </div>
              <p className="leading-relaxed">
                {currentOutput.ccc < 45
                  ? isAr
                    ? "الشركة تتمتع بدورة سيولة ممتازة وسريعة، مما يقلل الاعتماد على التسهيلات البنكية قصيرة الأجل."
                    : "The company possesses a highly lean cash cycle, requiring minimal short-term revolving debt."
                  : isAr
                  ? "دورة التحويل النقدي طويلة نسبياً؛ يُنصح بمراجعة شروط السداد مع العملاء أو تقليل فترات ركود المخزون."
                  : "Operating cash is tied up for an extended duration. Opportunities exist to tighten receivables or negotiate extended payment terms with vendors."}
              </p>
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

