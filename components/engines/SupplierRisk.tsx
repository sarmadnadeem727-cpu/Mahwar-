"use client";
import React, { useMemo, useState } from "react";
import { ShieldAlert, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import EngineShell, { Field, Kpis, Card, TableScroll, fmt, pct, uid } from "./EngineShell";
import { computeSupplierRisk, type SupplierRiskInputs, type SupplierRow } from "@/lib/operations/supplierRisk";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const SUPPLIERS: SupplierRow[] = [
  { id: "s1", name: "Zhejiang Compressors", country: "China", spend: 14_200_000, leadTimeDays: 62, singleSource: true, riskRating: 4 },
  { id: "s2", name: "Gulf Copper Industries", country: "KSA", spend: 6_800_000, leadTimeDays: 9, singleSource: false, riskRating: 2 },
  { id: "s3", name: "Mumbai Electronics", country: "India", spend: 5_100_000, leadTimeDays: 34, singleSource: false, riskRating: 3 },
  { id: "s4", name: "Sharjah Plastics", country: "UAE", spend: 2_900_000, leadTimeDays: 6, singleSource: false, riskRating: 1 },
  { id: "s5", name: "Izmir Steel", country: "Türkiye", spend: 3_400_000, leadTimeDays: 21, singleSource: true, riskRating: 3 },
];
const DEFAULTS: SupplierRiskInputs = { suppliers: SUPPLIERS, annualRevenue: 110_000_000 };

export default function SupplierRisk() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<SupplierRiskInputs>(DEFAULTS);
  const setS = (id: string, patch: Partial<SupplierRow>) => setI((p) => ({ ...p, suppliers: p.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const o = useMemo(() => computeSupplierRisk(i), [i]);
  useSessionSave("supplierRisk", i, { hhi: o.hhi, top1Pct: o.top1Pct, singleSourcePct: o.singleSourcePct, weightedRisk: o.weightedRisk });

  return (
    <EngineShell id="supplier_risk" icon={<ShieldAlert size={22} />} onReset={() => setI(DEFAULTS)} inputsWidth={430}
      audit={{
        toolName: "Supplier concentration & risk", toolNameAr: "تركّز الموردين والمخاطر",
        summary: "HHI = Σ (share %)²; single-source and country shares are spend-weighted; value at risk = spend × rating/5 × 1.5 if single-sourced.", summaryAr: "مؤشر هيرفندال = مجموع مربعات الحصص؛ القيمة المعرضة = الإنفاق × التصنيف / 5 × 1.5 للمصدر الواحد.",
        steps: [
          { title: "HHI", formula: "Σ (spend share × 100)²", substitution: o.exposure.map((e) => e.sharePct.toFixed(1)).join("² + ") + "²", result: fmt(o.hhi) },
          { title: "Top-1 share", formula: "largest spend / total", substitution: `${fmt(o.exposure[0]?.sharePct ?? 0, 1)}%`, result: pct(o.top1Pct) },
          { title: "Single-source share", formula: "Σ single-source spend / total", substitution: "", result: pct(o.singleSourcePct) },
          { title: "Weighted risk", formula: "Σ share × rating", substitution: "", result: o.weightedRisk.toFixed(2) },
        ],
      }}
      exportRows={[{ Metric: "HHI", Value: o.hhi }, { Metric: "Top-1 %", Value: o.top1Pct }, { Metric: "Top-3 %", Value: o.top3Pct }, { Metric: "Single-source %", Value: o.singleSourcePct }, { Metric: "Weighted risk", Value: o.weightedRisk }, ...o.exposure.map((e) => ({ Metric: e.name, "Share %": e.sharePct, "Value at risk": e.valueAtRisk, Flags: e.flag.join("; ") }))]}
      inputs={<>
        <Field label={isAr ? "الإيرادات السنوية" : "Annual revenue"} value={i.annualRevenue} onChange={(v) => setI((p) => ({ ...p, annualRevenue: v }))} suffix={currency} />
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "الموردون" : "Suppliers"}</span>
            <button onClick={() => setI((p) => ({ ...p, suppliers: [...p.suppliers, { id: uid(), name: "New supplier", country: "KSA", spend: 1_000_000, leadTimeDays: 14, singleSource: false, riskRating: 2 }] }))} className="btn-ghost"><Plus size={12} /> {isAr ? "إضافة" : "Add"}</button>
          </div>
          <div className="space-y-2">
            {i.suppliers.map((s) => (
              <div key={s.id} className="panel-data p-2 space-y-1.5">
                <div className="flex gap-1.5">
                  <input value={s.name} onChange={(e) => setS(s.id, { name: e.target.value })} className="terminal-input h-8 flex-1 min-w-0" />
                  <input value={s.country} onChange={(e) => setS(s.id, { country: e.target.value })} className="terminal-input h-8 w-20 px-1.5" title="Country" />
                  <button onClick={() => setI((p) => ({ ...p, suppliers: p.suppliers.filter((x) => x.id !== s.id) }))} className="text-fg-4 hover:text-neg px-1" aria-label="Remove"><Trash2 size={13} /></button>
                </div>
                <div className="grid grid-cols-[1fr_64px_56px_auto] gap-1 items-center">
                  <input type="number" value={s.spend} onChange={(e) => setS(s.id, { spend: Number(e.target.value) })} className="terminal-input h-7 px-1.5 text-[11px]" title="Spend" />
                  <input type="number" value={s.leadTimeDays} onChange={(e) => setS(s.id, { leadTimeDays: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" title="Lead time days" />
                  <select value={s.riskRating} onChange={(e) => setS(s.id, { riskRating: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px]" title="Risk 1-5">{[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>R{r}</option>)}</select>
                  <label className="flex items-center gap-1 text-[10px] text-fg-3 font-mono"><input type="checkbox" checked={s.singleSource} onChange={(e) => setS(s.id, { singleSource: e.target.checked })} className="accent-emerald" />1src</label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}>
      <Kpis items={[
        { label: "HHI", value: fmt(o.hhi), accent: o.hhiLabel === "concentrated" ? "neg" : o.hhiLabel === "moderate" ? "warn" : "emerald", sub: o.hhiLabel },
        { label: isAr ? "حصة أكبر مورد" : "Top-1 share", value: pct(o.top1Pct), sub: `${isAr ? "أكبر 3" : "top 3"} ${pct(o.top3Pct)}` },
        { label: isAr ? "مصدر واحد" : "Single-sourced spend", value: pct(o.singleSourcePct), accent: o.singleSourcePct > 30 ? "warn" : undefined },
        { label: isAr ? "المخاطر المرجحة" : "Weighted risk (1–5)", value: o.weightedRisk.toFixed(2), accent: "gold", sub: `${isAr ? "مدة توريد مرجحة" : "wtd lead time"} ${fmt(o.spendWeightedLeadTime)} d` },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <Card title={isAr ? "الإنفاق حسب الدولة" : "Spend by country"}>
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={o.countryShares} dataKey="spend" nameKey="country" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">{o.countryShares.map((_, k) => <Cell key={k} fill={T.series[k % T.series.length]} />)}</Pie>
                <Tooltip contentStyle={T.tooltipStyle} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 space-y-1 font-mono text-[11px]">{o.countryShares.map((c, k) => <li key={c.country} className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm" style={{ background: T.series[k % T.series.length] }} /><span className="flex-1 font-sans text-fg-2">{c.country}</span><span>{pct(c.pct, 0)}</span></li>)}</ul>
        </Card>
        <div className="space-y-4 min-w-0">
          <TableScroll maxH="max-h-72">
            <table className="terminal-table"><thead><tr><th>{isAr ? "المورد" : "Supplier"}</th><th>{isAr ? "الحصة" : "Share"}</th><th>{isAr ? "التصنيف" : "Rating"}</th><th>{isAr ? "القيمة المعرضة" : "Value at risk"}</th><th>{isAr ? "الإشارات" : "Flags"}</th></tr></thead>
              <tbody>{o.exposure.map((e) => <tr key={e.id}><td className="font-sans text-fg">{e.name}</td><td>{pct(e.sharePct)}</td><td className={e.riskRating >= 4 ? "text-neg" : e.riskRating === 3 ? "text-warn" : "text-pos"}>R{e.riskRating}</td><td>{fmt(e.valueAtRisk)}</td><td className="font-sans text-[11px] text-fg-3">{e.flag.join(" · ") || "—"}</td></tr>)}</tbody></table>
          </TableScroll>
          <Card title={isAr ? "الإجراءات الموصى بها" : "Recommended actions"}>
            <ul className="space-y-2 text-[12.5px] text-fg-2 leading-relaxed">{o.actions.map((a) => <li key={a} className="flex gap-2"><span className="text-gold shrink-0">▸</span>{a}</li>)}</ul>
          </Card>
        </div>
      </div>
    </EngineShell>
  );
}
