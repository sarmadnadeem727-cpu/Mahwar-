"use client";
import React, { useMemo, useState } from "react";
import { Factory } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Kpis, Card, fmt, pct } from "./EngineShell";
import { computeMakeBuy, type MakeBuyInputs } from "@/lib/operations/makeBuy";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: MakeBuyInputs = { volume: 60_000, makeFixedCost: 1_450_000, makeVariableCost: 31.5, makeCapacity: 75_000, overtimePremiumPct: 35, buyUnitPrice: 48, buyFixedCost: 120_000, buyLogisticsPerUnit: 2.4, buyQualityRiskPct: 3, annualRatePct: 9, buyInventoryDays: 45 };

export default function MakeVsBuy() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<MakeBuyInputs>(DEFAULTS);
  const set = <K extends keyof MakeBuyInputs>(k: K, v: MakeBuyInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeMakeBuy(i), [i]);
  useSessionSave("makeBuy", i, { recommendation: o.recommendation, makeTotal: o.makeTotal, buyTotal: o.buyTotal, breakevenVolume: o.breakevenVolume });
  const rec = { make: isAr ? "صنّع داخلياً" : "Make in-house", buy: isAr ? "اشترِ من الخارج" : "Buy / outsource", indifferent: isAr ? "متكافئ" : "Indifferent" }[o.recommendation];

  return (
    <EngineShell id="make_buy" icon={<Factory size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Make vs buy", toolNameAr: "التصنيع أم الشراء",
        summary: "Total cost lines for making (fixed + variable, overtime above capacity) and buying (fixed + effective unit cost incl. logistics, quality risk and pipeline carry); break-even where they cross.", summaryAr: "خطوط التكلفة الكلية للتصنيع والشراء ونقطة التعادل عند تقاطعهما.",
        steps: [
          { title: "Buy effective unit", formula: "price × (1 + risk) + logistics + price × r × days/365", substitution: `${i.buyUnitPrice} × ${1 + i.buyQualityRiskPct / 100} + ${i.buyLogisticsPerUnit} + carry`, result: fmt(o.buyComponents.reduce((a, c) => a + c.value, 0), 2) },
          { title: "Make total", formula: "F_make + v_make × Q (+ overtime)", substitution: `${fmt(i.makeFixedCost)} + ${i.makeVariableCost} × ${fmt(i.volume)}`, result: fmt(o.makeTotal) },
          { title: "Buy total", formula: "F_buy + unit × Q", substitution: `${fmt(i.buyFixedCost)} + ${fmt(o.buyUnit - i.buyFixedCost / Math.max(i.volume, 1), 2)} × ${fmt(i.volume)}`, result: fmt(o.buyTotal) },
          { title: "Break-even volume", formula: "(F_make − F_buy) / (v_buy − v_make)", substitution: "", result: o.breakevenVolume === null ? "none" : fmt(o.breakevenVolume) },
        ],
      }}
      exportRows={[{ Metric: "Recommendation", Value: o.recommendation }, { Metric: "Make total", Value: o.makeTotal }, { Metric: "Buy total", Value: o.buyTotal }, { Metric: "Make per unit", Value: o.makeUnit }, { Metric: "Buy per unit", Value: o.buyUnit }, { Metric: "Savings", Value: o.savings }, { Metric: "Break-even volume", Value: o.breakevenVolume ?? "" }]}
      inputs={<>
        <Field label={isAr ? "الحجم السنوي" : "Annual volume"} value={i.volume} onChange={(v) => set("volume", v)} />
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "التصنيع" : "Make"}</div>
        <Field label={isAr ? "تكلفة ثابتة" : "Fixed cost"} value={i.makeFixedCost} onChange={(v) => set("makeFixedCost", v)} suffix={currency} />
        <Field label={isAr ? "متغيرة / وحدة" : "Variable / unit"} value={i.makeVariableCost} onChange={(v) => set("makeVariableCost", v)} suffix={currency} step={0.1} />
        <Field label={isAr ? "الطاقة الإنتاجية" : "Capacity"} value={i.makeCapacity} onChange={(v) => set("makeCapacity", v)} />
        <Field label={isAr ? "علاوة العمل الإضافي" : "Overtime premium"} value={i.overtimePremiumPct} onChange={(v) => set("overtimePremiumPct", v)} suffix="%" />
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "الشراء" : "Buy"}</div>
        <Field label={isAr ? "سعر الوحدة" : "Unit price"} value={i.buyUnitPrice} onChange={(v) => set("buyUnitPrice", v)} suffix={currency} step={0.1} />
        <Field label={isAr ? "ثابتة (تأهيل/قوالب)" : "Fixed (tooling, qualification)"} value={i.buyFixedCost} onChange={(v) => set("buyFixedCost", v)} suffix={currency} />
        <Field label={isAr ? "لوجستيات / وحدة" : "Logistics / unit"} value={i.buyLogisticsPerUnit} onChange={(v) => set("buyLogisticsPerUnit", v)} suffix={currency} step={0.1} />
        <Field label={isAr ? "مخاطر الجودة" : "Quality / rework risk"} value={i.buyQualityRiskPct} onChange={(v) => set("buyQualityRiskPct", v)} suffix="%" step={0.5} />
        <Field label={isAr ? "أيام المخزون في الطريق" : "Pipeline inventory days"} value={i.buyInventoryDays} onChange={(v) => set("buyInventoryDays", v)} suffix="d" />
        <Field label={isAr ? "تكلفة رأس المال" : "Cost of capital"} value={i.annualRatePct} onChange={(v) => set("annualRatePct", v)} suffix="%" step={0.25} />
      </>}>
      <Kpis items={[
        { label: isAr ? "التوصية" : "Recommendation", value: rec, accent: o.recommendation === "make" ? "emerald" : o.recommendation === "buy" ? "gold" : "warn", sub: `${isAr ? "توفير" : "saves"} ${fmt(o.savings)} (${pct(o.savingsPct)})` },
        { label: isAr ? "تكلفة التصنيع" : "Make total", value: fmt(o.makeTotal), sub: `${fmt(o.makeUnit, 2)} / ${isAr ? "وحدة" : "unit"}`, accent: o.capacityFlag ? "warn" : undefined },
        { label: isAr ? "تكلفة الشراء" : "Buy total", value: fmt(o.buyTotal), sub: `${fmt(o.buyUnit, 2)} / ${isAr ? "وحدة" : "unit"}` },
        { label: isAr ? "حجم التعادل" : "Break-even volume", value: o.breakevenVolume === null ? "—" : fmt(o.breakevenVolume), accent: "gold" },
      ]} />
      <Card title={isAr ? "منحنيات التكلفة الكلية" : "Total cost curves"}>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={o.curve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="volume" {...T.axis} tickFormatter={(v) => fmt(v / 1000) + "k"} />
              <YAxis {...T.axis} width={60} tickFormatter={(v) => fmt(v / 1_000_000, 1) + "m"} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Q ${fmt(Number(l))}`} />
              <ReferenceLine x={i.volume} stroke={T.colors.gold} strokeDasharray="3 3" />
              {o.breakevenVolume !== null && <ReferenceLine x={Math.round(o.breakevenVolume)} stroke={T.colors.slateLight} strokeDasharray="2 4" />}
              <Line type="monotone" dataKey="make" stroke={T.colors.emerald} strokeWidth={2} dot={false} name={isAr ? "تصنيع" : "make"} />
              <Line type="monotone" dataKey="buy" stroke={T.colors.gold} strokeWidth={2} dot={false} name={isAr ? "شراء" : "buy"} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title={isAr ? "التكلفة الفعلية للوحدة المشتراة" : "Effective buy cost per unit"}>
        <ul className="font-mono text-[12px] space-y-1.5">{o.buyComponents.map((c) => <li key={c.label} className="flex justify-between"><span className="font-sans text-fg-2">{c.label}</span><span>{fmt(c.value, 2)}</span></li>)}<li className="flex justify-between pt-1.5 border-t border-line text-emerald-light"><span className="font-sans">{isAr ? "الإجمالي" : "Total"}</span><span>{fmt(o.buyComponents.reduce((a, c) => a + c.value, 0), 2)}</span></li></ul>
        {o.capacityFlag && <p className="mt-3 text-[12px] text-warn">{isAr ? "الحجم يتجاوز الطاقة الداخلية — تُطبق علاوة العمل الإضافي على الفائض." : "Volume exceeds in-house capacity — the overtime premium applies to the excess."}</p>}
      </Card>
    </EngineShell>
  );
}
