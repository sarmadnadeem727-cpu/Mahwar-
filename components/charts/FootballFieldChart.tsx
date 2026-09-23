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
  /** 52-week trading range, when the caller has real market data. */
  low52?: number;
  high52?: number;
}

export default function FootballFieldChart({
  currentPrice = 0,
  dcfBasePx,
  dcfBearPx,
  dcfBullPx,
  compsMinPx,
  compsAvgPx,
  compsMaxPx,
  low52,
  high52,
}: FootballFieldChartProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  if (!dcfBasePx || !dcfBearPx || !dcfBullPx) {
    return (
      <div className="panel-input p-8 text-center font-sans">
        <p className="text-fg-2">{isAr ? "شغّل نموذج DCF أولاً لرسم نطاقات التقييم." : "Run the DCF model first to draw valuation ranges."}</p>
      </div>
    );
  }
  const hasComps = compsMinPx !== undefined && compsAvgPx !== undefined && compsMaxPx !== undefined;
  const has52 = low52 !== undefined && high52 !== undefined;

  // Methodologies data setup (all derived dynamically from engine inputs)
  const ranges = [
    {
      name: isAr ? "تقييم التدفقات المخصومة (DCF)" : "DCF Valuation Range",
      min: dcfBearPx,
      mid: dcfBasePx,
      max: dcfBullPx,
      color: "bg-emerald",
      tag: isAr ? "نموذج التدفقات" : "INTRINSIC DCF",
      isLive: true,
    },
    ...(hasComps ? [{
      name: isAr ? "مضاعفات الشركات المماثلة (Comps)" : "Trading Comps Range",
      min: compsMinPx!,
      mid: compsAvgPx!,
      max: compsMaxPx!,
      color: "bg-emerald-deep",
      tag: isAr ? "الأقران" : "PEER MULTIPLES",
      isLive: true,
    }] : []),
    ...(has52 ? [{
      name: isAr ? "نطاق التداول الـ 52 أسبوعاً" : "52-Week Price Range",
      min: low52!,
      mid: currentPrice,
      max: high52!,
      color: "bg-gold",
      tag: isAr ? "نطاق السوق" : "HISTORICAL MARKET",
      isLive: true,
    }] : []),
  ];

  const allPrices = [
    dcfBearPx, dcfBasePx, dcfBullPx, currentPrice,
    ...ranges.flatMap((r) => [r.min, r.max]),
  ].filter((p): p is number => typeof p === 'number' && !isNaN(p) && p > 0);

  const rawMin = allPrices.length > 0 ? Math.min(...allPrices) : 20.0;
  const rawMax = allPrices.length > 0 ? Math.max(...allPrices) : 50.0;
  const minScale = Math.max(0, Number((rawMin * 0.85).toFixed(1)));
  const maxScale = Number((rawMax * 1.15).toFixed(1));
  const totalSpan = Math.max(1, maxScale - minScale);

  const getLeftPct = (val: number) => Math.max(0, Math.min(100, ((val - minScale) / totalSpan) * 100));
  const getWidthPct = (min: number, max: number) => Math.max(2, Math.min(100, ((max - min) / totalSpan) * 100));

  return (
    <div className="panel-input p-6 font-mono text-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2 text-emerald font-bold uppercase tracking-wider text-[11px] mb-1">
            <span>{isAr ? "مخطط ملعب التقييم" : "Football Field Valuation Summary"}</span>
          </div>
          <h3 className="text-sm font-extrabold text-fg font-serif">
            {isAr ? "مقارنة نطاقات التقييم للقيم العادلة" : "Implied Equity Value Per Share Across Methodologies"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-ink-3 border border-line rounded text-[11px]">
            <span className="w-2.5 h-0.5 bg-neg rounded-full" />
            <span className="text-fg font-bold">{isAr ? "السعر الحالي:" : "Current Price:"} SAR {currentPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Axis Scale Bar */}
      <div className="relative pt-2 pb-1">
        <div className="flex justify-between text-[10px] text-fg-3 font-bold uppercase border-b border-line pb-2 font-mono">
          <span>SAR {minScale.toFixed(2)}</span>
          <span>SAR {((minScale + maxScale) / 2).toFixed(2)}</span>
          <span>SAR {maxScale.toFixed(2)}</span>
        </div>
      </div>

      {/* Range Bars List */}
      <div className="space-y-6 relative">
        {/* Current Price Marker Vertical Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neg z-10 pointer-events-none opacity-80"
          style={{ left: `${getLeftPct(currentPrice)}%` }}
        >
          <div className="absolute -top-3 -translate-x-1/2 bg-neg text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
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
                  <span className="font-bold text-fg">{r.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-ink-4 border border-line text-fg-2 font-bold">
                    {r.tag}
                  </span>
                </div>
                <div className="text-[11px] text-fg-2">
                  <span className="text-fg-3">Low:</span> SAR {r.min.toFixed(2)} |{" "}
                  <span className="text-emerald font-bold">Mid: SAR {r.mid.toFixed(2)}</span> |{" "}
                  <span className="text-fg-3">High:</span> SAR {r.max.toFixed(2)}
                </div>
              </div>

              {/* Bar Container */}
              <div className="h-8 bg-ink-4 border border-line rounded-lg relative overflow-hidden flex items-center">
                {/* Implied Range Bar */}
                <div
                  className={`h-5 rounded-md ${r.color} opacity-90 group-hover:opacity-100 transition-all absolute top-1.5`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />

                {/* Midpoint Dot Marker */}
                <div
                  className="absolute w-3 h-3 bg-ink-2 border-2 border-emerald rounded-full z-10 shadow-xs"
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

