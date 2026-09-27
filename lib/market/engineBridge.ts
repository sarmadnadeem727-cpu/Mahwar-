/**
 * lib/market/engineBridge.ts
 *
 * The Universal Interlinking Fabric of Mahwar.
 * Bridges TradingView charts, market quotes, and screener securities
 * directly into the valuation, financial, and operational engines.
 */

import { UNIVERSE, EXCHANGE_MAP, type Security, type Sector } from "./universe";
import type { Quote } from "./quotes";
import type { Currency } from "@/store/useTerminalStore";
import type { CompsInputs, Peer } from "@/lib/finance/comps";
import type { ZInputs } from "@/lib/finance/zscore";
import type { RatioInputs } from "@/lib/finance/ratios";

export interface LinkedSecurity {
  id: string; // e.g. "TADAWUL:2222"
  code: string; // e.g. "2222"
  name: string; // e.g. "Saudi Aramco"
  nameAr: string;
  exchange: string; // e.g. "TADAWUL"
  currency: Currency;
  price: number;
  changePct: number;
  marketCapB: number; // in billions
  pe: number;
  pb: number;
  divYield: number; // in %
  roe: number; // in %
  revenueGrowth: number; // in %
  debtToAssets: number; // in %
  low52: number;
  high52: number;
  volume?: number;
  tradingViewSymbol: string;
  sector: Sector;
  shariahIndicative: boolean;
  asOf: string;
}

/**
 * Normalises a Security + optional live Quote into a unified LinkedSecurity.
 */
