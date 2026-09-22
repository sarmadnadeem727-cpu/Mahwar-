"use client";
import React, { useMemo, useState } from "react";
import { CalendarRange, Wand2 } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Kpis, Card, TableScroll, fmt } from "./EngineShell";
import { computeCash13, seedWeeks, type Cash13Inputs, type CashWeek } from "@/lib/finance/cash13";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DRIVERS = { weeklySales: 1_150_000, collectionLagWeeks: 4, grossMarginPct: 32, weeklyPayroll: 190_000, weeklyOpex: 145_000, capexWeek: 6, capexAmount: 900_000, debtServiceWeek: 9, debtServiceAmount: 1_250_000, seasonalityPct: 12 };
const DEFAULTS: Cash13Inputs = { openingCash: 2_400_000, minimumCash: 1_000_000, revolverLimit: 3_000_000, revolverRatePct: 7.5, weeks: seedWeeks(DRIVERS) };
const COLS: { k: keyof CashWeek; en: string; ar: string }[] = [
  { k: "receipts", en: "Receipts", ar: "المقبوضات" }, { k: "payroll", en: "Payroll", ar: "الرواتب" }, { k: "suppliers", en: "Suppliers", ar: "الموردون" },
  { k: "opex", en: "Opex", ar: "المصاريف" }, { k: "capex", en: "Capex", ar: "الرأسمالي" }, { k: "debtService", en: "Debt service", ar: "خدمة الدين" }, { k: "other", en: "Other", ar: "أخرى" },
];

