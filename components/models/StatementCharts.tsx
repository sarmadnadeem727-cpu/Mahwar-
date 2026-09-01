"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  Legend,
  ComposedChart
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface StatementChartsProps {
  activeStatement: "IS" | "BS" | "CF";
  sortedYears: string[];
  displayYears: string[];
  isData: Record<string, Record<string, unknown>>;
  bsData: Record<string, Record<string, unknown>>;
  cfData: Record<string, Record<string, unknown>>;
}

import { TERMINAL_CHART_THEME } from "@/lib/chartTheme";

const COLORS = {
  emerald: TERMINAL_CHART_THEME.colors.emerald,
  emeraldDim: TERMINAL_CHART_THEME.colors.emeraldDim,
  positive: TERMINAL_CHART_THEME.colors.positive,
  negative: TERMINAL_CHART_THEME.colors.negative,
  text2: "#737373",
  grid: TERMINAL_CHART_THEME.grid.stroke,
  gold: TERMINAL_CHART_THEME.colors.emerald,
  goldDim: TERMINAL_CHART_THEME.colors.emeraldDim,
};




const formatValue = (val: number) => {
  const abs = Math.abs(val);
  if (abs >= 1000) return `${(val / 1000).toFixed(1)}B`;
  return `${val.toFixed(0)}M`;
};

interface RechartsTooltipEntry {
  color: string;
  name: string;
  value: number;
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: RechartsTooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg1)] border border-[var(--border)] p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">

        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text3)] mb-2 font-bold">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[var(--text2)] font-sans">{entry.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text1)]">
                SAR {formatValue(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


export function StatementCharts({
  activeStatement,
  sortedYears,
  displayYears,
  isData,
  bsData,
  cfData,
}: StatementChartsProps) {
  // Memoize data transformation to avoid expensive re-renders
  const chartData = useMemo(() => {
    // We reverse sortedYears to get chronological order for charts (L to R)
    const chronologicalYears = [...sortedYears].reverse();
    
    return chronologicalYears.map((year, index) => {
      const yearLabel = displayYears[chronologicalYears.length - 1 - index];
      
      const is = isData[year] || {};
      const bs = bsData[year] || {};
      const cf = cfData[year] || {};

      return {
        year: yearLabel,
        // Income Statement
        revenue: parseFloat((is.totalRevenue as string) || "0"),
        grossProfit: parseFloat((is.grossProfit as string) || "0"),
        ebitda: parseFloat((is.EBITDA as string) || "0"),
        ebitdaMargin: (parseFloat((is.EBITDA as string) || "0") / (parseFloat((is.totalRevenue as string) || "1"))) * 100,
        netIncome: parseFloat((is.netIncome as string) || "0"),
        // Balance Sheet
        assets: parseFloat((bs.totalAssets as string) || "0"),
        equity: parseFloat((bs.stockholdersEquity as string) || "0"),
        liabilities: parseFloat((bs.totalLiabilitiesNetMinorityInterest as string) || "0"),
        cash: parseFloat((bs.cashAndCashEquivalents as string) || "0"),
        // Cash Flow
        ocf: parseFloat((cf.operatingCashFlow as string) || "0"),
        icf: parseFloat((cf.investingCashFlow as string) || "0"),
        fcf_fin: parseFloat((cf.financingCashFlow as string) || "0"),
        netChange: parseFloat((cf.changesInCash as string) || "0"),
      };
    });
  }, [sortedYears, displayYears, isData, bsData, cfData]);

  const renderIncomeCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="bg-white border border-[var(--border)] rounded-3xl p-8 flex flex-col h-[400px]">
        <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.3em] mb-8">Revenue & Gross Profit Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10, fontWeight: 700 }}

              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              tickFormatter={(v) => `SAR ${formatValue(v)}`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Total Revenue" fill={COLORS.goldDim} stroke={COLORS.gold} radius={[4, 4, 0, 0]} />
            <Bar dataKey="grossProfit" name="Gross Profit" fill={COLORS.positive} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-3xl p-8 flex flex-col h-[400px]">
        <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.3em] mb-8">EBITDA Margin Efficiency</h3>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: COLORS.text2, fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: COLORS.text2, fontSize: 10 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
            />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="ebitdaMargin" 
              name="EBITDA Margin" 
              stroke={COLORS.positive} 
              fillOpacity={1} 
              fill="url(#colorMargin)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderBalanceCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="bg-white border border-[var(--border)] rounded-3xl p-8 flex flex-col h-[400px]">

        <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.3em] mb-8">Capital Structure Composition</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}

              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              tickFormatter={(v) => `SAR ${formatValue(v)}`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="liabilities" name="Total Liabilities" stackId="a" fill={COLORS.negative} radius={[0, 0, 0, 0]} />
            <Bar dataKey="equity" name="Total Equity" stackId="a" fill={COLORS.positive} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-3xl p-8 flex flex-col h-[400px]">

        <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.3em] mb-8">Asset Growth vs Cash Reserves</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}

              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              tickFormatter={(v) => `SAR ${formatValue(v)}`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="assets" name="Total Assets" fill={COLORS.goldDim} stroke={COLORS.gold} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="cash" name="Cash & Equivalents" stroke={COLORS.positive} strokeWidth={3} dot={{ r: 4, fill: COLORS.positive }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCashCharts = () => (
    <div className="grid grid-cols-1 gap-8 h-full">
      <div className="bg-white border border-[var(--border)] rounded-3xl p-8 flex flex-col h-[500px]">
        <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.3em] mb-8">Cash Flow Allocation (SAR Millions)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--text3)", fontSize: 10 }}
              tickFormatter={(v) => formatValue(v)}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="ocf" name="Operating" fill={COLORS.positive} radius={[4, 4, 0, 0]} />
            <Bar dataKey="icf" name="Investing" fill={COLORS.negative} radius={[4, 4, 0, 0]} />
            <Bar dataKey="fcf_fin" name="Financing" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="netChange" name="Net Change in Cash" stroke="var(--text1)" strokeWidth={2} strokeDasharray="5 5" />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeStatement}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full flex-1"
      >
        {activeStatement === "IS" && renderIncomeCharts()}
        {activeStatement === "BS" && renderBalanceCharts()}
        {activeStatement === "CF" && renderCashCharts()}

        {chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-[var(--border)] rounded-3xl opacity-30">
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono">Terminal data missing or invalid</p>
          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}
