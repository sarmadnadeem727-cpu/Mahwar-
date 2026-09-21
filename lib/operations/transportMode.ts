// Transport mode comparison: total landed logistics cost including in-transit inventory carrying cost and CO2.
export interface ModeInput { id: string; name: string; nameAr: string; freightPerUnit: number; transitDays: number; reliabilityPct: number; co2KgPerUnit: number }
export interface TransportInputs { unitValue: number; annualUnits: number; carryingRatePct: number; safetyStockDaysPerTransitDay: number; carbonPricePerTon: number; modes: ModeInput[] }
export interface ModeResult extends ModeInput { freightCost: number; inTransitCost: number; safetyStockCost: number; carbonCost: number; totalCost: number; totalPerUnit: number; rank: number }
export function compareTransportModes(i: TransportInputs): { results: ModeResult[]; best: ModeResult | null } {
  const daily = i.annualUnits / 365;
  const results = i.modes.map((m) => {
    const freightCost = m.freightPerUnit * i.annualUnits;
    const inTransitCost = daily * m.transitDays * i.unitValue * (i.carryingRatePct / 100);
    const ssUnits = daily * m.transitDays * i.safetyStockDaysPerTransitDay * (1 + (100 - m.reliabilityPct) / 100);
    const safetyStockCost = ssUnits * i.unitValue * (i.carryingRatePct / 100);
    const carbonCost = (m.co2KgPerUnit * i.annualUnits / 1000) * i.carbonPricePerTon;
    const totalCost = freightCost + inTransitCost + safetyStockCost + carbonCost;
    return { ...m, freightCost, inTransitCost, safetyStockCost, carbonCost, totalCost, totalPerUnit: i.annualUnits ? totalCost / i.annualUnits : 0, rank: 0 };
  }).sort((a, b) => a.totalCost - b.totalCost).map((r, k) => ({ ...r, rank: k + 1 }));
  return { results, best: results[0] ?? null };
}

