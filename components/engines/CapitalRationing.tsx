"use client";
import React, { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import EngineShell, { Field, Toggle, Kpis, Card, TableScroll, fmt, pct, uid } from "./EngineShell";
import { computeCapitalRationing, type CapitalInputs, type Project } from "@/lib/finance/capitalRationing";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const PROJECTS: Project[] = [
  { id: "a", name: "Jeddah cold-chain hub", outlay: 4_200, cashflows: [900, 1_300, 1_500, 1_500, 1_400] },
  { id: "b", name: "Fleet electrification", outlay: 2_600, cashflows: [500, 800, 900, 900, 900] },
  { id: "c", name: "WMS upgrade", outlay: 1_100, cashflows: [400, 450, 450, 400, 300] },
  { id: "d", name: "Dammam DC expansion", outlay: 3_500, cashflows: [600, 900, 1_100, 1_200, 1_200] },
  { id: "e", name: "Supplier portal", outlay: 700, cashflows: [250, 300, 300, 250, 200] },
];
const DEFAULTS: CapitalInputs = { discountRatePct: 9.5, budget: 7_000, projects: PROJECTS, divisible: false };

export default function CapitalRationing() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<CapitalInputs>(DEFAULTS);
  const set = <K extends keyof CapitalInputs>(k: K, v: CapitalInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setProj = (id: string, patch: Partial<Project>) => set("projects", i.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const o = useMemo(() => computeCapitalRationing(i), [i]);
  useSessionSave("capitalRationing", i, { selectedNpv: o.selectedNpv, budgetUsed: o.budgetUsed, selected: o.projects.filter((p) => p.selected).map((p) => p.name) });

  return (
    <EngineShell id="capital_rationing" icon={<ListChecks size={22} />} onReset={() => setI(DEFAULTS)} inputsWidth={400}
      audit={{
        toolName: "Capital rationing", toolNameAr: "ترشيد رأس المال",
        summary: "NPV and profitability index per project; the portfolio is chosen by exhaustive search (≤ 14 projects) or greedy PI ranking under the budget.", summaryAr: "صافي القيمة الحالية ومؤشر الربحية لكل مشروع؛ تُختار المحفظة بالبحث الشامل أو الترتيب حسب مؤشر الربحية.",
        steps: [
          ...o.projects.slice(0, 5).map((p) => ({ title: p.name, formula: "NPV = Σ CFₜ/(1+r)ᵗ − outlay ; PI = (NPV + outlay)/outlay", substitution: `r = ${i.discountRatePct}%`, result: `NPV ${fmt(p.npv)} · PI ${p.pi.toFixed(2)}` })),
          { title: "Selection", formula: o.method, substitution: `budget ${fmt(i.budget)}`, result: `NPV ${fmt(o.selectedNpv)} using ${fmt(o.budgetUsed)}` },
        ],
      }}
      exportRows={o.projects.map((p) => ({ Project: p.name, Outlay: p.outlay, NPV: p.npv, "IRR %": p.irr === null ? "" : p.irr * 100, PI: p.pi, "Payback (yrs)": p.payback ?? "", "PI rank": p.rankPi, Selected: p.selected ? (p.fraction < 1 ? `${(p.fraction * 100).toFixed(0)}%` : "yes") : "no" }))}
      inputs={<>
        <Field label={isAr ? "معدل الخصم" : "Discount rate"} value={i.discountRatePct} onChange={(v) => set("discountRatePct", v)} suffix="%" step={0.25} />
        <Field label={isAr ? "الميزانية الرأسمالية" : "Capital budget"} value={i.budget} onChange={(v) => set("budget", v)} suffix={currency} />
        <Toggle label={isAr ? "المشاريع قابلة للتجزئة" : "Projects are divisible"} value={i.divisible} onChange={(v) => set("divisible", v)} />
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "المشاريع (تدفقات 5 سنوات)" : "Projects (5-year cash flows)"}</span>
            <button onClick={() => set("projects", [...i.projects, { id: uid(), name: `Project ${i.projects.length + 1}`, outlay: 1_000, cashflows: [300, 300, 300, 300, 300] }])} className="btn-ghost"><Plus size={12} /> {isAr ? "إضافة" : "Add"}</button>
          </div>
          <div className="space-y-2">
            {i.projects.map((p) => (
              <div key={p.id} className="panel-data p-2 space-y-1.5">
                <div className="flex gap-1.5">
                  <input value={p.name} onChange={(e) => setProj(p.id, { name: e.target.value })} className="terminal-input h-8 flex-1 min-w-0" />
                  <input type="number" value={p.outlay} onChange={(e) => setProj(p.id, { outlay: Number(e.target.value) })} className="terminal-input h-8 w-20 px-1.5 text-center" title="Outlay" />
                  <button onClick={() => set("projects", i.projects.filter((x) => x.id !== p.id))} className="text-fg-4 hover:text-neg px-1" aria-label="Remove"><Trash2 size={13} /></button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {p.cashflows.map((cf, k) => <input key={k} type="number" value={cf} onChange={(e) => setProj(p.id, { cashflows: p.cashflows.map((x, j) => (j === k ? Number(e.target.value) : x)) })} className="terminal-input h-7 px-1 text-[11px] text-center" title={`Year ${k + 1}`} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "NPV المحفظة المختارة" : "Selected portfolio NPV", value: fmt(o.selectedNpv), accent: "emerald", sub: currency },
        { label: isAr ? "الميزانية المستخدمة" : "Budget used", value: fmt(o.budgetUsed), sub: `${fmt(o.budgetLeft)} ${isAr ? "متبقٍ" : "left"}` },
        { label: isAr ? "NPV بلا قيود" : "Unconstrained NPV", value: fmt(o.unconstrainedNpv), accent: "gold", sub: isAr ? "كل المشاريع الموجبة" : "all positive-NPV projects" },
        { label: isAr ? "تكلفة القيد" : "Cost of the constraint", value: fmt(o.unconstrainedNpv - o.selectedNpv), accent: o.unconstrainedNpv - o.selectedNpv > 0 ? "warn" : undefined },
      ]} />
      <Card title={isAr ? "صافي القيمة الحالية حسب المشروع" : "NPV by project"} right={<span className="font-mono text-[10px] text-fg-4">{o.method}</span>}>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={o.projects.map((p) => ({ name: p.name, npv: p.npv, sel: p.selected }))} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="name" {...T.axis} interval={0} tick={{ fontSize: 9 }} />
              <YAxis {...T.axis} tickFormatter={(v) => fmt(v)} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} />
              <Bar dataKey="npv" radius={[3, 3, 0, 0]}>{o.projects.map((p) => <Cell key={p.id} fill={p.selected ? T.colors.emerald : p.npv < 0 ? T.colors.negative : T.colors.slateLight} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <TableScroll maxH="max-h-80">
        <table className="terminal-table"><thead><tr><th>#</th><th>{isAr ? "المشروع" : "Project"}</th><th>{isAr ? "الإنفاق" : "Outlay"}</th><th>NPV</th><th>IRR</th><th>PI</th><th>{isAr ? "الاسترداد" : "Payback"}</th><th>{isAr ? "الاختيار" : "Pick"}</th></tr></thead>
          <tbody>{[...o.projects].sort((a, b) => a.rankPi - b.rankPi).map((p) => <tr key={p.id} className={p.selected ? "bg-emerald/5" : ""}><td className="text-fg-3">{p.rankPi}</td><td className="font-sans text-fg">{p.name}</td><td>{fmt(p.outlay)}</td><td className={p.npv < 0 ? "text-neg" : "text-pos"}>{fmt(p.npv)}</td><td>{p.irr === null ? "—" : pct(p.irr * 100)}</td><td>{p.pi.toFixed(2)}</td><td>{p.payback === null ? "—" : `${p.payback.toFixed(1)} y`}</td><td className={p.selected ? "text-emerald-light" : "text-fg-4"}>{p.selected ? (p.fraction < 1 ? `${(p.fraction * 100).toFixed(0)}%` : "✓") : "·"}</td></tr>)}</tbody></table>
      </TableScroll>
    </EngineShell>
  );
}
