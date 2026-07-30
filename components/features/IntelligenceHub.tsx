"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Zap, BarChart3, Layers, FileSpreadsheet, 
  Sparkles, ShieldCheck, Filter, ArrowRight, Activity 
} from "lucide-react";
import { 
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

const BENCHMARK_DATA: Record<string, Array<{ time: string; price: number; tasi: number }>> = {
  "1D": [
    { time: "10:00", price: 31.10, tasi: 11800 },
    { time: "11:00", price: 31.25, tasi: 11815 },
    { time: "12:00", price: 31.30, tasi: 11822 },
    { time: "13:00", price: 31.20, tasi: 11810 },
    { time: "14:00", price: 31.40, tasi: 11835 },
    { time: "15:00", price: 31.45, tasi: 11842 },
  ],
  "1W": [
    { time: "Sun", price: 30.80, tasi: 11750 },
    { time: "Mon", price: 31.00, tasi: 11780 },
    { time: "Tue", price: 31.15, tasi: 11805 },
    { time: "Wed", price: 31.30, tasi: 11825 },
    { time: "Thu", price: 31.45, tasi: 11842 },
  ],
  "1M": [
    { time: "W1", price: 29.50, tasi: 11500 },
    { time: "W2", price: 30.10, tasi: 11620 },
    { time: "W3", price: 30.80, tasi: 11710 },
    { time: "W4", price: 31.45, tasi: 11842 },
  ],
  "1Y": [
    { time: "Jan", price: 28.00, tasi: 11000 },
    { time: "Apr", price: 29.20, tasi: 11300 },
    { time: "Jul", price: 30.50, tasi: 11650 },
    { time: "Oct", price: 31.45, tasi: 11842 },
  ]
};

const INITIAL_ORDER_TAPE = [
  { id: 1, time: "14:58:12", side: "BUY", price: 31.45, qty: "50,000", value: "SAR 1.57M", status: "EXECUTED" },
  { id: 2, time: "14:57:45", side: "SELL", price: 31.40, qty: "12,500", value: "SAR 392.5K", status: "EXECUTED" },
  { id: 3, time: "14:57:10", side: "BUY", price: 31.45, qty: "100,000", value: "SAR 3.14M", status: "EXECUTED" },
  { id: 4, time: "14:56:30", side: "BUY", price: 31.40, qty: "30,000", value: "SAR 942.0K", status: "PENDING" },
  { id: 5, time: "14:55:50", side: "SELL", price: 31.35, qty: "75,000", value: "SAR 2.35M", status: "EXECUTED" },
];

export default function IntelligenceHub() {
  const { activeTicker, setTicker, setPanel, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [timeframe, setTimeframe] = useState<string>("1D");
  const [orderTape, setOrderTape] = useState(INITIAL_ORDER_TAPE);

  // Auto insert order flow simulate
  useEffect(() => {
    const interval = setInterval(() => {
      const sides = ["BUY", "SELL"] as const;
      const side = sides[Math.floor(Math.random() * sides.length)];
      const price = Number((31.35 + Math.random() * 0.25).toFixed(2));
      const qtyNum = Math.floor(Math.random() * 80 + 10) * 1000;
      const valNum = (price * qtyNum) / 1000000;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newOrder = {
        id: Date.now(),
        time: timeStr,
        side,
        price,
        qty: qtyNum.toLocaleString(),
        value: `SAR ${valNum.toFixed(2)}M`,
        status: Math.random() > 0.3 ? "EXECUTED" : "PENDING"
      };

      setOrderTape((prev) => [newOrder, ...prev.slice(0, 7)]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const marketCards = [
    { ticker: "TASI", name: "Saudi Benchmark", price: "11,842.50", change: "+0.45%", positive: true },
    { ticker: "2222.SR", name: "Saudi Aramco", price: "SAR 31.45", change: "+0.80%", positive: true },
    { ticker: "1120.SR", name: "Al Rajhi Bank", price: "SAR 88.90", change: "+1.40%", positive: true },
    { ticker: "1180.SR", name: "SNB Bank", price: "SAR 38.20", change: "-0.50%", positive: false },
  ];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* TOP ROW: 4 SUMMARY MARKET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketCards.map((card) => {
          const isSelected = activeTicker === card.ticker;
          return (
            <div
              key={card.ticker}
              onClick={() => setTicker(card.ticker)}
              className={`glass-card p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? "border-[var(--emerald)] bg-[var(--emerald)]/10 shadow-lg shadow-[var(--emerald)]/15" 
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-white block">{card.ticker}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{card.name}</span>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    card.positive ? "text-[var(--pos)] bg-[var(--pos-bg)]" : "text-[var(--neg)] bg-[var(--neg-bg)]"
                  }`}
                >
                  {card.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.change}
                </span>
              </div>
              <div className="font-mono text-xl font-extrabold text-white mt-1">
                {card.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECOND ROW: PERFORMANCE ALPHA CHART & QUICK LAUNCH CARDS */}
      <div className="grid grid-cols-12 gap-6">
        {/* ALPHA CHART (8 COLS) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-garamond text-2xl font-bold text-white">
                {t("performance_alpha", language)}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                {activeTicker} {t("vs_tasi", language)}
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-white/10 font-mono text-xs">
              {["1D", "1W", "1M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeframe === tf
                      ? "bg-[var(--emerald)] text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Area + Line Chart */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={BENCHMARK_DATA[timeframe] || BENCHMARK_DATA["1D"]}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C69" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0E7C69" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#64748B" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1113",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F8FAFC"
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="price" stroke="#0E7C69" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK LAUNCH CARDS (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 glass-panel rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-[var(--gold)] font-mono text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              <span>{t("quick_launch_tools", language)}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Launch Bloomberg-grade valuation models bound to live SEC & Tadawul data.
            </p>
          </div>

          {[
            { id: "DCF" as const, title: t("panel_dcf", language), icon: <BarChart3 size={18} className="text-[var(--emerald)]" />, desc: "Discounted Cash Flow Valuation" },
            { id: "LBO" as const, title: t("panel_lbo", language), icon: <Layers size={18} className="text-[var(--gold)]" />, desc: "Private Equity Leveraged Buyout" },
            { id: "FS" as const, title: t("panel_three_statement", language), icon: <FileSpreadsheet size={18} className="text-[var(--emerald)]" />, desc: "Saudi GAAP / IFRS 3-Statement" }
          ].map((tool) => (
            <div
              key={tool.id}
              onClick={() => setPanel(tool.id)}
              className="glass-card p-4 rounded-xl border border-white/10 cursor-pointer hover:border-[var(--emerald)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[var(--emerald)]/10 transition-colors">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold font-mono group-hover:text-[var(--emerald)] transition-colors">
                    {tool.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">{tool.desc}</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* THIRD ROW: INSTITUTIONAL ORDER TAPE & RESEARCH BANNERS */}
      <div className="grid grid-cols-12 gap-6">
        {/* INSTITUTIONAL ORDER FLOW TABLE (8 COLS) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity size={16} className="text-[var(--emerald)]" />
                <span>{t("institutional_flow", language)}</span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                {t("real_time_tape", language)} ({activeTicker})
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[var(--pos)] px-2 py-0.5 rounded bg-[var(--pos-bg)] border border-[var(--pos)]/30 animate-pulse">
              ● STREAMING LIVE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderTape.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="text-slate-400">{row.time}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.side === "BUY" 
                          ? "bg-[var(--pos-bg)] text-[var(--pos)] border border-[var(--pos)]/30" 
                          : "bg-[var(--neg-bg)] text-[var(--neg)] border border-[var(--neg)]/30"
                      }`}>
                        {row.side}
                      </span>
                    </td>
                    <td className="font-bold text-slate-200">SAR {row.price}</td>
                    <td className="text-slate-300">{row.qty}</td>
                    <td className="text-[var(--gold)] font-bold">{row.value}</td>
                    <td>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        row.status === "EXECUTED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESEARCH BANNERS (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div
            onClick={() => setPanel("research")}
            className="glass-card p-5 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 cursor-pointer hover:border-[var(--gold)] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-[var(--gold)]" size={20} />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {t("panel_ai_research", language)}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Generate streaming institutional equity memos powered by Gemini 2.5.
            </p>
          </div>

          <div
            onClick={() => setPanel("shariah")}
            className="glass-card p-5 rounded-2xl border border-[var(--emerald)]/30 bg-[var(--emerald)]/5 cursor-pointer hover:border-[var(--emerald)] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-[var(--emerald)]" size={20} />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {t("panel_shariah", language)}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              AAOIFI Standard No. 21 ratio checks & purification calculation.
            </p>
          </div>

          <div
            onClick={() => setPanel("screener")}
            className="glass-card p-5 rounded-2xl border border-white/10 cursor-pointer hover:border-white/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Filter className="text-slate-300" size={20} />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {t("panel_screener", language)}
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Scan all Tadawul stocks with Heatmap & Table views.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
