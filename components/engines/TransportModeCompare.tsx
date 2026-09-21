"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Route } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import EngineShell, { Field, Kpis, fmt } from "./EngineShell";
import { compareTransportModes, type TransportInputs, type ModeInput } from "@/lib/operations/transportMode";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

// Sample lane: Shanghai → Riyadh. Values are editable starting points, not market quotes.
const DEFAULT_MODES: ModeInput[] = [
  { id: "sea", name: "Sea (via Jebel Ali + road)", nameAr: "بحري (عبر جبل علي + بري)", freightPerUnit: 4.2, transitDays: 32, reliabilityPct: 82, co2KgPerUnit: 0.9 },
  { id: "air", name: "Air (to RUH)", nameAr: "جوي (إلى الرياض)", freightPerUnit: 31, transitDays: 4, reliabilityPct: 96, co2KgPerUnit: 21 },
  { id: "rail_road", name: "Sea to Dammam + rail", nameAr: "بحري إلى الدمام + سكك", freightPerUnit: 3.9, transitDays: 29, reliabilityPct: 85, co2KgPerUnit: 0.75 },
  { id: "sea_air", name: "Sea–air via Dubai", nameAr: "بحري–جوي عبر دبي", freightPerUnit: 14, transitDays: 13, reliabilityPct: 90, co2KgPerUnit: 8 },
];
const DEFAULTS: TransportInputs = { unitValue: 180, annualUnits: 120_000, carryingRatePct: 22, safetyStockDaysPerTransitDay: 0.5, carbonPricePerTon: 60, modes: DEFAULT_MODES };

