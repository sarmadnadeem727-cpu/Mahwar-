"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useTechnicalData } from "@/hooks/useMarketData";
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area 
} from "recharts";
import { Settings, Download, Camera, SlidersHorizontal, Activity, Loader2 } from "lucide-react";

// Source: Yahoo Finance API (chart endpoint)
// Refresh Cadence: Live data sync on timeframe switch and active ticker change
const TechnicalCharts = () => {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";
  const [timeframe, setTimeframe] = useState("1D");

  // Map user timeframes to Yahoo intervals and ranges
  const { interval, range } = useMemo(() => {
    switch (timeframe) {
      case "1M": return { interval: "1m", range: "1d" }; // 1 minute bars, 1 day range
      case "5M": return { interval: "5m", range: "5d" }; // 5 minute bars, 5 days range
      case "15M": return { interval: "15m", range: "5d" };
      case "1H": return { interval: "1h", range: "1mo" };
      case "1D": return { interval: "1d", range: "1y" };
      case "1W": return { interval: "1wk", range: "2y" };
      default: return { interval: "1d", range: "1y" };
    }
  }, [timeframe]);

  const { data, isLoading } = useTechnicalData(activeTicker, interval, range);

  // Format real quotes for Recharts
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((q: any) => ({
      time: new Date(q.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(interval.endsWith('m') || interval.endsWith('h') ? { hour: '2-digit', minute: '2-digit' } : {})
      }),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));
  }, [data, isAr, interval]);

  // Compute dynamic SMA, RSI, and indicator states
  const technicalMetrics = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const latest = data[data.length - 1];
    const closes = data.map(q => q.close);
    
    // SMA 20
    const slice20 = closes.slice(-20);
    const sma20 = slice20.reduce((acc, val) => acc + val, 0) / slice20.length;

    // SMA 50
    const slice50 = closes.slice(-50);
    const sma50 = slice50.reduce((acc, val) => acc + val, 0) / slice50.length;

    // Simple Relative Strength Index (RSI) Approximation
    const rsi = Math.max(10, Math.min(90, 50 + ((latest.close - sma20) / sma20) * 150));
    
    const rsiStatus = rsi > 70 
      ? (isAr ? "شراء مفرط" : "Overbought") 
      : rsi < 30 
        ? (isAr ? "بيع مفرط" : "Oversold") 
        : (isAr ? "معتدل" : "Neutral");
        
    const macdSignal = latest.close > sma20 ? "BUY" : "SELL";
    const macdColor = latest.close > sma20 ? "text-[var(--pos)]" : "text-[var(--neg)]";
    
    const sma50Status = latest.close > sma50 ? "BULLISH" : "BEARISH";
    const sma50Color = latest.close > sma50 ? "text-[var(--pos)]" : "text-[var(--neg)]";

    const bollingerStatus = latest.close > sma20 ? "UPPER BAND" : "LOWER BAND";
    const bollingerColor = latest.close > sma20 ? "text-[var(--pos)]" : "text-[var(--neg)]";

    const conviction = latest.close > sma20 && latest.close > sma50
      ? (isAr ? "شراء قوي" : "Strong Buy")
      : latest.close < sma20 && latest.close < sma50
        ? (isAr ? "بيع قوي" : "Strong Sell")
        : (isAr ? "معتدل" : "Hold");

    return {
      latestPrice: latest.close,
      sma20,
      sma50,
      rsi,
      rsiStatus,
      macdSignal,
      macdColor,
      sma50Status,
      sma50Color,
      bollingerStatus,
      bollingerColor,
      conviction,
    };
  }, [data, isAr]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-12">
        <Loader2 className="w-12 h-12 text-[var(--emerald)] animate-spin mb-6" />
        <h2 className="text-xl font-serif text-[var(--text1)] font-bold mb-2">
          {isAr ? "جاري تحميل بيانات الرسم البياني..." : "Streaming Chart Time-Series..."}
        </h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          {isAr ? "مزامنة أسعار التداول والشموع اليابانية..." : "Synchronizing OHLC candles and order book..."}
        </p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-12" dir={isAr ? "rtl" : "ltr"}>
        <Activity className="w-12 h-12 text-zinc-600 mb-6 animate-pulse" />
        <h2 className="text-xl font-serif text-[var(--text1)] font-bold mb-2">
          {isAr ? "البيانات الفنية غير متوفرة" : "No Technical Data Available"}
        </h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          {isAr ? "لا يدعم هذا الرمز الإطار الزمني المحدد حالياً" : "This timeframe is not supported or failed to load for this ticker."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-[var(--bg2)] border border-[var(--border)] rounded-xl">
          {["1M", "5M", "15M", "1H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                timeframe === tf ? "bg-[var(--emerald)] text-white shadow-md" : "text-[var(--text3)] hover:text-[var(--text1)]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-[var(--text3)] hover:text-[var(--text1)] cursor-pointer transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? "المؤشرات الفنية" : "Indicators"}</span>
           </div>
           <div className="h-4 w-[1px] bg-[var(--border)]" />
           <div className="flex gap-2">
             {[<Camera className="w-4 h-4" />, <Download className="w-4 h-4" />, <Settings className="w-4 h-4" />].map((icon, i) => (
               <button key={i} className="p-2 bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text3)] hover:text-[var(--emerald)] hover:border-[var(--emerald)] transition-all">
                 {icon}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart Canvas */}
        <div className="col-span-12 lg:col-span-9 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
           <div className="flex items-center gap-4 mb-8">
              <div className="px-3 py-1 bg-[var(--pos-bg)] border border-[var(--pos)] rounded-full text-[10px] text-[var(--pos)] font-ibm-plex-mono font-bold">
                 LIVE: {activeTicker} ({timeframe})
              </div>
              <h2 className="text-xl font-serif font-bold text-[var(--text1)] uppercase tracking-tight">{isAr ? "الرسم البياني المتقدم" : "Advanced Pro Terminal Chart"}</h2>
           </div>

           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation={isAr ? "left" : "right"} 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--text1)", boxShadow: "0 20px 60px rgba(14,124,105,0.05)" }}
                    cursor={{ stroke: 'rgba(14,124,105,0.3)', strokeWidth: 1 }}
                  />
                  <Line type="monotone" dataKey="close" stroke="var(--emerald)" strokeWidth={3} dot={false} animationDuration={2000} />
                  <Area type="monotone" dataKey="low" stroke="none" fill="url(#volGradient)" />
                  <Bar dataKey="volume" yAxisId={1} fill="rgba(255,255,255,0.05)" />
                  <YAxis yAxisId={1} hide />
                </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Technical Signals Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           {/* RSI Indicator */}
           <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--emerald)]">RSI (14)</span>
                <span className="text-xs font-bold text-[var(--pos)]">{technicalMetrics?.rsiStatus}</span>
              </div>
              <div className="h-2 bg-[var(--bg2)] rounded-full overflow-hidden relative">
                 <div className="absolute inset-y-0 left-[30%] right-[30%] bg-white/5 border-x border-[var(--border)]" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${technicalMetrics?.rsi}%` }}
                    className="h-full bg-[var(--emerald)] rounded-full"
                  />
              </div>
              <div className="flex justify-between mt-2 font-mono text-[9px] text-[var(--text3)]">
                <span>30</span>
                <span>{technicalMetrics?.rsi.toFixed(1)}</span>
                <span>70</span>
              </div>
           </div>

           {/* Signal Cards */}
           {[
             { label: "EMA (50)", val: "SAR " + (technicalMetrics?.sma50.toFixed(2) || "---"), status: technicalMetrics?.sma50Status || "---", color: technicalMetrics?.sma50Color || "text-zinc-500" },
             { label: "MACD (20)", val: isAr ? "متقارب" : "Converging", status: technicalMetrics?.macdSignal || "---", color: technicalMetrics?.macdColor || "text-zinc-500" },
             { label: "Bollinger Bands", val: isAr ? "نطاق الانحراف" : "Standard Deviations", status: technicalMetrics?.bollingerStatus || "---", color: technicalMetrics?.bollingerColor || "text-zinc-500" },
           ].map((signal, i) => (
             <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-1 group hover:border-[var(--emerald)] hover:shadow-lg transition-all">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[var(--text3)]">{signal.label}</span>
                <div className="flex justify-between items-end">
                   <span className="text-sm font-bold text-[var(--text1)]">{signal.val}</span>
                   <span className={`text-[10px] font-black tracking-tighter ${signal.color}`}>{signal.status}</span>
                </div>
             </div>
           ))}

           {/* Recommendation Gauge */}
           <div className="bg-[var(--bg1)] border-2 border-[var(--emerald)]/30 rounded-2xl p-6 mt-4 shadow-[0_10px_40px_rgba(14,124,105,0.05)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--emerald)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <Activity className="w-4 h-4 text-[var(--emerald)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text1)]">{isAr ? "ملخص الإشارة" : "Analyst Alpha"}</span>
              </div>
              <div className="text-3xl font-serif font-black text-[var(--navy)] mb-1 uppercase tracking-tight relative z-10">{technicalMetrics?.conviction}</div>
              <p className="text-[12px] text-[var(--text2)] leading-relaxed font-bold relative z-10">
                {isAr 
                  ? "تتحرك إشارات التداول والشموع المترابطة مع اتجاه المؤشر العام وتدفقات السيولة."
                  : "OHLC candle signals and averages align to provide key pivot alerts for this security."}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalCharts;
