"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Kpis, fmt } from "./EngineShell";
import { computeBreakeven, type BreakevenInputs } from "@/lib/finance/breakeven";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULTS: BreakevenInputs = { fixedCosts: 1_800_000, pricePerUnit: 145, variableCostPerUnit: 92, expectedUnits: 48_000, targetProfit: 600_000 };

export default function BreakevenAnalysis() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<BreakevenInputs>(DEFAULTS);
  const set = <K extends keyof BreakevenInputs>(k: K, v: BreakevenInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeBreakeven(i), [i]);
  useEffect(() => { updateSessionAnalysis("breakeven", { inputs: i, outputs: { breakevenUnits: o.breakevenUnits, marginOfSafetyPct: o.marginOfSafetyPct, operatingLeverage: o.operatingLeverage }, computedAt: new Date().toISOString() }); }, [i, o, updateSessionAnalysis]);

  const audit = { toolName: "Break-even", toolNameAr: "نقطة التعادل", summary: "Break-even units = fixed costs ÷ contribution per unit.", summaryAr: "وحدات التعادل = التكاليف الثابتة ÷ هامش المساهمة للوحدة.",
    steps: [
      { title: "Contribution per unit", formula: "P − V", substitution: `${i.pricePerUnit} − ${i.variableCostPerUnit}`, result: fmt(o.contributionPerUnit, 2) },
      { title: "Break-even units", formula: "F / (P − V)", substitution: `${fmt(i.fixedCosts)} / ${fmt(o.contributionPerUnit, 2)}`, result: fmt(o.breakevenUnits) },
      { title: "Margin of safety", formula: "(Q − Q_be) / Q", substitution: `(${fmt(i.expectedUnits)} − ${fmt(o.breakevenUnits)}) / ${fmt(i.expectedUnits)}`, result: `${fmt(o.marginOfSafetyPct, 1)}%` },
      { title: "Operating leverage", formula: "Q·(P−V) / profit", substitution: `${fmt(i.expectedUnits * o.contributionPerUnit)} / ${fmt(o.profitAtExpected)}`, result: fmt(o.operatingLeverage, 2) },
    ] };

  return (
    <EngineShell id="breakeven" icon={<Scale size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={[{ Metric: "Break-even units", Value: o.breakevenUnits }, { Metric: "Break-even revenue", Value: o.breakevenRevenue }, { Metric: "Contribution margin %", Value: o.contributionMarginPct }, { Metric: "Margin of safety %", Value: o.marginOfSafetyPct }, { Metric: "Operating leverage", Value: o.operatingLeverage }, { Metric: "Units for target profit", Value: o.unitsForTarget }]}
      inputs={<>
        <Field label={isAr ? "التكاليف الثابتة" : "Fixed costs"} value={i.fixedCosts} onChange={(v) => set("fixedCosts", v)} suffix={currency} />
        <Field label={isAr ? "سعر الوحدة" : "Price per unit"} value={i.pricePerUnit} onChange={(v) => set("pricePerUnit", v)} suffix={currency} />
        <Field label={isAr ? "التكلفة المتغيرة للوحدة" : "Variable cost per unit"} value={i.variableCostPerUnit} onChange={(v) => set("variableCostPerUnit", v)} suffix={currency} />
        <Field label={isAr ? "الوحدات المتوقعة" : "Expected units"} value={i.expectedUnits} onChange={(v) => set("expectedUnits", v)} />
        <Field label={isAr ? "الربح المستهدف" : "Target profit"} value={i.targetProfit ?? 0} onChange={(v) => set("targetProfit", v)} suffix={currency} />
      </>}>
      <Kpis items={[
        { label: isAr ? "وحدات التعادل" : "Break-even units", value: fmt(o.breakevenUnits), accent: "emerald", sub: `${fmt(o.breakevenRevenue)} ${currency}` },
        { label: isAr ? "هامش المساهمة" : "Contribution margin", value: `${fmt(o.contributionMarginPct, 1)}%` },
        { label: isAr ? "هامش الأمان" : "Margin of safety", value: `${fmt(o.marginOfSafetyPct, 1)}%`, accent: o.marginOfSafetyPct < 0 ? "neg" : "gold" },
        { label: isAr ? "الرفع التشغيلي" : "Operating leverage", value: fmt(o.operatingLeverage, 2), sub: `${isAr ? "للهدف" : "for target"}: ${fmt(o.unitsForTarget)} ${isAr ? "وحدة" : "units"}` },
      ]} />
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "الإيراد مقابل التكلفة الكلية" : "Revenue vs total cost"}</div>
        <div className="h-72"><ResponsiveContainer><LineChart data={o.curve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="units" {...T.axis} tickFormatter={(v) => fmt(v / 1000) + "k"} /><YAxis {...T.axis} width={64} tickFormatter={(v) => fmt(v / 1e6, 1) + "m"} />
          <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `${fmt(Number(l))} units`} />
          {Number.isFinite(o.breakevenUnits) && <ReferenceLine x={Math.round(o.breakevenUnits)} stroke={T.colors.gold} strokeDasharray="3 3" />}
          <Line type="monotone" dataKey="revenue" stroke={T.colors.emerald} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="totalCost" stroke={T.colors.negative} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit" stroke={T.colors.gold} strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
        </LineChart></ResponsiveContainer></div></div>
    </EngineShell>
  );
}

