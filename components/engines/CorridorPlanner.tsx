"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import EngineShell, { Field, Select, Kpis, fmt } from "./EngineShell";
import GulfMap from "@/components/ui/GulfMap";
import { useTerminalStore } from "@/store/useTerminalStore";
import { HUBS, HUB_MAP } from "@/lib/geo/hubs";
import { computeCorridor, generateCorridorAudit, MODE_DEFAULTS, type CorridorInputs, type Mode } from "@/lib/operations/corridor";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

const DEFAULTS: CorridorInputs = {
  originId: "jed", destId: "dxb", mode: "sea", cargoTonnes: 500, cargoValue: 2_000_000, carryingRatePct: 12,
  params: JSON.parse(JSON.stringify(MODE_DEFAULTS)),
};

export default function CorridorPlanner() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<CorridorInputs>(DEFAULTS);
  const o = useMemo(() => computeCorridor(i), [i]);
  const s = o.selected;
  const p = i.params[i.mode];

  useEffect(() => {
    updateSessionAnalysis("corridor", {
      inputs: i,
      outputs: { routeKm: s.routeKm, totalDays: s.totalDays, totalCost: s.totalCost, co2Tonnes: s.co2Tonnes },
      computedAt: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const setParam = (k: keyof typeof p, v: number) => setI({ ...i, params: { ...i.params, [i.mode]: { ...p, [k]: v } } });
  const hubOptions = HUBS.map((h) => ({ value: h.id, label: isAr ? h.ar : h.en }));
  const modeLabel: Record<Mode, string> = { sea: isAr ? "بحري" : "Sea", road: isAr ? "بري" : "Road", air: isAr ? "جوي" : "Air" };
  const audit = generateCorridorAudit(i, o);
  const best = o.all.reduce((m, r) => (r.totalCost < m.totalCost ? r : m), o.all[0]);
  const fastest = o.all.reduce((m, r) => (r.totalDays < m.totalDays ? r : m), o.all[0]);

  return (
    <EngineShell
      id="network_map"
      icon={<MapIcon size={22} />}
      audit={audit}
      onReset={() => setI(JSON.parse(JSON.stringify(DEFAULTS)))}
      exportRows={o.all.map((r) => ({ Mode: r.mode, "Route km": Math.round(r.routeKm), "Total days": +r.totalDays.toFixed(1), "Freight": Math.round(r.freightCost), "In-transit cost": Math.round(r.inTransitCost), "Total cost": Math.round(r.totalCost), "CO2 t": +r.co2Tonnes.toFixed(2) }))}
      inputs={
        <>
          <Select label={isAr ? "المنشأ" : "Origin"} value={i.originId} onChange={(v) => setI({ ...i, originId: v })} options={hubOptions} />
          <Select label={isAr ? "الوجهة" : "Destination"} value={i.destId} onChange={(v) => setI({ ...i, destId: v })} options={hubOptions.filter((h) => h.value !== i.originId)} />
          <Select label={isAr ? "الوسيلة" : "Mode"} value={i.mode} onChange={(v) => setI({ ...i, mode: v })} options={(["sea", "road", "air"] as Mode[]).map((m) => ({ value: m, label: modeLabel[m] }))} />
          <Field label={isAr ? "وزن الشحنة" : "Cargo weight"} value={i.cargoTonnes} onChange={(v) => setI({ ...i, cargoTonnes: v })} suffix="t" min={0} />
          <Field label={isAr ? "قيمة الشحنة" : "Cargo value"} value={i.cargoValue} onChange={(v) => setI({ ...i, cargoValue: v })} suffix={currency} min={0} />
          <Field label={isAr ? "معدل تكلفة الحمل السنوي" : "Annual carrying rate"} value={i.carryingRatePct} onChange={(v) => setI({ ...i, carryingRatePct: v })} suffix="%" min={0} />
          <div className="pt-3 mt-3 border-t border-line">
            <div className="font-mono text-[10px] tracking-[0.18em] text-fg-3 uppercase mb-2">{modeLabel[i.mode]} · {isAr ? "افتراضات قابلة للتعديل" : "editable assumptions"}</div>
            <div className="space-y-3">
              <Field label={isAr ? "السرعة" : "Speed"} value={p.speedKmh} onChange={(v) => setParam("speedKmh", v)} suffix="km/h" min={1} />
              <Field label={isAr ? "معامل الانحراف" : "Detour factor"} value={p.detour} onChange={(v) => setParam("detour", v)} step={0.01} min={1} hint="route ÷ great circle" />
              <Field label={isAr ? "سعر الشحن" : "Freight rate"} value={p.ratePerTonneKm} onChange={(v) => setParam("ratePerTonneKm", v)} suffix="/t·km" step={0.01} min={0} />
              <Field label={isAr ? "أيام المناولة" : "Handling days"} value={p.handlingDays} onChange={(v) => setParam("handlingDays", v)} suffix="d" step={0.5} min={0} />
              <Field label={isAr ? "عامل الانبعاث" : "Emission factor"} value={p.gCo2PerTonneKm} onChange={(v) => setParam("gCo2PerTonneKm", v)} suffix="g/t·km" min={0} />
            </div>
          </div>
        </>
      }
    >
      <Kpis items={[
        { label: isAr ? "مسافة الطريق" : "Route distance", value: `${fmt(s.routeKm)} km`, sub: `${fmt(s.greatCircleKm)} km ${isAr ? "دائرة عظمى" : "great circle"}` },
        { label: isAr ? "إجمالي الأيام" : "Door-to-door", value: `${fmt(s.totalDays, 1)} d`, accent: "emerald", sub: `${fmt(s.transitDays, 1)} ${isAr ? "عبور" : "in transit"}` },
        { label: isAr ? "التكلفة الإجمالية" : "Total cost", value: `${fmt(s.totalCost)}`, accent: "gold", sub: `${currency} · ${isAr ? "شحن + مخزون عابر" : "freight + in-transit"}` },
        { label: "CO₂", value: `${fmt(s.co2Tonnes, 2)} t`, accent: s.mode === "air" ? "neg" : undefined },
      ]} />

      <div className="panel-data overflow-hidden">
        <GulfMap isAr={isAr} highlight={{ a: i.originId, b: i.destId }} onSelect={(id) => setI(i.originId === id ? i : { ...i, destId: id })} showVehicles />
        <div className="px-4 py-2 border-t border-line font-mono text-[10.5px] text-fg-3">
          {HUB_MAP[i.originId][isAr ? "ar" : "en"]} → {HUB_MAP[i.destId][isAr ? "ar" : "en"]} · {isAr ? "انقر على مركز لجعله الوجهة" : "click a hub to make it the destination"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel-data p-5">
          <div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "التكلفة حسب الوسيلة" : "Cost by mode"}</div>
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={o.all.map((r) => ({ name: modeLabel[r.mode], freight: Math.round(r.freightCost), transit: Math.round(r.inTransitCost) }))}>
                <CartesianGrid {...T.grid} />
                <XAxis dataKey="name" {...T.axis} />
                <YAxis {...T.axis} tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))} />
                <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} itemStyle={T.tooltipItemStyle} />
                <Bar dataKey="freight" name={isAr ? "شحن" : "Freight"} stackId="a" fill={T.colors.emerald} />
                <Bar dataKey="transit" name={isAr ? "مخزون عابر" : "In-transit"} stackId="a" fill={T.colors.gold}>
                  {o.all.map((r) => <Cell key={r.mode} fill={r.mode === i.mode ? T.colors.gold : T.colors.goldDim} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-data overflow-x-auto">
          <table className="terminal-table">
            <thead><tr><th>{isAr ? "الوسيلة" : "Mode"}</th><th>km</th><th>{isAr ? "أيام" : "Days"}</th><th>{isAr ? "التكلفة" : "Cost"}</th><th>CO₂ t</th></tr></thead>
            <tbody>
              {o.all.map((r) => (
                <tr key={r.mode} onClick={() => setI({ ...i, mode: r.mode })} className={`cursor-pointer ${r.mode === i.mode ? "bg-emerald/10" : ""}`}>
                  <td className="text-fg">{modeLabel[r.mode]} {r === best && <span className="text-emerald-light">·{isAr ? "أرخص" : "cheapest"}</span>}{r === fastest && <span className="text-gold"> ·{isAr ? "أسرع" : "fastest"}</span>}</td>
                  <td>{fmt(r.routeKm)}</td><td>{fmt(r.totalDays, 1)}</td><td>{fmt(r.totalCost)}</td><td>{fmt(r.co2Tonnes, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[11px] text-fg-4">{isAr ? "الأسعار وعوامل الانبعاث افتراضات تخطيطية قابلة للتعديل، وليست عروض أسعار." : "Rates and emission factors are editable planning assumptions, not quotes."}</p>
        </div>
      </div>
    </EngineShell>
  );
}

