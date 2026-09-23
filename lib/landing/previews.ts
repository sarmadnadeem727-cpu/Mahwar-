/**
 * lib/landing/previews.ts — the six flagship demos on the landing page.
 *
 * Nothing here is a screenshot or a typed-in number. Each preview calls the
 * exact engine function the dashboard panel calls, with a fixed, documented
 * sample input, and hands the result to the FLAGSHIP chapter to draw. If an
 * engine changes, the landing page changes with it.
 */
import { runDcf, type DcfParams, type DcfYear, type EvBridge } from "@/lib/finance/dcf";
import { runLbo, type DebtTranche, type LboYearInput } from "@/lib/finance/lbo";
import { runMonteCarlo, seededRandom } from "@/lib/finance/monteCarlo";
import { computeZ } from "@/lib/finance/zscore";
import { computeEOQ } from "@/lib/operations/eoq";
import { computePeriodCCC } from "@/lib/operations/ccc";
import { ZAKAT_RATE } from "@/lib/constants";

/* ------------------------------------------------------------------ DCF */

/** A mid-cap Saudi industrial: SAR 1.2bn revenue, 22 % EBIT margin, Zakat payer (no tax shield). */
export function dcfPreview() {
  const years: DcfYear[] = Array.from({ length: 5 }, (_, k) => {
    const revenue = 1200 * Math.pow(1.08, k + 1);
    return {
      yearIndex: k + 1,
      year: 2026 + k,
      revenue,
      ebitMargin: 0.22,
      taxRateEffective: 0,
      dAndA: revenue * 0.05,
      capex: revenue * 0.08,
      deltaNwc: revenue * 0.012,
    };
  });
  const params: DcfParams = {
    rfRate: 0.045, erp: 0.06, betaUnlevered: 0.9, targetDtoE: 0.4, taxShieldRate: 0, kdPreTax: 0.065,
    zakatRate: ZAKAT_RATE, terminalMethod: "GORDON", terminalGrowth: 0.025,
    includeLeasesInDebt: true, includeEosbInDebt: true, includeSukukInDebt: true,
  };
  const bridge: EvBridge = {
    enterpriseValue: 0, cash: 180, shortTermDebt: 60, longTermDebt: 240, sukuk: 150, leaseFinancingLiabilities: 40,
    eosbLiability: 35, minorityInterest: 0, otherDebtLike: 0, nonOperatingAssets: 20, sharesOutstanding: 100, currentPrice: 32.5,
  };
  const out = runDcf(years, params, bridge);
  const sens = out.sensitivityTable!;
  // Show a 5 × 5 window of the real WACC × growth grid centred on the base case.
  const r0 = Math.max(0, Math.min(sens.rows.length - 5, sens.baseRowIndex - 2));
  const c0 = Math.max(0, Math.min(sens.cols.length - 5, sens.baseColIndex - 2));
  const grid = sens.rows.slice(r0, r0 + 5).map((g, ri) => ({
    growth: g,
    cells: sens.cols.slice(c0, c0 + 5).map((w, ci) => ({
      wacc: w,
      price: sens.cells[r0 + ri][c0 + ci],
      base: r0 + ri === sens.baseRowIndex && c0 + ci === sens.baseColIndex,
    })),
  }));
  return {
    wacc: out.wacc,
    impliedPrice: out.bridge.impliedSharePrice,
    upsidePct: out.bridge.upsidePct,
    enterpriseValue: out.enterpriseValue,
    tvPct: out.tvAsPctOfEv,
    currentPrice: bridge.currentPrice!,
    grid,
  };
}

/* ------------------------------------------------------------------ LBO */

