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
  autosize = true,
  className = "",
  hideSideToolbar = true,
  allowSymbolChange = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme !== "light";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean previous widget
    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    container.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: autosize,
      symbol: symbol,
      interval: interval,
      timezone: "Asia/Riyadh",
      theme: isDark ? "dark" : "light",
      style: "1",
      locale: "en",
      backgroundColor: isDark ? "rgba(10, 22, 34, 0.75)" : "rgba(241, 248, 244, 0.75)",
      gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      hide_side_toolbar: hideSideToolbar,
      allow_symbol_change: allowSymbolChange,
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol, interval, isDark, autosize, hideSideToolbar, allowSymbolChange]);

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-white/15 bg-ink-2/80 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1)] ${className}`}
      style={{ height }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
        style={{ minHeight: "100%" }}
      />
    </div>
  );
}
