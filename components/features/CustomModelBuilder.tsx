"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Table, Plus, Trash2, Save, Calculator, LineChart, 
  BarChart2, HelpCircle, Check, FileSpreadsheet, FolderPlus
} from "lucide-react";
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTerminalStore, CustomModelSaved, CustomModelRow } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import NumberCounter from "@/components/ui/NumberCounter";

const DEFAULT_INITIAL_MODEL: CustomModelSaved = {
  id: "model-default",
  name: "GCC Commercial Real Estate Model",
  computedAt: new Date().toISOString(),
  rows: [
    { id: "r1", name: "Rental Income", nameAr: "إيرادات التأجير", isFormula: false, formulaOrValue: "450", values: [450, 495, 544, 598, 658] },
    { id: "r2", name: "Facility OpEx", nameAr: "المصاريف التشغيلية", isFormula: false, formulaOrValue: "120", values: [120, 132, 145, 159, 175] },
    { id: "r3", name: "Net Operating Income (NOI)", nameAr: "صافي دخل التشغيل", isFormula: true, formulaOrValue: "=Rental Income - Facility OpEx", values: [330, 363, 399, 439, 483] },
    { id: "r4", name: "Financing Cost", nameAr: "تكلفة التمويل", isFormula: false, formulaOrValue: "45", values: [45, 42, 38, 35, 30] },
    { id: "r5", name: "Net Profit", nameAr: "صافي الربح النهائي", isFormula: true, formulaOrValue: "=Net Operating Income (NOI) - Financing Cost", values: [285, 321, 361, 404, 453] },
  ]
};

