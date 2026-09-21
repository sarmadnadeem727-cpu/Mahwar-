// Bullwhip effect: order-variance amplification across supply-chain tiers
// using order-up-to policies with moving-average forecasts (Chen et al., 2000).
export interface BullwhipInputs { tiers: number; leadTimeDays: number; forecastWindow: number; demandMean: number; demandStdDev: number; periods: number; seed?: number }
export interface BullwhipTier { tier: number; name: string; orderVariance: number; amplification: number; series: number[] }
export interface BullwhipOutputs { tiers: BullwhipTier[]; endToEndAmplification: number; theoreticalPerTier: number }
const NAMES = ["Retailer", "Wholesaler", "Distributor", "Manufacturer", "Tier-2 supplier", "Tier-3 supplier"];
export function simulateBullwhip(i: BullwhipInputs): BullwhipOutputs {
  let seed = i.seed ?? 42;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const gauss = () => { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const L = Math.max(1, i.leadTimeDays), p = Math.max(1, i.forecastWindow);
  let demand = Array.from({ length: i.periods }, () => Math.max(0, i.demandMean + i.demandStdDev * gauss()));
  const variance = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length; };
  const baseVar = variance(demand) || 1;
  const tiers: BullwhipTier[] = [];
  for (let t = 0; t < i.tiers; t++) {
    const orders: number[] = [];
    for (let k = 0; k < demand.length; k++) {
      const win = demand.slice(Math.max(0, k - p + 1), k + 1);
      const prevWin = demand.slice(Math.max(0, k - p), k);
      const f = win.reduce((a, b) => a + b, 0) / win.length;
      const fPrev = prevWin.length ? prevWin.reduce((a, b) => a + b, 0) / prevWin.length : f;
      orders.push(Math.max(0, demand[k] + L * (f - fPrev)));   // order-up-to with MA forecast
    }
    const v = variance(orders);
    tiers.push({ tier: t + 1, name: NAMES[t] ?? `Tier ${t + 1}`, orderVariance: v, amplification: v / baseVar, series: orders });
    demand = orders;
  }
  return { tiers, endToEndAmplification: tiers.length ? tiers[tiers.length - 1].amplification : 1, theoreticalPerTier: 1 + (2 * L) / p + (2 * L * L) / (p * p) };
}

