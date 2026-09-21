// components/operations/DemandForecasting.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Sliders, Layers, Plus, Trash2, HelpCircle, 
  ArrowRight, FileSpreadsheet, CheckCircle2, AlertCircle, BarChart2 
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { ForecastMethod, TimeSeriesPoint, ForecastOutputs, AuditData } from "@/lib/operations/types";
import { DEFAULT_DEMAND_SERIES, computeForecasts, generateForecastAudit } from "@/lib/operations/forecasting";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

export default function DemandForecasting() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [series, setSeries] = useState<TimeSeriesPoint[]>(DEFAULT_DEMAND_SERIES);
  const [method, setMethod] = useState<ForecastMethod>("SMA");
  const [horizon, setHorizon] = useState<number>(4);
  const [smaWindow, setSmaWindow] = useState<number>(3);
  const [wmaWeightsStr, setWmaWeightsStr] = useState<string>("0.5, 0.3, 0.2");
  const [sesAlpha, setSesAlpha] = useState<number>(0.3);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Parse WMA weights
  const parsedWeights = wmaWeightsStr
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n) && n > 0);

  const weightSum = parsedWeights.reduce((a, b) => a + b, 0);
  const isWeightValid = method !== "WMA" || Math.abs(weightSum - 1.0) < 0.01;

  const outputs: ForecastOutputs = computeForecasts(series, method, {
    smaWindow,
    wmaWeights: parsedWeights,
    sesAlpha,
    horizon,
  });

  // Sync to sessionAnalyses so S&OP can pull from it
  useEffect(() => {
    updateSessionAnalysis("demandForecast", {
      inputs: { method, horizon, smaWindow, sesAlpha },
      outputs: { forecasts: outputs.forecasts, mape: outputs.mape },
      computedAt: new Date().toISOString(),
    });
  }, [series, method, horizon, smaWindow, sesAlpha, outputs.forecasts]);

  let validationError = "";
  if (method === "WMA" && !isWeightValid) {
    validationError = isAr
      ? `أوزان المتوسط المرجح يجب أن تساوي 1.0 (المجموع الحالي: ${weightSum.toFixed(2)}).`
      : `WMA weights must sum to 1.0 (current sum: ${weightSum.toFixed(2)}).`;
  }

  const handleExportExcel = () => {
    const historicalData = series.map((s) => ({
      Period: s.periodLabel,
      Actual: s.actual,
    }));
    const forecastData = outputs.forecasts.map((f) => ({
      Period: f.periodLabel,
      Forecast: f.forecastValue,
      Method: method,
    }));
    exportToExcel(
      [
        { name: "Historical Demand", data: historicalData },
        { name: "Forecast Projections", data: forecastData },
        { name: "Method Comparison", data: outputs.comparativeMetrics },
      ],
      "MAHWAR_Demand_Forecast_Projections"
    );
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("forecast-container", "MAHWAR_Demand_Forecast_Projections");
    setIsExportingPdf(false);
  };

  const updateActual = (index: number, val: number) => {
    const updated = [...series];
    updated[index].actual = val;
    setSeries(updated);
  };

  const addPeriod = () => {
    const nextP = series.length + 1;
    const lastVal = series[series.length - 1]?.actual || 400;
    setSeries([...series, { period: nextP, periodLabel: `M${nextP}`, actual: lastVal }]);
  };

  const removePeriod = (index: number) => {
    if (series.length <= 4) return;
    const updated = series.filter((_, idx) => idx !== index);
    setSeries(updated.map((p, idx) => ({ ...p, period: idx + 1, periodLabel: `M${idx + 1}` })));
  };

  const auditData: AuditData = generateForecastAudit(method, outputs);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="forecast-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="PLANNING & FORECASTING"
        categoryTagAr="التخطيط والتنبؤ"
        title="Demand Forecasting & Statistical Time Series Engine"
        titleAr="محرك التنبؤ بالطلب والسلاسل الزمنية الإحصائية"
        subtitle="Forecast future demand from historical actuals using Moving Averages and Exponential Smoothing with accuracy metrics"
        subtitleAr="توقع المبيعات والطلب المستقبلي من البيانات التاريخية باستخدام نماذج المتوسطات المتحركة والتمهيد الأسي"
        icon={<TrendingUp size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setSeries(DEFAULT_DEMAND_SERIES);
          setMethod("SMA");
          setHorizon(4);
          setSmaWindow(3);
          setSesAlpha(0.3);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI ACCURACY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* ACTIVE METHOD & HORIZON */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "النموذج النشط وأفق التوقع" : "Active Model Horizon"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald">{outputs.horizon}</span>
            <span className="text-xs font-bold text-emerald">{isAr ? "فترات قادمة" : "Periods"}</span>
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            Method: {method} ({outputs.forecasts.map((f) => f.forecastValue).join(", ")})
          </span>
        </div>

        {/* MAPE */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            MAPE (Accuracy Error)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${outputs.mape < 10 ? "text-emerald" : "text-fg"}`}>
              {outputs.mape}%
            </span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {outputs.mape < 10 ? "High precision fit (<10%)" : "Acceptable deviation"}
          </span>
        </div>

        {/* MAD */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            MAD (Mean Abs Deviation)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{outputs.mad}</span>
            <span className="text-xs font-bold text-fg-3">units</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Average absolute unit variance
          </span>
        </div>

        {/* FORECAST BIAS */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            Tracking Bias
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${outputs.bias > 0 ? "text-gold" : outputs.bias < 0 ? "text-sky-400" : "text-emerald"}`}>
              {outputs.bias > 0 ? `+${outputs.bias}` : outputs.bias}
            </span>
            <span className="text-xs font-bold text-fg-3">units</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            {outputs.bias > 0 ? "Slight under-forecasting" : outputs.bias < 0 ? "Slight over-forecasting" : "Unbiased"}
          </span>
        </div>
      </div>

      {validationError && <InlineError message={validationError} isAr={isAr} />}

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONFIG & INPUTS COLUMN (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider border-b border-line pb-3">
              {isAr ? "اختيار النموذج ومعلمات التنبؤ" : "Model Selection & Hyperparameters"}
            </h3>

            {/* METHOD TOGGLE */}
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              {(["SMA", "WMA", "SES"] as ForecastMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-1 rounded text-center transition-all cursor-pointer font-bold ${
                    method === m
                      ? "bg-emerald text-ink-0 shadow-2xs"
                      : "bg-ink-3 text-fg-2 hover:bg-ink-4 border border-line"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* HORIZON */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-fg-2 font-medium">
                    {isAr ? "أفق التوقع المستقبلي (فترات)" : "Forecast Horizon (Periods ahead)"}
                  </label>
                  <span className="font-mono font-bold text-emerald">{horizon} Periods</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="w-full accent-emerald cursor-pointer"
                />
              </div>

              {/* METHOD-SPECIFIC PARAMETERS */}
              {method === "SMA" && (
                <div>
                  <label className="text-fg-2 font-medium block mb-1">
                    {isAr ? "نافذة المتوسط المتحرك (n)" : "SMA Window Size (n periods)"}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={series.length - 1}
                    value={smaWindow}
                    onChange={(e) => setSmaWindow(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-fg-3 block mt-0.5">
                    Averages the last {smaWindow} historical actuals
                  </span>
                </div>
              )}

              {method === "WMA" && (
                <div>
                  <label className="text-fg-2 font-medium block mb-1">
                    {isAr ? "أوزان الفترات الأحدث (مفصولة بفاصلة)" : "WMA Weights (recent to oldest, comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={wmaWeightsStr}
                    onChange={(e) => setWmaWeightsStr(e.target.value)}
                    placeholder="0.5, 0.3, 0.2"
                    className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs font-bold"
                  />
                  <div className="flex justify-between text-[10px] text-fg-3 mt-1 font-mono">
                    <span>Sum: {weightSum.toFixed(2)}</span>
                    <span className={isWeightValid ? "text-emerald" : "text-neg font-bold"}>
                      {isWeightValid ? "Valid (Sums to 1.0)" : "Must sum to 1.0"}
                    </span>
                  </div>
                </div>
              )}

              {method === "SES" && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-fg-2 font-medium">
                      {isAr ? "معامل التمهيد الأسي (α)" : "Smoothing Constant (α Alpha)"}
                    </label>
                    <span className="font-mono font-bold text-emerald">{sesAlpha}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.05}
                    value={sesAlpha}
                    onChange={(e) => setSesAlpha(Number(e.target.value))}
                    className="w-full accent-emerald cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-fg-3">
                    <span>0.05 (Smooth)</span>
                    <span>0.5</span>
                    <span>0.95 (Reactive)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HISTORICAL SERIES TABLE */}
          <div className="panel-input p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-line pb-2">
              <span className="font-mono text-xs font-bold text-fg uppercase">
                {isAr ? "البيانات التاريخية الفعلية" : "Historical Demand Series"}
              </span>
              <button
                onClick={addPeriod}
                className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald hover:text-emerald-light"
              >
                <Plus size={13} /> {isAr ? "إضافة فترة" : "Add Period"}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {series.map((item, idx) => (
                <div key={item.period} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-12 text-fg-3 font-bold">{item.periodLabel}</span>
                  <input
                    type="number"
                    value={item.actual}
                    onChange={(e) => updateActual(idx, Number(e.target.value))}
                    className="flex-1 px-2.5 py-1 rounded bg-ink-3 border border-line font-bold text-right"
                  />
                  <button
                    onClick={() => removePeriod(idx)}
                    disabled={series.length <= 4}
                    className="text-fg-3 hover:text-neg disabled:opacity-20 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTION CHART & SIDE-BY-SIDE COMPARISON (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TIMELINE VISUALIZATION */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "المسار الزمني: الفعلي مقابل التوقع" : "Actual vs. Fitted & Projected Horizon"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "الخط المنقط يمثل الأفق المستقبلي المتوقع" : "Dashed extension visualizes the out-of-sample forward forecast"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                {method} PROJECTION
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={outputs.chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                  <XAxis dataKey="label" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Line type="monotone" dataKey="actual" name="Actual Demand" stroke="#e8f1ed" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line
                    type="monotone"
                    dataKey="fitted"
                    name={`${method} Fit & Forecast`}
                    stroke="#17a88a"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE-BY-SIDE METHOD COMPARISON TABLE */}
          <div className="panel-data p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                {isAr ? "مقارنة دقة النماذج الثلاثة جنباً إلى جنب" : "Side-by-Side Model Accuracy Tournament"}
              </h3>
              <span className="text-[10px] text-fg-3 font-mono">Lower MAPE is superior</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-line bg-ink-3 text-fg-3">
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3 text-right">MAPE (%)</th>
                    <th className="py-2 px-3 text-right">MAD (Units)</th>
                    <th className="py-2 px-3 text-right">Bias</th>
                    <th className="py-2 px-3 text-center">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {outputs.comparativeMetrics.map((comp) => {
                    const isSelected = comp.method === method;
                    return (
                      <tr
                        key={comp.method}
                        className={`hover:bg-ink-3 transition-colors cursor-pointer ${
                          isSelected ? "bg-emerald/5 font-bold" : ""
                        }`}
                        onClick={() => setMethod(comp.method)}
                      >
                        <td className="py-2.5 px-3 font-medium text-fg flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald" />}
                          <span>{comp.name}</span>
                        </td>
                        <td className={`py-2.5 px-3 text-right ${comp.mape < 10 ? "text-emerald font-extrabold" : ""}`}>
                          {comp.mape}%
                        </td>
                        <td className="py-2.5 px-3 text-right">{comp.mad}</td>
                        <td className="py-2.5 px-3 text-right">{comp.bias}</td>
                        <td className="py-2.5 px-3 text-center">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded">
                              ACTIVE
                            </span>
                          ) : (
                            <button
                              onClick={() => setMethod(comp.method)}
                              className="text-[10px] text-fg-3 hover:text-emerald underline cursor-pointer"
                            >
                              Apply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-3 bg-ink-3 rounded-lg border border-line text-xs font-sans text-fg-2">
              <span className="font-bold text-fg block mb-0.5">
                {isAr ? "توصية الاختيار الآلي" : "Model Recommendation:"}
              </span>
              The method with the lowest MAPE provides the closest fit to your historical sales cadence with minimal systematic bias.
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
