// Warehouse capacity planning — pallet positions, utilisation, cost per position and months of headroom.
export interface WarehouseInputs {
  floorAreaSqm: number; clearHeightM: number; aisleAndDockPct: number; palletFootprintSqm: number; palletHeightM: number; beamClearanceM: number;
  rackingType: "selective" | "double_deep" | "drive_in";
  inventoryUnits: number; unitsPerPallet: number; monthlyGrowthPct: number; monthlyRentPerSqm: number; monthlyOpsCost: number; targetUtilisationPct: number;
}
export interface WarehouseOutputs {
  storageAreaSqm: number; levels: number; groundPositions: number; totalPositions: number; usablePositions: number; palletsNeeded: number;
  utilisationPct: number; freePositions: number; monthsToTarget: number | null; monthsToFull: number | null; costPerPositionMonth: number; monthlyCost: number; projection: { month: number; pallets: number; capacity: number }[];
}
const ACCESS_FACTOR: Record<WarehouseInputs["rackingType"], number> = { selective: 1, double_deep: 1.6, drive_in: 2.4 };
const HONEYCOMB: Record<WarehouseInputs["rackingType"], number> = { selective: 0.95, double_deep: 0.85, drive_in: 0.7 };

export function computeWarehouse(i: WarehouseInputs): WarehouseOutputs {
  const storageAreaSqm = i.floorAreaSqm * (1 - i.aisleAndDockPct / 100);
  const levels = Math.max(1, Math.floor(i.clearHeightM / (i.palletHeightM + i.beamClearanceM)));
  const groundPositions = i.palletFootprintSqm > 0 ? Math.floor((storageAreaSqm / i.palletFootprintSqm) * ACCESS_FACTOR[i.rackingType]) : 0;
  const totalPositions = groundPositions * levels;
  const usablePositions = Math.floor(totalPositions * HONEYCOMB[i.rackingType]);
  const palletsNeeded = i.unitsPerPallet > 0 ? Math.ceil(i.inventoryUnits / i.unitsPerPallet) : 0;
  const utilisationPct = usablePositions > 0 ? (palletsNeeded / usablePositions) * 100 : 0;
  const g = i.monthlyGrowthPct / 100;
  const months = (target: number) => (g > 0 && palletsNeeded > 0 && palletsNeeded < target ? Math.log(target / palletsNeeded) / Math.log(1 + g) : palletsNeeded >= target ? 0 : null);
  const monthlyCost = i.floorAreaSqm * i.monthlyRentPerSqm + i.monthlyOpsCost;
  const projection = Array.from({ length: 25 }, (_, m) => ({ month: m, pallets: Math.round(palletsNeeded * Math.pow(1 + g, m)), capacity: usablePositions }));
  return {
    storageAreaSqm, levels, groundPositions, totalPositions, usablePositions, palletsNeeded, utilisationPct, freePositions: usablePositions - palletsNeeded,
    monthsToTarget: months(usablePositions * (i.targetUtilisationPct / 100)), monthsToFull: months(usablePositions),
    costPerPositionMonth: usablePositions > 0 ? monthlyCost / usablePositions : 0, monthlyCost, projection,
  };
}
