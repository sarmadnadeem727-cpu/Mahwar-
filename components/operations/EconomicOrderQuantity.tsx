// components/operations/EconomicOrderQuantity.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PackageCheck, TrendingDown, Layers, ArrowRight, HelpCircle, 
  Boxes, Calendar, DollarSign, CheckCircle2, Sliders 
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceDot 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { EOQInputs, EOQOutputs, AuditData } from "@/lib/operations/types";
import { computeEOQ, generateEOQAudit } from "@/lib/operations/eoq";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

export default function EconomicOrderQuantity() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [annualDemand, setAnnualDemand] = useState<number>(10000);
  const [orderSetupCost, setOrderSetupCost] = useState<number>(250);
  const [holdingCostMode, setHoldingCostMode] = useState<'direct' | 'percentage'>('direct');
  const [directHoldingCost, setDirectHoldingCost] = useState<number>(4.5);
  const [unitCost, setUnitCost] = useState<number>(45);
  const [holdingCostPct, setHoldingCostPct] = useState<number>(15);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const inputs: EOQInputs = {
    annualDemand,
    orderSetupCost,
    holdingCostMode,
    directHoldingCost,
    unitCost,
    holdingCostPct,
  };

  const outputs: EOQOutputs = computeEOQ(inputs);

  // Sync session state
  useEffect(() => {
    updateSessionAnalysis("eoq", {
      inputs,
      outputs: { eoq: outputs.eoq, totalAnnualCost: outputs.totalAnnualCost },
      computedAt: new Date().toISOString(),
    });
  }, [annualDemand, orderSetupCost, holdingCostMode, directHoldingCost, unitCost, holdingCostPct]);

  let validationError = "";
  if (annualDemand <= 0) {
    validationError = isAr ? "يجب أن يكون الطلب السنوي أكبر من الصفر." : "Annual demand must be greater than zero.";
  } else if (orderSetupCost <= 0) {
    validationError = isAr ? "يجب أن تكون تكلفة إصدار أمر التوريد أكبر من الصفر." : "Order setup cost must be greater than zero.";
  } else if (outputs.effectiveHoldingCost <= 0) {
    validationError = isAr ? "يجب أن تكون تكلفة التخزين السنوية للوحدة أكبر من الصفر." : "Holding cost per unit must be greater than zero.";
  }

  const handleExportExcel = () => {
    const summaryData = [
      { Metric: "Annual Demand (D)", Value: annualDemand },
      { Metric: "Ordering Cost per Order (S)", Value: orderSetupCost },
      { Metric: "Holding Cost per Unit (H)", Value: outputs.effectiveHoldingCost },
      { Metric: "Unit Purchase Price (C)", Value: unitCost },
      { Metric: "Optimal Order Quantity (EOQ)", Value: outputs.eoq },
      { Metric: "Orders per Year", Value: outputs.ordersPerYear },
      { Metric: "Days Between Orders", Value: outputs.daysBetweenOrders },
      { Metric: "Annual Ordering Cost", Value: outputs.annualOrderingCost },
      { Metric: "Annual Holding Cost", Value: outputs.annualHoldingCost },
      { Metric: "Total Annual Inventory Cost", Value: outputs.annualInventoryCost },
      { Metric: "Total Cost (including purchase)", Value: outputs.totalAnnualCost },
    ];
    exportToExcel([{ name: "EOQ Optimization", data: summaryData }], "MAHWAR_EOQ_Inventory_Model");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("eoq-container", "MAHWAR_EOQ_Inventory_Model");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateEOQAudit(inputs, outputs);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-slate-800"
      dir={isAr ? "rtl" : "ltr"}
      id="eoq-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="INVENTORY & ORDERING"
        categoryTagAr="المخزون وأوامر التوريد"
        title="Economic Order Quantity (EOQ) Optimizer"
        titleAr="محرك حجم الطلب الاقتصادي الأمثل (EOQ)"
        subtitle="Determine the optimal order batch size that minimizes aggregate holding and ordering costs"
        subtitleAr="تحديد الحجم المثالي لأمر الشراء الذي يحقق التوازن الأدنى بين تكلفة التخزين وتكلفة الطلب"
        icon={<PackageCheck size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setAnnualDemand(10000);
          setOrderSetupCost(250);
          setHoldingCostMode('direct');
          setDirectHoldingCost(4.5);
          setUnitCost(45);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* EOQ MASTER CARD */}
        <div className="p-4 rounded-xl border border-emerald-border bg-emerald-dim shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "حجم الطلب الأمثل (EOQ)" : "Optimal Order Batch (EOQ)"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald">{outputs.eoq.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald">{isAr ? "وحدة" : "Units"}</span>
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            {isAr ? "نقطة التكلفة الدنيا المؤكدة" : "Cost-minimizing batch quantity"}
          </span>
        </div>

        {/* ORDER FREQUENCY */}
        <div className="p-4 rounded-xl border border-surface-border bg-white shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">
            {isAr ? "عدد الأوامر السنوية" : "Orders per Year"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-heading">{outputs.ordersPerYear}</span>
            <span className="text-xs font-bold text-slate-muted">{isAr ? "أمر/سنة" : "Orders/yr"}</span>
          </div>
          <span className="text-[10px] text-slate-muted font-sans font-medium block mt-1">
            Every {outputs.daysBetweenOrders} {isAr ? "يوم" : "days cycle"}
          </span>
        </div>

        {/* INVENTORY MANAGEMENT COST */}
        <div className="p-4 rounded-xl border border-surface-border bg-white shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">
            {isAr ? "تكلفة إدارة المخزون (طلب + حفظ)" : "Total Annual Inventory Cost"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-heading">
              {currency} {outputs.annualInventoryCost.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-muted font-sans font-medium block mt-1">
            Ord: {currency} {outputs.annualOrderingCost.toLocaleString()} | Hld: {currency} {outputs.annualHoldingCost.toLocaleString()}
          </span>
        </div>

        {/* TOTAL BURDEN INCL PURCHASE */}
        <div className="p-4 rounded-xl border border-surface-border bg-white shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">
            {isAr ? "التكلفة الكلية مع الشراء" : "Total Annual Sourcing Cost"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-heading">
              {currency} {outputs.totalAnnualCost.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-muted font-sans font-medium block mt-1">
            Includes {currency} {outputs.annualPurchaseCost.toLocaleString()} materials
          </span>
        </div>
      </div>

      {validationError && <InlineError message={validationError} isAr={isAr} />}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider border-b border-surface-border pb-3">
              {isAr ? "افتراضات الطلب والتكاليف" : "Demand & Cost Drivers"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-body font-medium block mb-1">
                  {isAr ? "الطلب السنوي (D)" : "Annual Demand (D)"} ({isAr ? "وحدة/سنة" : "Units/year"})
                </label>
                <input
                  type="number"
                  value={annualDemand}
                  onChange={(e) => setAnnualDemand(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-slate-body font-medium block mb-1">
                  {isAr ? "تكلفة إصدار أمر التوريد (S)" : "Ordering / Setup Cost per Order (S)"} ({currency})
                </label>
                <input
                  type="number"
                  value={orderSetupCost}
                  onChange={(e) => setOrderSetupCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs font-bold"
                />
              </div>

              {/* HOLDING COST CONFIG WITH TOGGLE */}
              <div className="p-3.5 bg-surface-subtle rounded-lg border border-surface-border space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    {isAr ? "تكلفة الاحتفاظ بالمخزون (H)" : "Holding Cost per Unit / Year (H)"}
                  </span>
                  <div className="flex rounded border border-surface-border overflow-hidden text-[10px] font-mono">
                    <button
                      onClick={() => setHoldingCostMode('direct')}
                      className={`px-2 py-1 ${
                        holdingCostMode === 'direct' ? 'bg-emerald text-white font-bold' : 'bg-white text-slate-600'
                      }`}
                    >
                      {currency}/unit
                    </button>
                    <button
                      onClick={() => setHoldingCostMode('percentage')}
                      className={`px-2 py-1 ${
                        holdingCostMode === 'percentage' ? 'bg-emerald text-white font-bold' : 'bg-white text-slate-600'
                      }`}
                    >
                      % Unit Cost
                    </button>
                  </div>
                </div>

                {holdingCostMode === 'direct' ? (
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      value={directHoldingCost}
                      onChange={(e) => setDirectHoldingCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded bg-white border border-surface-border font-mono text-xs font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {currency} per unit per year in warehouse storage & capital
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Unit Purchase Cost ({currency})</span>
                      <input
                        type="number"
                        value={unitCost}
                        onChange={(e) => setUnitCost(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-white border border-surface-border font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Holding Cost (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={holdingCostPct}
                        onChange={(e) => setHoldingCostPct(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-white border border-surface-border font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="text-[11px] font-mono text-emerald font-bold pt-1 border-t border-surface-border flex justify-between">
                  <span>Effective Annual Holding (H):</span>
                  <span>{currency} {outputs.effectiveHoldingCost} / unit</span>
                </div>
              </div>

              {/* OPTIONAL PURCHASE COST */}
              {holdingCostMode === 'direct' && (
                <div>
                  <label className="text-slate-body font-medium block mb-1">
                    {isAr ? "تكلفة شراء الوحدة (C) — اختياري" : "Unit Purchase Cost (C) — Optional"} ({currency})
                  </label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COST CURVE CHART COLUMN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-heading">
                  {isAr ? "منحنى تكلفة المخزون الكلاسيكي (EOQ Tradeoff Curve)" : "EOQ Classic Cost Tradeoff Curve"}
                </h3>
                <p className="text-[11px] text-slate-muted font-sans font-medium">
                  {isAr
                    ? "نقطة التقاطع بين تكلفة الطلب وتكلفة التخزين تمثل أدنى تكلفة كلية"
                    : "The exact intersection of ordering and holding curves forms the global minimum total cost"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                MIN @ Q={outputs.eoq}
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={outputs.curveData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="q"
                    stroke="#64748B"
                    fontSize={10}
                    fontFamily="monospace"
                    label={{ value: "Order Batch Size (Q)", position: "insideBottom", offset: -2, fontSize: 10 }}
                  />
                  <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [`${currency} ${val.toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Line type="monotone" dataKey="orderingCost" name="Ordering Cost" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="holdingCost" name="Holding Cost" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalCost" name="Total Inventory Cost" stroke="#0E7C69" strokeWidth={3} dot={false} />
                  {/* Mark the optimal EOQ dot */}
                  <ReferenceDot
                    x={outputs.eoq}
                    y={outputs.annualInventoryCost}
                    r={6}
                    fill="#0E7C69"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INSIGHT CARD */}
          <div className="panel-input p-4 text-xs font-sans text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-emerald" />
              <span>{isAr ? "تحليل الكفاءة التشغيلية" : "Economic Lot Size Mechanics"}</span>
            </div>
            <p className="leading-relaxed">
              {isAr
                ? `طلب ${outputs.eoq} وحدة كل ${outputs.daysBetweenOrders} يوماً يحقق توازناً اقتصادياً تاماً؛ حيث تتساوى تكلفة أوامر الشراء السنوية (${currency} ${outputs.annualOrderingCost.toLocaleString()}) مع تكلفة التخزين السنوية (${currency} ${outputs.annualHoldingCost.toLocaleString()}).`
                : `Ordering batches of ${outputs.eoq} units every ${outputs.daysBetweenOrders} days achieves mathematical equilibrium. Annual setup expenditure (${currency} ${outputs.annualOrderingCost.toLocaleString()}) virtually equals warehouse holding burden (${currency} ${outputs.annualHoldingCost.toLocaleString()}).`}
            </p>
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
