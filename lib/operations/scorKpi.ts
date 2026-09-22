// SCOR-style supply-chain KPI scorecard: perfect order, OTIF, fill rate, cash-to-cash, forecast accuracy, cost-to-serve.
export interface ScorInputs {
  orders: number; onTime: number; inFull: number; damageFree: number; docsCorrect: number; perfectOrders: number;
  linesRequested: number; linesShipped: number;
  dio: number; dso: number; dpo: number; forecastMapePct: number; scCostPctRevenue: number; upsideFlexDays: number;
}
export interface ScorKpi { key: string; label: string; value: number; unit: "%" | "days" | "x"; bestInClass: number; median: number; higherIsBetter: boolean; score: number; tier: "best" | "advantage" | "parity" | "lagging" }
export interface ScorOutputs { kpis: ScorKpi[]; overall: number; perfectOrderPct: number; otifPct: number; cashToCash: number; weakest: ScorKpi | null }

function tierScore(v: number, best: number, med: number, up: boolean): { score: number; tier: ScorKpi["tier"] } {
  const lag = up ? med - (best - med) : med + (med - best);
  const raw = up ? (v - lag) / (best - lag || 1) : (lag - v) / (lag - best || 1);
  const score = Math.max(0, Math.min(100, raw * 100));
  const tier: ScorKpi["tier"] = score >= 95 ? "best" : score >= 66 ? "advantage" : score >= 33 ? "parity" : "lagging";
  return { score, tier };
}

export function computeScor(i: ScorInputs): ScorOutputs {
  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);
  const otif = pct(Math.min(i.onTime, i.inFull), i.orders);
  const perfect = pct(i.perfectOrders, i.orders);
  const c2c = i.dio + i.dso - i.dpo;
  const defs: Omit<ScorKpi, "score" | "tier">[] = [
    { key: "perfect", label: "Perfect order fulfilment", value: perfect, unit: "%", bestInClass: 95, median: 85, higherIsBetter: true },
    { key: "otif", label: "On-time in-full (OTIF)", value: otif, unit: "%", bestInClass: 97, median: 88, higherIsBetter: true },
    { key: "ontime", label: "On-time delivery", value: pct(i.onTime, i.orders), unit: "%", bestInClass: 98, median: 90, higherIsBetter: true },
    { key: "fill", label: "Line fill rate", value: pct(i.linesShipped, i.linesRequested), unit: "%", bestInClass: 99, median: 94, higherIsBetter: true },
    { key: "damage", label: "Damage-free delivery", value: pct(i.damageFree, i.orders), unit: "%", bestInClass: 99.5, median: 97, higherIsBetter: true },
    { key: "docs", label: "Documentation accuracy", value: pct(i.docsCorrect, i.orders), unit: "%", bestInClass: 99.5, median: 96, higherIsBetter: true },
    { key: "c2c", label: "Cash-to-cash cycle", value: c2c, unit: "days", bestInClass: 30, median: 60, higherIsBetter: false },
    { key: "fa", label: "Forecast accuracy (1 − MAPE)", value: 100 - i.forecastMapePct, unit: "%", bestInClass: 85, median: 70, higherIsBetter: true },
    { key: "cost", label: "Supply-chain cost / revenue", value: i.scCostPctRevenue, unit: "%", bestInClass: 6, median: 10, higherIsBetter: false },
    { key: "flex", label: "Upside flexibility (days to +20 %)", value: i.upsideFlexDays, unit: "days", bestInClass: 15, median: 45, higherIsBetter: false },
  ];
  const kpis = defs.map((d) => ({ ...d, ...tierScore(d.value, d.bestInClass, d.median, d.higherIsBetter) }));
  const overall = kpis.reduce((a, k) => a + k.score, 0) / kpis.length;
  const weakest = kpis.length ? kpis.reduce((w, k) => (k.score < w.score ? k : w)) : null;
  return { kpis, overall, perfectOrderPct: perfect, otifPct: otif, cashToCash: c2c, weakest };
}
