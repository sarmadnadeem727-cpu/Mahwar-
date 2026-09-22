"use client";
import React, { useMemo, useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from "recharts";
import EngineShell, { Field, Kpis, Card, TableScroll, fmt, pct, uid } from "./EngineShell";
import { computeComps, type CompsInputs, type Peer } from "@/lib/finance/comps";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const PEERS: Peer[] = [
  { id: "p1", name: "Almarai", evRevenue: 2.6, evEbitda: 11.8, pe: 22.5 },
  { id: "p2", name: "Savola", evRevenue: 0.9, evEbitda: 9.4, pe: 17.2 },
  { id: "p3", name: "Agthia", evRevenue: 1.7, evEbitda: 10.6, pe: 19.8 },
  { id: "p4", name: "Americana", evRevenue: 2.9, evEbitda: 14.1, pe: 26.4 },
  { id: "p5", name: "Halwani", evRevenue: 1.2, evEbitda: 8.9, pe: 15.3 },
];
const DEFAULTS: CompsInputs = { revenue: 4_200, ebitda: 780, netIncome: 390, netDebt: 1_150, sharesOutstanding: 500, currentPrice: 16.4, peers: PEERS };

export default function CompsAnalysis() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<CompsInputs>(DEFAULTS);
  const set = <K extends keyof CompsInputs>(k: K, v: CompsInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setPeer = (id: string, k: keyof Peer, v: string | number) => set("peers", i.peers.map((p) => (p.id === id ? { ...p, [k]: v } : p)));
  const o = useMemo(() => computeComps(i), [i]);
  useSessionSave("comps", i, { blendedPerShare: o.blendedPerShare, upsidePct: o.upsidePct, medianEvEbitda: o.stats[1]?.median });

  const audit = {
    toolName: "Comparable companies", toolNameAr: "الشركات المماثلة",
    summary: "Implied equity = peer multiple × target metric − net debt (P/E applies directly to net income).", summaryAr: "القيمة الضمنية = مضاعف الأقران × مقياس الشركة − صافي الدين.",
    steps: o.stats.map((s) => ({ title: `${s.label} quartiles`, formula: "P25 · median · P75 of peer set", substitution: `${s.n} peers`, result: `${s.p25.toFixed(1)}x · ${s.median.toFixed(1)}x · ${s.p75.toFixed(1)}x` })).concat([
      { title: "Blended value / share", formula: "mean of median-implied values", substitution: o.implied.map((r) => r.midPs.toFixed(2)).join(" , "), result: fmt(o.blendedPerShare, 2) },
    ]),
  };
  const chart = o.implied.map((r) => ({ name: r.label, low: r.lowPs, mid: r.midPs, high: r.highPs, range: r.highPs - r.lowPs }));

  return (
    <EngineShell id="comps" icon={<Users size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={[
        { Metric: "Blended value / share", Value: o.blendedPerShare }, { Metric: "Upside %", Value: o.upsidePct },
        ...o.implied.flatMap((r) => [{ Metric: `${r.label} low / share`, Value: r.lowPs }, { Metric: `${r.label} median / share`, Value: r.midPs }, { Metric: `${r.label} high / share`, Value: r.highPs }]),
        ...i.peers.map((p) => ({ Metric: `Peer ${p.name}`, "EV/Rev": p.evRevenue, "EV/EBITDA": p.evEbitda, "P/E": p.pe })),
      ]}
      inputs={<>
        <Field label={isAr ? "الإيرادات (م)" : "Revenue (m)"} value={i.revenue} onChange={(v) => set("revenue", v)} suffix={currency} />
        <Field label="EBITDA (m)" value={i.ebitda} onChange={(v) => set("ebitda", v)} suffix={currency} />
        <Field label={isAr ? "صافي الدخل (م)" : "Net income (m)"} value={i.netIncome} onChange={(v) => set("netIncome", v)} suffix={currency} />
        <Field label={isAr ? "صافي الدين (م)" : "Net debt (m)"} value={i.netDebt} onChange={(v) => set("netDebt", v)} suffix={currency} />
        <Field label={isAr ? "الأسهم القائمة (م)" : "Shares outstanding (m)"} value={i.sharesOutstanding} onChange={(v) => set("sharesOutstanding", v)} />
        <Field label={isAr ? "السعر الحالي" : "Current price"} value={i.currentPrice} onChange={(v) => set("currentPrice", v)} suffix={currency} step={0.05} />
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "مجموعة الأقران" : "Peer set"}</span>
            <button onClick={() => set("peers", [...i.peers, { id: uid(), name: `Peer ${i.peers.length + 1}`, evRevenue: 1.5, evEbitda: 10, pe: 18 }])} className="btn-ghost"><Plus size={12} /> {isAr ? "إضافة" : "Add"}</button>
          </div>
          <div className="space-y-2">
            {i.peers.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_52px_52px_52px_24px] gap-1 items-center">
                <input value={p.name} onChange={(e) => setPeer(p.id, "name", e.target.value)} className="terminal-input h-8 min-w-0" />
                <input type="number" step={0.1} value={p.evRevenue} onChange={(e) => setPeer(p.id, "evRevenue", Number(e.target.value))} className="terminal-input h-8 px-1 text-center" title="EV/Revenue" />
                <input type="number" step={0.1} value={p.evEbitda} onChange={(e) => setPeer(p.id, "evEbitda", Number(e.target.value))} className="terminal-input h-8 px-1 text-center" title="EV/EBITDA" />
                <input type="number" step={0.1} value={p.pe} onChange={(e) => setPeer(p.id, "pe", Number(e.target.value))} className="terminal-input h-8 px-1 text-center" title="P/E" />
                <button onClick={() => set("peers", i.peers.filter((x) => x.id !== p.id))} className="text-fg-4 hover:text-neg" aria-label="Remove peer"><Trash2 size={13} /></button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_52px_52px_52px_24px] gap-1 font-mono text-[9px] text-fg-4 text-center"><span /><span>EV/Rev</span><span>EV/EBITDA</span><span>P/E</span><span /></div>
          </div>
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "القيمة المرجحة / سهم" : "Blended value / share", value: fmt(o.blendedPerShare, 2), accent: "emerald", sub: currency },
        { label: isAr ? "الفارق عن السعر" : "Vs. current price", value: pct(o.upsidePct), accent: o.upsidePct >= 0 ? "emerald" : "neg" },
        { label: "EV / EBITDA (target now)", value: `${fmt(o.targetMultiples.evEbitda, 1)}x`, sub: `${isAr ? "وسيط الأقران" : "peer median"} ${fmt(o.stats[1]?.median ?? 0, 1)}x` },
        { label: "P / E (target now)", value: `${fmt(o.targetMultiples.pe, 1)}x`, sub: `${isAr ? "وسيط الأقران" : "peer median"} ${fmt(o.stats[2]?.median ?? 0, 1)}x`, accent: "gold" },
      ]} />
      <Card title={isAr ? "ملعب كرة القدم — القيمة الضمنية للسهم" : "Football field — implied value per share"}>
        <div className="h-60">
          <ResponsiveContainer>
            <BarChart data={chart} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
              <CartesianGrid {...T.grid} horizontal={false} />
              <XAxis type="number" {...T.axis} tickFormatter={(v) => fmt(v, 0)} />
              <YAxis type="category" dataKey="name" {...T.axis} width={88} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number, n: string) => [fmt(v, 2), n === "range" ? "high" : n]} />
              <ReferenceLine x={i.currentPrice} stroke={T.colors.gold} strokeDasharray="4 3" label={{ value: "price", fill: T.colors.gold, fontSize: 10, position: "top" }} />
              <ReferenceLine x={o.blendedPerShare} stroke={T.colors.emerald} strokeDasharray="2 4" />
              <Bar dataKey="low" stackId="a" fill="transparent" />
              <Bar dataKey="range" stackId="a" radius={2}>{chart.map((_, k) => <Cell key={k} fill={T.colors.emerald} fillOpacity={0.55 + k * 0.15} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <TableScroll maxH="max-h-72">
        <table className="terminal-table"><thead><tr><th>{isAr ? "المضاعف" : "Multiple"}</th><th>Min</th><th>P25</th><th>{isAr ? "الوسيط" : "Median"}</th><th>P75</th><th>Max</th><th>{isAr ? "قيمة السهم (وسيط)" : "Per share (median)"}</th></tr></thead>
          <tbody>{o.stats.map((s, k) => <tr key={s.key}><td className="text-emerald-light">{s.label}</td><td>{s.min.toFixed(1)}x</td><td>{s.p25.toFixed(1)}x</td><td className="text-fg">{s.median.toFixed(1)}x</td><td>{s.p75.toFixed(1)}x</td><td>{s.max.toFixed(1)}x</td><td className="text-gold">{fmt(o.implied[k].midPs, 2)}</td></tr>)}</tbody></table>
      </TableScroll>
    </EngineShell>
  );
}
