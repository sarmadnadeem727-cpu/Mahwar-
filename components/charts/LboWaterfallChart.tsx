"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";

import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

interface LboWaterfallChartProps {
  entryEv?: number;
  transactionFees?: number;
  sponsorEquity?: number;
  seniorDebt?: number;
  mezzDebt?: number;
  pikNotes?: number;
  holdYearsData?: { year: number; irr: number; moic: number }[];
}

export default function LboWaterfallChart({
  entryEv = 1500,
  transactionFees = 45,
  sponsorEquity = 650,
  seniorDebt = 700,
  mezzDebt = 195,
  pikNotes = 0,
  holdYearsData = [
    { year: 1, irr: 12.4, moic: 1.12 },
    { year: 2, irr: 18.2, moic: 1.40 },
    { year: 3, irr: 21.8, moic: 1.81 },
    { year: 4, irr: 23.6, moic: 2.25 },
    { year: 5, irr: 24.8, moic: 2.65 },
    { year: 6, irr: 23.1, moic: 3.05 },
    { year: 7, irr: 21.5, moic: 3.42 },
  ],
}: LboWaterfallChartProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const totalUses = entryEv + transactionFees;

  const sources = [
    { name: isAr ? "رأس مال المستثمر (Sponsor Equity)" : "Sponsor Equity", val: sponsorEquity, color: T.colors.sponsor, pct: ((sponsorEquity / totalUses) * 100).toFixed(1) },
    { name: isAr ? "الدين الممتاز (Senior Debt)" : "Senior Bank Debt", val: seniorDebt, color: T.series[1], pct: ((seniorDebt / totalUses) * 100).toFixed(1) },
    { name: isAr ? "الدين الثانوي (Mezzanine Debt)" : "Mezzanine Debt", val: mezzDebt, color: T.colors.emeraldDeep, pct: ((mezzDebt / totalUses) * 100).toFixed(1) },
    ...(pikNotes > 0 ? [{ name: isAr ? "سندات عينية (PIK Notes)" : "PIK Notes", val: pikNotes, color: T.colors.slateLight, pct: ((pikNotes / totalUses) * 100).toFixed(1) }] : []),
  ];

  const uses = [
    { name: isAr ? "قيمة الاستحواذ (Enterprise Value)" : "Purchase Enterprise Value", val: entryEv, color: "bg-ink-0" },
    { name: isAr ? "رسوم ومصاريف الصفقة" : "Transaction Fees & Expenses", val: transactionFees, color: "bg-ink-0" },
  ];

  return (
    <div className="space-y-6">
      {/* SOURCES & USES WATERFALL PANEL */}
      <div className="panel-input p-6 font-mono text-xs space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-line">
          <div>
            <span className="text-emerald font-bold uppercase tracking-wider text-[11px] block mb-1">
              {isAr ? "مصادر واستخدامات الأموال" : "LBO Sources & Uses Waterfall"}
            </span>
            <h3 className="text-sm font-extrabold text-fg font-serif">
              {isAr ? "هيكل تمويل رأس المال واستخدامات التمويل" : "Capital Structure Breakdown & Transaction Uses"}
            </h3>
          </div>
          <div className="px-3 py-1 bg-ink-3 border border-line rounded text-fg font-bold">
            Total Uses: SAR {totalUses}M
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SOURCES SIDE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald uppercase tracking-wider border-b border-line pb-2">
              {isAr ? "مصادر التمويل (Sources of Funds)" : "Sources of Capital"}
            </h4>
            {sources.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-fg font-bold">{s.name}</span>
                  <span className="text-emerald font-bold">SAR {s.val}M ({s.pct}%)</span>
                </div>
                <div className="h-3 bg-ink-4 rounded-full overflow-hidden border border-line">
                  <div className="h-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* USES SIDE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-fg-3 uppercase tracking-wider border-b border-line pb-2">
              {isAr ? "استخدامات الأموال (Uses of Funds)" : "Uses of Capital"}
            </h4>
            {uses.map((u, idx) => {
              const pct = ((u.val / totalUses) * 100).toFixed(1);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-fg font-bold">{u.name}</span>
                    <span className="text-fg-2 font-bold">SAR {u.val}M ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-ink-4 rounded-full overflow-hidden border border-line">
                    <div className="h-full bg-fg-3" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IRR & MOIC HOLD PERIOD TRAJECTORY LINE CHART */}
      <div className="panel-input p-6 font-mono text-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-line">
          <div>
            <span className="text-emerald font-bold uppercase tracking-wider text-[11px] block mb-1">
              {isAr ? "مسار معدل العائد حسب فترة الاستثمار" : "IRR & MOIC Hold Period Trajectory"}
            </span>
            <h3 className="text-sm font-extrabold text-fg font-serif">
              {isAr ? "توقعات العائد المستهدف عبر السنوات (1 - 7 سنوات)" : "Annualized Returns by Hold Year"}
            </h3>
          </div>
        </div>

        <div className="h-[220px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={holdYearsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="year" stroke={T.colors.slate} tickLine={false} tickFormatter={(y) => `Yr ${y}`} fontSize={10} />
              <YAxis stroke={T.colors.slate} tickLine={false} unit="%" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: T.colors.surface, borderColor: "var(--line)", borderRadius: "8px", color: T.colors.fg, fontSize: "11px", boxShadow: "0 4px 12px rgba(158,190,180,0.1)" }}
                formatter={(val: any, name: any) => [name === "irr" ? `${val}%` : `${val}x`, name === "irr" ? "IRR (%)" : "MOIC (x)"]}
              />
              <Line type="monotone" dataKey="irr" stroke={T.colors.emerald} strokeWidth={3} dot={{ fill: T.colors.emerald, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

