// lib/operations/eoq.ts
import { EOQInputs, EOQOutputs, AuditData } from './types';

export function computeEOQ(inputs: EOQInputs): EOQOutputs {
  const D = Math.max(1, inputs.annualDemand);
  const S = Math.max(0.01, inputs.orderSetupCost);

  // Effective H
  const effectiveH = inputs.holdingCostMode === 'percentage'
    ? Math.max(0.01, (inputs.unitCost * inputs.holdingCostPct) / 100)
    : Math.max(0.01, inputs.directHoldingCost);

  const C = Math.max(0, inputs.unitCost || 0);

  // EOQ Formula: sqrt((2 * D * S) / H)
  const eoq = Math.sqrt((2 * D * S) / effectiveH);
  const ordersPerYear = D / eoq;
  const daysBetweenOrders = 365 / ordersPerYear;

  const annualOrderingCost = ordersPerYear * S;
  const annualHoldingCost = (eoq / 2) * effectiveH;
  const annualInventoryCost = annualOrderingCost + annualHoldingCost;
  const annualPurchaseCost = D * C;
  const totalAnnualCost = annualInventoryCost + annualPurchaseCost;

  // Generate continuous cost curve points
  const curvePoints = 25;
  const minQ = Math.max(1, Math.round(eoq * 0.2));
  const maxQ = Math.round(eoq * 2.5);
  const step = Math.max(1, (maxQ - minQ) / (curvePoints - 1));

  const curveData: EOQOutputs['curveData'] = [];
  let addedOptimal = false;

  for (let i = 0; i < curvePoints; i++) {
    const q = Math.round(minQ + i * step);

    if (!addedOptimal && q >= Math.round(eoq)) {
      // Insert exact EOQ
      const optOrdering = (D / eoq) * S;
      const optHolding = (eoq / 2) * effectiveH;
      curveData.push({
        q: Math.round(eoq),
        orderingCost: Number(optOrdering.toFixed(1)),
        holdingCost: Number(optHolding.toFixed(1)),
        totalCost: Number((optOrdering + optHolding).toFixed(1)),
        isOptimal: true,
      });
      addedOptimal = true;
    }

    if (Math.abs(q - Math.round(eoq)) > step * 0.25) {
      const ord = (D / q) * S;
      const hld = (q / 2) * effectiveH;
      curveData.push({
        q,
        orderingCost: Number(ord.toFixed(1)),
        holdingCost: Number(hld.toFixed(1)),
        totalCost: Number((ord + hld).toFixed(1)),
        isOptimal: false,
      });
    }
  }

  // Sort curve data by q
  curveData.sort((a, b) => a.q - b.q);

  return {
    effectiveHoldingCost: Number(effectiveH.toFixed(2)),
    eoq: Math.round(eoq),
    ordersPerYear: Number(ordersPerYear.toFixed(2)),
    daysBetweenOrders: Number(daysBetweenOrders.toFixed(1)),
    annualOrderingCost: Number(annualOrderingCost.toFixed(2)),
    annualHoldingCost: Number(annualHoldingCost.toFixed(2)),
    annualInventoryCost: Number(annualInventoryCost.toFixed(2)),
    annualPurchaseCost: Number(annualPurchaseCost.toFixed(2)),
    totalAnnualCost: Number(totalAnnualCost.toFixed(2)),
    curveData,
  };
}

export function generateEOQAudit(inputs: EOQInputs, outputs: EOQOutputs): AuditData {
  return {
    toolName: "Economic Order Quantity (EOQ)",
    toolNameAr: "حجم الطلب الاقتصادي الأمثل (EOQ)",
    summary: `Identifies the cost-minimizing order batch size where ordering costs exactly counterbalance inventory holding costs.`,
    summaryAr: `يحدد حجم الشحنة المثالي الذي يقلل التكلفة الإجمالية للمخزون إلى أدنى حد بتساوي تكلفة الطلب مع تكلفة الاحتفاظ.`,
    steps: [
      {
        title: "1. Effective Annual Holding Cost (H)",
        formula: inputs.holdingCostMode === 'percentage'
          ? "H = Unit Cost (C) × Holding Cost %"
          : "H = Direct Holding Cost per unit per year",
        substitution: inputs.holdingCostMode === 'percentage'
          ? `${inputs.unitCost} × ${inputs.holdingCostPct}%`
          : `${inputs.directHoldingCost}`,
        result: `${outputs.effectiveHoldingCost} SAR/unit/year`,
        explanation: "Carrying cost per unit including warehousing, insurance, obsolescence, and capital interest.",
      },
      {
        title: "2. Optimal Order Quantity (EOQ)",
        formula: "EOQ = √((2 × D × S) / H)",
        substitution: `√((2 × ${inputs.annualDemand} × ${inputs.orderSetupCost}) / ${outputs.effectiveHoldingCost})`,
        result: `${outputs.eoq} units`,
        explanation: "The exact lot size that minimizes total inventory management costs.",
      },
      {
        title: "3. Annual Order Cadence",
        formula: "Orders / Year = D / EOQ | Cycle Days = 365 / (Orders/Year)",
        substitution: `${inputs.annualDemand} / ${outputs.eoq} = ${outputs.ordersPerYear} orders | 365 / ${outputs.ordersPerYear}`,
        result: `${outputs.ordersPerYear} orders/yr (every ${outputs.daysBetweenOrders} days)`,
        explanation: "Purchasing frequency and replenishment cycle duration.",
      },
      {
        title: "4. Total Annual Inventory Cost Reconciliation",
        formula: "Total = Ordering Cost ((D/Q)×S) + Holding Cost ((Q/2)×H)",
        substitution: `${outputs.annualOrderingCost.toLocaleString()} + ${outputs.annualHoldingCost.toLocaleString()}`,
        result: `${outputs.annualInventoryCost.toLocaleString()} SAR/yr`,
        explanation: "At the exact EOQ, ordering cost and holding cost are virtually identical (economic equilibrium).",
      },
    ],
  };
}

