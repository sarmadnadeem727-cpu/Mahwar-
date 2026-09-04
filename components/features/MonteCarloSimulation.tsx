"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { RefreshCw, Play, Sparkles } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { runDcf, DcfParams, DcfYear, EvBridge } from "@/lib/finance/dcf";

interface MonteCarloSimulationProps {
  baseWacc?: number;
  baseGrowth?: number;
  baseSharePrice?: number;
}

export default function MonteCarloSimulation({
  baseWacc = 0.089,
  baseGrowth = 0.025,
  baseSharePrice = 38.45,
}: MonteCarloSimulationProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const [simResults, setSimResults] = useState<{
    histogramData: { rangeLabel: string; count: number; minVal: number }[];
    p10: number;
    p50: number;
    p90: number;
    mean: number;
    stdDev: number;
  } | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runSimulation = () => {
    setIsRunning(true);

    setTimeout(() => {
      const iterations = 1000;
      const prices: number[] = [];

      const baseYears: DcfYear[] = [
        { yearIndex: 1, year: 2025, revenue: 1296, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 65, capex: 130, deltaNwc: 15 },
        { yearIndex: 2, year: 2026, revenue: 1399, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 70, capex: 140, deltaNwc: 15 },
        { yearIndex: 3, year: 2027, revenue: 1511, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 75, capex: 151, deltaNwc: 16 },
        { yearIndex: 4, year: 2028, revenue: 1632, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 81, capex: 163, deltaNwc: 17 },
        { yearIndex: 5, year: 2029, revenue: 1763, ebitMargin: 0.35, taxRateEffective: 0.025, dAndA: 88, capex: 176, deltaNwc: 18 },
      ];

      const bridge: EvBridge = {
        enterpriseValue: 0,
        cash: 100,
        shortTermDebt: 50,
        longTermDebt: 300,
        sukuk: 0,
        leaseFinancingLiabilities: 0,
        eosbLiability: 0,
        minorityInterest: 0,
        otherDebtLike: 0,
        nonOperatingAssets: 0,
        sharesOutstanding: 100,
        currentPrice: 32.50,
      };

      // Box-Muller normal random sampling
      const randNormal = (mean: number, stdDev: number) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + z * stdDev;
      };

      for (let i = 0; i < iterations; i++) {
        // Sample WACC, terminal growth, and revenue multiplier
        const sampledWacc = Math.max(0.065, Math.min(0.14, randNormal(baseWacc, 0.006)));
        const sampledGrowth = Math.max(0.01, Math.min(sampledWacc - 0.005, randNormal(baseGrowth, 0.004)));
        const revMult = Math.max(0.85, Math.min(1.15, randNormal(1.0, 0.04)));

        const sampledYears = baseYears.map(y => ({
          ...y,
          revenue: y.revenue * revMult,
        }));

        const params: DcfParams = {
          rfRate: 0.045,
          erp: 0.055,
          betaUnlevered: 0.85,
          targetDtoE: 0.25,
          taxShieldRate: 0.0,
          kdPreTax: 0.055,
          zakatRate: 0.025,
          waccOverride: sampledWacc,
          terminalMethod: 'GORDON',
          terminalGrowth: sampledGrowth,
          includeLeasesInDebt: true,
          includeEosbInDebt: true,
          includeSukukInDebt: true,
        };

        try {
          const res = runDcf(sampledYears, params, bridge);
          prices.push(res.bridge.impliedSharePrice);
        } catch {
          prices.push(baseSharePrice);
        }
      }

      prices.sort((a, b) => a - b);

      const p10 = prices[Math.floor(iterations * 0.10)];
      const p50 = prices[Math.floor(iterations * 0.50)];
      const p90 = prices[Math.floor(iterations * 0.90)];

      const sum = prices.reduce((a, b) => a + b, 0);
      const mean = sum / iterations;
      const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iterations;
      const stdDev = Math.sqrt(variance);

      // Create 12 histogram bins
      const minPx = Math.floor(prices[0]);
      const maxPx = Math.ceil(prices[prices.length - 1]);
      const binWidth = (maxPx - minPx) / 12;

      const bins = Array(12).fill(0).map((_, idx) => ({
        minVal: minPx + idx * binWidth,
        rangeLabel: `${(minPx + idx * binWidth).toFixed(0)}-${(minPx + (idx + 1) * binWidth).toFixed(0)}`,
        count: 0,
      }));

      prices.forEach(p => {
        const binIndex = Math.min(11, Math.max(0, Math.floor((p - minPx) / binWidth)));
        bins[binIndex].count += 1;
      });

      setSimResults({
        histogramData: bins,
        p10: Number(p10.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p90: Number(p90.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
      });

      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    runSimulation();
  }, [baseWacc, baseGrowth, baseSharePrice]);

  return (
    <div className="panel-input p-6 font-mono text-xs space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 text-emerald font-bold uppercase tracking-wider text-[11px] mb-1">
            <Sparkles size={14} />
            <span>{isAr ? "محاكاة مونت كارلو الاحتمالية" : "1,000-Run Client-Side Monte Carlo Engine"}</span>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 font-serif">
            {isAr ? "توزيع احتمالية القيمة العادلة للسهم (Probabilistic Valuation)" : "Implied Valuation Probability Distribution"}
          </h3>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="px-4 py-2 bg-emerald hover:bg-emerald-light text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider text-xs shadow-xs"
        >
          {isRunning ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
          <span>{isAr ? "إعادة المحاكاة (1,000 جولة)" : "Run 1,000 Simulations"}</span>
        </button>
      </div>

      {/* PERCENTILE CALLOUTS */}
      {simResults && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              {isAr ? "النسبة المئوية P10 (تحفظية)" : "P10 Percentile (Bear)"}
            </span>
            <span className="text-xl font-extrabold text-rose-400">
              SAR {simResults.p10.toFixed(2)}
            </span>
          </div>

          <div className="p-4 bg-terminal-emerald-dim border border-terminal-border-emerald rounded-sm text-center">
            <span className="text-[10px] text-emerald font-bold uppercase block mb-1">
              {isAr ? "النسبة المئوية P50 (الوسيط)" : "P50 Percentile (Median)"}
            </span>
            <span className="text-2xl font-extrabold text-emerald">
              SAR {simResults.p50.toFixed(2)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              {isAr ? "النسبة المئوية P90 (تفاؤلية)" : "P90 Percentile (Bull)"}
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              SAR {simResults.p90.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* HISTOGRAM CHART */}
      <div className="h-[220px] w-full pt-2">
        {simResults ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simResults.histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="rangeLabel" stroke="#64748B" tickLine={false} fontSize={10} />
              <YAxis stroke="#64748B" tickLine={false} fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", color: "#0F172A", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                formatter={(val: any) => [`${val} runs`, "Frequency"]}
              />
              <Bar dataKey="count" fill="#0E7C69" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Calculating 1,000 Monte Carlo iterations...
          </div>
        )}
      </div>
    </div>
  );
}
