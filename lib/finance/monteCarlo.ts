// lib/finance/monteCarlo.ts — the Monte Carlo valuation engine.
//
// Moved verbatim out of components/features/MonteCarloPanel.tsx so the same
// function serves the dashboard panel and the landing-page preview. The maths
// is unchanged: five-year FCF projection with a 0.65 after-capex/tax factor,
// Gordon terminal value, EV → equity → per-share, then P10/P50/P90 and a
// 14-bin histogram. `rng` lets a caller pass a seeded generator for a
// deterministic preview; the panel uses Math.random as before.

export interface MonteCarloInputs {
  currentMarketPrice: number;
  revenueGrowthMean: number; revenueGrowthStd: number;   // percent
  ebitdaMarginMean: number; ebitdaMarginStd: number;     // percent
  waccMean: number; waccStd: number;                     // percent
  terminalGrowthMean: number; terminalGrowthStd: number; // percent
  baseRev: number;      // SAR M
  baseShares: number;   // M shares
  netDebt: number;      // SAR M
  iterations: number;
  distributionType: "normal" | "triangular";
}

export interface MonteCarloStats {
  histogramData: { rangeLabel: string; count: number; minVal: number; maxVal: number }[];
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  stdDev: number;
  probUpside: number;
  iterationsRun: number;
}

/** Deterministic 32-bit generator for previews (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runMonteCarlo(i: MonteCarloInputs, rng: () => number = Math.random): MonteCarloStats {
  // Helper box-muller transform for normal distribution
  const randomNormal = (mean: number, stdDev: number): number => {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * stdDev;
  };

  // Helper triangular distribution
  const randomTriangular = (min: number, mode: number, max: number): number => {
    const u = rng();
    const fc = (mode - min) / (max - min);
    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  };

  const prices: number[] = [];

  for (let k = 0; k < i.iterations; k++) {
    let revGrowth = 0;
    let ebitdaMarg = 0;
    let wacc = 0;
    let termGrowth = 0;

    if (i.distributionType === "normal") {
      revGrowth = randomNormal(i.revenueGrowthMean, i.revenueGrowthStd) / 100;
      ebitdaMarg = randomNormal(i.ebitdaMarginMean, i.ebitdaMarginStd) / 100;
      wacc = Math.max(0.04, randomNormal(i.waccMean, i.waccStd) / 100);
      termGrowth = Math.min(wacc - 0.005, randomNormal(i.terminalGrowthMean, i.terminalGrowthStd) / 100);
    } else {
      revGrowth = randomTriangular(i.revenueGrowthMean - 2 * i.revenueGrowthStd, i.revenueGrowthMean, i.revenueGrowthMean + 2 * i.revenueGrowthStd) / 100;
      ebitdaMarg = randomTriangular(i.ebitdaMarginMean - 2 * i.ebitdaMarginStd, i.ebitdaMarginMean, i.ebitdaMarginMean + 2 * i.ebitdaMarginStd) / 100;
      wacc = Math.max(0.04, randomTriangular(i.waccMean - 2 * i.waccStd, i.waccMean, i.waccMean + 2 * i.waccStd) / 100);
      termGrowth = Math.min(wacc - 0.005, randomTriangular(i.terminalGrowthMean - 2 * i.terminalGrowthStd, i.terminalGrowthMean, i.terminalGrowthMean + 2 * i.terminalGrowthStd) / 100);
    }

    // 5-Year Cash Flow Projection
    let fcfSum = 0;
    let currentRev = i.baseRev;
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
    const equityValue = enterpriseValue - i.netDebt;
    const perShare = Math.max(1.0, equityValue / (i.baseShares > 0 ? i.baseShares : 100));

    prices.push(perShare);
  }

  prices.sort((a, b) => a - b);

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  const p10 = prices[Math.floor(prices.length * 0.10)];
  const p50 = prices[Math.floor(prices.length * 0.50)];
  const p90 = prices[Math.floor(prices.length * 0.90)];

  const upsideCount = prices.filter(p => p > i.currentMarketPrice).length;
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

  return {
    histogramData,
    p10: Number(p10.toFixed(2)),
    p50: Number(p50.toFixed(2)),
    p90: Number(p90.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    probUpside: Number(probUpside.toFixed(1)),
    iterationsRun: i.iterations
  };
}
