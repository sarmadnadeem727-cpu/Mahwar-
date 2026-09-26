"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface TradingViewChartProps {
  symbol?: string; // e.g. "TADAWUL:2222", "DFM:EMAAR", "NASDAQ:AAPL"
  interval?: string; // "D", "60", "240", "W"
  height?: number | string;
  autosize?: boolean;
  className?: string;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
}

/**
 * Apple Liquid Glass TradingView Advanced Real-Time Chart.
 * Embeds official TradingView charting engine supporting Tadawul, DFM, ADX, and global markets.
 */
export default function TradingViewChart({
  symbol = "TADAWUL:2222",
  interval = "D",
  height = 420,
  className = "",
}: TradingViewChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";

  // Build official TradingView widget URL
  const formattedSymbol = encodeURIComponent(symbol);
  const tvTheme = isDark ? "dark" : "light";
  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${formattedSymbol}&interval=${interval}&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=${tvTheme}&style=1&timezone=Asia%2FRiyadh&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${formattedSymbol}`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-white/15 bg-ink-2 shadow-[0_12px_36px_rgba(0,0,0,0.35)] ${className}`}
      style={{ height, minHeight: height }}
    >
      <iframe
        title={`TradingView Chart ${symbol}`}
        src={iframeSrc}
        className="w-full h-full border-0 block"
        style={{ width: "100%", height: "100%", minHeight: height }}
        allowTransparency={true}
        scrolling="no"
        allowFullScreen={true}
      />
    </div>
  );
}
