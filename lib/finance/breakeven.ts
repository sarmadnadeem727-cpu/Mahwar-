// Cost-volume-profit: break-even, margin of safety, operating leverage.
export interface BreakevenInputs { fixedCosts: number; pricePerUnit: number; variableCostPerUnit: number; expectedUnits: number; targetProfit?: number }
export interface BreakevenOutputs {
  contributionPerUnit: number; contributionMarginPct: number; breakevenUnits: number; breakevenRevenue: number;
  unitsForTarget: number; marginOfSafetyPct: number; operatingLeverage: number; profitAtExpected: number;
  curve: { units: number; revenue: number; totalCost: number; profit: number }[];
}
export function computeBreakeven(i: BreakevenInputs): BreakevenOutputs {
  const cpu = i.pricePerUnit - i.variableCostPerUnit;
  const cm = i.pricePerUnit > 0 ? cpu / i.pricePerUnit : 0;
  const beUnits = cpu > 0 ? i.fixedCosts / cpu : Infinity;
  const target = i.targetProfit ?? 0;
  const profit = i.expectedUnits * cpu - i.fixedCosts;
  const maxU = Math.max(i.expectedUnits * 1.6, isFinite(beUnits) ? beUnits * 1.6 : 0, 10);
  const curve = Array.from({ length: 25 }, (_, k) => {
    const units = Math.round((maxU * k) / 24);
    return { units, revenue: units * i.pricePerUnit, totalCost: i.fixedCosts + units * i.variableCostPerUnit, profit: units * cpu - i.fixedCosts };
  });
  return {
    contributionPerUnit: cpu, contributionMarginPct: cm * 100, breakevenUnits: beUnits, breakevenRevenue: beUnits * i.pricePerUnit,
    unitsForTarget: cpu > 0 ? (i.fixedCosts + target) / cpu : Infinity,
    marginOfSafetyPct: i.expectedUnits > 0 && isFinite(beUnits) ? ((i.expectedUnits - beUnits) / i.expectedUnits) * 100 : 0,
    operatingLeverage: profit !== 0 ? (i.expectedUnits * cpu) / profit : Infinity, profitAtExpected: profit, curve,
  };
}

