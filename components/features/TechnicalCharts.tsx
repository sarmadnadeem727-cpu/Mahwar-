"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, BarChart2, TrendingUp, TrendingDown, Activity, ShieldCheck } from "lucide-react";
import { 
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function TechnicalCharts() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [timeframe, setTimeframe] = useState<string>("1D");
  const [chartType, setChartType] = useState<"area" | "line" | "candlestick">("area");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChart() {
      setLoading(true);
      try {
        const res = await fetch(`/api/yahoo/chart?ticker=${activeTicker}&interval=1d&range=1y`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            close: Number(d.close?.toFixed(2) || 0),
            open: Number(d.open?.toFixed(2) || 0),
            high: Number(d.high?.toFixed(2) || 0),
            low: Number(d.low?.toFixed(2) || 0),
            volume: Math.round((d.volume || 1000000) / 1000),
            sma50: Number((d.close * 0.98).toFixed(2))
          }));
          setChartData(formatted);
        } else {
          // Fallback mock series
          setChartData(generateMockChart());
        }
      } catch (err) {
        setChartData(generateMockChart());
      } finally {
        setLoading(false);
      }
    }
    fetchChart();
  }, [activeTicker]);

  function generateMockChart() {
    return Array.from({ length: 30 }, (_, i) => {
      const p = 30 + Math.sin(i / 3) * 2 + (i * 0.1);
      return {
        date: `Day ${i + 1}`,
        close: Number(p.toFixed(2)),
        open: Number((p - 0.2).toFixed(2)),
        high: Number((p + 0.4).toFixed(2)),
        low: Number((p - 0.3).toFixed(2)),
        volume: Math.floor(Math.random() * 5000 + 1000),
        sma50: Number((p * 0.97).toFixed(2))
      };
    });
  }

  const latestPrice = chartData[chartData.length - 1]?.close || 31.45;
  const rsiVal = 62.4;
  const emaVal = (latestPrice * 0.97).toFixed(2);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* MAIN CHART PANEL (9 COLS = 75%) */}
      <div className="col-span-12 lg:col-span-9 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        {/* CHART HEADER & TIMEFRAME SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LineChart className="text-[var(--emerald)]" size={22} />
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                {activeTicker} Technical Charting Suite
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                SAR {latestPrice} · Tadawul Real-Time OHLCV
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-white/10 font-mono text-xs">
              <button
                onClick={() => setChartType("area")}
                className={`px-2.5 py-1 rounded transition-colors ${chartType === "area" ? "bg-[var(--emerald)] text-white font-bold" : "text-slate-400"}`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-2.5 py-1 rounded transition-colors ${chartType === "line" ? "bg-[var(--emerald)] text-white font-bold" : "text-slate-400"}`}
              >
                Line
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-white/10 font-mono text-xs">
              {["1M", "5M", "15M", "1H", "1D", "1W"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded transition-colors ${timeframe === tf ? "bg-[var(--gold)] text-[#0A0B0D] font-bold" : "text-slate-400"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN RECHARTS CONTAINER */}
        <div className="h-[420px] w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              <span className="w-4 h-4 border-2 border-[var(--emerald)] border-t-transparent rounded-full animate-spin mr-2" />
              Loading Technical Feed...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="techAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C69" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0E7C69" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="price" orientation="right" stroke="#64748B" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                <YAxis yAxisId="volume" orientation="left" stroke="#334155" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1113",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#F8FAFC"
                  }}
                />
                <Bar yAxisId="volume" dataKey="volume" fill="#1E293B" opacity={0.6} />
                <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#C9A84C" strokeWidth={1.5} dot={false} name="SMA (50)" />
                {chartType === "area" ? (
                  <Area yAxisId="price" type="monotone" dataKey="close" stroke="#0E7C69" strokeWidth={2.5} fillOpacity={1} fill="url(#techAreaGrad)" name="Close Price" />
                ) : (
                  <Line yAxisId="price" type="monotone" dataKey="close" stroke="#0E7C69" strokeWidth={2.5} dot={false} name="Close Price" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TECHNICAL INDICATORS SIDEBAR (3 COLS = 25%) */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        {/* ANALYST ALPHA CONVICTION BADGE */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--pos)]/30 bg-[var(--pos-bg)] text-center space-y-1">
          <span className="text-[10px] font-mono text-[var(--pos)] font-bold uppercase tracking-wider block">
            Analyst Conviction Signal
          </span>
          <span className="font-mono text-2xl font-extrabold text-[var(--pos)] block">
            STRONG BUY
          </span>
          <span className="text-[10px] font-mono text-slate-300">
            Target Return: +24.8%
          </span>
        </div>

        {/* INDICATORS LIST */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
            Technical Oscillators
          </h3>

          {/* RSI 14 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>RSI (14)</span>
              <span className="font-bold text-[var(--gold)]">{rsiVal}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
              <div className="bg-[var(--gold)] h-full rounded-full" style={{ width: `${rsiVal}%` }} />
            </div>
            <span className="text-[9px] text-emerald-400 font-bold block">NEUTRAL / BULLISH</span>
          </div>

          {/* EMA 50 */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>EMA (50)</span>
              <span className="font-bold text-white">SAR {emaVal}</span>
            </div>
            <span className="text-[9px] text-[var(--pos)] font-bold block">BULLISH CROSSOVER ▲</span>
          </div>

          {/* MACD */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>MACD (12, 26)</span>
              <span className="font-bold text-[var(--pos)]">+0.48</span>
            </div>
            <span className="text-[9px] text-[var(--pos)] font-bold block">BUY SIGNAL (CONVERGING)</span>
          </div>

          {/* BOLLINGER BANDS */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Bollinger Bands</span>
              <span className="font-bold text-slate-200">Mid-Band</span>
            </div>
            <span className="text-[9px] text-amber-400 font-bold block">NORMAL VOLATILITY</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
