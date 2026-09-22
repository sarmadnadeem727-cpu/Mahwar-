// Capital budgeting under a hard budget: NPV, IRR, PI, payback, and the optimal project set.
import { computeIrr } from "@/lib/finance/irr";
export interface Project { id: string; name: string; outlay: number; cashflows: number[] }
export interface CapitalInputs { discountRatePct: number; budget: number; projects: Project[]; divisible: boolean }
export interface ProjectResult extends Project { npv: number; irr: number | null; pi: number; payback: number | null; rankPi: number; selected: boolean; fraction: number }
export interface CapitalOutputs { projects: ProjectResult[]; selectedNpv: number; budgetUsed: number; budgetLeft: number; method: "exhaustive" | "greedy-divisible" | "greedy"; unconstrainedNpv: number }

function npv(rate: number, outlay: number, cfs: number[]) {
  return cfs.reduce((a, cf, k) => a + cf / Math.pow(1 + rate, k + 1), -outlay);
}
function payback(outlay: number, cfs: number[]): number | null {
  let cum = -outlay;
  for (let k = 0; k < cfs.length; k++) {
    const prev = cum; cum += cfs[k];
    if (cum >= 0) return k + (cfs[k] ? -prev / cfs[k] : 0);
  }
  return null;
}

export function computeCapitalRationing(i: CapitalInputs): CapitalOutputs {
  const r = i.discountRatePct / 100;
  const base = i.projects.map((p) => {
    const v = npv(r, p.outlay, p.cashflows);
    return { ...p, npv: v, irr: computeIrr([-p.outlay, ...p.cashflows]).irr, pi: p.outlay > 0 ? (v + p.outlay) / p.outlay : 0, payback: payback(p.outlay, p.cashflows), rankPi: 0, selected: false, fraction: 0 };
  });
  const byPi = [...base].sort((a, b) => b.pi - a.pi);
  byPi.forEach((p, k) => { const t = base.find((x) => x.id === p.id)!; t.rankPi = k + 1; });
  const positive = base.filter((p) => p.npv > 0);
  let method: CapitalOutputs["method"];
  if (i.divisible) {
    method = "greedy-divisible";
    let left = i.budget;
    for (const p of byPi) {
      const t = base.find((x) => x.id === p.id)!;
      if (t.npv <= 0 || left <= 0) continue;
      const take = Math.min(1, left / t.outlay);
      t.fraction = take; t.selected = take > 0; left -= take * t.outlay;
    }
  } else if (positive.length <= 14) {
    method = "exhaustive";
    let best = 0, bestMask = 0;
    const n = positive.length;
    for (let mask = 1; mask < 1 << n; mask++) {
      let cost = 0, val = 0;
      for (let k = 0; k < n; k++) if (mask & (1 << k)) { cost += positive[k].outlay; val += positive[k].npv; }
      if (cost <= i.budget && val > best) { best = val; bestMask = mask; }
    }
    positive.forEach((p, k) => { if (bestMask & (1 << k)) { p.selected = true; p.fraction = 1; } });
  } else {
    method = "greedy";
    let left = i.budget;
    for (const p of byPi) { const t = base.find((x) => x.id === p.id)!; if (t.npv > 0 && t.outlay <= left) { t.selected = true; t.fraction = 1; left -= t.outlay; } }
  }
  const selectedNpv = base.reduce((a, p) => a + p.npv * p.fraction, 0);
  const budgetUsed = base.reduce((a, p) => a + p.outlay * p.fraction, 0);
  return { projects: base, selectedNpv, budgetUsed, budgetLeft: i.budget - budgetUsed, method, unconstrainedNpv: positive.reduce((a, p) => a + p.npv, 0) };
}
