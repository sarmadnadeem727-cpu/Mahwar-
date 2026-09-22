// Supplier concentration and risk — Herfindahl index, single-source exposure, country clustering and a weighted risk score.
export interface SupplierRow { id: string; name: string; country: string; spend: number; leadTimeDays: number; singleSource: boolean; riskRating: number /* 1 low – 5 high */ }
export interface SupplierRiskInputs { suppliers: SupplierRow[]; annualRevenue: number }
export interface SupplierRiskOutputs {
  totalSpend: number; hhi: number; hhiLabel: "competitive" | "moderate" | "concentrated"; top1Pct: number; top3Pct: number; singleSourcePct: number;
  countryShares: { country: string; spend: number; pct: number }[]; weightedRisk: number; spendWeightedLeadTime: number; exposure: { id: string; name: string; sharePct: number; valueAtRisk: number; riskRating: number; flag: string[] }[]; actions: string[];
}
export function computeSupplierRisk(i: SupplierRiskInputs): SupplierRiskOutputs {
  const total = i.suppliers.reduce((a, s) => a + s.spend, 0) || 1e-9;
  const shares = i.suppliers.map((s) => ({ ...s, share: s.spend / total }));
  const hhi = shares.reduce((a, s) => a + Math.pow(s.share * 100, 2), 0);
  const sorted = [...shares].sort((a, b) => b.share - a.share);
  const top1Pct = (sorted[0]?.share ?? 0) * 100;
  const top3Pct = sorted.slice(0, 3).reduce((a, s) => a + s.share, 0) * 100;
  const singleSourcePct = shares.filter((s) => s.singleSource).reduce((a, s) => a + s.share, 0) * 100;
  const byCountry = new Map<string, number>();
  shares.forEach((s) => byCountry.set(s.country, (byCountry.get(s.country) ?? 0) + s.spend));
  const countryShares = [...byCountry.entries()].map(([country, spend]) => ({ country, spend, pct: (spend / total) * 100 })).sort((a, b) => b.pct - a.pct);
  const weightedRisk = shares.reduce((a, s) => a + s.share * s.riskRating, 0);
  const spendWeightedLeadTime = shares.reduce((a, s) => a + s.share * s.leadTimeDays, 0);
  const exposure = sorted.map((s) => {
    const flag: string[] = [];
    if (s.share > 0.25) flag.push("concentration");
    if (s.singleSource) flag.push("single source");
    if (s.riskRating >= 4) flag.push("high risk rating");
    if (s.leadTimeDays > 60) flag.push("long lead time");
    return { id: s.id, name: s.name, sharePct: s.share * 100, valueAtRisk: s.spend * (s.riskRating / 5) * (s.singleSource ? 1.5 : 1), riskRating: s.riskRating, flag };
  });
  const actions: string[] = [];
  if (hhi > 2500) actions.push("Spend is concentrated (HHI > 2,500): qualify a second source for the top supplier.");
  if (singleSourcePct > 30) actions.push(`${singleSourcePct.toFixed(0)}% of spend is single-sourced: negotiate dual-award or hold strategic buffer stock.`);
  if ((countryShares[0]?.pct ?? 0) > 50) actions.push(`Over half of spend sits in ${countryShares[0].country}: add a near-shore alternative to cut corridor risk.`);
  if (weightedRisk > 3) actions.push("Spend-weighted risk rating above 3: run supplier audits and tighten contract SLAs.");
  if (actions.length === 0) actions.push("Portfolio is diversified. Keep monitoring lead-time drift and risk ratings quarterly.");
  return { totalSpend: total, hhi, hhiLabel: hhi < 1500 ? "competitive" : hhi < 2500 ? "moderate" : "concentrated", top1Pct, top3Pct, singleSourcePct, countryShares, weightedRisk, spendWeightedLeadTime, exposure, actions };
}
