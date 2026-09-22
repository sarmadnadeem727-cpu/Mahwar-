"use client";
import React, { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Select, TextField, Kpis, Card, TableScroll, fmt, pct } from "./EngineShell";
import { computeFx, type FxInputs } from "@/lib/finance/fx";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: FxInputs = { pair: "EUR/SAR", spot: 4.05, domesticRatePct: 5.6, foreignRatePct: 3.4, tenorDays: 180, exposure: 2_500_000, direction: "payable", forwardQuote: 0, shockPct: 8 };

export default function FxHedge() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<FxInputs>(DEFAULTS);
  const set = <K extends keyof FxInputs>(k: K, v: FxInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeFx(i), [i]);
  useSessionSave("fxHedge", i, { fairForward: o.fairForward, forwardHedged: o.forwardHedged, mmHedged: o.mmHedged, hedgeCostPct: o.hedgeCostPct });
  const [base, quote] = i.pair.split("/");
  const t = i.tenorDays / 365;
  const curve = Array.from({ length: 21 }, (_, k) => { const s = i.spot * (1 - i.shockPct / 100 + (2 * i.shockPct / 100) * (k / 20)); return { spot: Number(s.toFixed(4)), unhedged: i.exposure * s, forward: o.forwardHedged }; });

  return (
    <EngineShell id="fx_hedge" icon={<ArrowLeftRight size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "FX exposure & hedge", toolNameAr: "التعرض لسعر الصرف والتحوط",
        summary: "Fair forward from covered interest parity; money-market hedge replicates it with a deposit and a loan; scenarios show the open position.", summaryAr: "السعر الآجل العادل من تعادل الفائدة المغطاة؛ التحوط عبر سوق النقد يكرره بوديعة وقرض.",
        steps: [
          { title: "CIP forward", formula: "F = S × (1 + r_d·t) / (1 + r_f·t)", substitution: `${i.spot} × (1 + ${i.domesticRatePct}%·${t.toFixed(3)}) / (1 + ${i.foreignRatePct}%·${t.toFixed(3)})`, result: o.fairForward.toFixed(4) },
          { title: "Forward points", formula: "(F − S) × 10,000", substitution: `(${o.usedForward.toFixed(4)} − ${i.spot}) × 10,000`, result: fmt(o.forwardPoints, 0) },
          { title: "Forward-hedged amount", formula: "exposure × F", substitution: `${fmt(i.exposure)} × ${o.usedForward.toFixed(4)}`, result: fmt(o.forwardHedged) },
          ...o.mmSteps.map((s) => ({ title: s.label, formula: "money-market leg", substitution: "", result: fmt(s.value, 2) })),
        ],
      }}
      exportRows={[{ Metric: "Fair forward", Value: o.fairForward }, { Metric: "Forward used", Value: o.usedForward }, { Metric: "Forward points", Value: o.forwardPoints }, { Metric: "Forward-hedged domestic", Value: o.forwardHedged }, { Metric: "Money-market hedge domestic", Value: o.mmHedged }, { Metric: "Unhedged at spot", Value: o.unhedgedAtSpot }, ...o.scenarios.map((s) => ({ Metric: `Scenario ${s.label}`, Spot: s.spot, Unhedged: s.unhedged, "Δ vs forward": s.deltaVsForward }))]}
      inputs={<>
        <TextField label={isAr ? "الزوج (أساس/تسعير)" : "Pair (base/quote)"} value={i.pair} onChange={(v) => set("pair", v.toUpperCase())} placeholder="EUR/SAR" />
        <Select label={isAr ? "الاتجاه" : "Direction"} value={i.direction} onChange={(v) => set("direction", v)} options={[{ value: "payable", label: isAr ? `مدفوعات بـ ${base}` : `Payable in ${base}` }, { value: "receivable", label: isAr ? `مقبوضات بـ ${base}` : `Receivable in ${base}` }]} />
        <Field label={isAr ? `التعرض (${base})` : `Exposure (${base})`} value={i.exposure} onChange={(v) => set("exposure", v)} />
        <Field label={isAr ? "السعر الفوري" : "Spot"} value={i.spot} onChange={(v) => set("spot", v)} step={0.0001} />
        <Field label={isAr ? `فائدة ${quote} (محلية)` : `${quote} rate (domestic)`} value={i.domesticRatePct} onChange={(v) => set("domesticRatePct", v)} suffix="%" step={0.05} />
        <Field label={isAr ? `فائدة ${base} (أجنبية)` : `${base} rate (foreign)`} value={i.foreignRatePct} onChange={(v) => set("foreignRatePct", v)} suffix="%" step={0.05} />
        <Field label={isAr ? "الأجل (أيام)" : "Tenor (days)"} value={i.tenorDays} onChange={(v) => set("tenorDays", v)} min={1} />
        <Field label={isAr ? "عرض البنك الآجل (اختياري)" : "Bank forward quote (optional)"} value={i.forwardQuote ?? 0} onChange={(v) => set("forwardQuote", v)} step={0.0001} hint="0 = CIP" />
        <Field label={isAr ? "سعة السيناريو ±" : "Scenario width ±"} value={i.shockPct} onChange={(v) => set("shockPct", v)} suffix="%" />
      </>}>
      <Kpis items={[
        { label: isAr ? "الآجل العادل" : "Fair forward", value: o.fairForward.toFixed(4), accent: "emerald", sub: `${fmt(o.forwardPoints, 0)} pts · ${pct(o.annualisedCarryPct, 2)} p.a.` },
        { label: isAr ? "مبلغ التحوط الآجل" : "Forward-hedged", value: fmt(o.forwardHedged), sub: quote },
        { label: isAr ? "تحوط سوق النقد" : "Money-market hedge", value: fmt(o.mmHedged), sub: quote, accent: "gold" },
        { label: isAr ? "تكلفة التحوط" : "Hedge cost vs spot", value: pct(o.hedgeCostPct, 2), accent: o.hedgeCostPct > 0 ? "warn" : "emerald", sub: isAr ? "موجب = يكلف" : "positive = costs you" },
      ]} />
      <Card title={isAr ? "المركز المفتوح مقابل المتحوط" : "Open position vs hedged"}>
        <div className="h-60">
          <ResponsiveContainer>
            <LineChart data={curve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="spot" {...T.axis} tickFormatter={(v) => Number(v).toFixed(3)} />
              <YAxis {...T.axis} width={64} tickFormatter={(v) => fmt(v / 1000) + "k"} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `spot ${l}`} />
              <ReferenceLine x={Number(i.spot.toFixed(4))} stroke={T.colors.gold} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="unhedged" stroke={T.colors.negative} strokeWidth={2} dot={false} name={isAr ? "غير متحوط" : "unhedged"} />
              <Line type="monotone" dataKey="forward" stroke={T.colors.emerald} strokeWidth={2} dot={false} name={isAr ? "آجل" : "forward"} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <TableScroll maxH="max-h-72">
        <table className="terminal-table"><thead><tr><th>{isAr ? "السيناريو" : "Scenario"}</th><th>Spot</th><th>{isAr ? "غير متحوط" : "Unhedged"}</th><th>{isAr ? "آجل" : "Forward"}</th><th>{isAr ? "سوق النقد" : "Money market"}</th><th>{isAr ? "ميزة التحوط" : "Hedge benefit"}</th></tr></thead>
          <tbody>{o.scenarios.map((s) => <tr key={s.label}><td className="text-emerald-light">{s.label}</td><td>{s.spot.toFixed(4)}</td><td>{fmt(s.unhedged)}</td><td>{fmt(s.forwardHedged)}</td><td>{fmt(s.mmHedged)}</td><td className={s.deltaVsForward >= 0 ? "text-pos" : "text-neg"}>{fmt(s.deltaVsForward)}</td></tr>)}</tbody></table>
      </TableScroll>
    </EngineShell>
  );
}
