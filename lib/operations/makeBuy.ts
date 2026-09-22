// Make-vs-buy: break-even volume and total cost curves for in-house production against outsourcing.
export interface MakeBuyInputs {
  volume: number; makeFixedCost: number; makeVariableCost: number; makeCapacity: number; overtimePremiumPct: number;
  buyUnitPrice: number; buyFixedCost: number; buyLogisticsPerUnit: number; buyQualityRiskPct: number; annualRatePct: number; buyInventoryDays: number;
}
export interface MakeBuyOutputs {
  makeTotal: number; buyTotal: number; makeUnit: number; buyUnit: number; breakevenVolume: number | null; recommendation: "make" | "buy" | "indifferent";
  savings: number; savingsPct: number; curve: { volume: number; make: number; buy: number }[]; capacityFlag: boolean;
  buyComponents: { label: string; value: number }[];
}
export function computeMakeBuy(i: MakeBuyInputs): MakeBuyOutputs {
  const makeCost = (v: number) => {
    const within = Math.min(v, i.makeCapacity);
    const over = Math.max(0, v - i.makeCapacity);
    return i.makeFixedCost + within * i.makeVariableCost + over * i.makeVariableCost * (1 + i.overtimePremiumPct / 100);
  };
  const buyEffectiveUnit = i.buyUnitPrice * (1 + i.buyQualityRiskPct / 100) + i.buyLogisticsPerUnit + i.buyUnitPrice * (i.annualRatePct / 100) * (i.buyInventoryDays / 365);
  const buyCost = (v: number) => i.buyFixedCost + v * buyEffectiveUnit;
  const makeTotal = makeCost(i.volume), buyTotal = buyCost(i.volume);
  const slopeMake = i.makeVariableCost, slopeBuy = buyEffectiveUnit;
  const breakevenVolume = slopeBuy !== slopeMake ? (i.makeFixedCost - i.buyFixedCost) / (slopeBuy - slopeMake) : null;
  const diff = buyTotal - makeTotal;
  const recommendation: MakeBuyOutputs["recommendation"] = Math.abs(diff) / Math.max(makeTotal, buyTotal, 1) < 0.02 ? "indifferent" : diff > 0 ? "make" : "buy";
  const maxV = Math.max(i.volume * 2, (breakevenVolume ?? 0) * 1.3, 10);
  const curve = Array.from({ length: 25 }, (_, k) => { const v = (maxV / 24) * k; return { volume: Math.round(v), make: makeCost(v), buy: buyCost(v) }; });
  return {
    makeTotal, buyTotal, makeUnit: i.volume > 0 ? makeTotal / i.volume : 0, buyUnit: i.volume > 0 ? buyTotal / i.volume : 0,
    breakevenVolume: breakevenVolume !== null && breakevenVolume > 0 ? breakevenVolume : null, recommendation, savings: Math.abs(diff), savingsPct: (Math.abs(diff) / Math.max(makeTotal, buyTotal, 1)) * 100,
    curve, capacityFlag: i.volume > i.makeCapacity,
    buyComponents: [
      { label: "Unit price", value: i.buyUnitPrice }, { label: "Quality / rework risk", value: i.buyUnitPrice * (i.buyQualityRiskPct / 100) },
      { label: "Inbound logistics", value: i.buyLogisticsPerUnit }, { label: "Pipeline inventory carry", value: i.buyUnitPrice * (i.annualRatePct / 100) * (i.buyInventoryDays / 365) },
    ],
  };
}
