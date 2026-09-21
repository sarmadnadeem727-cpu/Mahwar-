"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Kpis, fmt } from "./EngineShell";
import { computeNewsvendor, type NewsvendorInputs } from "@/lib/operations/newsvendor";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULTS: NewsvendorInputs = { unitCost: 38, sellingPrice: 65, salvageValue: 12, shortageCost: 8, meanDemand: 2400, demandStdDev: 520 };

export default function NewsvendorModel() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<NewsvendorInputs>(DEFAULTS);
  const set = <K extends keyof NewsvendorInputs>(k: K, v: NewsvendorInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeNewsvendor(i), [i]);
  useEffect(() => { updateSessionAnalysis("newsvendor", { inputs: i, outputs: { optimalQty: o.optimalQty, expectedProfit: o.expectedProfit, fillRatePct: o.fillRatePct }, computedAt: new Date().toISOString() }); }, [i, o, updateSessionAnalysis]);

  const audit = { toolName: "Newsvendor", toolNameAr: "نموذج بائع الصحف", summary: "Order where P(D ≤ Q) equals the critical ratio Cu / (Cu + Co).", summaryAr: "اطلب حيث يساوي احتمال الطلب ≤ الكمية النسبة الحرجة.",
    steps: [
      { title: "Underage cost", formula: "Cu = p − c + s", substitution: `${i.sellingPrice} − ${i.unitCost} + ${i.shortageCost}`, result: fmt(o.underageCost, 2) },
      { title: "Overage cost", formula: "Co = c − v", substitution: `${i.unitCost} − ${i.salvageValue}`, result: fmt(o.overageCost, 2) },
      { title: "Critical ratio", formula: "CR = Cu / (Cu + Co)", substitution: `${fmt(o.underageCost, 2)} / ${fmt(o.underageCost + o.overageCost, 2)}`, result: fmt(o.criticalRatio, 4) },
      { title: "Optimal quantity", formula: "Q* = μ + z(CR)·σ", substitution: `${i.meanDemand} + ${fmt(o.z, 3)} × ${i.demandStdDev}`, result: fmt(o.optimalQty) },
    ] };

  return (
    <EngineShell id="newsvendor" icon={<Boxes size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={[{ Metric: "Critical ratio", Value: o.criticalRatio }, { Metric: "z", Value: o.z }, { Metric: "Optimal quantity", Value: o.optimalQty }, { Metric: "Expected profit", Value: o.expectedProfit }, { Metric: "Expected lost sales", Value: o.expectedLostSales }, { Metric: "Fill rate %", Value: o.fillRatePct }]}
      inputs={<>
        <Field label={isAr ? "تكلفة الوحدة" : "Unit cost"} value={i.unitCost} onChange={(v) => set("unitCost", v)} suffix={currency} />
        <Field label={isAr ? "سعر البيع" : "Selling price"} value={i.sellingPrice} onChange={(v) => set("sellingPrice", v)} suffix={currency} />
        <Field label={isAr ? "قيمة التصفية" : "Salvage value"} value={i.salvageValue} onChange={(v) => set("salvageValue", v)} suffix={currency} />
        <Field label={isAr ? "تكلفة النقص (سمعة)" : "Shortage penalty"} value={i.shortageCost} onChange={(v) => set("shortageCost", v)} suffix={currency} />
        <Field label={isAr ? "متوسط الطلب" : "Mean demand"} value={i.meanDemand} onChange={(v) => set("meanDemand", v)} />
        <Field label={isAr ? "الانحراف المعياري" : "Demand std dev"} value={i.demandStdDev} onChange={(v) => set("demandStdDev", v)} />
      </>}>
      <Kpis items={[
        { label: isAr ? "الكمية المثلى" : "Optimal order", value: fmt(o.optimalQty), accent: "emerald", sub: `z = ${fmt(o.z, 3)}` },
        { label: isAr ? "النسبة الحرجة" : "Critical ratio", value: fmt(o.criticalRatio, 3) },
        { label: isAr ? "الربح المتوقع" : "Expected profit", value: fmt(o.expectedProfit), accent: "gold" },
        { label: isAr ? "معدل التلبية" : "Fill rate", value: `${fmt(o.fillRatePct, 1)}%`, sub: `${isAr ? "مبيعات ضائعة" : "lost sales"} ${fmt(o.expectedLostSales)}` },
      ]} />
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "الربح المتوقع مقابل كمية الطلب" : "Expected profit vs order quantity"}</div>
        <div className="h-64"><ResponsiveContainer><AreaChart data={o.curve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="qty" {...T.axis} tickFormatter={(v) => fmt(v)} /><YAxis {...T.axis} width={64} tickFormatter={(v) => fmt(v / 1000) + "k"} />
          <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Q = ${fmt(Number(l))}`} />
          <ReferenceLine x={o.curve.reduce((b, p) => (Math.abs(p.qty - o.optimalQty) < Math.abs(b.qty - o.optimalQty) ? p : b), o.curve[0]).qty} stroke={T.colors.gold} strokeDasharray="3 3" />
          <Area type="monotone" dataKey="expectedProfit" stroke={T.colors.emerald} fill={T.colors.emeraldDim} strokeWidth={2} />
        </AreaChart></ResponsiveContainer></div></div>
    </EngineShell>
  );
}

