// Financial ratio analysis with DuPont decomposition and health bands.
export interface RatioInputs {
  revenue: number; cogs: number; opex: number; depreciation: number; interestExpense: number; taxExpense: number; netIncome: number;
  cash: number; receivables: number; inventory: number; currentAssets: number; totalAssets: number;
  currentLiabilities: number; totalDebt: number; totalLiabilities: number; equity: number; payables: number;
  operatingCashFlow: number; capex: number; sharesOutstanding: number; price: number;
}
export interface Ratio { key: string; group: "liquidity" | "leverage" | "efficiency" | "profitability" | "market"; label: string; value: number; unit: "x" | "%" | "days" | "n"; band: [number, number]; higherIsBetter: boolean; status: "good" | "watch" | "weak" }
export interface RatioOutputs { ratios: Ratio[]; dupont: { netMargin: number; assetTurnover: number; leverage: number; roe: number }; score: number; ebitda: number; ebit: number; fcf: number }

function status(value: number, band: [number, number], higherIsBetter: boolean): Ratio["status"] {
  if (!Number.isFinite(value)) return "weak";
  const [lo, hi] = band;
  if (higherIsBetter) return value >= hi ? "good" : value >= lo ? "watch" : "weak";
  return value <= lo ? "good" : value <= hi ? "watch" : "weak";
}

export function computeRatios(i: RatioInputs): RatioOutputs {
  const d = (n: number, m: number) => (m ? n / m : NaN);
  const ebitda = i.revenue - i.cogs - i.opex;
  const ebit = ebitda - i.depreciation;
  const netDebt = i.totalDebt - i.cash;
  const fcf = i.operatingCashFlow - i.capex;
  const mcap = i.price * i.sharesOutstanding;
  const defs: Omit<Ratio, "status">[] = [
    { key: "current", group: "liquidity", label: "Current ratio", value: d(i.currentAssets, i.currentLiabilities), unit: "x", band: [1.2, 1.8], higherIsBetter: true },
    { key: "quick", group: "liquidity", label: "Quick ratio", value: d(i.currentAssets - i.inventory, i.currentLiabilities), unit: "x", band: [0.8, 1.2], higherIsBetter: true },
    { key: "cash", group: "liquidity", label: "Cash ratio", value: d(i.cash, i.currentLiabilities), unit: "x", band: [0.2, 0.5], higherIsBetter: true },
    { key: "de", group: "leverage", label: "Debt / Equity", value: d(i.totalDebt, i.equity), unit: "x", band: [0.5, 1.5], higherIsBetter: false },
    { key: "ndebitda", group: "leverage", label: "Net debt / EBITDA", value: d(netDebt, ebitda), unit: "x", band: [2, 3.5], higherIsBetter: false },
    { key: "icr", group: "leverage", label: "Interest cover (EBIT / interest)", value: d(ebit, i.interestExpense), unit: "x", band: [2, 4], higherIsBetter: true },
    { key: "eqratio", group: "leverage", label: "Equity / Assets", value: d(i.equity, i.totalAssets) * 100, unit: "%", band: [30, 45], higherIsBetter: true },
    { key: "at", group: "efficiency", label: "Asset turnover", value: d(i.revenue, i.totalAssets), unit: "x", band: [0.6, 1.0], higherIsBetter: true },
    { key: "dio", group: "efficiency", label: "Days inventory (DIO)", value: d(i.inventory, i.cogs) * 365, unit: "days", band: [45, 75], higherIsBetter: false },
    { key: "dso", group: "efficiency", label: "Days sales outstanding (DSO)", value: d(i.receivables, i.revenue) * 365, unit: "days", band: [45, 70], higherIsBetter: false },
    { key: "dpo", group: "efficiency", label: "Days payable outstanding (DPO)", value: d(i.payables, i.cogs) * 365, unit: "days", band: [40, 60], higherIsBetter: true },
    { key: "gm", group: "profitability", label: "Gross margin", value: d(i.revenue - i.cogs, i.revenue) * 100, unit: "%", band: [25, 40], higherIsBetter: true },
    { key: "em", group: "profitability", label: "EBITDA margin", value: d(ebitda, i.revenue) * 100, unit: "%", band: [12, 22], higherIsBetter: true },
    { key: "nm", group: "profitability", label: "Net margin", value: d(i.netIncome, i.revenue) * 100, unit: "%", band: [5, 12], higherIsBetter: true },
    { key: "roa", group: "profitability", label: "Return on assets", value: d(i.netIncome, i.totalAssets) * 100, unit: "%", band: [4, 8], higherIsBetter: true },
    { key: "roe", group: "profitability", label: "Return on equity", value: d(i.netIncome, i.equity) * 100, unit: "%", band: [10, 16], higherIsBetter: true },
    { key: "fcfm", group: "profitability", label: "FCF margin", value: d(fcf, i.revenue) * 100, unit: "%", band: [4, 10], higherIsBetter: true },
    { key: "pe", group: "market", label: "P / E", value: d(mcap, i.netIncome), unit: "x", band: [12, 22], higherIsBetter: false },
    { key: "pb", group: "market", label: "P / B", value: d(mcap, i.equity), unit: "x", band: [1.5, 3], higherIsBetter: false },
    { key: "fcfy", group: "market", label: "FCF yield", value: d(fcf, mcap) * 100, unit: "%", band: [3, 6], higherIsBetter: true },
  ];
  const ratios = defs.map((r) => ({ ...r, status: status(r.value, r.band, r.higherIsBetter) }));
  const pts = { good: 1, watch: 0.5, weak: 0 } as const;
  const valid = ratios.filter((r) => Number.isFinite(r.value));
  const score = valid.length ? (valid.reduce((a, r) => a + pts[r.status], 0) / valid.length) * 100 : 0;
  const netMargin = d(i.netIncome, i.revenue);
  const assetTurnover = d(i.revenue, i.totalAssets);
  const leverage = d(i.totalAssets, i.equity);
  return { ratios, dupont: { netMargin, assetTurnover, leverage, roe: netMargin * assetTurnover * leverage }, score, ebitda, ebit, fcf };
}
