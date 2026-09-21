// Newsvendor: optimal single-period order under demand uncertainty (normal demand).
import { normInv } from "./safetyStock";
export interface NewsvendorInputs { unitCost: number; sellingPrice: number; salvageValue: number; shortageCost: number; meanDemand: number; demandStdDev: number }
export interface NewsvendorOutputs {
  underageCost: number; overageCost: number; criticalRatio: number; z: number; optimalQty: number;
  expectedProfit: number; expectedLostSales: number; fillRatePct: number;
  curve: { qty: number; expectedProfit: number }[];
}
const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
const Phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
function expectedProfitAt(q: number, i: NewsvendorInputs) {
  const z = (q - i.meanDemand) / (i.demandStdDev || 1);
  const lost = i.demandStdDev * (phi(z) - z * (1 - Phi(z)));          // E[(D−Q)+]
  const sales = i.meanDemand - lost;
  const leftover = q - sales;
  return (i.sellingPrice - i.unitCost) * sales - (i.unitCost - i.salvageValue) * leftover - i.shortageCost * lost;
}
export function computeNewsvendor(i: NewsvendorInputs): NewsvendorOutputs {
  const cu = i.sellingPrice - i.unitCost + i.shortageCost;
  const co = i.unitCost - i.salvageValue;
  const cr = cu + co > 0 ? cu / (cu + co) : 0.5;
  const z = normInv(Math.min(0.9999, Math.max(0.0001, cr)));
  const q = i.meanDemand + z * i.demandStdDev;
  const lost = i.demandStdDev * (phi(z) - z * (1 - Phi(z)));
  const curve = Array.from({ length: 31 }, (_, k) => {
    const qty = Math.max(0, i.meanDemand - 3 * i.demandStdDev + (6 * i.demandStdDev * k) / 30);
    return { qty, expectedProfit: expectedProfitAt(qty, i) };
  });
  return { underageCost: cu, overageCost: co, criticalRatio: cr, z, optimalQty: q, expectedProfit: expectedProfitAt(q, i), expectedLostSales: lost, fillRatePct: i.meanDemand > 0 ? (1 - lost / i.meanDemand) * 100 : 0, curve };
}

