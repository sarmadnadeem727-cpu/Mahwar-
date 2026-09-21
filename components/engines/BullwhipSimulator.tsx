"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Waves } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import EngineShell, { Field, Kpis, fmt } from "./EngineShell";
import { simulateBullwhip, type BullwhipInputs } from "@/lib/operations/bullwhip";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULTS: BullwhipInputs = { tiers: 4, leadTimeDays: 4, forecastWindow: 5, demandMean: 100, demandStdDev: 12, periods: 60, seed: 7 };

export default function BullwhipSimulator() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<BullwhipInputs>(DEFAULTS);
  const set = <K extends keyof BullwhipInputs>(k: K, v: BullwhipInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => simulateBullwhip(i), [i]);
  useEffect(() => { updateSessionAnalysis("bullwhip", { inputs: i, outputs: { endToEndAmplification: o.endToEndAmplification, theoreticalPerTier: o.theoreticalPerTier }, computedAt: new Date().toISOString() }); }, [i, o, updateSessionAnalysis]);

  const series = useMemo(() => Array.from({ length: i.periods }, (_, k) => Object.fromEntries([["t", k + 1], ...o.tiers.map((tr) => [tr.name, Math.round(tr.series[k])])])), [o, i.periods]);
  const bars = o.tiers.map((t) => ({ name: t.name, amplification: Number(t.amplification.toFixed(2)) }));

  const audit = { toolName: "Bullwhip simulator", toolNameAr: "محاكي تأثير السوط", summary: "Order-up-to policy with moving-average forecast at each tier; variance ratio measured per tier.", summaryAr: "سياسة الطلب حتى المستوى مع توقع بالمتوسط المتحرك في كل مستوى؛ نسبة التباين تُقاس لكل مستوى.",
    steps: [
      { title: "Theoretical amplification per tier", formula: "Var(q)/Var(D) ≥ 1 + 2L/p + 2L²/p²", substitution: `L = ${i.leadTimeDays}, p = ${i.forecastWindow}`, result: fmt(o.theoreticalPerTier, 2) },
      { title: "Simulated end-to-end", formula: "Var(q_last)/Var(D)", substitution: `${o.tiers.length} tiers, ${i.periods} periods`, result: `${fmt(o.endToEndAmplification, 2)}×` },
    ] };

  return (
    <EngineShell id="bullwhip" icon={<Waves size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={o.tiers.map((t) => ({ Tier: t.name, "Order variance": t.orderVariance, Amplification: t.amplification }))}
      inputs={<>
        <Field label={isAr ? "عدد المستويات" : "Tiers"} value={i.tiers} onChange={(v) => set("tiers", Math.max(1, Math.min(6, v)))} min={1} max={6} />
        <Field label={isAr ? "مدة التوريد (فترات)" : "Lead time (periods)"} value={i.leadTimeDays} onChange={(v) => set("leadTimeDays", v)} min={1} />
        <Field label={isAr ? "نافذة التوقع" : "Forecast window"} value={i.forecastWindow} onChange={(v) => set("forecastWindow", v)} min={1} hint="MA(p)" />
        <Field label={isAr ? "متوسط الطلب" : "Demand mean"} value={i.demandMean} onChange={(v) => set("demandMean", v)} />
        <Field label={isAr ? "الانحراف المعياري" : "Demand std dev"} value={i.demandStdDev} onChange={(v) => set("demandStdDev", v)} />
        <Field label={isAr ? "الفترات" : "Periods"} value={i.periods} onChange={(v) => set("periods", Math.max(10, Math.min(240, v)))} min={10} max={240} />
        <Field label={isAr ? "بذرة العشوائية" : "Random seed"} value={i.seed ?? 1} onChange={(v) => set("seed", v)} />
      </>}>
      <Kpis items={[
        { label: isAr ? "التضخيم الكلي" : "End-to-end amplification", value: `${fmt(o.endToEndAmplification, 2)}×`, accent: o.endToEndAmplification > 4 ? "neg" : "emerald" },
        { label: isAr ? "النظري لكل مستوى" : "Theoretical / tier", value: `${fmt(o.theoreticalPerTier, 2)}×` },
        { label: isAr ? "أعلى مستوى" : "Worst tier", value: o.tiers.length ? o.tiers[o.tiers.length - 1].name : "—", accent: "gold" },
        { label: isAr ? "الحل" : "Lever", value: isAr ? "قصّر L، طوّل p" : "shorter L, longer p", sub: isAr ? "أو شارك بيانات نقاط البيع" : "or share POS data" },
      ]} />
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "الطلبات عبر المستويات" : "Orders by tier"}</div>
        <div className="h-72"><ResponsiveContainer><LineChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="t" {...T.axis} /><YAxis {...T.axis} width={48} /><Legend wrapperStyle={{ fontSize: 10, fontFamily: T.axis.fontFamily }} />
          <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} />
          {o.tiers.map((t, k) => <Line key={t.name} type="monotone" dataKey={t.name} stroke={T.series[k % T.series.length]} strokeWidth={k === o.tiers.length - 1 ? 2 : 1.2} dot={false} />)}
        </LineChart></ResponsiveContainer></div></div>
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "نسبة التباين لكل مستوى" : "Variance ratio per tier"}</div>
        <div className="h-48"><ResponsiveContainer><BarChart data={bars} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="name" {...T.axis} /><YAxis {...T.axis} width={40} />
          <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} /><Bar dataKey="amplification" fill={T.colors.gold} radius={[3, 3, 0, 0]} />
        </BarChart></ResponsiveContainer></div></div>
    </EngineShell>
  );
}

