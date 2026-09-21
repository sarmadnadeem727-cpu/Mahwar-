// components/operations/AbcXyzClassification.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Grid3X3, Layers, Plus, Trash2, Sliders, Filter, HelpCircle, 
  ArrowRight, Download, FileSpreadsheet, CheckCircle2, AlertCircle 
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ComposedChart 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { SkuItem, AbcXyzMatrixSummary, AuditData } from "@/lib/operations/types";
import { DEFAULT_SKUS, computeAbcXyz, generateAbcXyzAudit } from "@/lib/operations/abcXyz";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

export default function AbcXyzClassification() {
  const { language, currency, sessionAnalyses, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [skus, setSkus] = useState<typeof DEFAULT_SKUS>(DEFAULT_SKUS);
  const [thresholdA, setThresholdA] = useState<number>(80);
  const [thresholdB, setThresholdB] = useState<number>(95);
  const [thresholdX, setThresholdX] = useState<number>(0.5);
  const [thresholdY, setThresholdY] = useState<number>(1.0);

  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [selectedCell, setSelectedCell] = useState<string | null>("AZ");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // New SKU form modal/state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkuName, setNewSkuName] = useState("");
  const [newSkuCost, setNewSkuCost] = useState(100);
  const [newSkuDemand, setNewSkuDemand] = useState(500);

  const { classifiedSkus, totalValue, matrix, paretoData } = computeAbcXyz(
    skus,
    thresholdA,
    thresholdB,
    thresholdX,
    thresholdY
  );

  // Sync to session
  useEffect(() => {
    updateSessionAnalysis("abcXyz", {
      inputs: { thresholdA, thresholdB, thresholdX, thresholdY },
      outputs: { totalValue, skuCount: classifiedSkus.length },
      computedAt: new Date().toISOString(),
    });
  }, [skus, thresholdA, thresholdB, thresholdX, thresholdY, totalValue]);

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuName) return;
    const baseDemand = Math.round(newSkuDemand / 12);
    const mockHistorical = [0.9, 1.1, 0.95, 1.05, 1.0, 0.85, 1.15, 1.0, 0.95, 1.05, 1.0, 0.9].map((f) =>
      Math.round(baseDemand * f)
    );
    const newItem = {
      id: `SKU-${Date.now().toString().slice(-4)}`,
      name: newSkuName,
      unitCost: Number(newSkuCost),
      annualDemand: Number(newSkuDemand),
      historicalDemand: mockHistorical,
    };
    setSkus([newItem, ...skus]);
    setNewSkuName("");
    setShowAddModal(false);
  };

  const removeSku = (id: string) => {
    if (skus.length <= 1) return;
    setSkus(skus.filter((s) => s.id !== id));
  };

  const handleExportExcel = () => {
    const tableData = classifiedSkus.map((s) => ({
      "SKU ID": s.id,
      "SKU Name": s.name,
      "Unit Cost": s.unitCost,
      "Annual Demand": s.annualDemand,
      "Annual Consumption Value": s.annualConsumptionValue,
      "Cumulative Value %": s.cumulativeValuePct,
      "Mean Demand": s.meanDemand,
      "Std Dev Demand": s.demandStdDev,
      "CV (Coeff of Var)": s.cv,
      "ABC Class": s.abcClass,
      "XYZ Class": s.xyzClass,
      "Combined Matrix": s.combinedClass,
    }));
    exportToExcel([{ name: "ABC XYZ Analysis", data: tableData }], "MAHWAR_ABC_XYZ_Inventory_Segmentation");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("abc-xyz-container", "MAHWAR_ABC_XYZ_Inventory_Segmentation");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateAbcXyzAudit(
    totalValue,
    thresholdA,
    thresholdB,
    thresholdX,
    thresholdY,
    skus.length
  );

  const filteredSkus = classifiedSkus.filter((s) => {
    if (filterClass === "ALL") return true;
    if (filterClass.length === 1) return s.abcClass === filterClass || s.xyzClass === filterClass;
    return s.combinedClass === filterClass;
  });

  const matrixCells = [
    ['AX', 'AY', 'AZ'],
    ['BX', 'BY', 'BZ'],
    ['CX', 'CY', 'CZ'],
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="abc-xyz-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="INVENTORY & ORDERING"
        categoryTagAr="المخزون وأوامر التوريد"
        title="ABC / XYZ Inventory Classification & Segmentation"
        titleAr="تصنيف وتقسيم المخزون المزدوج (ABC / XYZ)"
        subtitle="Prioritize catalog investment across Pareto monetary value (ABC) and demand predictability (XYZ)"
        subtitleAr="تحديد أولويات الإنفاق والتحكم في المخزون وفق قيمة الاستهلاك السنوية (ABC) واستقرار الطلب (XYZ)"
        icon={<Grid3X3 size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setSkus(DEFAULT_SKUS);
          setThresholdA(80);
          setThresholdB(95);
          setThresholdX(0.5);
          setThresholdY(1.0);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "إجمالي قيمة الاستهلاك السنوي" : "Total Annual Portfolio Value"}
          </span>
          <span className="text-2xl font-extrabold text-emerald">
            {currency} {totalValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            Across {classifiedSkus.length} catalog items
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "أصناف الفئة A (عالية القيمة)" : "Class A (Top ~80% Value)"}
          </span>
          <span className="text-2xl font-extrabold text-fg">
            {classifiedSkus.filter((s) => s.abcClass === "A").length} <span className="text-xs text-fg-3">SKUs</span>
          </span>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {((classifiedSkus.filter((s) => s.abcClass === "A").reduce((a, b) => a + b.annualConsumptionValue, 0) / totalValue) * 100).toFixed(0)}% of total capital
          </span>
        </div>

        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "أصناف X (طلب مستقر ومتوقع)" : "Class X (Stable Demand)"}
          </span>
          <span className="text-2xl font-extrabold text-fg">
            {classifiedSkus.filter((s) => s.xyzClass === "X").length} <span className="text-xs text-fg-3">SKUs</span>
          </span>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            CV &lt; {thresholdX} (Lean JIT Candidates)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neg/30 bg-neg/10 shadow-xs">
          <span className="text-[10px] text-neg uppercase font-bold block mb-1">
            {isAr ? "أصناف AZ (الأعلى خطورة)" : "Critical Risk (AZ Items)"}
          </span>
          <span className="text-2xl font-extrabold text-neg">
            {matrix["AZ"]?.count || 0} <span className="text-xs text-neg">SKUs</span>
          </span>
          <span className="text-[10px] text-neg font-sans font-medium block mt-1">
            High capital + erratic volatility
          </span>
        </div>
      </div>

      {/* COMBINED 3x3 MATRIX & PARETO CURVE (MAIN UPPER SECTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3x3 MATRIX (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مصفوفة التقسيم المزدوج 3×3 (ABC - XYZ Matrix)" : "Strategic 3×3 ABC-XYZ Portfolio Matrix"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "انقر على أي خلية لتصفية الأصناف واستعراض استراتيجية الإدارة الموصى بها" : "Click any cell to filter SKU list and inspect tailored inventory replenishment strategy"}
                </p>
              </div>
              <span className="label-pill text-fg-3 font-mono text-[10px]">
                9 SEGMENTS
              </span>
            </div>

            {/* 3x3 GRID */}
            <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
              {matrixCells.flat().map((cellId) => {
                const data = matrix[cellId];
                const isSelected = selectedCell === cellId;

                // Color accent based on criticality
                let bgAccent = "bg-ink-3 hover:bg-ink-4 border-line";
                let textAccent = "text-fg";
                if (cellId === "AZ") {
                  bgAccent = isSelected ? "bg-neg/10 border-neg/30" : "bg-neg/10 border-neg/30";
                  textAccent = "text-neg";
                } else if (cellId === "AX" || cellId === "AY") {
                  bgAccent = isSelected ? "bg-emerald/20 border-emerald" : "bg-emerald/5 border-emerald/20";
                  textAccent = "text-emerald";
                } else if (isSelected) {
                  bgAccent = "bg-ink-5 border-line-strong";
                }

                return (
                  <div
                    key={cellId}
                    onClick={() => {
                      setSelectedCell(cellId);
                      setFilterClass(cellId);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[95px] ${bgAccent}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-extrabold text-sm ${textAccent}`}>{cellId}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ink-2/90 border border-line">
                        {data?.count || 0} SKUs
                      </span>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="block text-[11px] font-extrabold">
                        {currency} {((data?.totalValue || 0) / 1000).toFixed(0)}k
                      </span>
                      <span className="block text-[9px] text-fg-3">
                        {data?.valueSharePct || 0}% of spend
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED CELL STRATEGY CALLOUT */}
            {selectedCell && matrix[selectedCell] && (
              <div className="p-3.5 bg-ink-3 border border-line rounded-lg text-xs font-sans space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-fg flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald" />
                    <span>Segment {selectedCell} Action Policy:</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCell(null);
                      setFilterClass("ALL");
                    }}
                    className="text-[10px] font-mono text-fg-3 hover:text-fg-2 underline"
                  >
                    Clear Filter
                  </button>
                </div>
                <p className="text-fg-2 leading-relaxed font-medium">
                  {matrix[selectedCell].strategyKey}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PARETO CUMULATIVE VALUE CHART (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مخطط باريتو لقيمة المخزون المتراكمة" : "Pareto 80/20 Value Concentration"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "منحنى القيمة التراكمية (%) للأصناف مرتبة تنازلياً" : "Cumulative % spend curve across ranked catalog"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                PARETO
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                  <XAxis dataKey="name" stroke="#a7b9b2" fontSize={8} fontFamily="monospace" angle={-45} textAnchor="end" />
                  <YAxis yAxisId="left" stroke="#a7b9b2" fontSize={9} fontFamily="monospace" />
                  <YAxis yAxisId="right" orientation="right" stroke="#17a88a" domain={[0, 100]} fontSize={9} fontFamily="monospace" unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar yAxisId="left" dataKey="value" name="Value (SAR)" fill="#6d817a" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativePct" name="Cumulative %" stroke="#17a88a" strokeWidth={2.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* THRESHOLD ADJUSTMENT CONTROLS */}
            <div className="p-3 bg-ink-3 rounded-lg border border-line space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold text-fg-2">
                <span>Threshold Sliders:</span>
                <span className="font-mono text-[11px] text-fg-3">
                  A &lt; {thresholdA}% | B &lt; {thresholdB}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div>
                  <span className="text-fg-3 block mb-0.5">Pareto A Threshold (%)</span>
                  <input
                    type="number"
                    value={thresholdA}
                    onChange={(e) => setThresholdA(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-ink-2 border border-line"
                  />
                </div>
                <div>
                  <span className="text-fg-3 block mb-0.5">Pareto B Threshold (%)</span>
                  <input
                    type="number"
                    value={thresholdB}
                    onChange={(e) => setThresholdB(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-ink-2 border border-line"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKU DATA TABLE WITH FILTER & ADD MODAL */}
      <div className="panel-data p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
              {isAr ? "جدول بيانات الأصناف وتصنيفاتها" : "Classified SKU Master Catalog"}
            </h3>
            <span className="label-pill text-fg-3 text-[10px]">
              {filteredSkus.length} of {skus.length} SKUs
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter pills */}
            <div className="flex rounded border border-line overflow-hidden text-[10px] font-mono font-bold">
              {["ALL", "A", "B", "C", "X", "Y", "Z"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setFilterClass(cls);
                    setSelectedCell(null);
                  }}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${
                    filterClass === cls
                      ? "bg-emerald text-ink-0"
                      : "bg-ink-3 text-fg-2 hover:bg-ink-4"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald text-ink-0 rounded text-xs font-mono font-bold hover:bg-emerald-light transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>{isAr ? "إضافة صنف" : "Add SKU"}</span>
            </button>
          </div>
        </div>

        {/* ADD SKU INLINE CARD IF OPEN */}
        {showAddModal && (
          <form onSubmit={handleAddSku} className="p-4 bg-emerald/5 border border-emerald/20 rounded-lg space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald">Enter New SKU Details:</span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-fg-3 hover:text-fg-2"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-fg-3 block mb-1">SKU Name / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Filter Cartridge 5M"
                  value={newSkuName}
                  onChange={(e) => setNewSkuName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-ink-2 border border-line"
                  required
                />
              </div>
              <div>
                <label className="text-fg-3 block mb-1">Unit Purchase Cost ({currency})</label>
                <input
                  type="number"
                  value={newSkuCost}
                  onChange={(e) => setNewSkuCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded bg-ink-2 border border-line"
                  required
                />
              </div>
              <div>
                <label className="text-fg-3 block mb-1">Annual Volume (Units)</label>
                <input
                  type="number"
                  value={newSkuDemand}
                  onChange={(e) => setNewSkuDemand(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded bg-ink-2 border border-line"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald text-ink-0 rounded font-bold hover:bg-emerald-light cursor-pointer"
              >
                Insert SKU
              </button>
            </div>
          </form>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
            <thead>
              <tr className="border-b border-line bg-ink-3 text-fg-3">
                <th className="py-2.5 px-3">SKU ID</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Annual Demand</th>
                <th className="py-2.5 px-3 text-right">Annual Value</th>
                <th className="py-2.5 px-3 text-right">Cumul %</th>
                <th className="py-2.5 px-3 text-right">CV</th>
                <th className="py-2.5 px-3 text-center">Class</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredSkus.map((sku) => {
                let badgeClass = "bg-ink-4 text-fg-2";
                if (sku.combinedClass === "AZ") badgeClass = "bg-neg/10 text-neg border border-neg/30";
                else if (sku.combinedClass === "AX") badgeClass = "bg-emerald/20 text-emerald border border-emerald/30";

                return (
                  <tr key={sku.id} className="hover:bg-ink-3 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-fg-2">{sku.id}</td>
                    <td className="py-2.5 px-3 font-medium text-fg font-sans">{sku.name}</td>
                    <td className="py-2.5 px-3 text-right">{currency} {sku.unitCost}</td>
                    <td className="py-2.5 px-3 text-right">{sku.annualDemand.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-fg">
                      {currency} {sku.annualConsumptionValue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-fg-3">{sku.cumulativeValuePct}%</td>
                    <td className="py-2.5 px-3 text-right">{sku.cv}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeClass}`}>
                        {sku.combinedClass}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => removeSku(sku.id)}
                        className="text-fg-3 hover:text-neg cursor-pointer p-1"
                        title="Remove SKU"
                      >
                        <Trash2 size={13} />
                      </button>
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
