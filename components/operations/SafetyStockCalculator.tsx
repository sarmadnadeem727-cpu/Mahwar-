// components/operations/SafetyStockCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { SafetyStockInputs, SafetyStockOutputs, AuditData } from "@/lib/operations/types";
import { computeSafetyStock, generateSafetyStockAudit } from "@/lib/operations/safetyStock";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

export default function SafetyStockCalculator() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [dailyDemand, setDailyDemand] = useState<number>(120);
  const [demandStdDev, setDemandStdDev] = useState<number>(25);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [leadTimeStdDev, setLeadTimeStdDev] = useState<number>(3);
  const [serviceLevelPct, setServiceLevelPct] = useState<number>(95);
  const [useManualZ, setUseManualZ] = useState<boolean>(false);
  const [customZScore, setCustomZScore] = useState<number>(1.645);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const inputs: SafetyStockInputs = {
    dailyDemand,
    demandStdDev,
    leadTimeDays,
    leadTimeStdDev,
    serviceLevelPct,
    useManualZ,
    customZScore,
  };

  const outputs: SafetyStockOutputs = computeSafetyStock(inputs);

  // Sync session state
  useEffect(() => {
    updateSessionAnalysis("safetyStock", {
      inputs,
      outputs: {
        safetyStock: outputs.safetyStock,
        reorderPoint: outputs.reorderPoint,
        zScore: outputs.zScore,
      },
      computedAt: new Date().toISOString(),
    });
  }, [dailyDemand, demandStdDev, leadTimeDays, leadTimeStdDev, serviceLevelPct, useManualZ, customZScore]);

  let validationError = "";
  if (dailyDemand <= 0) {
    validationError = isAr ? "يجب أن يكون متوسط الطلب اليومي أكبر من الصفر." : "Average daily demand must be greater than zero.";
  } else if (leadTimeDays <= 0) {
    validationError = isAr ? "يجب أن تكون فترة التوريد (Lead Time) أكبر من الصفر." : "Lead time must be greater than zero.";
  }

  const handleExportExcel = () => {
    const summary = [
      { Parameter: "Average Daily Demand (d)", Value: dailyDemand },
      { Parameter: "Daily Demand Std Dev (σ_d)", Value: demandStdDev },
      { Parameter: "Average Lead Time Days (LT)", Value: leadTimeDays },
      { Parameter: "Lead Time Std Dev (σ_LT)", Value: leadTimeStdDev },
      { Parameter: "Service Level Target (%)", Value: serviceLevelPct },
      { Parameter: "Z-Score", Value: outputs.zScore },
      { Parameter: "Combined Standard Deviation", Value: outputs.combinedStdDev },
      { Parameter: "Computed Safety Stock (units)", Value: outputs.safetyStock },
      { Parameter: "Expected Demand during Lead Time", Value: outputs.leadTimeDemand },
      { Parameter: "Reorder Point ROP (units)", Value: outputs.reorderPoint },
    ];
    exportToExcel(
      [
        { name: "Safety Stock Summary", data: summary },
        { name: "Service Level Tradeoff", data: outputs.sensitivityPoints },
      ],
      "MAHWAR_Safety_Stock_ROP_Model"
    );
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("safety-stock-container", "MAHWAR_Safety_Stock_ROP_Model");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateSafetyStockAudit(inputs, outputs);

  const sensitivityChartData = outputs.sensitivityPoints.map((pt) => ({
    name: `${pt.serviceLevel}%`,
    safetyStock: pt.safetyStock,
    isCurrent: pt.serviceLevel === serviceLevelPct,
  }));

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="safety-stock-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="INVENTORY & ORDERING"
        categoryTagAr="المخزون وأوامر التوريد"
        title="Safety Stock & Reorder Point (ROP) Calculator"
        titleAr="حاسبة مخزون الأمان ونقطة إعادة الطلب (ROP)"
        subtitle="Determine buffer inventory protecting against demand surges and supplier lead time volatility"
        subtitleAr="حساب المخزون الاحتياطي لحماية استمرارية العمليات ضد تقلبات المبيعات وتأخر شحنات الموردين"
        icon={<ShieldAlert size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setDailyDemand(120);
          setDemandStdDev(25);
          setLeadTimeDays(14);
          setLeadTimeStdDev(3);
          setServiceLevelPct(95);
          setUseManualZ(false);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* SAFETY STOCK */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "مخزون الأمان المطلوب" : "Required Safety Stock"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald">{outputs.safetyStock.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald">{isAr ? "وحدة" : "Units"}</span>
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            {isAr ? `يحقق نسبة خدمة ${serviceLevelPct}%` : `Guarantees ${serviceLevelPct}% cycle service rate`}
          </span>
        </div>

        {/* REORDER POINT (ROP) */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "نقطة إعادة الطلب (ROP)" : "Reorder Point (ROP)"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{outputs.reorderPoint.toLocaleString()}</span>
            <span className="text-xs font-bold text-fg-3">{isAr ? "وحدة" : "Units"}</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {isAr ? "أصدر أمر شراء فور بلوغ هذا الرصيد" : "Trigger order immediately when hit"}
          </span>
        </div>

        {/* LEAD TIME DEMAND */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "الاستهلاك المتوقع خلال التوريد" : "Expected Lead Time Demand"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{outputs.leadTimeDemand.toLocaleString()}</span>
            <span className="text-xs font-bold text-fg-3">{isAr ? "وحدة" : "Units"}</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {dailyDemand} units/day × {leadTimeDays} days LT
          </span>
        </div>

        {/* STATISTICAL Z-SCORE */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "معامل الخدمة الإحصائي (Z)" : "Statistical Z-Factor"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{outputs.zScore}</span>
            <span className="text-xs font-bold text-fg-3">σ</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Combined σ = {outputs.combinedStdDev} units
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
              {isAr ? "معلمات الطلب وفترة التوريد" : "Demand & Lead Time Variability"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "متوسط الطلب اليومي (d)" : "Average Daily Demand (d)"} ({isAr ? "وحدة/يوم" : "Units/day"})
                </label>
                <input
                  type="number"
                  value={dailyDemand}
                  onChange={(e) => setDailyDemand(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الانحراف المعياري للطلب اليومي (σ_d)" : "Std Deviation of Daily Demand (σ_d)"}
                </label>
                <input
                  type="number"
                  value={demandStdDev}
                  onChange={(e) => setDemandStdDev(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-fg-3 block mt-0.5">
                  Measures day-to-day demand volatility
                </span>
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "متوسط فترة التوريد بالأيام (LT)" : "Average Lead Time (LT Days)"}
                </label>
                <input
                  type="number"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الانحراف المعياري لفترة التوريد (σ_LT)" : "Std Deviation of Lead Time (σ_LT Days)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={leadTimeStdDev}
                  onChange={(e) => setLeadTimeStdDev(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-fg-3 block mt-0.5">
                  Set to 0 if supplier delivery lead time is completely constant
                </span>
              </div>

              {/* SERVICE LEVEL SELECTOR */}
              <div className="p-3.5 bg-ink-3 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-fg">
                    {isAr ? "مستوى الخدمة المستهدف (%)" : "Target Service Level (%)"}
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-fg-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useManualZ}
                      onChange={(e) => setUseManualZ(e.target.checked)}
                      className="rounded text-emerald"
                    />
                    <span>{isAr ? "إدخال Z يدوياً" : "Custom Z"}</span>
                  </label>
                </div>

                {!useManualZ ? (
                  <div className="grid grid-cols-5 gap-1 pt-1 font-mono text-xs">
                    {[90, 95, 97.5, 99, 99.9].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setServiceLevelPct(lvl)}
                        className={`py-1.5 rounded text-center transition-all cursor-pointer font-bold ${
                          serviceLevelPct === lvl
                            ? "bg-emerald text-ink-0 shadow-2xs"
                            : "bg-ink-2 text-fg-2 hover:bg-ink-4 border border-line"
                        }`}
                      >
                        {lvl}%
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={customZScore}
                      onChange={(e) => setCustomZScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs font-bold"
                    />
                    <span className="text-[10px] text-fg-3 block mt-1">
                      Direct standard normal score Z (e.g., 1.645 for 95%, 2.33 for 99%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SENSITIVITY CHART COLUMN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مخطط حساسية مقايضة التكلفة ومستوى الخدمة" : "Cost-Service Level Tradeoff Curve"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr
                    ? "ارتفاع مستوى الخدمة فوق 95% يتطلب زيادة غير خطية في مخزون الأمان"
                    : "Pushing service level above 95% requires exponentially higher buffer investment"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                Z = {outputs.zScore}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensitivityChartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="name" stroke={T.colors.slate} fontSize={10} fontFamily="monospace" />
                  <YAxis stroke={T.colors.slate} fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: T.colors.surface, borderColor: "var(--line)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [`${val} Units`, "Safety Stock"]}
                  />
                  <Bar dataKey="safetyStock" radius={[4, 4, 0, 0]}>
                    {sensitivityChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? T.colors.emerald : T.colors.neutral}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SENSITIVITY TABLE */}
          <div className="panel-data p-5">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider mb-3">
              {isAr ? "جدول مقايضة مستويات الخدمة" : "Service Level Lookup Matrix"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-line bg-ink-3 text-fg-3">
                    <th className="py-2 px-3">Service Level</th>
                    <th className="py-2 px-3 text-right">Z-Score</th>
                    <th className="py-2 px-3 text-right">Safety Stock</th>
                    <th className="py-2 px-3 text-right font-bold text-emerald">Reorder Point (ROP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {outputs.sensitivityPoints.map((pt) => {
                    const isSelected = pt.serviceLevel === serviceLevelPct;
                    return (
                      <tr
                        key={pt.serviceLevel}
                        className={`hover:bg-ink-3 transition-colors cursor-pointer ${
                          isSelected ? "bg-emerald/5 font-bold" : ""
                        }`}
                        onClick={() => {
                          setServiceLevelPct(pt.serviceLevel);
                          setUseManualZ(false);
                        }}
                      >
                        <td className="py-2 px-3 font-medium text-fg flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald" />}
                          <span>{pt.serviceLevel}%</span>
                        </td>
                        <td className="py-2 px-3 text-right">{pt.z}</td>
                        <td className="py-2 px-3 text-right">{pt.safetyStock} units</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald">{pt.reorderPoint} units</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-ink-3 rounded-lg border border-line text-xs font-sans text-fg-2">
              <span className="font-bold text-fg block mb-1">
                {isAr ? "تحليل الكفاءة والمخاطر" : "Operational Insight:"}
              </span>
              {isAr
                ? "زيادة مستوى الخدمة من 95% إلى 99.9% تضاعف مخزون الأمان تقريباً لتغطية حالات النفاذ النادرة. اختر المستوى الذي يوازن تكلفة التخزين مع أثر نفاذ المخزون على العميل."
                : "Notice how moving from 95% to 99.9% service level almost doubles required buffer units for marginal availability gains. Align service goals with customer criticality."}
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

