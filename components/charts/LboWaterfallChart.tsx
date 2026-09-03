"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";

interface LboWaterfallChartProps {
  entryEv?: number;
  transactionFees?: number;
  sponsorEquity?: number;
  seniorDebt?: number;
  mezzDebt?: number;
  holdYearsData?: { year: number; irr: number; moic: number }[];
}

export default function LboWaterfallChart({
  entryEv = 1500,
  transactionFees = 45,
  sponsorEquity = 650,
  seniorDebt = 700,
  mezzDebt = 195,
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
    { name: isAr ? "رأس مال المستثمر (Sponsor Equity)" : "Sponsor Equity", val: sponsorEquity, color: "bg-emerald-500", pct: ((sponsorEquity / totalUses) * 100).toFixed(1) },
    { name: isAr ? "الدين الممتاز (Senior Debt)" : "Senior Bank Debt", val: seniorDebt, color: "bg-sky-500", pct: ((seniorDebt / totalUses) * 100).toFixed(1) },
    { name: isAr ? "الدين الثانوي (Mezzanine Debt)" : "Mezzanine Debt", val: mezzDebt, color: "bg-indigo-500", pct: ((mezzDebt / totalUses) * 100).toFixed(1) },
  ];

  const uses = [
    { name: isAr ? "قيمة الاستحواذ (Enterprise Value)" : "Purchase Enterprise Value", val: entryEv, color: "bg-[#1E293B]" },
    { name: isAr ? "رسوم ومصاريف الصفقة" : "Transaction Fees & Expenses", val: transactionFees, color: "bg-[#1E293B]" },
  ];

  return (
    <div className="space-y-6">
      {/* SOURCES & USES WATERFALL PANEL */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm font-mono text-xs space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
          <div>
            <span className="text-emerald font-bold uppercase tracking-wider text-[11px] block mb-1">
              {isAr ? "مصادر واستخدامات الأموال" : "LBO Sources & Uses Waterfall"}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 font-serif">
              {isAr ? "هيكل تمويل رأس المال واستخدامات التمويل" : "Capital Structure Breakdown & Transaction Uses"}
            </h3>
          </div>
          <div className="px-3 py-1 bg-slate-50 border border-[#E2E8F0] rounded text-slate-900 font-bold">
            Total Uses: SAR {totalUses}M
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SOURCES SIDE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald uppercase tracking-wider border-b border-[#1E293B] pb-2">
              {isAr ? "مصادر التمويل (Sources of Funds)" : "Sources of Capital"}
            </h4>
            {sources.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-bold">{s.name}</span>
                  <span className="text-emerald font-bold">SAR {s.val}M ({s.pct}%)</span>
                </div>
                <div className="h-3 bg-[#0B0E14] rounded-sm overflow-hidden border border-[#1E293B]">
                  <div className={`h-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* USES SIDE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E293B] pb-2">
              {isAr ? "استخدامات الأموال (Uses of Funds)" : "Uses of Capital"}
            </h4>
            {uses.map((u, idx) => {
              const pct = ((u.val / totalUses) * 100).toFixed(1);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-bold">{u.name}</span>
                    <span className="text-slate-300 font-bold">SAR {u.val}M ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-[#0B0E14] rounded-sm overflow-hidden border border-[#1E293B]">
                    <div className="h-full bg-slate-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IRR & MOIC HOLD PERIOD TRAJECTORY LINE CHART */}
      <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl font-mono text-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
          <div>
            <span className="text-emerald font-bold uppercase tracking-wider text-[11px] block mb-1">
              {isAr ? "مسار معدل العائد حسب فترة الاستثمار" : "IRR & MOIC Hold Period Trajectory"}
            </span>
            <h3 className="text-sm font-extrabold text-white font-serif">
              {isAr ? "توقعات العائد المستهدف عبر السنوات (1 - 7 سنوات)" : "Annualized Returns by Hold Year"}
            </h3>
          </div>
        </div>

        <div className="h-[220px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={holdYearsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="year" stroke="#64748B" tickLine={false} tickFormatter={(y) => `Yr ${y}`} />
              <YAxis stroke="#64748B" tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0B0E14", borderColor: "#1E293B", color: "#F8FAFC", fontSize: "11px" }}
                formatter={(val: any, name: any) => [name === "irr" ? `${val}%` : `${val}x`, name === "irr" ? "IRR (%)" : "MOIC (x)"]}
              />
              <Line type="monotone" dataKey="irr" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