// Safe arithmetic evaluator for row formulas
function evaluateFormulaForYear(
  formulaStr: string,
  yearIdx: number,
  allRows: CustomModelRow[]
): number {
  if (!formulaStr.startsWith("=")) {
    const num = parseFloat(formulaStr);
    return isNaN(num) ? 0 : num;
  }

  let expr = formulaStr.substring(1).trim();

  // Simple functions SUM(...) & AVERAGE(...)
  const sumMatch = expr.match(/^SUM\((.*?)\)$/i);
  if (sumMatch) {
    const rowNames = sumMatch[1].split(",").map((s) => s.trim());
    let total = 0;
    rowNames.forEach((rName) => {
      const found = allRows.find((r) => r.name.toLowerCase() === rName.toLowerCase());
      if (found) {
        total += found.values[yearIdx] || 0;
      }
    });
    return total;
  }

  const avgMatch = expr.match(/^AVERAGE\((.*?)\)$/i);
  if (avgMatch) {
    const rowNames = avgMatch[1].split(",").map((s) => s.trim());
    let total = 0;
    let count = 0;
    rowNames.forEach((rName) => {
      const found = allRows.find((r) => r.name.toLowerCase() === rName.toLowerCase());
      if (found) {
        total += found.values[yearIdx] || 0;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  }

  // Replace Row Names with their numerical value at yearIdx
  // Sort row names by length descending so longer names get replaced first
  const sortedRows = [...allRows].sort((a, b) => b.name.length - a.name.length);
  for (const r of sortedRows) {
    if (r.name.trim() && expr.includes(r.name)) {
      const val = r.values[yearIdx] || 0;
      expr = expr.split(r.name).join(val.toString());
    }
  }

  // Evaluate simple arithmetic expression safely without unsafe eval
  try {
    // Sanitize: allow numbers, decimal points, spaces, and + - * / ( )
    const sanitized = expr.replace(/[^0-9.\s+\-*/()]/g, "");
    if (!sanitized.trim()) return 0;
    // Simple Function evaluator using Function constructor
    const result = new Function(`"use strict"; return (${sanitized})`)();
    return typeof result === "number" && !isNaN(result) && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export default function CustomModelBuilder() {
  const { language, updateSessionAnalysis, sessionAnalyses } = useTerminalStore();
  const isAr = language === 'ar';

  const [savedModels, setSavedModels] = useState<CustomModelSaved[]>([DEFAULT_INITIAL_MODEL]);
  const [activeModelId, setActiveModelId] = useState<string>("model-default");
  const [selectedChartRowId, setSelectedChartRowId] = useState<string>("r3");

  const [modelNameInput, setModelNameInput] = useState<string>("GCC Commercial Real Estate Model");

  // New Row Insertion inputs
  const [newRowName, setNewRowName] = useState("");
  const [newRowNameAr, setNewRowNameAr] = useState("");
  const [newFormulaOrValue, setNewFormulaOrValue] = useState("");
  const [newBaseVal, setNewBaseVal] = useState("100");
  const [newGrowth, setNewGrowth] = useState("10");

  // Active Model Rows
  const activeModel = savedModels.find((m) => m.id === activeModelId) || savedModels[0] || DEFAULT_INITIAL_MODEL;
  const [rows, setRows] = useState<CustomModelRow[]>(activeModel.rows);

  useEffect(() => {
    setRows(activeModel.rows);
    setModelNameInput(activeModel.name);
  }, [activeModelId]);

  // Recalculate row values on every formula change or row update
  const recalculateAll = (targetRows: CustomModelRow[]): CustomModelRow[] => {
    return targetRows.map((row) => {
      if (!row.isFormula) {
        const base = parseFloat(row.formulaOrValue) || 0;
        // If raw number, generate 5Y with subtle growth or flat
        const vals = [0, 1, 2, 3, 4].map((yrIdx) => Math.round(base * Math.pow(1.10, yrIdx)));
        return { ...row, values: vals };
      }
      // Calculate 5 years for formula row
      const vals = [0, 1, 2, 3, 4].map((yrIdx) => {
        return Math.round(evaluateFormulaForYear(row.formulaOrValue, yrIdx, targetRows));
      });
      return { ...row, values: vals };
    });
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowName.trim()) return;

    const isForm = newFormulaOrValue.trim().startsWith("=");
    const baseNum = parseFloat(newBaseVal) || 100;
    const gRate = (parseFloat(newGrowth) || 0) / 100;

    const initialVals = isForm 
      ? [0, 0, 0, 0, 0] 
      : [0, 1, 2, 3, 4].map((yr) => Math.round(baseNum * Math.pow(1 + gRate, yr)));

    const newRow: CustomModelRow = {
      id: `row-${Date.now()}`,
      name: newRowName.trim(),
      nameAr: newRowNameAr.trim() || newRowName.trim(),
      isFormula: isForm,
      formulaOrValue: isForm ? newFormulaOrValue.trim() : newBaseVal,
      values: initialVals
    };

    const updated = recalculateAll([...rows, newRow]);
    setRows(updated);

    // Clear inputs
    setNewRowName("");
    setNewRowNameAr("");
    setNewFormulaOrValue("");
  };

  const handleDeleteRow = (id: string) => {
    const filtered = rows.filter((r) => r.id !== id);
    setRows(recalculateAll(filtered));
  };

  const handleCellFormulaChange = (id: string, val: string) => {
    const isForm = val.trim().startsWith("=");
    const updatedRaw = rows.map((r) => {
      if (r.id === id) {
        return { ...r, formulaOrValue: val, isFormula: isForm };
      }
      return r;
    });
    setRows(recalculateAll(updatedRaw));
  };

  const handleSaveModel = () => {
    const updatedModel: CustomModelSaved = {
      id: activeModelId,
      name: modelNameInput.trim() || "Untitled Custom Model",
      rows,
      computedAt: new Date().toISOString()
    };

    const exists = savedModels.some((m) => m.id === activeModelId);
    const newSaved = exists
      ? savedModels.map((m) => (m.id === activeModelId ? updatedModel : m))
      : [...savedModels, updatedModel];

    setSavedModels(newSaved);

    updateSessionAnalysis("customModel", {
      models: newSaved,
      activeModelId,
      computedAt: new Date().toISOString()
    });
  };

  const handleCreateNewModel = () => {
    const newId = `model-${Date.now()}`;
    const newM: CustomModelSaved = {
      id: newId,
      name: "New Custom Model",
      rows: [
        { id: "nr1", name: "Revenue", nameAr: "الإيرادات", isFormula: false, formulaOrValue: "500", values: [500, 550, 605, 665, 731] },
        { id: "nr2", name: "COGS", nameAr: "تكلفة المبيعات", isFormula: false, formulaOrValue: "250", values: [250, 275, 302, 332, 365] },
        { id: "nr3", name: "Gross Profit", nameAr: "مجمل الربح", isFormula: true, formulaOrValue: "=Revenue - COGS", values: [250, 275, 303, 333, 366] },
      ],
      computedAt: new Date().toISOString()
    };
    setSavedModels([...savedModels, newM]);
    setActiveModelId(newId);
  };

  // Prepare chart data for selected row
  const selectedRow = rows.find((r) => r.id === selectedChartRowId) || rows[0];
  const chartData = [1, 2, 3, 4, 5].map((yr, idx) => ({
    year: `Year ${yr}`,
    value: selectedRow ? selectedRow.values[idx] || 0 : 0
  }));

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-slate-heading font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: MODEL MANAGER & ROW ADDER (4 COLS) */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* MODEL SELECTOR & CREATOR */}
        <div className="bg-white p-6 rounded-xl border border-surface-border space-y-4 shadow-terminal-card">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="text-emerald" size={22} />
              <div>
                <h2 className="font-mono text-heading-sm font-bold text-slate-heading uppercase">
                  {isAr ? "نماذج النمذجة المخصصة" : "Custom Model Library"}
                </h2>
                <span className="text-mono-caption font-mono text-slate-muted">
                  {isAr ? "حفظ وتخصيص معادلات Excel" : "Saved Excel-Style Sheets"}
                </span>
              </div>
            </div>
            <button
              onClick={handleCreateNewModel}
              className="p-2 rounded-lg bg-surface-subtle border border-surface-border hover:border-emerald text-emerald transition-colors cursor-pointer"
              title="Create New Model"
            >
              <FolderPlus size={16} />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-muted block text-[10px] uppercase font-bold">{isAr ? "اختر النموذج" : "Select Active Sheet"}</label>
              <select
                value={activeModelId}
                onChange={(e) => setActiveModelId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none cursor-pointer"
              >
                {savedModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-muted block text-[10px] uppercase font-bold">{isAr ? "اسم النموذج الحالي" : "Model Title"}</label>
              <input
                type="text"
                value={modelNameInput}
                onChange={(e) => setModelNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveModel}
              className="w-full py-2.5 rounded-lg bg-emerald hover:bg-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              <span>{isAr ? "حفظ نموذج العمل" : "Save Model State"}</span>
            </button>
          </div>
        </div>

        {/* ADD ROW FORM */}
        <div className="bg-white p-6 rounded-xl border border-surface-border space-y-4 shadow-terminal-card">
          <h3 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider pb-2 border-b border-surface-border flex items-center gap-2">
            <Plus size={15} className="text-emerald" />
            <span>{isAr ? "إضافة بنـد مالي جديد" : "Add Line Item (Row)"}</span>
          </h3>

          <form onSubmit={handleAddRow} className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-muted block text-[10px] font-bold">Line Item Name (EN) *</label>
              <input
                type="text"
                required
                placeholder="e.g. EBITDA Margin"
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-muted block text-[10px] font-bold">Line Item Name (AR)</label>
              <input
                type="text"
                placeholder="e.g. هامش الأرباح"
                value={newRowNameAr}
                onChange={(e) => setNewRowNameAr(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-muted block text-[10px] font-bold">Formula or Raw Value (e.g. =Revenue - COGS or 250)</label>
              <input
                type="text"
                placeholder="e.g. =Rental Income - Facility OpEx"
                value={newFormulaOrValue}
                onChange={(e) => setNewFormulaOrValue(e.target.value)}
                className="w-full px-3 py-2 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
              />
            </div>

            {!newFormulaOrValue.startsWith("=") && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-muted block text-[10px] font-bold">Base Value (Y1)</label>
                  <input
                    type="number"
                    value={newBaseVal}
                    onChange={(e) => setNewBaseVal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-muted block text-[10px] font-bold">YoY Growth (%)</label>
                  <input
                    type="number"
                    value={newGrowth}
                    onChange={(e) => setNewGrowth(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-subtle border border-surface-border focus:border-emerald rounded-lg text-slate-heading font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-slate-heading hover:bg-slate-800 text-white font-mono font-bold uppercase tracking-wider transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>{isAr ? "إدراج البند" : "Insert Line Item"}</span>
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: SPREADSHEET GRID & CHART (8 COLS) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* SPREADSHEET TABLE GRID */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-terminal-card overflow-x-auto">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-border">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-heading">
                {modelNameInput}
              </h3>
              <span className="text-mono-caption font-mono text-slate-muted">
                {isAr ? "جدول الحسابات التفاعلي والربط المباشر" : "Live Excel-Style Formula Cascade Grid"}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-dim border border-emerald-border text-emerald font-mono font-bold text-mono-caption">
              {rows.length} {isAr ? "بنود إجمالية" : "Active Line Items"}
            </span>
          </div>

          <table className="w-full font-mono text-xs text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-surface-border text-slate-muted">
                <th className="p-3">Line Item (Row)</th>
                <th className="p-3">Formula / Value Input</th>
                <th className="p-3 text-right">Year 1</th>
                <th className="p-3 text-right">Year 2</th>
                <th className="p-3 text-right">Year 3</th>
                <th className="p-3 text-right">Year 4</th>
                <th className="p-3 text-right">Year 5</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {rows.map((row) => {
                const isSelectedForChart = row.id === selectedChartRowId;
                return (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${
                      isSelectedForChart ? "bg-emerald-dim/40" : "hover:bg-surface-subtle"
                    }`}
                  >
                    <td 
                      onClick={() => setSelectedChartRowId(row.id)}
                      className="p-3 font-bold text-slate-heading cursor-pointer hover:text-emerald"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${row.isFormula ? "bg-emerald" : "bg-slate-400"}`} />
                        <span>{isAr ? row.nameAr || row.name : row.name}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={row.formulaOrValue}
                        onChange={(e) => handleCellFormulaChange(row.id, e.target.value)}
                        className={`w-full px-2 py-1 bg-surface-subtle border rounded font-mono text-[11px] focus:outline-none focus:border-emerald ${
                          row.isFormula ? "text-emerald font-bold border-emerald-border" : "text-slate-body border-surface-border"
                        }`}
                      />
                    </td>

                    {row.values.map((v, vIdx) => (
                      <td 
                        key={vIdx} 
                        className={`p-3 text-right font-bold ${
                          row.isFormula ? "text-emerald font-extrabold" : "text-slate-heading"
                        }`}
                      >
                        {v.toLocaleString()}
                      </td>
                    ))}

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete Row"
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

        {/* VISUAL RECHARTS PROJECTION GRAPH FOR SELECTED ROW */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-terminal-card space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <LineChart size={18} className="text-emerald" />
              <h4 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider">
                {isAr ? "رسم بياني للبند المحدد:" : "Projections Chart:"} <span className="text-emerald">{selectedRow?.name}</span>
              </h4>
            </div>
            <span className="text-mono-caption font-mono text-slate-muted">
              5-Year Quantitative Curve
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                />
                <Line type="monotone" dataKey="value" stroke="#0E7C69" strokeWidth={3} dot={{ fill: "#0E7C69", r: 4 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
