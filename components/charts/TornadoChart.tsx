"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { runDcf, DcfParams, DcfYear, EvBridge } from "@/lib/finance/dcf";

interface TornadoChartProps {
  baseParams?: DcfParams;
  baseYears?: DcfYear[];
  baseBridge?: EvBridge;
  baseSharePrice?: number;
}

export default function TornadoChart({
  baseSharePrice = 38.45,
}: TornadoChartProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  // Recompute driver swings against base Aramco model
  const defaultYears: DcfYear[] = [
    { yearIndex: 1, year: 2025, revenue: 1296, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 65, capex: 130, deltaNwc: 15 },
    { yearIndex: 2, year: 2026, revenue: 1399, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 70, capex: 140, deltaNwc: 15 },
    { yearIndex: 3, year: 2027, revenue: 1511, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 75, capex: 151, deltaNwc: 16 },
    { yearIndex: 4, year: 2028, revenue: 1632, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 81, capex: 163, deltaNwc: 17 },
    { yearIndex: 5, year: 2029, revenue: 1763, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 88, capex: 176, deltaNwc: 18 },
  ];

  const defaultParams: DcfParams = {
    rfRate: 0.045,
    erp: 0.055,
    betaUnlevered: 0.85,
    targetDtoE: 0.25,
    taxShieldRate: 0.0,
    kdPreTax: 0.055,
    zakatRate: 0.025,
    terminalMethod: 'GORDON',
    terminalGrowth: 0.025,
    includeLeasesInDebt: true,
    includeEosbInDebt: true,
    includeSukukInDebt: true,
  };

  const defaultBridge: EvBridge = {
    enterpriseValue: 0,
    cash: 100,
    shortTermDebt: 50,
    longTermDebt: 300,
    sukuk: 0,
    leaseFinancingLiabilities: 0,
    eosbLiability: 0,
    minorityInterest: 0,
    otherDebtLike: 0,
    nonOperatingAssets: 0,
    sharesOutstanding: 100,
    currentPrice: 32.50,
  };

  // Safe runner helper
  const calcPx = (customParams: DcfParams, customYears: DcfYear[]) => {
    try {
      const res = runDcf(customYears, customParams, defaultBridge);
      return res.bridge.impliedSharePrice;
    } catch {
      return baseSharePrice;
    }
  };

  // Drivers calculations
  const waccHighPx = calcPx({ ...defaultParams, waccOverride: 0.105 }, defaultYears);
  const waccLowPx = calcPx({ ...defaultParams, waccOverride: 0.075 }, defaultYears);

  const gHighPx = calcPx({ ...defaultParams, terminalGrowth: 0.035 }, defaultYears);
  const gLowPx = calcPx({ ...defaultParams, terminalGrowth: 0.015 }, defaultYears);

  const marginHighYears = defaultYears.map(y => ({ ...y, ebitMargin: 0.38 }));
  const marginLowYears = defaultYears.map(y => ({ ...y, ebitMargin: 0.32 }));
  const marginHighPx = calcPx(defaultParams, marginHighYears);
  const marginLowPx = calcPx(defaultParams, marginLowYears);

  const revHighYears = defaultYears.map(y => ({ ...y, revenue: y.revenue * 1.05 }));
  const revLowYears = defaultYears.map(y => ({ ...y, revenue: y.revenue * 0.95 }));
  const revHighPx = calcPx(defaultParams, revHighYears);
  const revLowPx = calcPx(defaultParams, revLowYears);

  const drivers = [
    {
      name: isAr ? "معدل الخصم (WACC ±1.5%)" : "WACC (±1.5% Swing)",
      lowPx: Math.min(waccHighPx, waccLowPx),
      highPx: Math.max(waccHighPx, waccLowPx),
      basePx: baseSharePrice,
      range: Math.abs(waccHighPx - waccLowPx),
    },
    {
      name: isAr ? "معدل النمو النهائي (g ±1.0%)" : "Terminal Growth Rate (±1.0%)",
      lowPx: Math.min(gHighPx, gLowPx),
      highPx: Math.max(gHighPx, gLowPx),
      basePx: baseSharePrice,
      range: Math.abs(gHighPx - gLowPx),
    },
    {
      name: isAr ? "هامش الأرباح (EBITDA ±3.0%)" : "EBITDA Margin (±3.0%)",
      lowPx: Math.min(marginHighPx, marginLowPx),
      highPx: Math.max(marginHighPx, marginLowPx),
      basePx: baseSharePrice,
      range: Math.abs(marginHighPx - marginLowPx),
    },
    {
      name: isAr ? "نمو الإيرادات (Revenue ±5.0%)" : "Revenue Growth (±5.0%)",
      lowPx: Math.min(revHighPx, revLowPx),
      highPx: Math.max(revHighPx, revLowPx),
      basePx: baseSharePrice,
      range: Math.abs(revHighPx - revLowPx),
    },
  ].sort((a, b) => b.range - a.range);

  const maxDev = Math.max(...drivers.map(d => Math.max(Math.abs(d.highPx - baseSharePrice), Math.abs(d.lowPx - baseSharePrice)))) * 1.25;

  return (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm font-mono text-xs space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-emerald font-bold uppercase tracking-wider text-[11px] mb-1">
            <span>{isAr ? "مخطط تورنادو الحساسية" : "DCF Driver Sensitivity Tornado Chart"}</span>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-serif">
            {isAr ? "ترتيب افتراضات النمذجة حسب حجم تأثيرها على القيمة العادلة" : "Share Price Swing Impact Ranked by Valuation Driver"}
          </h3>
        </div>
        <div className="px-3 py-1 bg-slate-50 border border-[#E2E8F0] rounded text-emerald font-bold">
          Base: SAR {baseSharePrice.toFixed(2)}
        </div>
      </div>

      <div className="space-y-6 pt-2">
        {drivers.map((d, i) => {
          const negDiff = d.lowPx - baseSharePrice;
          const posDiff = d.highPx - baseSharePrice;

          const negPct = Math.min(50, (Math.abs(negDiff) / maxDev) * 50);
          const posPct = Math.min(50, (Math.abs(posDiff) / maxDev) * 50);

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{d.name}</span>
                <span className="text-[11px] text-slate-500">
                  Swing: <span className="text-emerald font-bold">SAR {d.range.toFixed(2)}</span> (SAR {d.lowPx.toFixed(2)} — SAR {d.highPx.toFixed(2)})
                </span>
              </div>

              {/* Centered Tornado Bar Container */}
              <div className="h-7 bg-slate-100 border border-[#E2E8F0] rounded-lg relative flex items-center">
                {/* Center Baseline Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />

                {/* Left Negative Bar */}
                <div
                  className="absolute right-1/2 h-4 bg-rose-500 rounded-l transition-all"
                  style={{ width: `${negPct}%` }}
                />

                {/* Right Positive Bar */}
                <div
                  className="absolute left-1/2 h-4 bg-emerald rounded-r transition-all"
                  style={{ width: `${posPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
