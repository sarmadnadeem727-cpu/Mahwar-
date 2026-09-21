// lib/finance/dcf.ts

export class InsufficientDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

export interface DcfYear {
  yearIndex: number;
  year: number;
  revenue: number;
  ebitMargin: number;
  taxRateEffective: number; // 0 for Saudi-owned (Zakat has no tax shield)
  dAndA: number;
  capex: number;
  deltaNwc: number; // positive = NWC increase = cash use
  // Computed by engine:
  ebit?: number;
  nopat?: number;
  zakatExpense?: number;
  fcff?: number;
  discountFactor?: number;
  pvFcff?: number;
}

export interface DcfParams {
  rfRate: number;         // Saudi 10Y gov bond yield
  erp: number;            // global ERP + KSA country spread
  betaUnlevered: number;  // Beta without debt
  targetDtoE: number;     // target Debt/Equity ratio
  taxShieldRate: number;  // 0.0 for Saudi-owned
  kdPreTax: number;       // SAIBOR + credit spread
  zakatRate: number;      // ZATCA 2.5% applied to NOPAT
  waccOverride?: number;
  terminalMethod: 'GORDON' | 'EXIT_MULTIPLE';
  terminalGrowth?: number;
  exitMultiple?: number;
  exitMultipleEbitda?: number;
  includeLeasesInDebt: boolean;
  includeEosbInDebt: boolean;
  includeSukukInDebt: boolean;
}

export interface EvBridge {
  enterpriseValue: number;
  cash: number;
  shortTermDebt: number;
  longTermDebt: number;
  sukuk: number;
  leaseFinancingLiabilities: number;
  eosbLiability: number;
  minorityInterest: number;
  otherDebtLike: number;
  nonOperatingAssets: number;
  sharesOutstanding: number;
  currentPrice?: number;
  includeLeasesInDebt?: boolean;
  includeEosbInDebt?: boolean;
  includeSukukInDebt?: boolean;
}

/**
 * Hamada equation: β_levered = β_unlevered × [1 + (1 - T_shield) × D/E]
 */
export function computeWacc(p: DcfParams) {
  if (p.waccOverride != null && p.waccOverride > 0) {
    return { wacc: p.waccOverride, ke: 0, betaL: 0 };
  }
  const betaL = p.betaUnlevered * (1 + (1 - p.taxShieldRate) * p.targetDtoE);
  const ke = p.rfRate + betaL * p.erp;
  const eOverV = 1 / (1 + (p.targetDtoE || 0));
  const dOverV = (p.targetDtoE || 0) / (1 + (p.targetDtoE || 0));
  // taxShieldRate = 0 for pure Saudi companies: no interest deductibility against Zakat
  const wacc = eOverV * ke + dOverV * p.kdPreTax * (1 - p.taxShieldRate);
  return { wacc, ke, betaL };
}

/**
 * FCFF = EBIT × (1 - taxRateEff) - Zakat + D&A - CapEx - ΔNWC
 * Zakat = 2.5% of Adjusted Base (approximated here as NOPAT)
 */
export function projectFcff(years: DcfYear[], p: DcfParams): DcfYear[] {
  return years.map(y => {
    const ebit = y.revenue * y.ebitMargin;
    const nopat = ebit * (1 - y.taxRateEffective);
    const zakatExpense = nopat > 0 ? nopat * p.zakatRate : 0; // Simple approximation of ZATCA base
    const fcff = nopat - zakatExpense + y.dAndA - y.capex - y.deltaNwc;
    return { ...y, ebit, nopat, zakatExpense, fcff };
  });
}

export function discountFcff(years: DcfYear[], wacc: number) {
  let pvSum = 0;
  const out = years.map(y => {
    const df = 1 / Math.pow(1 + wacc, y.yearIndex);
    const pv = (y.fcff ?? 0) * df;
    pvSum += pv;
    return { ...y, discountFactor: df, pvFcff: pv };
  });
  return { years: out, pvSum };
}

/**
 * Gordon Growth: TV = FCFF_(n+1) / (WACC - g) — requires WACC > g
 * Exit Multiple: TV = Last Year EBITDA × Exit Multiple
 */
export function computeTerminalValue(lastY: DcfYear, wacc: number, p: DcfParams): number {
  if (p.terminalMethod === 'GORDON') {
    const g = p.terminalGrowth || 0;
    if (wacc <= g) {
      throw new InsufficientDataError(`WACC (${(wacc * 100).toFixed(2)}%) must be > terminal growth (${(g * 100).toFixed(2)}%)`);
    }
    return ((lastY.fcff ?? 0) * (1 + g)) / (wacc - g);
  }
  if (!p.exitMultiple || !p.exitMultipleEbitda) {
    throw new InsufficientDataError('exitMultiple and exitMultipleEbitda required for Exit Multiple method');
  }
  return p.exitMultiple * p.exitMultipleEbitda;
}

