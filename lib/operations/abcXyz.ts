// lib/operations/abcXyz.ts
import { SkuItem, AbcXyzMatrixSummary, AuditData } from './types';

export const DEFAULT_SKUS: Omit<SkuItem, 'annualConsumptionValue' | 'meanDemand' | 'demandStdDev' | 'cv' | 'abcClass' | 'xyzClass' | 'combinedClass'>[] = [
  { id: "SKU-101", name: "Industrial Valve A4", unitCost: 450, annualDemand: 1200, historicalDemand: [95, 100, 105, 98, 102, 100, 96, 104, 100, 98, 102, 100] },
  { id: "SKU-102", name: "Hydraulic Pump 300W", unitCost: 1250, annualDemand: 380, historicalDemand: [30, 32, 28, 35, 31, 33, 29, 34, 30, 32, 31, 35] },
  { id: "SKU-103", name: "Copper Piping 2-inch (m)", unitCost: 85, annualDemand: 4500, historicalDemand: [350, 420, 310, 490, 360, 400, 380, 430, 340, 410, 370, 240] },
  { id: "SKU-104", name: "Pressure Gauge Sensor", unitCost: 320, annualDemand: 850, historicalDemand: [60, 85, 45, 95, 70, 65, 80, 55, 90, 75, 60, 70] },
  { id: "SKU-105", name: "Polymer Gasket Ring", unitCost: 15, annualDemand: 12000, historicalDemand: [980, 1020, 1010, 990, 1005, 995, 1015, 990, 1010, 1000, 985, 1000] },
  { id: "SKU-106", name: "Steel Flange 6-inch", unitCost: 210, annualDemand: 1100, historicalDemand: [90, 95, 88, 92, 94, 91, 89, 93, 90, 96, 92, 90] },
  { id: "SKU-107", name: "Turbine Blade Module", unitCost: 3800, annualDemand: 65, historicalDemand: [2, 14, 0, 8, 3, 11, 1, 9, 4, 12, 0, 1] },
  { id: "SKU-108", name: "High-Temp Lubricant 20L", unitCost: 140, annualDemand: 600, historicalDemand: [50, 48, 52, 49, 51, 50, 48, 53, 49, 51, 50, 49] },
  { id: "SKU-109", name: "Standard Hex Bolt M12", unitCost: 2.5, annualDemand: 25000, historicalDemand: [2050, 2100, 2080, 2070, 2090, 2060, 2110, 2050, 2080, 2090, 2070, 2090] },
  { id: "SKU-110", name: "Safety Relief Valve", unitCost: 560, annualDemand: 340, historicalDemand: [20, 35, 15, 40, 22, 38, 18, 42, 25, 30, 27, 28] },
  { id: "SKU-111", name: "Custom Cast Impeller", unitCost: 2400, annualDemand: 90, historicalDemand: [1, 18, 0, 12, 4, 15, 2, 16, 0, 14, 3, 5] },
  { id: "SKU-112", name: "Electrical Breaker 63A", unitCost: 190, annualDemand: 480, historicalDemand: [40, 38, 42, 39, 41, 40, 38, 43, 39, 40, 41, 39] },
];

