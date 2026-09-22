// components/operations/SopWorksheet.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { AuditData } from "@/lib/operations/types";
import { computeSopWorksheet, generateSopAudit } from "@/lib/operations/sopWorksheet";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

const INITIAL_PLANS = [
  { period: 1, label: "M1", plannedSupply: 450, demand: 420, targetSafetyStock: 150 },
  { period: 2, label: "M2", plannedSupply: 450, demand: 440, targetSafetyStock: 150 },
  { period: 3, label: "M3", plannedSupply: 480, demand: 490, targetSafetyStock: 160 },
  { period: 4, label: "M4", plannedSupply: 500, demand: 530, targetSafetyStock: 160 },
  { period: 5, label: "M5", plannedSupply: 520, demand: 560, targetSafetyStock: 170 },
  { period: 6, label: "M6", plannedSupply: 550, demand: 540, targetSafetyStock: 170 },
  { period: 7, label: "M7", plannedSupply: 520, demand: 510, targetSafetyStock: 170 },
  { period: 8, label: "M8", plannedSupply: 500, demand: 480, targetSafetyStock: 160 },
  { period: 9, label: "M9", plannedSupply: 480, demand: 460, targetSafetyStock: 160 },
  { period: 10, label: "M10", plannedSupply: 460, demand: 470, targetSafetyStock: 150 },
  { period: 11, label: "M11", plannedSupply: 460, demand: 490, targetSafetyStock: 150 },
  { period: 12, label: "M12", plannedSupply: 500, demand: 510, targetSafetyStock: 150 },
];

