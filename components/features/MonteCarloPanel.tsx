"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine 
} from "recharts";
import { Dices, Play, RefreshCw, Sparkles, Sliders, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

interface DistributionStats {
  histogramData: { rangeLabel: string; count: number; minVal: number; maxVal: number }[];
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  stdDev: number;
  probUpside: number;
  iterationsRun: number;
}

export default function MonteCarloPanel() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  // Inputs
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number>(32.5);
  const [revenueGrowthMean, setRevenueGrowthMean] = useState<number>(8.0);
  const [revenueGrowthStd, setRevenueGrowthStd] = useState<number>(2.5);
  
  const [ebitdaMarginMean, setEbitdaMarginMean] = useState<number>(35.0);
  const [ebitdaMarginStd, setEbitdaMarginStd] = useState<number>(3.0);
  
  const [waccMean, setWaccMean] = useState<number>(8.9);
  const [waccStd, setWaccStd] = useState<number>(1.0);

  const [terminalGrowthMean, setTerminalGrowthMean] = useState<number>(2.5);
  const [terminalGrowthStd, setTerminalGrowthStd] = useState<number>(0.5);

  // Company Scale Inputs
  const [baseRev, setBaseRev] = useState<number>(1200); // SAR M
  const [baseShares, setBaseShares] = useState<number>(100); // M shares
  const [netDebt, setNetDebt] = useState<number>(200); // SAR M

  const [iterations, setIterations] = useState<number>(5000);
  const [distributionType, setDistributionType] = useState<"normal" | "triangular">("normal");

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stats, setStats] = useState<DistributionStats | null>(null);

  // Helper box-muller transform for normal distribution
  const randomNormal = (mean: number, stdDev: number): number => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * stdDev;
  };

  // Helper triangular distribution
  const randomTriangular = (min: number, mode: number, max: number): number => {
    const u = Math.random();
    const fc = (mode - min) / (max - min);
    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  };

  const runSimulation = () => {
    setIsRunning(true);

    // Use async timeout to allow UI loading spinner render
    setTimeout(() => {
      const prices: number[] = [];

      for (let i = 0; i < iterations; i++) {
        let revGrowth = 0;
        let ebitdaMarg = 0;
        let wacc = 0;
        let termGrowth = 0;

        if (distributionType === "normal") {
          revGrowth = randomNormal(revenueGrowthMean, revenueGrowthStd) / 100;
          ebitdaMarg = randomNormal(ebitdaMarginMean, ebitdaMarginStd) / 100;
          wacc = Math.max(0.04, randomNormal(waccMean, waccStd) / 100);
          termGrowth = Math.min(wacc - 0.005, randomNormal(terminalGrowthMean, terminalGrowthStd) / 100);
        } else {
          revGrowth = randomTriangular(revenueGrowthMean - 2 * revenueGrowthStd, revenueGrowthMean, revenueGrowthMean + 2 * revenueGrowthStd) / 100;
          ebitdaMarg = randomTriangular(ebitdaMarginMean - 2 * ebitdaMarginStd, ebitdaMarginMean, ebitdaMarginMean + 2 * ebitdaMarginStd) / 100;
          wacc = Math.max(0.04, randomTriangular(waccMean - 2 * waccStd, waccMean, waccMean + 2 * waccStd) / 100);
          termGrowth = Math.min(wacc - 0.005, randomTriangular(terminalGrowthMean - 2 * terminalGrowthStd, terminalGrowthMean, terminalGrowthMean + 2 * terminalGrowthStd) / 100);
        }

        // 5-Year Cash Flow Projection
        let fcfSum = 0;
        let currentRev = baseRev;
        for (let yr = 1; yr <= 5; yr++) {
          currentRev *= (1 + revGrowth);
          const fcf = currentRev * ebitdaMarg * 0.65; // After capex/tax factor
          const df = Math.pow(1 + wacc, yr);
          fcfSum += fcf / df;
        }

        // Terminal Value
        const lastRev = currentRev * (1 + termGrowth);
        const lastFcf = lastRev * ebitdaMarg * 0.65;
        const terminalValue = lastFcf / (wacc - termGrowth);
        const pvTerminal = terminalValue / Math.pow(1 + wacc, 5);

        const enterpriseValue = fcfSum + pvTerminal;
        const equityValue = enterpriseValue - netDebt;
        const perShare = Math.max(1.0, equityValue / (baseShares > 0 ? baseShares : 100));

        prices.push(perShare);
      }

      prices.sort((a, b) => a - b);

      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);

      const p10 = prices[Math.floor(prices.length * 0.10)];
      const p50 = prices[Math.floor(prices.length * 0.50)];
      const p90 = prices[Math.floor(prices.length * 0.90)];

      const upsideCount = prices.filter(p => p > currentMarketPrice).length;
      const probUpside = (upsideCount / prices.length) * 100;

      // Construct 15-bin Histogram
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      const binCount = 14;
      const binWidth = (maxPrice - minPrice) / binCount;

      const histogramData = Array.from({ length: binCount }).map((_, idx) => {
        const minVal = minPrice + idx * binWidth;
        const maxVal = minVal + binWidth;
        const count = prices.filter(p => p >= minVal && (idx === binCount - 1 ? p <= maxVal : p < maxVal)).length;
        return {
          rangeLabel: `${minVal.toFixed(1)}-${maxVal.toFixed(1)}`,
          count,
          minVal,
          maxVal
        };
      });

      const resultsData: DistributionStats = {
        histogramData,
        p10: Number(p10.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p90: Number(p90.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        probUpside: Number(probUpside.toFixed(1)),
        iterationsRun: iterations
      };

      setStats(resultsData);
      setIsRunning(false);

      updateSessionAnalysis("monteCarlo", {
        inputs: { currentMarketPrice, revenueGrowthMean, ebitdaMarginMean, waccMean, iterations, baseRev, baseShares, netDebt },
        outputs: resultsData,
        computedAt: new Date().toISOString()
      });
    }, 150);
  };

  useEffect(() => {
    runSimulation();
  }, [
    currentMarketPrice,
    revenueGrowthMean,
    revenueGrowthStd,
    ebitdaMarginMean,
    ebitdaMarginStd,
    waccMean,
    waccStd,
    terminalGrowthMean,
    terminalGrowthStd,
    iterations,
    distributionType,
    baseRev,
    baseShares,
    netDebt
  ]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* TOP TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 panel-input p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald/10 border border-emerald/30 text-emerald">
            <Dices size={24} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-fg">
              {isAr ? "محاكاة مونتي كارلو للتقييم الكمي" : "Monte Carlo Valuation Simulation Engine"}
            </h1>
            <p className="text-xs text-fg-3 font-sans font-medium">
              {isAr ? "محاكاة آلاف المسارات العشوائية لقياس المخاطر والت توزيع القيمة الجوهرية" : "Run 5,000–10,000 probability iterations over uncertain DCF inputs"}
            </p>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald hover:bg-emerald-light text-ink-0 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isRunning ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
          <span>{isRunning ? (isAr ? "جاري المحاكاة..." : "Running 5,000 Runs...") : (isAr ? "إعادة المحاكاة" : "Run Simulation")}</span>
        </button>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT PARAMETERS COLUMN */}
        <div className="panel-input p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-emerald" />
              <span>{isAr ? "معلمات التوزيع والمدخلات" : "Distribution Parameters"}</span>
            </h3>
            <span className="px-2 py-0.5 rounded bg-ink-3 border border-line text-fg-3 font-mono text-[10px]">
              {iterations.toLocaleString()} Runs
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "سعر السوق (SAR)" : "Market Price (SAR)"}
                </label>
                <input
                  type="number"
                  value={currentMarketPrice}
                  onChange={(e) => setCurrentMarketPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md bg-ink-3 border border-line font-mono text-fg text-xs focus:outline-none focus:border-emerald"
                />
              </div>
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الإيرادات الأساسية (M)" : "Base Revenue (SAR M)"}
                </label>
                <input
                  type="number"
                  value={baseRev}
                  onChange={(e) => setBaseRev(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md bg-ink-3 border border-line font-mono text-fg text-xs focus:outline-none focus:border-emerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "الأسهم القائمة (M)" : "Shares Out (M)"}
                </label>
                <input
                  type="number"
                  value={baseShares}
                  onChange={(e) => setBaseShares(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md bg-ink-3 border border-line font-mono text-fg text-xs focus:outline-none focus:border-emerald"
                />
              </div>
              <div>
                <label className="text-fg-2 font-medium block mb-1">
                  {isAr ? "صافي الدين (SAR M)" : "Net Debt (SAR M)"}
                </label>
                <input
                  type="number"
                  value={netDebt}
                  onChange={(e) => setNetDebt(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md bg-ink-3 border border-line font-mono text-fg text-xs focus:outline-none focus:border-emerald"
                />
              </div>
            </div>

            <div>
              <label className="text-fg-2 font-medium flex justify-between mb-1">
                <span>{isAr ? "نمو الإيرادات (%)" : "Revenue Growth Rate (%)"}</span>
                <span className="font-mono text-emerald">μ: {revenueGrowthMean}% | σ: {revenueGrowthStd}%</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={revenueGrowthMean}
                  onChange={(e) => setRevenueGrowthMean(Number(e.target.value))}
                  placeholder="Mean %"
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
                <input
                  type="number"
                  step="0.1"
                  value={revenueGrowthStd}
                  onChange={(e) => setRevenueGrowthStd(Number(e.target.value))}
                  placeholder="Std Dev %"
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-fg-2 font-medium flex justify-between mb-1">
                <span>{isAr ? "هامش الأرباح EBITDA (%)" : "EBITDA Margin (%)"}</span>
                <span className="font-mono text-emerald">μ: {ebitdaMarginMean}% | σ: {ebitdaMarginStd}%</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={ebitdaMarginMean}
                  onChange={(e) => setEbitdaMarginMean(Number(e.target.value))}
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
                <input
                  type="number"
                  step="0.1"
                  value={ebitdaMarginStd}
                  onChange={(e) => setEbitdaMarginStd(Number(e.target.value))}
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-fg-2 font-medium flex justify-between mb-1">
                <span>{isAr ? "تكلفة رأس المال WACC (%)" : "Discount Rate WACC (%)"}</span>
                <span className="font-mono text-emerald">μ: {waccMean}% | σ: {waccStd}%</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={waccMean}
                  onChange={(e) => setWaccMean(Number(e.target.value))}
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
                <input
                  type="number"
                  step="0.1"
                  value={waccStd}
                  onChange={(e) => setWaccStd(Number(e.target.value))}
                  className="px-3 py-1.5 rounded bg-ink-3 border border-line font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-fg-2 font-medium block mb-1">
                {isAr ? "نوع التوزيع الإحصائي" : "Probability Distribution Curve"}
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setDistributionType("normal")}
                  className={`py-2 rounded border text-center font-bold cursor-pointer transition-all ${
                    distributionType === "normal"
                      ? "bg-emerald text-ink-0 border-emerald"
                      : "bg-ink-3 border-line text-fg-3"
                  }`}
                >
                  Normal (Gaussian)
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionType("triangular")}
                  className={`py-2 rounded border text-center font-bold cursor-pointer transition-all ${
                    distributionType === "triangular"
                      ? "bg-emerald text-ink-0 border-emerald"
                      : "bg-ink-3 border-line text-fg-3"
                  }`}
                >
                  Triangular
                </button>
              </div>
            </div>

            <div>
              <label className="text-fg-2 font-medium block mb-1">
                {isAr ? "عدد التكرارات" : "Iteration Count"}
              </label>
              <select
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-ink-3 border border-line font-mono text-xs"
              >
                <option value={2000}>2,000 Iterations</option>
                <option value={5000}>5,000 Iterations</option>
                <option value={10000}>10,000 Iterations</option>
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS & HISTOGRAM COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PERCENTILE HIGHLIGHT CARDS */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 bg-ink-2 rounded-xl border border-line shadow-xs">
                <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">P10 (Bear Case)</span>
                <span className="text-xl font-extrabold text-fg">SAR {stats.p10}</span>
                <span className="text-[10px] text-fg-3 block mt-1">10th Percentile</span>
              </div>

              <div className="p-4 bg-emerald/10 rounded-xl border border-emerald/30 shadow-xs">
                <span className="text-[10px] text-emerald uppercase font-bold block mb-1">P50 (Median)</span>
                <span className="text-xl font-extrabold text-emerald">SAR {stats.p50}</span>
                <span className="text-[10px] text-emerald font-bold block mt-1">Expected Outcome</span>
              </div>

              <div className="p-4 bg-ink-2 rounded-xl border border-line shadow-xs">
                <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">P90 (Bull Case)</span>
                <span className="text-xl font-extrabold text-fg">SAR {stats.p90}</span>
                <span className="text-[10px] text-fg-3 block mt-1">90th Percentile</span>
              </div>

              <div className="p-4 bg-ink-2 rounded-xl border border-line shadow-xs">
                <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">Upside Prob.</span>
                <span className="text-xl font-extrabold text-emerald">{stats.probUpside}%</span>
                <span className="text-[10px] text-fg-3 block mt-1">&gt; Market Price</span>
              </div>
            </div>
          )}

          {/* RECHARTS HISTOGRAM */}
          <div className="panel-input p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "مخطط التوزيع التكراري للقيمة الجوهرية (Histogram)" : "Valuation Outcome Probability Histogram"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "يُظهر توزيع النتائج المحسوبة من تكرارات المحاكاة" : "Frequency distribution across 15 valuation price bins"}
                </p>
              </div>
              {stats && (
                <div className="text-right font-mono text-[11px] text-fg-3">
                  <span>Mean: <strong className="text-fg">SAR {stats.mean}</strong></span> | 
                  <span> StdDev: <strong className="text-fg">SAR {stats.stdDev}</strong></span>
                </div>
              )}
            </div>

            <div className="h-64 w-full">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" vertical={false} />
                    <XAxis dataKey="rangeLabel" stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#a7b9b2" fontSize={10} fontFamily="monospace" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(val: any) => [`${val} Runs`, "Frequency"]}
                    />
                    <ReferenceLine x={`SAR ${stats.p50}`} stroke="#17a88a" strokeWidth={2} label={{ value: "P50 Median", fill: "#17a88a", fontSize: 10 }} />
                    <Bar dataKey="count" fill="#17a88a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-fg-3 font-mono text-xs">
                  <RefreshCw className="animate-spin text-emerald mr-2" size={16} />
                  <span>Computing Monte Carlo Simulation...</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