/** SAR 1.2bn take-private at 8.0× EBITDA: 3.2× senior + 1.2× mezz, five-year hold, 8.0× exit. */
export function lboPreview() {
  const entryEbitda = 150;
  const entryEv = entryEbitda * 8;
  const tranches: DebtTranche[] = [
    { name: "Senior", type: "SENIOR", openingBalance: 480, commitment: 480, spreadBps: 350, benchmarkRate: 0.055, amortPctPa: 0.05, cashSweepPct: 0.75, seniority: 1 },
    { name: "Mezz", type: "MEZZ", openingBalance: 180, commitment: 180, spreadBps: 800, benchmarkRate: 0.055, amortPctPa: 0, cashSweepPct: 0.25, seniority: 2 },
  ];
  const years: LboYearInput[] = Array.from({ length: 5 }, (_, k) => {
    const revenue = 1000 * Math.pow(1.06, k + 1);
    const ebitdaMargin = 0.15 + 0.005 * (k + 1);
    return { yearIndex: k + 1, year: 2026 + k, revenue, ebitdaMargin, capex: revenue * 0.04, deltaNwc: revenue * 0.01, taxesZakat: revenue * ebitdaMargin * ZAKAT_RATE };
  });
  const out = runLbo(tranches, years, entryEv, entryEbitda, 30, 5, 8, 20, 20);
  return {
    irr: out.irr ?? 0,
    moic: out.moic,
    entryLeverage: out.sourcesUses.entryLeverage,
    equityCheck: out.sourcesUses.equityCheck,
    entryEv,
    exitEquity: out.exitEquity,
    debtPath: [{ year: 0, debt: out.sourcesUses.totalDebt, ebitda: entryEbitda }, ...out.years.map((y) => ({ year: y.yearIndex, debt: y.debtClose, ebitda: y.ebitda }))],
  };
}

/* ------------------------------------------------------------ Monte Carlo */

/** The panel's default company, 2 000 seeded draws so the picture is the same on every visit. */
export function monteCarloPreview() {
  const out = runMonteCarlo(
    {
      currentMarketPrice: 32.5,
      revenueGrowthMean: 8.0, revenueGrowthStd: 2.5,
      ebitdaMarginMean: 35.0, ebitdaMarginStd: 3.0,
      waccMean: 8.9, waccStd: 1.0,
      terminalGrowthMean: 2.5, terminalGrowthStd: 0.5,
      baseRev: 1200, baseShares: 100, netDebt: 200,
      iterations: 2000, distributionType: "normal",
    },
    seededRandom(20260401)
  );
  return { ...out, currentMarketPrice: 32.5 };
}

/* ------------------------------------------------------------------ EOQ */

/** 24 000 units a year, SAR 180 per order, SAR 6.20 per unit-year to hold. */
export function eoqPreview() {
  const out = computeEOQ({ annualDemand: 24_000, orderSetupCost: 180, holdingCostMode: "direct", directHoldingCost: 6.2, unitCost: 40, holdingCostPct: 0 });
  return {
    eoq: out.eoq,
    ordersPerYear: out.ordersPerYear,
    daysBetweenOrders: out.daysBetweenOrders,
    annualInventoryCost: out.annualInventoryCost,
    curve: out.curveData,
  };
}

/* ------------------------------------------------------------------ CCC */

/** Three quarters of a distributor tightening its cycle: inventory down, collections faster. */
export function cccPreview() {
  const periods = [
    { periodId: "q1", periodLabel: "Q1", revenue: 900, cogs: 640, averageInventory: 210, averageAR: 190, averageAP: 120 },
    { periodId: "q2", periodLabel: "Q2", revenue: 940, cogs: 660, averageInventory: 195, averageAR: 178, averageAP: 128 },
    { periodId: "q3", periodLabel: "Q3", revenue: 990, cogs: 690, averageInventory: 178, averageAR: 168, averageAP: 134 },
  ].map((p) => computePeriodCCC({ ...p, useBeginningEnding: false, daysInPeriod: 90 }));
  const latest = periods[periods.length - 1];
  const first = periods[0];
  return { periods, latest, deltaDays: latest.ccc - first.ccc };
}

/* ------------------------------------------------------------ Altman Z */

/** A listed manufacturer in the grey zone — the case where the score actually earns its keep. */
export function zscorePreview() {
  const out = computeZ({ model: "public", workingCapital: 180, retainedEarnings: 260, ebit: 95, equityValue: 640, totalLiabilities: 720, sales: 1350, totalAssets: 1480 });
  return out;
}

export type DcfPreview = ReturnType<typeof dcfPreview>;
export type LboPreview = ReturnType<typeof lboPreview>;
export type MonteCarloPreview = ReturnType<typeof monteCarloPreview>;
export type EoqPreview = ReturnType<typeof eoqPreview>;
export type CccPreview = ReturnType<typeof cccPreview>;
export type ZPreview = ReturnType<typeof zscorePreview>;
