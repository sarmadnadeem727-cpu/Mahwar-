"use client";
import React, { useMemo, useState } from "react";
import { Target } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import EngineShell, { Field, Kpis, Card, fmt, pct } from "./EngineShell";
import { computeScor, type ScorInputs } from "@/lib/operations/scorKpi";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: ScorInputs = { orders: 4_800, onTime: 4_420, inFull: 4_560, damageFree: 4_730, docsCorrect: 4_690, perfectOrders: 4_120, linesRequested: 26_400, linesShipped: 25_300, dio: 58, dso: 52, dpo: 41, forecastMapePct: 24, scCostPctRevenue: 9.2, upsideFlexDays: 35 };
const TIER = { best: "text-emerald-light", advantage: "text-pos", parity: "text-warn", lagging: "text-neg" };

export default function ScorScorecard() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<ScorInputs>(DEFAULTS);
  const set = <K extends keyof ScorInputs>(k: K, v: ScorInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeScor(i), [i]);
  useSessionSave("scorKpi", i, { overall: o.overall, perfectOrderPct: o.perfectOrderPct, otifPct: o.otifPct, cashToCash: o.cashToCash });
  const f = (k: keyof ScorInputs, en: string, ar: string, suffix?: string) => <Field key={k} label={isAr ? ar : en} value={i[k]} onChange={(v) => set(k, v)} suffix={suffix} />;

  return (
    <EngineShell id="scor_kpi" icon={<Target size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Supply-chain KPI scorecard", toolNameAr: "بطاقة مؤشرات سلسلة الإمداد",
        summary: "Ten SCOR-style metrics scored 0–100 against best-in-class and median benchmarks (lagging = median minus the gap to best).", summaryAr: "عشرة مؤشرات على طريقة SCOR مقيّمة من 0 إلى 100 مقابل الأفضل في الفئة والوسيط.",
        steps: [
          { title: "OTIF", formula: "min(on time, in full) / orders", substitution: `min(${i.onTime}, ${i.inFull}) / ${i.orders}`, result: pct(o.otifPct) },
          { title: "Perfect order", formula: "perfect orders / orders", substitution: `${i.perfectOrders} / ${i.orders}`, result: pct(o.perfectOrderPct) },
          { title: "Cash-to-cash", formula: "DIO + DSO − DPO", substitution: `${i.dio} + ${i.dso} − ${i.dpo}`, result: `${fmt(o.cashToCash)} d` },
          { title: "Score", formula: "(value − lagging) / (best − lagging) × 100, clipped", substitution: "per metric", result: fmt(o.overall) },
        ],
      }}
      exportRows={[{ Metric: "Overall score", Value: o.overall }, ...o.kpis.map((k) => ({ Metric: k.label, Value: k.value, Unit: k.unit, "Best in class": k.bestInClass, Median: k.median, Score: k.score, Tier: k.tier }))]}
      inputs={<>
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-1">{isAr ? "الطلبات (الفترة)" : "Orders (period)"}</div>
        {f("orders", "Orders shipped", "الطلبات المشحونة")}{f("onTime", "On time", "في الوقت")}{f("inFull", "In full", "كاملة")}{f("damageFree", "Damage-free", "بدون تلف")}{f("docsCorrect", "Documents correct", "مستندات صحيحة")}{f("perfectOrders", "Perfect orders (all four)", "طلبات مثالية")}
        {f("linesRequested", "Lines requested", "الأسطر المطلوبة")}{f("linesShipped", "Lines shipped", "الأسطر المشحونة")}
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "النقد والتخطيط والتكلفة" : "Cash, planning, cost"}</div>
        {f("dio", "DIO", "أيام المخزون", "d")}{f("dso", "DSO", "أيام التحصيل", "d")}{f("dpo", "DPO", "أيام السداد", "d")}{f("forecastMapePct", "Forecast MAPE", "خطأ التنبؤ", "%")}{f("scCostPctRevenue", "SC cost / revenue", "تكلفة السلسلة / الإيراد", "%")}{f("upsideFlexDays", "Days to +20 % volume", "أيام لزيادة 20%", "d")}
      </>}>
      <Kpis items={[
        { label: isAr ? "النتيجة الإجمالية" : "Overall score", value: `${fmt(o.overall)} / 100`, accent: o.overall >= 66 ? "emerald" : o.overall >= 33 ? "warn" : "neg" },
        { label: "OTIF", value: pct(o.otifPct) },
        { label: isAr ? "الطلب المثالي" : "Perfect order", value: pct(o.perfectOrderPct), accent: "gold" },
        { label: isAr ? "الأضعف" : "Weakest", value: o.weakest ? fmt(o.weakest.score) : "—", accent: "neg", sub: o.weakest?.label },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <Card title={isAr ? "الرادار" : "Radar"}>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={o.kpis.map((k) => ({ k: k.label.split(" (")[0].slice(0, 18), score: Math.round(k.score) }))} outerRadius="72%">
                <PolarGrid stroke={T.colors.grid} />
                <PolarAngleAxis dataKey="k" tick={{ fill: T.colors.slate, fontSize: 9 }} />
                <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} />
                <Radar dataKey="score" stroke={T.colors.emerald} fill={T.colors.emerald} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title={isAr ? "المؤشرات مقابل المعايير" : "Metrics vs benchmarks"} className="!p-0">
          <div className="overflow-x-auto"><table className="terminal-table"><thead><tr><th>{isAr ? "المؤشر" : "Metric"}</th><th>{isAr ? "القيمة" : "Value"}</th><th>{isAr ? "الوسيط" : "Median"}</th><th>{isAr ? "الأفضل" : "Best"}</th><th>{isAr ? "الدرجة" : "Score"}</th></tr></thead>
            <tbody>{o.kpis.map((k) => <tr key={k.key}><td className="font-sans text-fg text-[12px]">{k.label}</td><td className={TIER[k.tier]}>{k.unit === "%" ? pct(k.value) : k.unit === "days" ? `${fmt(k.value)} d` : fmt(k.value, 2)}</td><td className="text-fg-3">{k.median}{k.unit === "%" ? "%" : ""}</td><td className="text-fg-3">{k.bestInClass}{k.unit === "%" ? "%" : ""}</td><td><span className="inline-flex items-center gap-2"><span className="w-16 h-1.5 rounded-full bg-ink-4 overflow-hidden"><span className="block h-full bg-emerald" style={{ width: `${k.score}%` }} /></span>{fmt(k.score)}</span></td></tr>)}</tbody></table></div>
        </Card>
      </div>
    </EngineShell>
  );
}
