// lib/operations/landedCost.ts
import { SourcingScenario, LandedCostCalculation, AuditData } from './types';

import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

export function computeLandedCost(scenario: SourcingScenario): LandedCostCalculation {
  const units = Math.max(1, scenario.units);
  const productCostTotal = units * scenario.unitCostFob;
  const freightTotal = scenario.freightCostTotal;
  const insuranceTotal = scenario.insuranceCostTotal;

  // Customs value base: Product + Freight (+ Insurance if toggled)
  const customsValue = productCostTotal + freightTotal + (scenario.includeInsuranceInCustomsValue ? insuranceTotal : 0);
  const customsDutyTotal = (customsValue * Math.max(0, scenario.dutyRatePct)) / 100;

  const otherFeesTotal = (scenario.fees || []).reduce((acc, f) => acc + (f.amount || 0), 0);

  const totalLandedCost = productCostTotal + freightTotal + insuranceTotal + customsDutyTotal + otherFeesTotal;
  const landedCostPerUnit = totalLandedCost / units;
  const effectiveMarkupPct = productCostTotal > 0 ? ((totalLandedCost - productCostTotal) / productCostTotal) * 100 : 0;

  const breakdown = [
    { name: "FOB Product Cost", amount: Number(productCostTotal.toFixed(2)), pct: (productCostTotal / totalLandedCost) * 100, color: T.colors.emeraldDeep },
    { name: "Freight Cost", amount: Number(freightTotal.toFixed(2)), pct: (freightTotal / totalLandedCost) * 100, color: T.series[2] },
    { name: "Cargo Insurance", amount: Number(insuranceTotal.toFixed(2)), pct: (insuranceTotal / totalLandedCost) * 100, color: T.series[3] },
    { name: "Customs Duty", amount: Number(customsDutyTotal.toFixed(2)), pct: (customsDutyTotal / totalLandedCost) * 100, color: T.series[1] },
    { name: "Port & Clearance Fees", amount: Number(otherFeesTotal.toFixed(2)), pct: (otherFeesTotal / totalLandedCost) * 100, color: T.series[4] },
  ];

  return {
    productCostTotal: Number(productCostTotal.toFixed(2)),
    customsValue: Number(customsValue.toFixed(2)),
    customsDutyTotal: Number(customsDutyTotal.toFixed(2)),
    otherFeesTotal: Number(otherFeesTotal.toFixed(2)),
    totalLandedCost: Number(totalLandedCost.toFixed(2)),
    landedCostPerUnit: Number(landedCostPerUnit.toFixed(2)),
    effectiveMarkupPct: Number(effectiveMarkupPct.toFixed(1)),
    breakdown,
  };
}

export function generateLandedCostAudit(scenario: SourcingScenario, calc: LandedCostCalculation): AuditData {
  return {
    toolName: "Landed Cost Calculator (GCC Import)",
    toolNameAr: "حاسبة التكلفة الإجمالية الواصلة (Landed Cost)",
    summary: `Computes the true per-unit cost delivered to GCC destination, including FOB price, sea/air freight, insurance, customs tariff, and port handling fees.`,
    summaryAr: `حساب التكلفة الفعلية للقطعة المستوردة الواصلة إلى موانئ ومستودعات الخليج متضمنة الشحن والتأمين والرسوم الجمركية والخدمات اللوجستية.`,
    steps: [
      {
        title: "1. Customs Assessment Base",
        formula: scenario.includeInsuranceInCustomsValue
          ? "Customs Value = FOB Product Cost + International Freight + Insurance"
          : "Customs Value = FOB Product Cost + International Freight",
        substitution: `${calc.productCostTotal.toLocaleString()} + ${scenario.freightCostTotal.toLocaleString()}${scenario.includeInsuranceInCustomsValue ? ` + ${scenario.insuranceCostTotal.toLocaleString()}` : ""}`,
        result: `${calc.customsValue.toLocaleString()} SAR`,
        explanation: "Declared CIF or CFR value assessed by GCC customs authorities.",
      },
      {
        title: "2. Customs Tariff Duty",
        formula: "Customs Duty = Customs Assessment Value × Tariff Duty Rate (%)",
        substitution: `${calc.customsValue.toLocaleString()} × ${scenario.dutyRatePct}%`,
        result: `${calc.customsDutyTotal.toLocaleString()} SAR`,
        explanation: "Unified GCC tariff (commonly 5% standard or higher for protected local manufacturing).",
      },
      {
        title: "3. Total Landed Cost Stack",
        formula: "Total = Product + Freight + Insurance + Duty + Itemized Brokerage Fees",
        substitution: `${calc.productCostTotal.toLocaleString()} + ${scenario.freightCostTotal.toLocaleString()} + ${scenario.insuranceCostTotal.toLocaleString()} + ${calc.customsDutyTotal.toLocaleString()} + ${calc.otherFeesTotal.toLocaleString()}`,
        result: `${calc.totalLandedCost.toLocaleString()} SAR shipment total`,
        explanation: "Total gross cash outlay required to receive shipment into inventory.",
      },
      {
        title: "4. Delivered Landed Cost per Unit",
        formula: "Unit Landed Cost = Total Landed Cost / Shipment Units",
        substitution: `${calc.totalLandedCost.toLocaleString()} / ${scenario.units}`,
        result: `${calc.landedCostPerUnit} SAR/unit (+${calc.effectiveMarkupPct}% over FOB)`,
        explanation: "The true unit baseline cost to use for inventory valuation and gross margin pricing.",
      },
    ],
  };
}

