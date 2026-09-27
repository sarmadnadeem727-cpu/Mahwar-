"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Zap, ChevronRight, BarChart2 } from "lucide-react";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";
import { UNIVERSE } from "@/lib/market/universe";
import { buildLinkedSecurity } from "@/lib/market/engineBridge";

interface TradingViewChartProps {
  symbol?: string; // e.g. "TADAWUL:2222", "DFM:EMAAR", "NASDAQ:AAPL"
  interval?: string; // "D", "60", "240", "W"
  height?: number | string;
  autosize?: boolean;
  className?: string;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
  showEngineBridgeBar?: boolean;
}

/**
 * Apple Liquid Glass TradingView Advanced Real-Time Chart.
 * Embeds official TradingView charting engine supporting Tadawul, DFM, ADX, and global markets,
 * fully interlinked to dispatch values directly into Mahwar valuation & financial engines.
 */
export default function TradingViewChart({
  symbol = "TADAWUL:2222",
  interval = "D",
  height = 420,
  className = "",
  showEngineBridgeBar = true,
}: TradingViewChartProps) {
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const { language, linkSecurityAndOpenPanel } = useTerminalStore();
  const isAr = language === "ar";

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

  // Find corresponding security in the universe
  const matchedSec = UNIVERSE.find(
    (s) =>
      s.symbols.tradingview === symbol ||
      s.id === symbol ||
      s.code === symbol ||
      symbol.endsWith(`:${s.code}`)
  );

  const handleSendToEngine = (panelId: PanelType) => {
    if (matchedSec) {
      const linked = buildLinkedSecurity(matchedSec);
      linkSecurityAndOpenPanel(linked, panelId);
    } else {
      // Create a fallback linked security from the TV symbol
      const [ex = "GLOBAL", code = symbol] = symbol.split(":");
      const fallbackSec = buildLinkedSecurity({
        id: symbol,
        code,
        name: symbol,
        nameAr: symbol,
        exchange: ex as any,
        sector: "Industrials",
        symbols: { tradingview: symbol, twelvedata: symbol },
        ref: {
          price: 100,
          marketCapB: 10,
          pe: 15,
          pb: 1.5,
          divYield: 3,
          roe: 12,
          revenueGrowth: 8,
          debtToAssets: 25,
          low52: 80,
          high52: 120,
        },
        shariahIndicative: true,
      });
      linkSecurityAndOpenPanel(fallbackSec, panelId);
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-white/15 bg-ink-2 shadow-[0_12px_36px_rgba(0,0,0,0.35)] flex flex-col ${className}`}
      style={{ height, minHeight: height }}
    >
      {/* Chart to Engine Interlinking Bar */}
      {showEngineBridgeBar && (
        <div
          className="h-10 min-h-10 px-3 border-b border-line bg-ink-1/90 backdrop-blur-md flex items-center justify-between gap-2 text-[11px] font-sans z-10"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="flex items-center gap-2 text-fg-3">
            <span className="w-2 h-2 rounded-full bg-emerald-light animate-pulse" />
            <span className="font-mono text-fg font-semibold">{symbol}</span>
            {matchedSec && (
              <span className="hidden sm:inline text-fg-2 truncate">
                ({isAr ? matchedSec.nameAr : matchedSec.name})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10.5px] text-fg-4 hidden md:inline">
              {isAr ? "نقل إلى المحركات:" : "Bridge to Engine:"}
            </span>
            {[
              { id: "DCF" as PanelType, label: "DCF" },
              { id: "comps" as PanelType, label: isAr ? "المماثلات" : "Comps" },
              { id: "zscore" as PanelType, label: "Z-Score" },
              { id: "ratios" as PanelType, label: isAr ? "النسب" : "Ratios" },
              { id: "shariah" as PanelType, label: isAr ? "أيوفي" : "AAOIFI" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleSendToEngine(btn.id)}
                className="px-2 py-0.5 rounded-lg border border-line hover:border-emerald-border hover:bg-emerald/15 hover:text-emerald-light text-fg-3 text-[10.5px] font-mono transition-all flex items-center gap-1 apple-touch-target"
              >
                <Zap size={9} className="text-emerald-light" />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main TradingView Iframe */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          title={`TradingView Chart ${symbol}`}
          src={iframeSrc}
          className="w-full h-full border-0 block"
          style={{ width: "100%", height: "100%" }}
          allowTransparency={true}
          scrolling="no"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
}
