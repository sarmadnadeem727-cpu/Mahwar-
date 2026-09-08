// lib/operations/sopWorksheet.ts
import { SopPeriodRow, AuditData } from './types';

export function computeSopWorksheet(
  initialBeginningInventory: number,
  periodPlans: {
    period: number;
    label: string;
    plannedSupply: number;
    demand: number;
    targetSafetyStock: number;
  }[]
): {
  rows: SopPeriodRow[];
  summary: {
    stockoutCount: number;
    belowSafetyCount: number;
    healthyCount: number;
    minEndingInventory: number;
    maxEndingInventory: number;
    averageEndingInventory: number;
  };
} {
  const rows: SopPeriodRow[] = [];
  let currentBeginning = initialBeginningInventory;

  let stockoutCount = 0;
  let belowSafetyCount = 0;
  let healthyCount = 0;
  let minEnding = Infinity;
  let maxEnding = -Infinity;
  let totalEnding = 0;

  periodPlans.forEach((plan) => {
    const endingInventory = currentBeginning + plan.plannedSupply - plan.demand;
    const inventoryPositionVsTarget = endingInventory - plan.targetSafetyStock;

    let status: SopPeriodRow['status'] = 'HEALTHY';
    if (endingInventory < 0) {
      status = 'STOCKOUT';
      stockoutCount++;
    } else if (endingInventory < plan.targetSafetyStock) {
      status = 'BELOW_SAFETY_STOCK';
      belowSafetyCount++;
    } else {
      healthyCount++;
    }

    if (endingInventory < minEnding) minEnding = endingInventory;
    if (endingInventory > maxEnding) maxEnding = endingInventory;
    totalEnding += endingInventory;

    rows.push({
      period: plan.period,
      label: plan.label,
      beginningInventory: currentBeginning,
      plannedSupply: plan.plannedSupply,
      demand: plan.demand,
      endingInventory,
      targetSafetyStock: plan.targetSafetyStock,
      inventoryPositionVsTarget,
      status,
    });

    // Carry forward to next period
    currentBeginning = endingInventory;
  });

  return {
    rows,
    summary: {
      stockoutCount,
      belowSafetyCount,
      healthyCount,
      minEndingInventory: rows.length > 0 ? minEnding : 0,
      maxEndingInventory: rows.length > 0 ? maxEnding : 0,
      averageEndingInventory: rows.length > 0 ? Math.round(totalEnding / rows.length) : 0,
    },
  };
}

export function generateSopAudit(rows: SopPeriodRow[]): AuditData {
  return {
    toolName: "S&OP Supply / Demand Balancing Worksheet",
    toolNameAr: "جدول موازنة العرض والطلب (S&OP)",
    summary: "Reconciles periodic production supply schedules against demand forecasts to reveal stockout bottlenecks and safety stock compliance.",
    summaryAr: "موازنة خطط الإنتاج والتوريد الدورية مع توقعات الطلب لاكتشاف العجز ونقاط الخلل في مخزون الأمان.",
    steps: [
      {
        title: "1. Rolling Inventory Balance Equation",
        formula: "Ending Inventory_t = Beginning Inventory_t + Planned Supply_t - Demand_t",
        substitution: "Beginning Inventory_(t+1) = Ending Inventory_t",
        result: `${rows.length} Periods Balanced`,
        explanation: "Maintains uninterrupted material conservation across rolling planning buckets.",
      },
      {
        title: "2. Inventory Position vs Safety Buffer",
        formula: "Position Delta = Ending Inventory_t - Target Safety Stock_t",
        substitution: "Delta >= 0: Compliant | Delta < 0: Warning",
        result: "Buffer Adherence Check",
        explanation: "Quantifies how close each period gets to breaching service level commitments.",
      },
      {
        title: "3. Health Classification Hierarchy",
        formula: "Ending < 0 -> STOCKOUT (Red) | 0 <= Ending < Target -> BELOW SAFETY (Amber) | Ending >= Target -> HEALTHY",
        substitution: "Dynamic 3-Tier Status Matrix",
        result: "Operational Verdict",
        explanation: "Directly directs procurement and production capacity adjustments to at-risk periods.",
      },
    ],
  };
}
