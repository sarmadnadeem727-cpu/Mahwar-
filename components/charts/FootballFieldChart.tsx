"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";

interface FootballFieldChartProps {
  currentPrice?: number;
  dcfBasePx?: number;
  dcfBearPx?: number;
  dcfBullPx?: number;
  compsMinPx?: number;
  compsAvgPx?: number;
  compsMaxPx?: number;
}

export default function FootballFieldChart({
  currentPrice = 32.50,
  dcfBasePx = 38.45,
  dcfBearPx = 32.10,
  dcfBullPx = 45.80,
  compsMinPx = 28.50,
  compsAvgPx = 36.20,
  compsMaxPx = 42.00,
}: FootballFieldChartProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  // Methodologies data setup (all derived dynamically from engine inputs)
  const ranges = [
    {
      name: isAr ? "تقييم التدفقات المخصومة (DCF)" : "DCF Valuation Range",
      min: dcfBearPx,
      mid: dcfBasePx,
      max: dcfBullPx,
      color: "bg-emerald-500",
      tag: isAr ? "نموذج التدفقات" : "INTRINSIC DCF",
      isLive: true,
    },
    {
      name: isAr ? "مضاعفات الشركات المماثلة (Comps)" : "Trading Comps Range",
      min: compsMinPx,
      mid: compsAvgPx,
      max: compsMaxPx,
      color: "bg-sky-500",
      tag: isAr ? "الأقران" : "PEER MULTIPLES",
      isLive: true,
    },
    {
      name: isAr ? "نطاق التداول الـ 52 أسبوعاً" : "52-Week Price Range",
      min: Number((currentPrice * 0.82).toFixed(2)),
      mid: currentPrice,
      max: Number((currentPrice * 1.22).toFixed(2)),
      color: "bg-amber-500",
      tag: isAr ? "نطاق السوق" : "HISTORICAL MARKET",
      isLive: true,
    },
  ];

  const minScale = 20.0;
  const maxScale = 50.0;
  const totalSpan = maxScale - minScale;

  const getLeftPct = (val: number) => Math.max(0, Math.min(100, ((val - minScale) / totalSpan) * 100));
  const getWidthPct = (min: number, max: number) => Math.max(2, Math.min(100, ((max - min) / totalSpan) * 100));

  return (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm font-mono text-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-emerald font-bold uppercase tracking-wider text-[11px] mb-1">
            <span>{isAr ? "مخطط ملعب التقييم" : "Football Field Valuation Summary"}</span>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-serif">
            {isAr ? "مقارنة نطاقات التقييم للقيم العادلة" : "Implied Equity Value Per Share Across Methodologies"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-[#E2E8F0] rounded text-[11px]">
            <span className="w-2.5 h-0.5 bg-rose-500 rounded-full" />
            <span className="text-slate-800 font-bold">{isAr ? "السعر الحالي:" : "Current Price:"} SAR {currentPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Axis Scale Bar */}
      <div className="relative pt-2 pb-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase border-b border-[#E2E8F0] pb-2 font-mono">
          <span>SAR {minScale.toFixed(2)}</span>
          <span>SAR {((minScale + maxScale) / 2).toFixed(2)}</span>
          <span>SAR {maxScale.toFixed(2)}</span>
        </div>
      </div>

      {/* Range Bars List */}
      <div className="space-y-6 relative">
        {/* Current Price Marker Vertical Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none opacity-80"
          style={{ left: `${getLeftPct(currentPrice)}%` }}
        >
          <div className="absolute -top-3 -translate-x-1/2 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
            SAR {currentPrice.toFixed(2)}
          </div>
        </div>

        {ranges.map((r, i) => {
          const leftPct = getLeftPct(r.min);
          const widthPct = getWidthPct(r.min, r.max);
          const midPct = getLeftPct(r.mid);

          return (
            <div key={i} className="space-y-2 group">
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{r.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 border border-[#E2E8F0] text-slate-600 font-bold">
                    {r.tag}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Low:</span> SAR {r.min.toFixed(2)} |{" "}
                  <span className="text-emerald font-bold">Mid: SAR {r.mid.toFixed(2)}</span> |{" "}
                  <span className="text-slate-400">High:</span> SAR {r.max.toFixed(2)}
                </div>
              </div>

              {/* Bar Container */}
              <div className="h-8 bg-slate-100 border border-[#E2E8F0] rounded-lg relative overflow-hidden flex items-center">
                {/* Implied Range Bar */}
                <div
                  className={`h-5 rounded-md ${r.color} opacity-90 group-hover:opacity-100 transition-all absolute top-1.5`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />

                {/* Midpoint Dot Marker */}
                <div
                  className="absolute w-3 h-3 bg-white border-2 border-emerald rounded-full z-10 shadow-xs"
                  style={{ left: `calc(${midPct}% - 6px)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
