// Sukuk / fixed-profit instrument pricing — price, yield-to-maturity, duration, convexity.
export interface SukukInputs {
  faceValue: number;       // e.g. 1000
  profitRatePct: number;   // annual coupon / profit rate, %
  yearsToMaturity: number;
  frequency: 1 | 2 | 4;    // payments per year
  marketYieldPct: number;  // required yield, %
}
export interface SukukCashflow { period: number; t: number; cash: number; pv: number }
export interface SukukOutputs {
  price: number; pricePct: number; macaulayDuration: number; modifiedDuration: number;
  convexity: number; currentYieldPct: number; totalProfit: number; cashflows: SukukCashflow[];
  priceCurve: { yieldPct: number; price: number }[];
}
export function priceSukuk(i: SukukInputs): SukukOutputs {
  const n = Math.max(1, Math.round(i.yearsToMaturity * i.frequency));
  const c = (i.faceValue * i.profitRatePct) / 100 / i.frequency;
  const y = i.marketYieldPct / 100 / i.frequency;
  const cashflows: SukukCashflow[] = [];
  let price = 0, wTime = 0, conv = 0;
  for (let k = 1; k <= n; k++) {
    const cash = c + (k === n ? i.faceValue : 0);
    const df = Math.pow(1 + y, -k);
    const pv = cash * df;
    price += pv; wTime += (k / i.frequency) * pv; conv += (k * (k + 1) * cash) / Math.pow(1 + y, k + 2);
    cashflows.push({ period: k, t: k / i.frequency, cash, pv });
  }
  const mac = price > 0 ? wTime / price : 0;
  const mod = mac / (1 + y);
  const convexity = price > 0 ? conv / (price * i.frequency * i.frequency) : 0;
  const priceCurve = Array.from({ length: 21 }, (_, j) => {
    const yieldPct = Math.max(0.25, i.marketYieldPct - 5 + j * 0.5);
    return { yieldPct, price: priceSukukAt(i, yieldPct) };
  });
  return {
    price, pricePct: (price / i.faceValue) * 100, macaulayDuration: mac, modifiedDuration: mod, convexity,
    currentYieldPct: price > 0 ? ((c * i.frequency) / price) * 100 : 0, totalProfit: c * n, cashflows, priceCurve,
  };
}
function priceSukukAt(i: SukukInputs, yieldPct: number): number {
  const n = Math.max(1, Math.round(i.yearsToMaturity * i.frequency));
  const c = (i.faceValue * i.profitRatePct) / 100 / i.frequency;
  const y = yieldPct / 100 / i.frequency;
  let p = 0;
  for (let k = 1; k <= n; k++) p += (c + (k === n ? i.faceValue : 0)) * Math.pow(1 + y, -k);
  return p;
}
/** Solve the yield that reproduces a given market price (bisection). */
export function solveSukukYield(i: Omit<SukukInputs, "marketYieldPct">, targetPrice: number): number {
  let lo = 0.01, hi = 60;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (priceSukukAt({ ...i, marketYieldPct: mid }, mid) > targetPrice) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

