"use client";

import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";

export interface ScatterPeer {
  ticker: string;
  name: string;
  evEbitda: number;
  revGrowth: number;
  isTarget?: boolean;
}

interface ComparatorScatterPlotProps {
  peers?: ScatterPeer[];
  targetTicker?: string;
}

export default function ComparatorScatterPlot({
  peers = [
    { ticker: "2222.SR", name: "Saudi Aramco", evEbitda: 9.8, revGrowth: 8.5, isTarget: true },
    { ticker: "1120.SR", name: "Al Rajhi Bank", evEbitda: 14.2, revGrowth: 12.1 },
    { ticker: "2010.SR", name: "SABIC", evEbitda: 8.4, revGrowth: 4.2 },
    { ticker: "7010.SR", name: "STC Group", evEbitda: 7.2, revGrowth: 5.8 },
    { ticker: "EMAAR.AE", name: "Emaar Properties", evEbitda: 6.8, revGrowth: 14.5 },
    { ticker: "QNBK.QA", name: "QNB Group", evEbitda: 11.5, revGrowth: 7.2 },
  ],
  targetTicker = "2222.SR",
}: ComparatorScatterPlotProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const chartData = peers.map((p) => ({
    ...p,
    isTarget: p.ticker === targetTicker || p.isTarget,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScatterPeer = payload[0].payload;
      return (
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-sm text-xs font-mono shadow-xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{data.ticker}</span>
            <span className="text-slate-400">({data.name})</span>
          </div>
          <div className="text-emerald font-bold">
            EV/EBITDA: {data.evEbitda}x
          </div>
          <div className="text-slate-300">
            Rev Growth: {data.revGrowth}%
          </div>
          {data.isTarget && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] bg-emerald-dim border border-emerald-border text-emerald rounded font-bold uppercase">
              Target Company
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] shadow-xl font-mono text-xs space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
        <div>
          <span className="text-emerald font-bold uppercase tracking-wider text-[11px] block mb-1">
            {isAr ? "مخطط التشتت للمقارنة" : "Peer Valuation Scatter Matrix"}
          </span>
          <h3 className="text-sm font-extrabold text-white font-serif">
            {isAr ? "مضاعف EV/EBITDA مقابل معدل نمو الإيرادات (%)" : "EV/EBITDA Multiple vs Revenue Growth Rate (%)"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald inline-block" />
          <span className="text-slate-300 font-bold text-[11px]">{targetTicker} (Target)</span>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              type="number"
              dataKey="revGrowth"
              name="Revenue Growth"
              unit="%"
              stroke="#64748B"
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="evEbitda"
              name="EV/EBITDA"
              unit="x"
              stroke="#64748B"
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={chartData}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isTarget ? "#10B981" : "#38BDF8"}
                  stroke={entry.isTarget ? "#FFFFFF" : "#0F172A"}
                  strokeWidth={entry.isTarget ? 2 : 1}
                  r={entry.isTarget ? 9 : 6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
