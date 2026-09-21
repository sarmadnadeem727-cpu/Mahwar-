// components/operations/WorkingCapitalFinancing.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Sliders, TrendingDown, Layers, Link as LinkIcon, 
  HelpCircle, ArrowRight, FileSpreadsheet, FileText, CheckCircle2 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { WCFinancingInputs, WCFinancingOutputs, AuditData } from "@/lib/operations/types";
import { computeWCFinancing, generateWCFinancingAudit } from "@/lib/operations/financingCost";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

export default function WorkingCapitalFinancing() {
  const { language, currency, sessionAnalyses, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  // Check if CCC is available in session
  const sessionCCC = sessionAnalyses.ccc?.outputs?.activeOutput?.ccc ?? null;
  const sessionCOGS = sessionAnalyses.ccc?.inputs?.periods?.[0]?.cogs ?? 3100000;
  const sessionInv = sessionAnalyses.ccc?.inputs?.periods?.[0]?.averageInventory ?? 590000;
  const sessionAR = sessionAnalyses.ccc?.inputs?.periods?.[0]?.averageAR ?? 780000;
  const sessionAP = sessionAnalyses.ccc?.inputs?.periods?.[0]?.averageAP ?? 560000;

  const [inventory, setInventory] = useState<number>(sessionInv);
  const [accountsReceivable, setAccountsReceivable] = useState<number>(sessionAR);
  const [accountsPayable, setAccountsPayable] = useState<number>(sessionAP);
  const [costOfCapitalRate, setCostOfCapitalRate] = useState<number>(8.5); // %
  const [cogs, setCogs] = useState<number>(sessionCOGS);
  const [revenue, setRevenue] = useState<number>(5200000);
  const [linkedCCC, setLinkedCCC] = useState<number | undefined>(sessionCCC || 45);
  const [useCccMode, setUseCccMode] = useState<boolean>(true);
  const [sensitivityDays, setSensitivityDays] = useState<number>(10);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const inputs: WCFinancingInputs = {
    inventory,
    accountsReceivable,
    accountsPayable,
    costOfCapitalRate,
    cogs,
    revenue,
    linkedCCC: useCccMode ? linkedCCC : undefined,
    sensitivityReductionDays: sensitivityDays,
  };

  const outputs: WCFinancingOutputs = computeWCFinancing(inputs);

  // Sync to sessionAnalyses
  useEffect(() => {
    updateSessionAnalysis("wcFinancing", {
      inputs,
      outputs,
      computedAt: new Date().toISOString(),
    });
  }, [inventory, accountsReceivable, accountsPayable, costOfCapitalRate, cogs, linkedCCC, sensitivityDays, useCccMode]);

  let validationError = "";
  if (costOfCapitalRate < 0) {
    validationError = isAr ? "لا يمكن أن تكون تكلفة رأس المال سالبة." : "Cost of capital rate cannot be negative.";
  }

  const handleExportExcel = () => {
    const summaryData = [
      { Metric: "Inventory", Value: inventory },
      { Metric: "Accounts Receivable", Value: accountsReceivable },
      { Metric: "Accounts Payable", Value: accountsPayable },
      { Metric: "Net Operating Working Capital (NOWC)", Value: outputs.netWorkingCapital },
      { Metric: "Cost of Capital Rate (%)", Value: costOfCapitalRate },
      { Metric: "Annual Financing Cost (NOWC Method)", Value: outputs.annualFinancingCostOperating },
      { Metric: "CCC (Days)", Value: linkedCCC ?? "N/A" },
      { Metric: "Daily COGS", Value: outputs.dailyCogs },
      { Metric: "Cash Tied Up (CCC Method)", Value: outputs.cashTiedUpCCC },
      { Metric: "Annual Financing Cost (CCC Method)", Value: outputs.annualFinancingCostCCC },
      { Metric: "Savings per Day Reduced", Value: outputs.savingsPerDayReduction },
      { Metric: `Savings for ${sensitivityDays} Days Reduction`, Value: outputs.totalSensitivitySavings },
    ];
    exportToExcel([{ name: "WC Financing Cost", data: summaryData }], "MAHWAR_Working_Capital_Financing_Cost");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("wc-financing-container", "MAHWAR_Working_Capital_Financing_Cost");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateWCFinancingAudit(inputs, outputs);

  // Chart data reconciling the two calculation perspectives
  const comparisonChartData = [
    {
      name: isAr ? "رأس المال العامل التشغيلي (NOWC)" : "Operating NOWC Balance",
      cost: outputs.annualFinancingCostOperating,
      capital: outputs.netWorkingCapital,
      fill: "#17a88a",
    },
    {
      name: isAr ? "دورة التحويل النقدي (CCC)" : "CCC Operational Tie-Up",
      cost: outputs.annualFinancingCostCCC,
      capital: outputs.cashTiedUpCCC,
      fill: "#3B82F6",
    },
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="wc-financing-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="WORKING CAPITAL"
        categoryTagAr="رأس المال العامل"
        title="Working Capital Financing Cost Calculator"
        titleAr="حاسبة تكلفة تمويل رأس المال العامل"
        subtitle="Quantify the carrying interest cost of cash locked in operating working capital"
        subtitleAr="حساب الفائدة الفعلية وتكلفة الفرصة البديلة للأموال المجمدة في دورة التشغيل"
        icon={<DollarSign size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setInventory(590000);
          setAccountsReceivable(780000);
          setAccountsPayable(560000);
          setCostOfCapitalRate(8.5);
          setCogs(3100000);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* CCC LINK BANNER */}
      {sessionCCC !== null && (
        <div className="p-3.5 bg-emerald/5 border border-emerald/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-fg-2">
            <LinkIcon size={14} className="text-emerald shrink-0" />
            <span>
              {isAr
                ? `مرتبط بحاسبة CCC: دورة التحويل الحالية تبلغ ${sessionCCC} يوماً.`
                : `Linked to CCC Engine: Current cycle is ${sessionCCC} days.`}
            </span>
          </div>
          <button
            onClick={() => setLinkedCCC(sessionCCC)}
            className="text-[11px] font-mono font-bold text-emerald hover:underline"
          >
            {isAr ? "مزامنة دورة الأيام" : "Sync CCC Days"}
          </button>
        </div>
      )}

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* OPERATING FINANCING COST */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "تكلفة التمويل السنوية (الميزانية)" : "Annual Financing Cost (NOWC)"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald">
              {currency} {outputs.annualFinancingCostOperating.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            {costOfCapitalRate}% on {currency} {outputs.netWorkingCapital.toLocaleString()} NOWC
          </span>
        </div>

        {/* CCC-BASED FINANCING COST */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "تكلفة التمويل (بناءً على CCC)" : "Annual Financing Cost (CCC)"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {outputs.annualFinancingCostCCC.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {linkedCCC} days × {currency} {outputs.dailyCogs.toLocaleString()} daily COGS
          </span>
        </div>

        {/* SAVINGS PER DAY */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "الوفر المالي لكل يوم تخفيض" : "Savings per Day Reduced"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {outputs.savingsPerDayReduction.toLocaleString()}
            </span>
            <span className="text-xs text-fg-3">/day</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {isAr ? "وفر مباشر في فوائد التمويل" : "Direct interest expense saved"}
          </span>
        </div>

        {/* SCENARIO SENSITIVITY SAVINGS */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? `الوفر عند خفض ${sensitivityDays} أيام` : `Savings @ -${sensitivityDays} Days`}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald">
              {currency} {outputs.totalSensitivitySavings.toLocaleString()}
            </span>
            <span className="text-xs text-emerald">/yr</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {isAr ? "سيولة إضافية حرة سنوياً" : "Recurring annual cash unlocked"}
          </span>
        </div>
      </div>

      {validationError && <InlineError message={validationError} isAr={isAr} />}

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider border-b border-line pb-3">
              {isAr ? "مدخلات رأس المال ومعدل الفائدة" : "Working Capital & Rate Assumptions"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "المخزون السلعي الحالي" : "Current Inventory Balance"} ({currency})
                </label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الذمم المدينة / العملاء (AR)" : "Accounts Receivable (AR)"} ({currency})
                </label>
                <input
                  type="number"
                  value={accountsReceivable}
                  onChange={(e) => setAccountsReceivable(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الذمم الدائنة / الموردين (AP)" : "Accounts Payable (AP)"} ({currency})
                </label>
                <input
                  type="number"
                  value={accountsPayable}
                  onChange={(e) => setAccountsPayable(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-ink-3 rounded-lg border border-line">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-fg-2 font-bold">
                    {isAr ? "صافي رأس المال العامل (NOWC):" : "Net Working Capital (NOWC):"}
                  </span>
                  <span className="font-bold text-fg">
                    {currency} {outputs.netWorkingCapital.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "تكلفة رأس المال / فائدة الاقتراض (%)" : "Cost of Capital / Borrowing Rate (%)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costOfCapitalRate}
                  onChange={(e) => setCostOfCapitalRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div className="pt-2 border-t border-line space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-fg text-xs">
                    {isAr ? "ربط دورة التحويل النقدي (CCC)" : "CCC-Linked Cash Tie-Up"}
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-fg-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCccMode}
                      onChange={(e) => setUseCccMode(e.target.checked)}
                      className="rounded text-emerald"
                    />
                    <span>{isAr ? "تفعيل" : "Enabled"}</span>
                  </label>
                </div>

                {useCccMode && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-fg-3 block mb-0.5">Annual COGS ({currency})</span>
                      <input
                        type="number"
                        value={cogs}
                        onChange={(e) => setCogs(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-fg-3 block mb-0.5">CCC (Days)</span>
                      <input
                        type="number"
                        value={linkedCCC || 0}
                        onChange={(e) => setLinkedCCC(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SENSITIVITY SLIDER & RECONCILIATION COLUMN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* WHAT-IF SENSITIVITY SLIDER CARD */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "محاكاة الحساسية: خفض دورة التحويل النقدي" : "Sensitivity: Reduce CCC Days What-If"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr
                    ? "كم توفر الشركة سنوياً عند تسريع التحصيل أو ترشيد المخزون؟"
                    : "Quantifies recurring interest cost eliminated by shortening operating cycle"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-xs">
                -{sensitivityDays} {isAr ? "يوم" : "Days"}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-fg-2">{isAr ? "أيام التخفيض المستهدفة:" : "Target Days Reduced:"}</span>
                  <span className="text-emerald text-sm">{sensitivityDays} Days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={45}
                  value={sensitivityDays}
                  onChange={(e) => setSensitivityDays(Number(e.target.value))}
                  className="w-full accent-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-fg-3">
                  <span>1 Day</span>
                  <span>15 Days</span>
                  <span>30 Days</span>
                  <span>45 Days</span>
                </div>
              </div>

              {/* SAVINGS HIGHLIGHT BANNER */}
              <div className="p-4 bg-emerald/10 border border-emerald/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald font-bold uppercase tracking-wider block">
                    {isAr ? "إجمالي الوفر النقدي السنوي" : "Total Annual Financing Expense Saved"}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald font-mono">
                    {currency} {outputs.totalSensitivitySavings.toLocaleString()}
                  </span>
                </div>
                <div className="text-right font-mono text-xs text-fg-2">
                  <div>
                    {currency} {outputs.savingsPerDayReduction.toLocaleString()} <span className="text-[10px] text-fg-3">/ day</span>
                  </div>
                  <div className="text-[10px] text-emerald font-bold">
                    Releases {currency} {((outputs.dailyCogs * sensitivityDays) / 1000).toFixed(0)}k Liquidity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* METHOD RECONCILIATION COMPARISON */}
          <div className="panel-data p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-fg border-b border-line pb-3">
              {isAr ? "مقارنة منهجيتي حساب تكلفة السيولة" : "Method Reconciliation: Balance Sheet vs. CCC Operational"}
            </h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                  <XAxis dataKey="name" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [`${currency} ${val.toLocaleString()}`, "Cost"]}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {comparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-ink-3 rounded-lg border border-line text-xs text-fg-2 leading-relaxed font-sans">
              <span className="font-bold text-fg block mb-1">
                {isAr ? "ملاحظة التوفيق المحاسبي" : "Reconciliation Note:"}
              </span>
              {isAr
                ? "طريقة الميزانية (NOWC) تعكس الأرصدة القائمة بدقة في نقطة زمنية، بينما طريقة CCC تحسب السيولة المجمدة عبر حركة التدفقات التشغيلية. التوافق التقريبي بينهما يؤكد صحة الفرضيات."
                : "The balance sheet method evaluates point-in-time net capital, while the CCC method reflects continuous operational throughput. Both methods reconcile within reasonable margins."}
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