/**
 * EV Bridge: Equity Value = EV - Net Debt - Minority Interest + Non-Op Assets
 */
export function bridgeEvToEquity(b: EvBridge) {
  const totalDebt =
    b.shortTermDebt +
    b.longTermDebt +
    (b.includeSukukInDebt !== false ? b.sukuk : 0) +
    (b.includeLeasesInDebt !== false ? b.leaseFinancingLiabilities : 0) +
    (b.includeEosbInDebt !== false ? b.eosbLiability : 0) +
    b.otherDebtLike;
  const netDebt = totalDebt - (b.cash || 0);
  const equityValue = (b.enterpriseValue || 0) - netDebt - (b.minorityInterest || 0) + (b.nonOperatingAssets || 0);
  
  if (!b.sharesOutstanding || b.sharesOutstanding === 0) {
    throw new InsufficientDataError("Shares outstanding is zero or missing, cannot calculate implied share price.");
  }
  const impliedPx = equityValue / b.sharesOutstanding;
  const upsidePct = b.currentPrice ? (impliedPx / b.currentPrice - 1) * 100 : null;
  return { cash: b.cash || 0, totalDebt, netDebt, equityValue, impliedSharePrice: impliedPx, upsidePct };
}

/**
 * Build a 2D sensitivity table
 */
export function buildSensitivityTable(years: DcfYear[], p: DcfParams, bridge: EvBridge) {
  const n = years.length;
  if (n === 0) return null;
  const lastY = years[n - 1];
  const waccCols = [0.07, 0.08, 0.09, 0.095, 0.10, 0.105, 0.11, 0.12, 0.13, 0.14];
  const rows = p.terminalMethod === 'GORDON'
    ? [0.015, 0.020, 0.025, 0.030, 0.035, 0.040, 0.045, 0.050]
    : [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const { wacc: bw } = computeWacc(p);
  const baseRowVal = p.terminalMethod === 'GORDON' ? (p.terminalGrowth || 0) : (p.exitMultiple || 0);
  const bri = rows.findIndex(r => Math.abs(r - baseRowVal) < 0.001);
  const bci = waccCols.findIndex(w => Math.abs(w - bw) < 0.001);

  const cells = rows.map(rv => waccCols.map(w => {
    let pv = 0;
    years.forEach((y, i) => {
      pv += (y.fcff ?? 0) / Math.pow(1 + w, i + 1);
    });
    let tv: number;
    if (p.terminalMethod === 'GORDON') {
      if (w <= rv) return null;
      tv = ((lastY.fcff ?? 0) * (1 + rv)) / (w - rv);
    } else {
      tv = rv * (p.exitMultipleEbitda ?? 0);
    }
    const ev = pv + tv / Math.pow(1 + w, n);
    return parseFloat(bridgeEvToEquity({ ...bridge, enterpriseValue: ev }).impliedSharePrice.toFixed(2));
  }));

  return {
    rowLabel: p.terminalMethod === 'GORDON' ? 'Terminal Growth Rate' : 'Exit EV/EBITDA',
    colLabel: 'WACC',
    rows,
    cols: waccCols,
    cells,
    baseRowIndex: bri,
    baseColIndex: bci,
  };
}

/**
 * Main DCF entry point
 */
export function runDcf(rawYears: DcfYear[], p: DcfParams, bridge: EvBridge) {
  if (!rawYears || rawYears.length === 0) {
    throw new InsufficientDataError("No projected years provided for DCF.");
  }

  const { wacc, ke, betaL } = computeWacc(p);
  const projected = projectFcff(rawYears, p);
  const { years: discounted, pvSum } = discountFcff(projected, wacc);
  const lastY = discounted[discounted.length - 1];
  const tv = computeTerminalValue(lastY, wacc, p);
  const pvTv = tv / Math.pow(1 + wacc, lastY.yearIndex);
  const ev = pvSum + pvTv;
  const br = bridgeEvToEquity({ ...bridge, enterpriseValue: ev });
  const sens = buildSensitivityTable(discounted, p, bridge);
  return {
    wacc,
    costOfEquity: ke,
    betaLevered: betaL,
    projectedYears: discounted,
    pvProjectionPeriod: pvSum,
    terminalValue: tv,
    pvTerminalValue: pvTv,
    enterpriseValue: ev,
    tvAsPctOfEv: (pvTv / ev) * 100,
    bridge: br,
    sensitivityTable: sens,
  };
}