export default function TransportModeCompare() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<TransportInputs>(DEFAULTS);
  const set = <K extends keyof TransportInputs>(k: K, v: TransportInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setMode = (id: string, k: keyof ModeInput, v: number) => setI((p) => ({ ...p, modes: p.modes.map((m) => (m.id === id ? { ...m, [k]: v } : m)) }));
  const o = useMemo(() => compareTransportModes(i), [i]);
  useEffect(() => { updateSessionAnalysis("transportMode", { inputs: i, outputs: { bestMode: o.best?.name, bestTotalCost: o.best?.totalCost, bestPerUnit: o.best?.totalPerUnit }, computedAt: new Date().toISOString() }); }, [i, o, updateSessionAnalysis]);

  const audit = { toolName: "Transport mode comparison", toolNameAr: "مقارنة وسائل النقل", summary: "Total = freight + in-transit carrying + transit-driven safety stock carrying + carbon.", summaryAr: "الإجمالي = الشحن + تكلفة حمل المخزون في الطريق + مخزون الأمان الناتج عن مدة العبور + الكربون.",
    steps: o.results.map((r) => ({ title: r.name, formula: "F + (daily × days × value × rate) + SS + CO₂", substitution: `${fmt(r.freightCost)} + ${fmt(r.inTransitCost)} + ${fmt(r.safetyStockCost)} + ${fmt(r.carbonCost)}`, result: fmt(r.totalCost) })) };

  const chart = o.results.map((r) => ({ name: isAr ? r.nameAr : r.name, freight: Math.round(r.freightCost), transit: Math.round(r.inTransitCost), safety: Math.round(r.safetyStockCost), carbon: Math.round(r.carbonCost) }));

  return (
    <EngineShell id="transport_mode" icon={<Route size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={o.results.map((r) => ({ Mode: r.name, Rank: r.rank, Freight: r.freightCost, "In-transit carrying": r.inTransitCost, "Safety stock carrying": r.safetyStockCost, Carbon: r.carbonCost, Total: r.totalCost, "Per unit": r.totalPerUnit }))}
      inputs={<>
        <Field label={isAr ? "قيمة الوحدة" : "Unit value"} value={i.unitValue} onChange={(v) => set("unitValue", v)} suffix={currency} />
        <Field label={isAr ? "الوحدات سنوياً" : "Annual units"} value={i.annualUnits} onChange={(v) => set("annualUnits", v)} />
        <Field label={isAr ? "معدل تكلفة الحمل" : "Carrying rate"} value={i.carryingRatePct} onChange={(v) => set("carryingRatePct", v)} suffix="%" />
        <Field label={isAr ? "أيام أمان لكل يوم عبور" : "Safety days per transit day"} value={i.safetyStockDaysPerTransitDay} onChange={(v) => set("safetyStockDaysPerTransitDay", v)} step={0.1} />
        <Field label={isAr ? "سعر الكربون" : "Carbon price"} value={i.carbonPricePerTon} onChange={(v) => set("carbonPricePerTon", v)} suffix="/t" />
        <div className="pt-2 border-t border-line space-y-3">
          {i.modes.map((m) => (
            <div key={m.id} className="space-y-1.5">
              <div className="text-[12px] text-fg">{isAr ? m.nameAr : m.name}</div>
              <div className="grid grid-cols-2 gap-2">
                <Field label={isAr ? "شحن/وحدة" : "Freight/unit"} value={m.freightPerUnit} onChange={(v) => setMode(m.id, "freightPerUnit", v)} step={0.1} />
                <Field label={isAr ? "أيام" : "Days"} value={m.transitDays} onChange={(v) => setMode(m.id, "transitDays", v)} />
                <Field label={isAr ? "موثوقية" : "Reliability"} value={m.reliabilityPct} onChange={(v) => setMode(m.id, "reliabilityPct", v)} suffix="%" />
                <Field label="CO₂ kg" value={m.co2KgPerUnit} onChange={(v) => setMode(m.id, "co2KgPerUnit", v)} step={0.1} />
              </div>
            </div>
          ))}
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "الأفضل" : "Lowest total cost", value: o.best ? (isAr ? o.best.nameAr : o.best.name) : "—", accent: "emerald" },
        { label: isAr ? "الإجمالي السنوي" : "Annual total", value: o.best ? fmt(o.best.totalCost) : "—" },
        { label: isAr ? "لكل وحدة" : "Per unit", value: o.best ? fmt(o.best.totalPerUnit, 2) : "—", accent: "gold" },
        { label: isAr ? "الفارق عن الثاني" : "Gap to runner-up", value: o.results[1] ? fmt(o.results[1].totalCost - o.results[0].totalCost) : "—" },
      ]} />
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "تفكيك التكلفة" : "Cost stack by mode"}</div>
        <div className="h-72"><ResponsiveContainer><BarChart data={chart} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="name" {...T.axis} interval={0} /><YAxis {...T.axis} width={64} tickFormatter={(v) => fmt(v / 1e6, 1) + "m"} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: T.axis.fontFamily }} /><Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} />
          <Bar dataKey="freight" stackId="a" fill={T.colors.emerald} /><Bar dataKey="transit" stackId="a" fill={T.colors.gold} /><Bar dataKey="safety" stackId="a" fill={T.series[2]} /><Bar dataKey="carbon" stackId="a" fill={T.colors.slateLight} radius={[3, 3, 0, 0]} />
        </BarChart></ResponsiveContainer></div></div>
      <div className="panel-data overflow-auto"><table className="terminal-table"><thead><tr><th>#</th><th>{isAr ? "الوسيلة" : "Mode"}</th><th>{isAr ? "أيام" : "Days"}</th><th>{isAr ? "شحن" : "Freight"}</th><th>{isAr ? "في الطريق" : "In transit"}</th><th>{isAr ? "أمان" : "Safety"}</th><th>CO₂</th><th>{isAr ? "الإجمالي" : "Total"}</th></tr></thead>
        <tbody>{o.results.map((r) => <tr key={r.id} className={r.rank === 1 ? "text-emerald-light" : ""}><td>{r.rank}</td><td className="font-sans">{isAr ? r.nameAr : r.name}</td><td>{r.transitDays}</td><td>{fmt(r.freightCost)}</td><td>{fmt(r.inTransitCost)}</td><td>{fmt(r.safetyStockCost)}</td><td>{fmt(r.carbonCost)}</td><td>{fmt(r.totalCost)}</td></tr>)}</tbody></table></div>
    </EngineShell>
  );
}

