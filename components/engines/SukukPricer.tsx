"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Select, Kpis, fmt } from "./EngineShell";
import { priceSukuk, type SukukInputs } from "@/lib/finance/sukuk";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULTS: SukukInputs = { faceValue: 1000, profitRatePct: 5.25, yearsToMaturity: 5, frequency: 2, marketYieldPct: 5.9 };

export default function SukukPricer() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<SukukInputs>(DEFAULTS);
  const set = <K extends keyof SukukInputs>(k: K, v: SukukInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => priceSukuk(i), [i]);

  useEffect(() => {
    updateSessionAnalysis("sukuk", { inputs: i, outputs: { price: o.price, modifiedDuration: o.modifiedDuration, currentYieldPct: o.currentYieldPct }, computedAt: new Date().toISOString() });
  }, [i, o, updateSessionAnalysis]);

  const audit = {
    toolName: "Sukuk pricer", toolNameAr: "مسعّر الصكوك",
    summary: "Price = Σ profit distributions and face value discounted at the periodic market yield.", summaryAr: "السعر = مجموع التوزيعات والقيمة الاسمية مخصومة بعائد السوق الدوري.",
    steps: [
      { title: "Periodic profit", formula: "c = F × r / f", substitution: `${i.faceValue} × ${i.profitRatePct}% / ${i.frequency}`, result: fmt(o.cashflows[0]?.cash ?? 0, 2) },
      { title: "Price", formula: "P = Σ c/(1+y)^k + F/(1+y)^n", substitution: `y = ${i.marketYieldPct}% / ${i.frequency}, n = ${o.cashflows.length}`, result: fmt(o.price, 2) },
      { title: "Macaulay duration", formula: "D = Σ t·PV(CF) / P", substitution: `Σ t·PV / ${fmt(o.price, 2)}`, result: `${fmt(o.macaulayDuration, 3)} yrs` },
      { title: "Modified duration", formula: "D_mod = D / (1 + y)", substitution: `${fmt(o.macaulayDuration, 3)} / (1 + ${(i.marketYieldPct / i.frequency).toFixed(3)}%)`, result: fmt(o.modifiedDuration, 3) },
    ],
  };

  return (
    <EngineShell id="sukuk" icon={<Landmark size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={[{ Metric: "Price", Value: o.price }, { Metric: "Price % of par", Value: o.pricePct }, { Metric: "Macaulay duration", Value: o.macaulayDuration }, { Metric: "Modified duration", Value: o.modifiedDuration }, { Metric: "Convexity", Value: o.convexity }, { Metric: "Current yield %", Value: o.currentYieldPct }, ...o.cashflows.map((c) => ({ Metric: `Period ${c.period} cash`, Value: c.cash, PV: c.pv }))]}
      inputs={<>
        <Field label={isAr ? "القيمة الاسمية" : "Face value"} value={i.faceValue} onChange={(v) => set("faceValue", v)} suffix={currency} />
        <Field label={isAr ? "معدل الربح السنوي" : "Profit rate"} value={i.profitRatePct} onChange={(v) => set("profitRatePct", v)} suffix="%" step={0.05} />
        <Field label={isAr ? "سنوات حتى الاستحقاق" : "Years to maturity"} value={i.yearsToMaturity} onChange={(v) => set("yearsToMaturity", v)} step={0.5} min={0.5} />
        <Select label={isAr ? "تكرار التوزيع" : "Distribution frequency"} value={String(i.frequency) as "1" | "2" | "4"} onChange={(v) => set("frequency", Number(v) as 1 | 2 | 4)} options={[{ value: "1", label: isAr ? "سنوي" : "Annual" }, { value: "2", label: isAr ? "نصف سنوي" : "Semi-annual" }, { value: "4", label: isAr ? "ربع سنوي" : "Quarterly" }]} />
        <Field label={isAr ? "عائد السوق المطلوب" : "Market yield"} value={i.marketYieldPct} onChange={(v) => set("marketYieldPct", v)} suffix="%" step={0.05} />
      </>}>
      <Kpis items={[
        { label: isAr ? "السعر" : "Price", value: fmt(o.price, 2), accent: "emerald", sub: `${fmt(o.pricePct, 2)}% ${isAr ? "من الاسمية" : "of par"}` },
        { label: isAr ? "المدة المعدلة" : "Mod. duration", value: fmt(o.modifiedDuration, 2), sub: isAr ? "% تغير السعر لكل 1% عائد" : "% price move per 1% yield" },
        { label: isAr ? "التحدب" : "Convexity", value: fmt(o.convexity, 2) },
        { label: isAr ? "العائد الحالي" : "Current yield", value: `${fmt(o.currentYieldPct, 2)}%`, accent: "gold" },
      ]} />
      <div className="panel-data p-5">
        <div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "السعر مقابل العائد" : "Price vs yield"}</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={o.priceCurve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="yieldPct" {...T.axis} tickFormatter={(v) => `${v}%`} />
              <YAxis {...T.axis} width={56} tickFormatter={(v) => fmt(v)} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v, 2)} labelFormatter={(l) => `yield ${l}%`} />
              <ReferenceLine x={i.marketYieldPct} stroke={T.colors.gold} strokeDasharray="3 3" />
              <ReferenceLine y={i.faceValue} stroke={T.colors.slateLight} strokeDasharray="2 4" />
              <Line type="monotone" dataKey="price" stroke={T.colors.emerald} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel-data overflow-auto max-h-80">
        <table className="terminal-table"><thead><tr><th>#</th><th>t (yrs)</th><th>{isAr ? "التدفق" : "Cash"}</th><th>PV</th></tr></thead>
          <tbody>{o.cashflows.map((c) => <tr key={c.period}><td>{c.period}</td><td>{c.t.toFixed(2)}</td><td>{fmt(c.cash, 2)}</td><td>{fmt(c.pv, 2)}</td></tr>)}</tbody></table>
      </div>
    </EngineShell>
  );
}