export function computeAbcXyz(
  skus: typeof DEFAULT_SKUS,
  thresholdA = 80,
  thresholdB = 95,
  thresholdX = 0.5,
  thresholdY = 1.0
): {
  classifiedSkus: SkuItem[];
  totalValue: number;
  matrix: Record<string, AbcXyzMatrixSummary>;
  paretoData: { name: string; value: number; cumulativePct: number }[];
} {
  // 1. Compute values, means, std devs, and CV
  const evaluated = skus.map((sku) => {
    const annualConsumptionValue = sku.unitCost * sku.annualDemand;

    const n = sku.historicalDemand.length;
    const meanDemand = n > 0 ? sku.historicalDemand.reduce((a, b) => a + b, 0) / n : sku.annualDemand / 12;

    let variance = 0;
    if (n > 1) {
      variance = sku.historicalDemand.reduce((acc, val) => acc + Math.pow(val - meanDemand, 2), 0) / (n - 1);
    }
    const demandStdDev = Math.sqrt(variance);
    const cv = meanDemand > 0 ? demandStdDev / meanDemand : 0;

    // XYZ Classification
    let xyzClass: 'X' | 'Y' | 'Z' = 'X';
    if (cv >= thresholdY) {
      xyzClass = 'Z';
    } else if (cv >= thresholdX) {
      xyzClass = 'Y';
    } else {
      xyzClass = 'X';
    }

    return {
      ...sku,
      annualConsumptionValue,
      meanDemand: Number(meanDemand.toFixed(1)),
      demandStdDev: Number(demandStdDev.toFixed(1)),
      cv: Number(cv.toFixed(2)),
      xyzClass,
    };
  });

  // 2. Sort descending by annual consumption value for Pareto ABC
  evaluated.sort((a, b) => b.annualConsumptionValue - a.annualConsumptionValue);

  const totalValue = evaluated.reduce((acc, item) => acc + item.annualConsumptionValue, 0);

  let runningSum = 0;
  const paretoData: { name: string; value: number; cumulativePct: number }[] = [];

  const classifiedSkus: SkuItem[] = evaluated.map((item) => {
    runningSum += item.annualConsumptionValue;
    const cumulativeValuePct = totalValue > 0 ? (runningSum / totalValue) * 100 : 0;

    let abcClass: 'A' | 'B' | 'C' = 'A';
    // If the previous item was already above threshold A, this is B or C
    const prevPct = ((runningSum - item.annualConsumptionValue) / totalValue) * 100;
    if (prevPct >= thresholdB) {
      abcClass = 'C';
    } else if (prevPct >= thresholdA) {
      abcClass = 'B';
    } else {
      abcClass = 'A';
    }

    const combinedClass = `${abcClass}${item.xyzClass}` as SkuItem['combinedClass'];

    paretoData.push({
      name: item.name,
      value: item.annualConsumptionValue,
      cumulativePct: Number(cumulativeValuePct.toFixed(1)),
    });

    return {
      ...item,
      abcClass,
      combinedClass,
      cumulativeValuePct: Number(cumulativeValuePct.toFixed(1)),
    };
  });

  // 3. Matrix summaries
  const cells = ['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ'];
  const matrix: Record<string, AbcXyzMatrixSummary> = {};

  const strategies: Record<string, string> = {
    AX: "High value, predictable demand. Best candidates for Just-In-Time (JIT) / vendor managed inventory with low buffer.",
    AY: "High value, moderate variability. Require careful MRP planning and moderate safety buffers.",
    AZ: "High value, unpredictable demand. Critical risk items. Require senior buyer oversight and tailored safety stocks.",
    BX: "Moderate value, stable demand. Automate replenishment orders using continuous review EOQ/ROP.",
    BY: "Moderate value, moderate volatility. Periodic review with seasonal forecasting adjustments.",
    BZ: "Moderate value, irregular demand. Consolidate orders or evaluate supplier consignment.",
    CX: "Low value, stable demand. Keep generous buffer stock (bulk purchase discounts) to minimize order admin costs.",
    CY: "Low value, erratic demand. Order in batches only when threshold triggered or two-bin system.",
    CZ: "Low value, highly erratic. Review catalog rationalization; consider order-on-demand or minimum stocking.",
  };

  cells.forEach((cell) => {
    const matching = classifiedSkus.filter((s) => s.combinedClass === cell);
    const cellValue = matching.reduce((acc, s) => acc + s.annualConsumptionValue, 0);
    matrix[cell] = {
      cell,
      count: matching.length,
      totalValue: cellValue,
      valueSharePct: totalValue > 0 ? Number(((cellValue / totalValue) * 100).toFixed(1)) : 0,
      strategyKey: strategies[cell] || "",
    };
  });

  return {
    classifiedSkus,
    totalValue,
    matrix,
    paretoData,
  };
}

export function generateAbcXyzAudit(
  totalValue: number,
  thresholdA: number,
  thresholdB: number,
  thresholdX: number,
  thresholdY: number,
  skuCount: number
): AuditData {
  return {
    toolName: "ABC / XYZ Inventory Classification",
    toolNameAr: "تصنيف المخزون المزدوج (ABC / XYZ)",
    summary: `Prioritizes inventory focus by combining Pareto monetary value (ABC) with demand volatility coefficients (XYZ).`,
    summaryAr: `ترتيب أولويات إدارة المخزون بدمج القيمة النقدية السنوية (ABC) مع استقرار وتقلب الطلب (XYZ).`,
    steps: [
      {
        title: "1. Pareto Value Sorting (ABC)",
        formula: "Annual Value = Unit Cost × Annual Demand | Sort Descending",
        substitution: `Threshold A: 0–${thresholdA}% | B: ${thresholdA}–${thresholdB}% | C: ${thresholdB}–100%`,
        result: `Total Catalog Value: ${totalValue.toLocaleString()} SAR (${skuCount} SKUs)`,
        explanation: "Class A items drive ~80% of invested capital and justify strict managerial attention.",
      },
      {
        title: "2. Coefficient of Variation (XYZ)",
        formula: "CV = Standard Deviation of Demand / Mean Demand",
        substitution: `X: CV < ${thresholdX} (Predictable) | Y: ${thresholdX} ≤ CV < ${thresholdY} (Moderate) | Z: CV ≥ ${thresholdY} (Volatile)`,
        result: `3 Volatility Tiers`,
        explanation: "Separates smooth steady consumption from lumpy, sporadic demand requiring high safety buffers.",
      },
      {
        title: "3. Combined 3×3 Portfolio Action Matrix",
        formula: "Combined Matrix: {A, B, C} × {X, Y, Z} = 9 Strategic Profiles",
        substitution: "AX, AY, AZ, BX, BY, BZ, CX, CY, CZ",
        result: "Segmented Operating Playbook",
        explanation: "Prevents treating high-risk volatile items (AZ) the same as stable commodity bolts (CX).",
      },
    ],
  };
}