export function buildLinkedSecurity(
  sec: Security,
  quote?: Partial<Quote>
): LinkedSecurity {
  const ex = EXCHANGE_MAP[sec.exchange];
  const cur = (ex?.currency ?? "SAR") as Currency;

  const f = quote?.fundamentals;
  const price = quote?.price ?? sec.ref.price;
  const changePct = quote?.changePct ?? 0;
  const marketCapB = f?.marketCapB ?? sec.ref.marketCapB;
  const pe = f?.pe ?? sec.ref.pe;
  const pb = f?.pb ?? sec.ref.pb;
  const divYield = f?.divYield ?? sec.ref.divYield;
  const roe = f?.roe ?? sec.ref.roe;
  const revenueGrowth = f?.revenueGrowth ?? sec.ref.revenueGrowth;
  const debtToAssets = sec.ref.debtToAssets ?? 20;
  const low52 = f?.low52 ?? sec.ref.low52;
  const high52 = f?.high52 ?? sec.ref.high52;

  return {
    id: sec.id,
    code: sec.code,
    name: sec.name,
    nameAr: sec.nameAr,
    exchange: sec.exchange,
    currency: cur,
    price: Number(price.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    marketCapB: Number(marketCapB.toFixed(2)),
    pe: Number(pe.toFixed(1)),
    pb: Number(pb.toFixed(2)),
    divYield: Number(divYield.toFixed(2)),
    roe: Number(roe.toFixed(1)),
    revenueGrowth: Number(revenueGrowth.toFixed(1)),
    debtToAssets: Number(debtToAssets.toFixed(1)),
    low52: Number(low52.toFixed(2)),
    high52: Number(high52.toFixed(2)),
    volume: quote?.volume,
    tradingViewSymbol: sec.symbols.tradingview,
    sector: sec.sector,
    shariahIndicative: sec.shariahIndicative,
    asOf: quote?.asOf ?? new Date().toISOString(),
  };
}

/**
 * Estimates shares outstanding in millions.
 * MarketCap (billions) * 1000 / Price
 */
export function estimateSharesOutstandingM(sec: LinkedSecurity): number {
  if (!sec.price || sec.price <= 0) return 100;
  const sharesM = (sec.marketCapB * 1000) / sec.price;
  return Math.round(sharesM);
}

/**
 * Estimates baseline revenue in millions.
 */
export function estimateRevenueM(sec: LinkedSecurity): number {
  const mcapM = sec.marketCapB * 1000;
  // If P/E > 0 and ROE > 0: Net Income = MCAP / PE. Equity = MCAP / PB.
  // Assumes ~12% net margin baseline or derived from ROE / Asset turnover
  if (sec.pe > 0) {
    const netIncomeM = mcapM / sec.pe;
    const estMargin = Math.max(0.04, Math.min(0.35, (sec.roe || 12) / 100));
    return Math.round(netIncomeM / estMargin);
  }
  return Math.round(mcapM * 0.4);
}

/**
 * Maps a LinkedSecurity to DCF Valuation model inputs.
 */
export function mapToDcfInputs(sec: LinkedSecurity) {
  const sharesOutstanding = estimateSharesOutstandingM(sec);
  const baseRevenue = estimateRevenueM(sec);
  const mcapM = sec.marketCapB * 1000;
  // Estimate Net Debt based on debt-to-assets
  const debtPct = (sec.debtToAssets || 20) / 100;
  const netDebt = Math.round(mcapM * debtPct * 0.5);

  return {
    currentPrice: sec.price,
    sharesOutstanding,
    baseRevenue,
    revGrowth: Math.max(-5, Math.min(25, sec.revenueGrowth || 8)),
    ebitdaMargin: Math.max(10, Math.min(65, Math.round((sec.roe || 15) * 1.8))),
    netDebt: Math.max(0, netDebt),
  };
}

/**
 * Maps a LinkedSecurity to Trading Comps inputs,
 * and automatically populates the peer set from the SAME sector in the universe!
 */
export function mapToCompsInputs(
  sec: LinkedSecurity,
  allSecurities: Security[] = UNIVERSE
): CompsInputs {
  const sharesOutstanding = estimateSharesOutstandingM(sec);
  const revenue = estimateRevenueM(sec);
  const mcapM = sec.marketCapB * 1000;
  const netIncome = sec.pe > 0 ? Math.round(mcapM / sec.pe) : Math.round(revenue * 0.1);
  const ebitda = Math.round(netIncome * 1.8);
  const debtPct = (sec.debtToAssets || 20) / 100;
  const netDebt = Math.round(mcapM * debtPct * 0.5);

  // Find up to 5 peers in the same sector (excluding self)
  const matchingPeers = allSecurities
    .filter((s) => s.id !== sec.id && s.sector === sec.sector)
    .slice(0, 5);

  // Fallback if sector has fewer than 3 peers
  const fallbackPeers = allSecurities
    .filter((s) => s.id !== sec.id && !matchingPeers.some((p) => p.id === s.id))
    .slice(0, Math.max(0, 5 - matchingPeers.length));

  const peerList = [...matchingPeers, ...fallbackPeers];

  const peers: Peer[] = peerList.map((p, idx) => ({
    id: `peer-${p.code}-${idx}`,
    name: p.name,
    evRevenue: Number(Math.max(0.8, (p.ref.pb * 1.1)).toFixed(1)),
    evEbitda: Number(Math.max(6, (p.ref.pe * 0.65)).toFixed(1)),
    pe: Number(p.ref.pe.toFixed(1)),
  }));

  return {
    revenue,
    ebitda,
    netIncome,
    netDebt,
    sharesOutstanding,
    currentPrice: sec.price,
    peers: peers.length > 0 ? peers : [
      { id: "p1", name: "Regional Peer A", evRevenue: 2.2, evEbitda: 10.5, pe: 18.0 },
      { id: "p2", name: "Regional Peer B", evRevenue: 1.8, evEbitda: 9.2, pe: 16.5 },
      { id: "p3", name: "Regional Peer C", evRevenue: 2.8, evEbitda: 12.0, pe: 21.0 },
    ],
  };
}

/**
 * Maps a LinkedSecurity to Altman Z-Score inputs.
 */
export function mapToAltmanZInputs(sec: LinkedSecurity): ZInputs {
  const mcapM = sec.marketCapB * 1000;
  const salesM = estimateRevenueM(sec);
  
  // Total Assets estimation from P/B and Market Cap
  const equityM = sec.pb > 0 ? mcapM / sec.pb : mcapM * 0.6;
  const debtRatio = (sec.debtToAssets || 25) / 100;
  // If Debt / Assets = d, and Liabilities ~ 1.3 * Debt:
  const totalAssetsM = Math.max(mcapM * 0.8, equityM / Math.max(0.1, (1 - debtRatio)));
  const totalLiabilitiesM = Math.max(mcapM * 0.2, totalAssetsM - equityM);
  
  const ebitM = Math.round(salesM * 0.18);
  const retainedEarningsM = Math.round(equityM * 0.45);
  const workingCapitalM = Math.round(salesM * 0.12);

  return {
    model: "public",
    workingCapital: Math.round(workingCapitalM),
    retainedEarnings: Math.round(retainedEarningsM),
    ebit: Math.round(ebitM),
    equityValue: Math.round(mcapM), // Market value for public
    totalLiabilities: Math.round(totalLiabilitiesM),
    sales: Math.round(salesM),
    totalAssets: Math.round(totalAssetsM),
  };
}

/**
 * Maps a LinkedSecurity to 20-Ratio Financial Analysis inputs.
 */
export function mapToRatioInputs(sec: LinkedSecurity): RatioInputs {
  const sharesM = estimateSharesOutstandingM(sec);
  const revenueM = estimateRevenueM(sec);
  const mcapM = sec.marketCapB * 1000;
  const netIncomeM = sec.pe > 0 ? Math.round(mcapM / sec.pe) : Math.round(revenueM * 0.12);
  const equityM = sec.pb > 0 ? Math.round(mcapM / sec.pb) : Math.round(mcapM * 0.6);
  const cogsM = Math.round(revenueM * 0.62);
  const opexM = Math.round(revenueM * 0.16);
  const depreciationM = Math.round(revenueM * 0.05);
  const interestM = Math.round(revenueM * 0.025);
  const taxM = Math.round(netIncomeM * 0.15);

  const debtRatio = (sec.debtToAssets || 25) / 100;
  const totalAssetsM = Math.round(Math.max(mcapM * 0.8, equityM / Math.max(0.1, (1 - debtRatio))));
  const totalDebtM = Math.round(totalAssetsM * debtRatio);
  const totalLiabilitiesM = Math.round(totalAssetsM - equityM);

  const cashM = Math.round(revenueM * 0.1);
  const recM = Math.round(revenueM * 0.15);
  const invM = Math.round(cogsM * 0.18);
  const curAssetsM = cashM + recM + invM;
  const payM = Math.round(cogsM * 0.15);
  const curLiabM = Math.round(payM * 1.8);

  const opCashFlowM = Math.round(netIncomeM + depreciationM + (revenueM * 0.02));
  const capexM = Math.round(revenueM * 0.08);

  return {
    revenue: revenueM,
    cogs: cogsM,
    opex: opexM,
    depreciation: depreciationM,
    interestExpense: interestM,
    taxExpense: taxM,
    netIncome: netIncomeM,
    cash: cashM,
    receivables: recM,
    inventory: invM,
    currentAssets: curAssetsM,
    totalAssets: totalAssetsM,
    currentLiabilities: curLiabM,
    totalDebt: totalDebtM,
    totalLiabilities: totalLiabilitiesM,
    equity: equityM,
    payables: payM,
    operatingCashFlow: opCashFlowM,
    capex: capexM,
    sharesOutstanding: sharesM,
    price: sec.price,
  };
}

/**
 * Maps a LinkedSecurity to Dividend Discount Model (DDM) inputs.
 */
export function mapToDdmInputs(sec: LinkedSecurity) {
  const dps = (sec.price * (sec.divYield / 100));
  return {
    currentDPS: Number(Math.max(0.1, dps).toFixed(2)),
    costOfEquity: Math.max(7.5, Math.min(14, Number((8.5 + (sec.pe > 25 ? 2 : 0)).toFixed(1)))),
    highGrowthRate: Math.max(2, Math.min(20, sec.revenueGrowth || 8)),
    terminalGrowthRate: 2.5,
  };
}

/**
 * Maps a LinkedSecurity to AAOIFI Shariah Screening inputs.
 */
export function mapToShariahInputs(sec: LinkedSecurity) {
  const mcapM = sec.marketCapB * 1000;
  const equityM = sec.pb > 0 ? mcapM / sec.pb : mcapM * 0.6;
  const debtRatio = (sec.debtToAssets || 20) / 100;
  const totalAssetsM = Math.round(Math.max(mcapM * 0.8, equityM / Math.max(0.1, 1 - debtRatio)));
  const totalDebtM = Math.round(totalAssetsM * debtRatio);
  const totalRevenueM = estimateRevenueM(sec);
  const sharesM = estimateSharesOutstandingM(sec);

  return {
    totalAssets: totalAssetsM,
    totalDebt: totalDebtM,
    totalRevenue: totalRevenueM,
    interestIncome: Math.round(totalRevenueM * 0.015),
    receivables: Math.round(totalRevenueM * 0.2),
    sharesOutstanding: sharesM,
  };
}
