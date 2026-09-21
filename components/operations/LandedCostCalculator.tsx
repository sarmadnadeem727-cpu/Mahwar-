// components/operations/LandedCostCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Ship, Anchor, DollarSign, Layers, Plus, Trash2, HelpCircle, 
  ArrowRight, FileSpreadsheet, CheckCircle2, Sliders, ArrowUpRight 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { SourcingScenario, LandedCostCalculation, AdditionalFee, AuditData } from "@/lib/operations/types";
import { computeLandedCost, generateLandedCostAudit } from "@/lib/operations/landedCost";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

const INITIAL_SCENARIOS: SourcingScenario[] = [
  {
    id: "sc-1",
    name: "Supplier A (Shanghai FOB)",
    origin: "China",
    units: 5000,
    unitCostFob: 65,
    freightCostTotal: 45000,
    insuranceCostTotal: 5500,
    dutyRatePct: 5.0,
    includeInsuranceInCustomsValue: false,
    fees: [
      { id: "f1", name: "Jeddah Islamic Port Handling", amount: 8500 },
      { id: "f2", name: "Customs Clearance & Brokerage", amount: 3500 },
      { id: "f3", name: "Documentation & Inspection SABER", amount: 2500 },
    ],
  },
  {
    id: "sc-2",
    name: "Supplier B (Jebel Ali DDP)",
    origin: "UAE (GCC Trade)",
    units: 5000,
    unitCostFob: 78,
    freightCostTotal: 12000,
    insuranceCostTotal: 1500,
    dutyRatePct: 0.0, // GCC duty exemption
    includeInsuranceInCustomsValue: false,
    fees: [
      { id: "f1", name: "Border Clearance & Trucking", amount: 4000 },
      { id: "f2", name: "Local Handling", amount: 1500 },
    ],
  },
];

