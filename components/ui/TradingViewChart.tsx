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

  // Build official TradingView widget URL using tradingview-widget.com
  const tvTheme = isDark ? "dark" : "light";
  const widgetConfig = {
    autosize: true,
    symbol: symbol,
    interval: interval,
    timezone: "Asia/Riyadh",
    theme: tvTheme,
    style: "1",
    locale: "en",
    backgroundColor: isDark ? "#0c1f30" : "#ffffff",
    gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    calendar: false,
    hide_volume: false,
    support_host: "https://www.tradingview.com",
    hide_side_toolbar: true,
    allow_symbol_change: true,
  };

  const iframeSrc = `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${encodeURIComponent(JSON.stringify(widgetConfig))}`;

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