export default function Cash13Forecast() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<Cash13Inputs>(DEFAULTS);
  const [d, setD] = useState(DRIVERS);
  const set = <K extends keyof Cash13Inputs>(k: K, v: Cash13Inputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setCell = (week: number, k: keyof CashWeek, v: number) => set("weeks", i.weeks.map((w) => (w.week === week ? { ...w, [k]: v } : w)));
  const o = useMemo(() => computeCash13(i), [i]);
  useSessionSave("cash13", { openingCash: i.openingCash, minimumCash: i.minimumCash, revolverLimit: i.revolverLimit, weeks: i.weeks }, { minCash: o.minCash, minCashWeek: o.minCashWeek, peakRevolver: o.peakRevolver, netChange: o.netChange, runwayWeeks: o.runwayWeeks });

  const k = (n: number) => fmt(n / 1000, 0) + "k";
  const chart = o.rows.map((r) => ({ w: `W${r.week}`, cash: r.endingCash, revolver: -r.revolverBalance, inflow: r.receipts, outflow: -r.totalOut, min: i.minimumCash }));

  return (
    <EngineShell id="cash13" icon={<CalendarRange size={22} />} onReset={() => { setI(DEFAULTS); setD(DRIVERS); }} inputsWidth={330}
      audit={{
        toolName: "13-week cash flow", toolNameAr: "التدفق النقدي لثلاثة عشر أسبوعاً",
        summary: "Ending cash = opening + receipts − disbursements − revolver interest + draws − repayments; draws fill to the minimum cash floor up to the facility limit.", summaryAr: "النقد الختامي = الافتتاحي + المقبوضات − المدفوعات + السحب − السداد.",
        steps: [
          { title: "Week 1 net flow", formula: "receipts − Σ disbursements", substitution: `${fmt(o.rows[0]?.receipts ?? 0)} − ${fmt(o.rows[0]?.totalOut ?? 0)}`, result: fmt(o.rows[0]?.netFlow ?? 0) },
          { title: "Revolver draw rule", formula: "max(0, min cash − cash before draw), capped by limit", substitution: `floor ${fmt(i.minimumCash)}, limit ${fmt(i.revolverLimit)}`, result: `peak ${fmt(o.peakRevolver)}` },
          { title: "Low point", formula: "min(ending cash)", substitution: `week ${o.minCashWeek}`, result: fmt(o.minCash) },
          { title: "Runway", formula: "(opening + limit) / avg weekly burn", substitution: o.runwayWeeks === null ? "cash generative" : `avg burn ${fmt(-o.rows.reduce((a, r) => a + r.netFlow, 0) / o.rows.length)}`, result: o.runwayWeeks === null ? "∞" : `${o.runwayWeeks.toFixed(1)} wks` },
        ],
      }}
      exportRows={o.rows.map((r) => ({ Week: r.week, Receipts: r.receipts, Payroll: r.payroll, Suppliers: r.suppliers, Opex: r.opex, Capex: r.capex, "Debt service": r.debtService, Other: r.other, Interest: Math.round(r.interest), "Net flow": Math.round(r.netFlow), Draw: Math.round(r.draw), Repay: Math.round(r.repay), "Revolver": Math.round(r.revolverBalance), "Ending cash": Math.round(r.endingCash) }))}
      inputs={<>
        <Field label={isAr ? "النقد الافتتاحي" : "Opening cash"} value={i.openingCash} onChange={(v) => set("openingCash", v)} suffix={currency} />
        <Field label={isAr ? "الحد الأدنى للنقد" : "Minimum cash floor"} value={i.minimumCash} onChange={(v) => set("minimumCash", v)} suffix={currency} />
        <Field label={isAr ? "سقف التسهيل الدوار" : "Revolver limit"} value={i.revolverLimit} onChange={(v) => set("revolverLimit", v)} suffix={currency} />
        <Field label={isAr ? "معدل التسهيل" : "Revolver rate"} value={i.revolverRatePct} onChange={(v) => set("revolverRatePct", v)} suffix="%" step={0.1} />
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "محركات التوليد" : "Seed from drivers"}</span>
            <button onClick={() => set("weeks", seedWeeks(d))} className="btn-ghost"><Wand2 size={12} /> {isAr ? "توليد 13 أسبوعاً" : "Regenerate 13 weeks"}</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={isAr ? "مبيعات أسبوعية" : "Weekly sales"} value={d.weeklySales} onChange={(v) => setD({ ...d, weeklySales: v })} />
            <Field label={isAr ? "تأخر التحصيل (أسابيع)" : "Collection lag (wks)"} value={d.collectionLagWeeks} onChange={(v) => setD({ ...d, collectionLagWeeks: v })} />
            <Field label={isAr ? "الهامش الإجمالي" : "Gross margin"} value={d.grossMarginPct} onChange={(v) => setD({ ...d, grossMarginPct: v })} suffix="%" />
            <Field label={isAr ? "الموسمية ±" : "Seasonality ±"} value={d.seasonalityPct} onChange={(v) => setD({ ...d, seasonalityPct: v })} suffix="%" />
            <Field label={isAr ? "رواتب أسبوعية" : "Weekly payroll"} value={d.weeklyPayroll} onChange={(v) => setD({ ...d, weeklyPayroll: v })} />
            <Field label={isAr ? "مصاريف أسبوعية" : "Weekly opex"} value={d.weeklyOpex} onChange={(v) => setD({ ...d, weeklyOpex: v })} />
            <Field label={isAr ? "الأسبوع الرأسمالي" : "Capex week"} value={d.capexWeek} onChange={(v) => setD({ ...d, capexWeek: v })} min={1} max={13} />
            <Field label={isAr ? "مبلغ الرأسمالي" : "Capex amount"} value={d.capexAmount} onChange={(v) => setD({ ...d, capexAmount: v })} />
            <Field label={isAr ? "أسبوع خدمة الدين" : "Debt service week"} value={d.debtServiceWeek} onChange={(v) => setD({ ...d, debtServiceWeek: v })} min={1} max={13} />
            <Field label={isAr ? "مبلغ خدمة الدين" : "Debt service amt"} value={d.debtServiceAmount} onChange={(v) => setD({ ...d, debtServiceAmount: v })} />
          </div>
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "أدنى نقد" : "Cash low point", value: k(o.minCash), accent: o.minCash < i.minimumCash ? "neg" : "emerald", sub: `${isAr ? "الأسبوع" : "week"} ${o.minCashWeek}` },
        { label: isAr ? "ذروة السحب" : "Peak revolver", value: k(o.peakRevolver), accent: o.peakRevolver > 0 ? "warn" : undefined, sub: `${fmt((o.peakRevolver / Math.max(i.revolverLimit, 1)) * 100, 0)}% ${isAr ? "من السقف" : "of limit"}` },
        { label: isAr ? "صافي التغير" : "Net 13-wk change", value: k(o.netChange), accent: o.netChange < 0 ? "neg" : "emerald" },
        { label: isAr ? "المدى الزمني" : "Runway", value: o.runwayWeeks === null ? "∞" : `${o.runwayWeeks.toFixed(0)} ${isAr ? "أسبوع" : "wks"}`, accent: "gold", sub: o.unfundedGap > 0 ? `${isAr ? "فجوة غير ممولة" : "unfunded gap"} ${k(o.unfundedGap)}` : undefined },
      ]} />
      <Card title={isAr ? "النقد الختامي والتسهيل" : "Ending cash and revolver"}>
        <div className="h-64">
          <ResponsiveContainer>
            <ComposedChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="w" {...T.axis} />
              <YAxis {...T.axis} width={52} tickFormatter={(v) => k(v)} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(Math.abs(v))} />
              <ReferenceLine y={i.minimumCash} stroke={T.colors.gold} strokeDasharray="4 3" />
              <ReferenceLine y={0} stroke={T.colors.slateLight} />
              <Bar dataKey="inflow" fill={T.colors.emeraldDim} stroke={T.colors.emerald} strokeWidth={0.5} />
              <Bar dataKey="outflow" fill={T.colors.negativeDim} stroke={T.colors.negative} strokeWidth={0.5} />
              <Area type="monotone" dataKey="revolver" fill={T.colors.goldDim} stroke={T.colors.gold} />
              <Line type="monotone" dataKey="cash" stroke={T.colors.emeraldLight} strokeWidth={2.2} dot={{ r: 2.5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <TableScroll maxH="max-h-[520px]">
        <table className="terminal-table">
          <thead><tr><th>{isAr ? "أسبوع" : "Wk"}</th>{COLS.map((c) => <th key={c.k}>{isAr ? c.ar : c.en}</th>)}<th>{isAr ? "الصافي" : "Net"}</th><th>{isAr ? "السحب/السداد" : "Draw/repay"}</th><th>{isAr ? "الختامي" : "Ending"}</th></tr></thead>
          <tbody>
            {o.rows.map((r) => (
              <tr key={r.week} className={r.breach ? "bg-neg/10" : ""}>
                <td className="text-emerald-light">{r.week}</td>
                {COLS.map((c) => <td key={c.k} className="p-1"><input type="number" value={r[c.k]} onChange={(e) => setCell(r.week, c.k, Number(e.target.value))} className="terminal-input h-7 w-[92px] px-1.5 text-[11px]" /></td>)}
                <td className={r.netFlow < 0 ? "text-neg" : "text-pos"}>{fmt(r.netFlow)}</td>
                <td className="text-gold">{r.draw > 0 ? `+${fmt(r.draw)}` : r.repay > 0 ? `−${fmt(r.repay)}` : "·"}</td>
                <td className={r.breach ? "text-neg font-semibold" : "text-fg"}>{fmt(r.endingCash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </EngineShell>
  );
}