export default function LandedCostCalculator() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [scenarios, setScenarios] = useState<SourcingScenario[]>(INITIAL_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sc-1");

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeIndex = scenarios.findIndex((s) => s.id === activeScenarioId);
  const currentScenario = scenarios[activeIndex >= 0 ? activeIndex : 0];
  const currentCalc = computeLandedCost(currentScenario);

  // Compute all calculations for comparison
  const allCalcs = scenarios.map((s) => ({
    scenario: s,
    calc: computeLandedCost(s),
  }));

  useEffect(() => {
    updateSessionAnalysis("landedCost", {
      inputs: { scenarios },
      outputs: { activeLandedCostPerUnit: currentCalc.landedCostPerUnit },
      computedAt: new Date().toISOString(),
    });
  }, [scenarios, currentCalc.landedCostPerUnit]);

  const updateActiveField = (field: keyof SourcingScenario, val: any) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? { ...s, [field]: val } : s))
    );
  };

  const addFee = () => {
    const newF: AdditionalFee = {
      id: `fee-${Date.now()}`,
      name: "Port Documentation",
      amount: 1500,
    };
    updateActiveField("fees", [...(currentScenario.fees || []), newF]);
  };

  const removeFee = (feeId: string) => {
    updateActiveField("fees", (currentScenario.fees || []).filter((f) => f.id !== feeId));
  };

  const updateFee = (feeId: string, field: "name" | "amount", val: any) => {
    updateActiveField(
      "fees",
      (currentScenario.fees || []).map((f) => (f.id === feeId ? { ...f, [field]: val } : f))
    );
  };

  const addScenario = () => {
    const nextIdx = scenarios.length + 1;
    const newSc: SourcingScenario = {
      id: `sc-${Date.now()}`,
      name: `Option ${nextIdx} (New Origin)`,
      origin: "India / Europe",
      units: currentScenario.units,
      unitCostFob: Math.round(currentScenario.unitCostFob * 0.95),
      freightCostTotal: currentScenario.freightCostTotal,
      insuranceCostTotal: currentScenario.insuranceCostTotal,
      dutyRatePct: 5.0,
      includeInsuranceInCustomsValue: false,
      fees: [...currentScenario.fees],
    };
    setScenarios([...scenarios, newSc]);
    setActiveScenarioId(newSc.id);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    const remaining = scenarios.filter((s) => s.id !== id);
    setScenarios(remaining);
    setActiveScenarioId(remaining[0].id);
  };

  const handleExportExcel = () => {
    const rows = allCalcs.map(({ scenario, calc }) => ({
      Scenario: scenario.name,
      Origin: scenario.origin,
      Units: scenario.units,
      "FOB Price/Unit": scenario.unitCostFob,
      "Total Product Cost": calc.productCostTotal,
      "Freight Cost": scenario.freightCostTotal,
      "Insurance Cost": scenario.insuranceCostTotal,
      "Customs Duty Rate (%)": scenario.dutyRatePct,
      "Customs Duty Amount": calc.customsDutyTotal,
      "Other Port Fees": calc.otherFeesTotal,
      "Total Landed Cost": calc.totalLandedCost,
      "Delivered Cost / Unit": calc.landedCostPerUnit,
      "Markup over FOB (%)": calc.effectiveMarkupPct,
    }));
    exportToExcel([{ name: "Landed Cost Comparison", data: rows }], "MAHWAR_Landed_Cost_Calculator");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("landed-cost-container", "MAHWAR_Landed_Cost_Calculator");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateLandedCostAudit(currentScenario, currentCalc);

  // Stacked chart data for all scenarios
  const comparisonData = allCalcs.map(({ scenario, calc }) => ({
    name: scenario.name,
    "FOB Product": Number(((calc.productCostTotal / scenario.units)).toFixed(2)),
    Freight: Number(((scenario.freightCostTotal / scenario.units)).toFixed(2)),
    Insurance: Number(((scenario.insuranceCostTotal / scenario.units)).toFixed(2)),
    Duty: Number(((calc.customsDutyTotal / scenario.units)).toFixed(2)),
    Fees: Number(((calc.otherFeesTotal / scenario.units)).toFixed(2)),
  }));

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="landed-cost-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="COST & SOURCING"
        categoryTagAr="التكاليف والتوريد"
        title="Delivered Landed Cost Calculator (GCC Import Model)"
        titleAr="حاسبة التكلفة الإجمالية الواصلة (Landed Cost)"
        subtitle="Compute the true delivered cost of imported merchandise beyond sticker purchase price"
        subtitleAr="حساب التكلفة الفعلية للسلع المستوردة متضمنة الشحن الدولي والرسوم الجمركية والتخليص والموانئ"
        icon={<Ship size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => setScenarios(INITIAL_SCENARIOS)}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* LANDED COST PER UNIT */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "التكلفة الواصلة للوحدة" : "Delivered Landed Cost / Unit"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald">{currentCalc.landedCostPerUnit}</span>
            <span className="text-xs font-bold text-emerald">{currency}</span>
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            vs {currency} {currentScenario.unitCostFob} FOB (+{currentCalc.effectiveMarkupPct}% markup)
          </span>
        </div>

        {/* TOTAL SHIPMENT LANDED */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "إجمالي تكلفة الشحنة الواصلة" : "Total Shipment Outlay"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {currentCalc.totalLandedCost.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            For {currentScenario.units.toLocaleString()} units
          </span>
        </div>

        {/* CUSTOMS DUTY */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "إجمالي الرسوم الجمركية" : "Assessed Customs Duty"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {currentCalc.customsDutyTotal.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {currentScenario.dutyRatePct}% on {currency} {currentCalc.customsValue.toLocaleString()} CIF/CFR
          </span>
        </div>

        {/* FREIGHT & LOGISTICS IMPACT */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "تكاليف الشحن والخدمات" : "Freight & Port Fees"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">
              {currency} {(currentScenario.freightCostTotal + currentCalc.otherFeesTotal).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {((((currentScenario.freightCostTotal + currentCalc.otherFeesTotal) / currentCalc.totalLandedCost) * 100).toFixed(1))}% of total landed cost
          </span>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            {/* SCENARIO SELECTOR */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                {isAr ? "خيارات التوريد والموردين" : "Sourcing Scenarios"}
              </span>
              <div className="flex items-center gap-1.5">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveScenarioId(s.id)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer truncate max-w-[130px] ${
                      activeScenarioId === s.id
                        ? "bg-emerald text-ink-0"
                        : "bg-ink-3 text-fg-2 hover:bg-ink-4"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                <button
                  onClick={addScenario}
                  className="p-1 rounded bg-ink-3 hover:bg-ink-4 text-emerald"
                  title="Add Sourcing Scenario"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* SCENARIO INPUTS */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Scenario Label</label>
                  <input
                    type="text"
                    value={currentScenario.name}
                    onChange={(e) => updateActiveField("name", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Country / Origin</label>
                  <input
                    type="text"
                    value={currentScenario.origin}
                    onChange={(e) => updateActiveField("origin", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Shipment Units</label>
                  <input
                    type="number"
                    value={currentScenario.units}
                    onChange={(e) => updateActiveField("units", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">FOB Price / Unit ({currency})</label>
                  <input
                    type="number"
                    value={currentScenario.unitCostFob}
                    onChange={(e) => updateActiveField("unitCostFob", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-2 font-medium block mb-1">International Freight ({currency})</label>
                  <input
                    type="number"
                    value={currentScenario.freightCostTotal}
                    onChange={(e) => updateActiveField("freightCostTotal", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-2 font-medium block mb-1">Cargo Insurance ({currency})</label>
                  <input
                    type="number"
                    value={currentScenario.insuranceCostTotal}
                    onChange={(e) => updateActiveField("insuranceCostTotal", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-ink-3 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-fg-2 font-medium">Customs Duty Rate (%)</label>
                  <label className="flex items-center gap-1.5 text-[10px] text-fg-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentScenario.includeInsuranceInCustomsValue}
                      onChange={(e) => updateActiveField("includeInsuranceInCustomsValue", e.target.checked)}
                      className="rounded text-emerald"
                    />
                    <span>Include Insurance in Duty Base</span>
                  </label>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={currentScenario.dutyRatePct}
                  onChange={(e) => updateActiveField("dutyRatePct", Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded bg-ink-2 border border-line font-mono text-xs font-bold"
                />
              </div>

              {/* ITEMIZED OTHER FEES */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-fg text-xs">Port, Clearance & Handling Fees:</span>
                  <button
                    onClick={addFee}
                    className="text-[11px] font-mono text-emerald hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Add Fee
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(currentScenario.fees || []).map((fee) => (
                    <div key={fee.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fee.name}
                        onChange={(e) => updateFee(fee.id, "name", e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-ink-3 border border-line text-xs"
                      />
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => updateFee(fee.id, "amount", Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded bg-ink-3 border border-line font-mono text-xs text-right"
                      />
                      <button
                        onClick={() => removeFee(fee.id)}
                        className="text-fg-3 hover:text-neg p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {scenarios.length > 1 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => removeScenario(currentScenario.id)}
                    className="text-neg hover:text-neg flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete This Sourcing Scenario</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMPARATIVE STACK CHART & TABLE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STACKED COST PER UNIT COMPARISON CHART */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مقارنة تكلفة الوحدة الواصلة عبر سيناريوهات التوريد" : "Delivered Landed Cost per Unit Comparison"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "توزيع مكونات التكلفة لكل خيار توريد" : "Stacked cost contribution per sourcing route"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                {scenarios.length} SCENARIOS
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                  <XAxis dataKey="name" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" unit={` ${currency}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Bar dataKey="FOB Product" stackId="a" fill="#17a88a" />
                  <Bar dataKey="Freight" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="Insurance" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="Duty" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Fees" stackId="a" fill="#EC4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WATERFALL BREAKDOWN TABLE */}
          <div className="panel-data p-5">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider mb-3">
              {currentScenario.name} — Full Component Stack
            </h3>

            <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-line bg-ink-3 text-fg-3">
                  <th className="py-2 px-3">Cost Component</th>
                  <th className="py-2 px-3 text-right">Total Shipment</th>
                  <th className="py-2 px-3 text-right">Cost / Unit</th>
                  <th className="py-2 px-3 text-right">% of Landed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {currentCalc.breakdown.map((item) => (
                  <tr key={item.name} className="hover:bg-ink-3">
                    <td className="py-2.5 px-3 font-medium text-fg flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">{currency} {item.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">{currency} {(item.amount / currentScenario.units).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-fg-3">{item.pct.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-line-strong bg-emerald/10 font-bold text-emerald">
                  <td className="py-3 px-3">TOTAL DELIVERED LANDED COST</td>
                  <td className="py-3 px-3 text-right">{currency} {currentCalc.totalLandedCost.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-sm">{currency} {currentCalc.landedCostPerUnit}</td>
                  <td className="py-3 px-3 text-right">100.0%</td>
                </tr>
              </tbody>
            </table>
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
