"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import EngineShell, { Field, Select, Kpis, fmt } from "./EngineShell";
import { buildAmortization, type AmortInputs, type AmortMethod } from "@/lib/finance/amortization";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULTS: AmortInputs = { principal: 25_000_000, annualRatePct: 6.5, years: 7, paymentsPerYear: 4, method: "annuity", gracePeriods: 2, upfrontFeePct: 1 };

export default function DebtSchedule() {
  const { language, currency, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<AmortInputs>(DEFAULTS);
  const set = <K extends keyof AmortInputs>(k: K, v: AmortInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => buildAmortization(i), [i]);
  useEffect(() => { updateSessionAnalysis("debtSchedule", { inputs: i, outputs: { payment: o.payment, totalInterest: o.totalInterest, aprWithFeesPct: o.aprWithFeesPct }, computedAt: new Date().toISOString() }); }, [i, o, updateSessionAnalysis]);

  const audit = { toolName: "Debt schedule", toolNameAr: "جدول سداد الدين", summary: "Each period: interest = balance × periodic rate; principal per method; balance rolls forward.", summaryAr: "كل فترة: الربح = الرصيد × المعدل الدوري؛ الأصل حسب الطريقة؛ الرصيد يُرحّل.",
    steps: [
      { title: "Periodic rate", formula: "r = R / f", substitution: `${i.annualRatePct}% / ${i.paymentsPerYear}`, result: `${(i.annualRatePct / i.paymentsPerYear).toFixed(4)}%` },
      { title: "Level payment", formula: "A = P·r / (1 − (1+r)^−n)", substitution: `n = ${o.schedule.length - (i.gracePeriods ?? 0)}`, result: fmt(o.payment, 2) },
      { title: "All-in cost", formula: "IRR of (−P + fee, payments…) annualised", substitution: `fee = ${i.upfrontFeePct}%`, result: `${fmt(o.aprWithFeesPct, 3)}%` },
    ] };

  return (
    <EngineShell id="debt_schedule" icon={<CalendarClock size={22} />} audit={audit} onReset={() => setI(DEFAULTS)}
      exportRows={o.schedule.map((r) => ({ Period: r.period, Payment: r.payment, Interest: r.interest, Principal: r.principal, Balance: r.balance }))}
      inputs={<>
        <Field label={isAr ? "أصل التمويل" : "Principal"} value={i.principal} onChange={(v) => set("principal", v)} suffix={currency} />
        <Field label={isAr ? "المعدل السنوي" : "Annual rate / profit"} value={i.annualRatePct} onChange={(v) => set("annualRatePct", v)} suffix="%" step={0.05} />
        <Field label={isAr ? "المدة (سنوات)" : "Tenor (years)"} value={i.years} onChange={(v) => set("years", v)} min={1} />
        <Select label={isAr ? "الأقساط سنوياً" : "Payments per year"} value={String(i.paymentsPerYear) as "1" | "2" | "4" | "12"} onChange={(v) => set("paymentsPerYear", Number(v) as 1 | 2 | 4 | 12)} options={[{ value: "12", label: isAr ? "شهري" : "Monthly" }, { value: "4", label: isAr ? "ربع سنوي" : "Quarterly" }, { value: "2", label: isAr ? "نصف سنوي" : "Semi-annual" }, { value: "1", label: isAr ? "سنوي" : "Annual" }]} />
        <Select<AmortMethod> label={isAr ? "طريقة السداد" : "Repayment method"} value={i.method} onChange={(v) => set("method", v)} options={[{ value: "annuity", label: isAr ? "قسط ثابت" : "Level payment (annuity)" }, { value: "equal_principal", label: isAr ? "أصل متساوٍ" : "Equal principal" }, { value: "bullet", label: isAr ? "دفعة واحدة" : "Bullet" }]} />
        <Field label={isAr ? "فترات السماح" : "Grace periods"} value={i.gracePeriods ?? 0} onChange={(v) => set("gracePeriods", v)} min={0} />
        <Field label={isAr ? "رسوم مقدمة" : "Upfront fee"} value={i.upfrontFeePct ?? 0} onChange={(v) => set("upfrontFeePct", v)} suffix="%" step={0.1} />
      </>}>
      <Kpis items={[
        { label: isAr ? "القسط" : "Payment", value: fmt(o.payment), accent: "emerald" },
        { label: isAr ? "إجمالي الربح/الفائدة" : "Total interest", value: fmt(o.totalInterest), accent: "gold" },
        { label: isAr ? "إجمالي المدفوع" : "Total paid", value: fmt(o.totalPaid) },
        { label: isAr ? "التكلفة الشاملة" : "All-in APR", value: `${fmt(o.aprWithFeesPct, 2)}%`, sub: `${isAr ? "فعلي" : "EAR"} ${fmt(o.effectiveAnnualRatePct, 2)}%` },
      ]} />
      <div className="panel-data p-5"><div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider mb-3">{isAr ? "الرصيد والفائدة" : "Balance & interest by period"}</div>
        <div className="h-64"><ResponsiveContainer><AreaChart data={o.schedule} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid {...T.grid} /><XAxis dataKey="period" {...T.axis} /><YAxis {...T.axis} width={64} tickFormatter={(v) => fmt(v / 1000) + "k"} />
          <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} />
          <Area type="monotone" dataKey="balance" stroke={T.colors.emerald} fill={T.colors.emeraldDim} strokeWidth={2} />
          <Area type="monotone" dataKey="interest" stroke={T.colors.gold} fill={T.colors.goldDim} strokeWidth={1.5} />
        </AreaChart></ResponsiveContainer></div></div>
      <div className="panel-data overflow-auto max-h-96"><table className="terminal-table"><thead><tr><th>#</th><th>{isAr ? "القسط" : "Payment"}</th><th>{isAr ? "الربح" : "Interest"}</th><th>{isAr ? "الأصل" : "Principal"}</th><th>{isAr ? "الرصيد" : "Balance"}</th></tr></thead>
        <tbody>{o.schedule.map((r) => <tr key={r.period}><td>{r.period}</td><td>{fmt(r.payment)}</td><td>{fmt(r.interest)}</td><td>{fmt(r.principal)}</td><td>{fmt(r.balance)}</td></tr>)}</tbody></table></div>
    </EngineShell>
  );
}

