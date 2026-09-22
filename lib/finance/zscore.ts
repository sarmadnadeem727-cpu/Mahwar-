// Altman Z-score family — bankruptcy distance for public, private and non-manufacturing firms.
export type ZModel = "public" | "private" | "nonmfg";
export interface ZInputs {
  model: ZModel;
  workingCapital: number; retainedEarnings: number; ebit: number; equityValue: number; // market value (public) or book (private)
  totalLiabilities: number; sales: number; totalAssets: number;
}
export interface ZComponent { name: string; ratio: number; weight: number; contribution: number }
export interface ZOutputs { z: number; zone: "safe" | "grey" | "distress"; thresholds: { distress: number; safe: number }; components: ZComponent[]; impliedPd: number }

const COEF: Record<ZModel, { w: number[]; thresholds: { distress: number; safe: number }; useSales: boolean }> = {
  public: { w: [1.2, 1.4, 3.3, 0.6, 1.0], thresholds: { distress: 1.81, safe: 2.99 }, useSales: true },
  private: { w: [0.717, 0.847, 3.107, 0.42, 0.998], thresholds: { distress: 1.23, safe: 2.9 }, useSales: true },
  nonmfg: { w: [6.56, 3.26, 6.72, 1.05, 0], thresholds: { distress: 1.1, safe: 2.6 }, useSales: false },
};

export function computeZ(i: ZInputs): ZOutputs {
  const ta = i.totalAssets || 1e-9;
  const tl = i.totalLiabilities || 1e-9;
  const c = COEF[i.model];
  const names = ["Working capital / Total assets", "Retained earnings / Total assets", "EBIT / Total assets", "Equity / Total liabilities", "Sales / Total assets"];
  const ratios = [i.workingCapital / ta, i.retainedEarnings / ta, i.ebit / ta, i.equityValue / tl, c.useSales ? i.sales / ta : 0];
  const components = ratios.map((r, k) => ({ name: names[k], ratio: r, weight: c.w[k], contribution: r * c.w[k] })).filter((x) => x.weight > 0);
  const z = components.reduce((a, x) => a + x.contribution, 0);
  const zone: ZOutputs["zone"] = z < c.thresholds.distress ? "distress" : z < c.thresholds.safe ? "grey" : "safe";
  // Logistic mapping of z to a rough one-year default probability (calibrated so 1.8 ≈ 25 %, 3.0 ≈ 3 %).
  const impliedPd = 1 / (1 + Math.exp(2.4 * (z - 2.3)));
  return { z, zone, thresholds: c.thresholds, components, impliedPd };
}