export default function SopWorksheet() {
  const { language, sessionAnalyses, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [initialBeginning, setInitialBeginning] = useState<number>(300);
  const [plans, setPlans] = useState(INITIAL_PLANS);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Check integrations
  const forecastAvailable = Boolean(sessionAnalyses.demandForecast?.outputs?.forecasts);
  const safetyStockAvailable = Boolean(sessionAnalyses.safetyStock?.outputs?.safetyStock);

  const { rows, summary } = computeSopWorksheet(initialBeginning, plans);

  // Sync session state
  useEffect(() => {
    updateSessionAnalysis("sopWorksheet", {
      inputs: { initialBeginning, plans },
      outputs: { rows, summary },
      computedAt: new Date().toISOString(),
    });
  }, [initialBeginning, plans]);

  const pullForecast = () => {
    const forecasts = sessionAnalyses.demandForecast?.outputs?.forecasts;
    if (!forecasts || forecasts.length === 0) return;
    setPlans((prev) =>
      prev.map((p, idx) => {
        if (idx < forecasts.length) {
          return { ...p, demand: Math.round(forecasts[idx].forecastValue) };
        }
        return p;
      })
    );
  };

  const pullSafetyStock = () => {
    const ss = sessionAnalyses.safetyStock?.outputs?.safetyStock;
    if (ss === undefined) return;
    setPlans((prev) => prev.map((p) => ({ ...p, targetSafetyStock: ss })));
  };

  const updatePlanField = (index: number, field: "plannedSupply" | "demand" | "targetSafetyStock", val: number) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: val };
    setPlans(updated);
  };

  const handleExportExcel = () => {
    const exportRows = rows.map((r) => ({
      Period: r.label,
      "Beginning Inventory": r.beginningInventory,
      "Planned Supply": r.plannedSupply,
      Demand: r.demand,
      "Ending Inventory": r.endingInventory,
      "Target Safety Stock": r.targetSafetyStock,
      "Position vs Target": r.inventoryPositionVsTarget,
      Status: r.status,
    }));
    exportToExcel([{ name: "S&OP Worksheet", data: exportRows }], "MAHWAR_SOP_Supply_Demand_Balancing");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("sop-container", "MAHWAR_SOP_Supply_Demand_Balancing");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateSopAudit(rows);

  const chartData = rows.map((r) => ({
    name: r.label,
    Supply: r.plannedSupply,
    Demand: r.demand,
    EndingInventory: r.endingInventory,
    TargetSafetyStock: r.targetSafetyStock,
  }));

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="sop-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="PLANNING & FORECASTING"
        categoryTagAr="التخطيط والتنبؤ"
        title="S&OP Supply / Demand Balancing Worksheet"
        titleAr="جدول موازنة العرض والطلب (S&OP)"
        subtitle="Balance production schedules against demand forecasts with stockout and safety stock alerts"
        subtitleAr="موازنة خطط التوريد والإنتاج مع توقعات المبيعات مع تنبيهات النفاذ وتتبع مخزون الأمان"
        icon={<FileSpreadsheet size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setInitialBeginning(300);
          setPlans(INITIAL_PLANS);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* CROSS-TOOL DATA BRIDGES */}
      <div className="flex flex-wrap items-center gap-3">
        {forecastAvailable && (
          <button
            onClick={pullForecast}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-xs font-mono font-bold hover:bg-emerald/15 transition-all cursor-pointer"
          >
            <ArrowUpRight size={13} />
            <span>{isAr ? "استيراد توقعات الطلب من أداة التنبؤ" : "Pull from Demand Forecast Tool"}</span>
          </button>
        )}
        {safetyStockAvailable && (
          <button
            onClick={pullSafetyStock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald text-xs font-mono font-bold hover:bg-emerald/15 transition-all cursor-pointer"
          >
            <ArrowUpRight size={13} />
            <span>{isAr ? "استيراد مخزون الأمان من أداة الأمان" : "Pull Target from Safety Stock Tool"}</span>
          </button>
        )}
      </div>

      {/* KPI SUMMARY TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* STOCKOUT ALERTS */}
        <div className={`p-4 rounded-xl border shadow-xs ${summary.stockoutCount > 0 ? "border-neg/30 bg-neg/10 text-neg" : "border-emerald/30 bg-emerald/10 text-emerald"}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold">
              {isAr ? "فترات النفاذ والعجز" : "Stockout Periods"}
            </span>
            {summary.stockoutCount > 0 ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
          </div>
          <span className="text-2xl font-extrabold">{summary.stockoutCount}</span>
          <span className="text-[10px] font-sans font-medium block mt-1">
            {summary.stockoutCount > 0 ? "Critical shortage bottleneck" : "Zero projected stockouts"}
          </span>
        </div>

        {/* BELOW SAFETY STOCK */}
        <div className={`p-4 rounded-xl border shadow-xs ${summary.belowSafetyCount > 0 ? "border-gold/40 bg-gold/10 text-gold" : "border-line bg-ink-2 text-fg"}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold text-fg-3">
              {isAr ? "تحت مخزون الأمان" : "Below Safety Stock"}
            </span>
            <AlertTriangle size={14} className={summary.belowSafetyCount > 0 ? "text-gold" : "text-fg-3"} />
          </div>
          <span className="text-2xl font-extrabold">{summary.belowSafetyCount}</span>
          <span className="text-[10px] font-sans font-medium block mt-1 text-fg-3">
            Periods below target buffer
          </span>
        </div>

        {/* AVERAGE ENDING INVENTORY */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "متوسط رصيد المخزون" : "Average Ending Inventory"}
          </span>
          <span className="text-2xl font-extrabold text-fg">
            {summary.averageEndingInventory.toLocaleString()}
          </span>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Units across 12-month horizon
          </span>
        </div>

        {/* MINIMUM ENDING INVENTORY */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "أدنى رصيد متوقع" : "Minimum Inventory Trough"}
          </span>
          <span className={`text-2xl font-extrabold ${summary.minEndingInventory < 0 ? "text-neg" : "text-fg"}`}>
            {summary.minEndingInventory.toLocaleString()}
          </span>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Max: {summary.maxEndingInventory.toLocaleString()} units
          </span>
        </div>
      </div>

      {/* TRAJECTORY CHART WITH SAFETY STOCK REFERENCE */}
      <div className="panel-data p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-line pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-fg">
              {isAr ? "مسار المخزون المستقبلي مقابل حدود الأمان" : "Inventory Trajectory vs. Safety Stock Target"}
            </h3>
            <p className="text-[11px] text-fg-3 font-sans font-medium">
              {isAr ? "مقارنة التوريد والطلب مع مسار الرصيد النهائي" : "Rolling trajectory with target buffer reference line"}
            </p>
          </div>
          <span className="label-pill label-pill-emerald text-[10px]">
            12-MONTH HORIZON
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
              <XAxis dataKey="name" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
              <Bar dataKey="Supply" name="Planned Supply" fill="#6d817a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Demand" name="Forecast Demand" fill="#6d817a" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="EndingInventory" name="Ending Inventory" stroke="#17a88a" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="step" dataKey="TargetSafetyStock" name="Target Safety Buffer" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SPREADSHEET BALANCING GRID */}
      <div className="panel-data p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
              {isAr ? "جدول موازنة الخطط الدورية التفاعلي" : "Rolling Horizon Interactive Plan Grid"}
            </h3>
            <p className="text-[11px] text-fg-3 font-sans font-medium">
              {isAr ? "يمكنك تعديل كميات التوريد والطلب مباشرة في الخلايا" : "Edit Supply and Demand directly in table cells below"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-fg-3 font-bold">Beginning Inv (M1):</span>
            <input
              type="number"
              value={initialBeginning}
              onChange={(e) => setInitialBeginning(Number(e.target.value))}
              className="w-24 px-2 py-1 rounded bg-ink-3 border border-line font-bold text-right text-emerald"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-line bg-ink-3 text-fg-3">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3 text-right">Beginning</th>
                <th className="py-2.5 px-3 text-right">Planned Supply</th>
                <th className="py-2.5 px-3 text-right">Demand</th>
                <th className="py-2.5 px-3 text-right font-bold">Ending Inv</th>
                <th className="py-2.5 px-3 text-right">Target Buffer</th>
                <th className="py-2.5 px-3 text-right">Position</th>
                <th className="py-2.5 px-3 text-center">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, idx) => {
                let badgeClass = "bg-emerald/10 text-emerald border border-emerald/30";
                let statusLabel = isAr ? "آمن" : "HEALTHY";

                if (row.status === "STOCKOUT") {
                  badgeClass = "bg-neg/10 text-neg border border-neg/30 font-bold";
                  statusLabel = isAr ? "نفاذ (عجز)" : "STOCKOUT";
                } else if (row.status === "BELOW_SAFETY_STOCK") {
                  badgeClass = "bg-gold/10 text-gold border border-gold/40";
                  statusLabel = isAr ? "تحت الأمان" : "LOW BUFFER";
                }

                return (
                  <tr key={row.period} className="hover:bg-ink-3 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-fg">{row.label}</td>
                    <td className="py-2.5 px-3 text-right text-fg-3">{row.beginningInventory.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        value={plans[idx].plannedSupply}
                        onChange={(e) => updatePlanField(idx, "plannedSupply", Number(e.target.value))}
                        className="w-20 px-1.5 py-0.5 rounded bg-ink-2 border border-line text-right font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        value={plans[idx].demand}
                        onChange={(e) => updatePlanField(idx, "demand", Number(e.target.value))}
                        className="w-20 px-1.5 py-0.5 rounded bg-ink-2 border border-line text-right"
                      />
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${row.endingInventory < 0 ? "text-neg font-extrabold" : "text-fg"}`}>
                      {row.endingInventory.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        value={plans[idx].targetSafetyStock}
                        onChange={(e) => updatePlanField(idx, "targetSafetyStock", Number(e.target.value))}
                        className="w-18 px-1.5 py-0.5 rounded bg-ink-2 border border-line text-right text-fg-3"
                      />
                    </td>
                    <td className={`py-2.5 px-3 text-right ${row.inventoryPositionVsTarget < 0 ? "text-neg" : "text-fg-3"}`}>
                      {row.inventoryPositionVsTarget > 0 ? `+${row.inventoryPositionVsTarget}` : row.inventoryPositionVsTarget}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

