// lib/operations/tco.ts
import { TcoOption, TcoCalculation, AuditData } from './types';

export function computeTco(option: TcoOption): TcoCalculation {
  const r = Math.max(0, option.discountRatePct) / 100;
  const n = Math.max(1, Math.round(option.usefulLifeYears));

  let pvAnnualOperating = 0;
  let pvAnnualMaintenance = 0;
  const annualCashFlows: TcoCalculation['annualCashFlows'] = [];

  for (let t = 1; t <= n; t++) {
    const discountFactor = Math.pow(1 + r, t);
    const pvOp = option.annualOperatingCost / discountFactor;
    const pvMaint = option.annualMaintenanceCost / discountFactor;

    pvAnnualOperating += pvOp;
    pvAnnualMaintenance += pvMaint;

    annualCashFlows.push({
      year: t,
      operating: option.annualOperatingCost,
      maintenance: option.annualMaintenanceCost,
      totalCashCost: option.annualOperatingCost + option.annualMaintenanceCost,
      pvCost: Number((pvOp + pvMaint).toFixed(2)),
    });
  }

  const pvAnnualTotal = pvAnnualOperating + pvAnnualMaintenance;
  const pvSalvage = option.salvageValue / Math.pow(1 + r, n);

  const netTcoPv = option.purchasePrice + option.installationCost + pvAnnualTotal - pvSalvage;
  const undiscountedTotal = option.purchasePrice + option.installationCost + (option.annualOperatingCost + option.annualMaintenanceCost) * n - option.salvageValue;

  return {
    pvAnnualOperating: Number(pvAnnualOperating.toFixed(2)),
    pvAnnualMaintenance: Number(pvAnnualMaintenance.toFixed(2)),
    pvAnnualTotal: Number(pvAnnualTotal.toFixed(2)),
    pvSalvage: Number(pvSalvage.toFixed(2)),
    netTcoPv: Number(netTcoPv.toFixed(2)),
    undiscountedTotal: Number(undiscountedTotal.toFixed(2)),
    annualCashFlows,
  };
}

export function generateTcoAudit(option: TcoOption, calc: TcoCalculation): AuditData {
  return {
    toolName: "Total Cost of Ownership (TCO) Calculator",
    toolNameAr: "حاسبة التكلفة الإجمالية للملكية (TCO)",
    summary: `Compares capital investments on a discounted lifecycle basis over ${option.usefulLifeYears} years at ${option.discountRatePct}% discount rate.`,
    summaryAr: `مقارنة قرارات الشراء الرأسمالي على أساس القيمة الحالية لدورة الحياة الكاملة على مدى ${option.usefulLifeYears} سنوات بمعدل خصم ${option.discountRatePct}%.`,
    steps: [
      {
        title: "1. Present Value of Annual Recurring Operating & Maintenance",
        formula: "PV = Σ [ (Operating_t + Maintenance_t) / (1 + r)^t ] for t = 1..N",
        substitution: `Σ [ (${option.annualOperatingCost} + ${option.annualMaintenanceCost}) / (1 + ${(option.discountRatePct / 100).toFixed(3)})^t ]`,
        result: `${calc.pvAnnualTotal.toLocaleString()} SAR (Op: ${calc.pvAnnualOperating.toLocaleString()} + Maint: ${calc.pvAnnualMaintenance.toLocaleString()})`,
        explanation: "Discounts future consumable, electricity, and servicing costs to today's money.",
      },
      {
        title: "2. Present Value of Residual Salvage Recovery",
        formula: "PV_salvage = Salvage Value / (1 + r)^UsefulLife",
        substitution: `${option.salvageValue.toLocaleString()} / (1 + ${(option.discountRatePct / 100).toFixed(3)})^${option.usefulLifeYears}`,
        result: `-${calc.pvSalvage.toLocaleString()} SAR`,
        explanation: "Terminal recoverable salvage or scrap value credited against lifecycle expenses.",
      },
      {
        title: "3. Net Present Value TCO",
        formula: "TCO (PV) = Purchase Price + Installation Cost + PV(Recurring Costs) - PV(Salvage)",
        substitution: `${option.purchasePrice.toLocaleString()} + ${option.installationCost.toLocaleString()} + ${calc.pvAnnualTotal.toLocaleString()} - ${calc.pvSalvage.toLocaleString()}`,
        result: `${calc.netTcoPv.toLocaleString()} SAR (Net TCO PV)`,
        explanation: "Definitive total lifecycle burden for procurement and CapEx decisions.",
      },
    ],
  };
}

