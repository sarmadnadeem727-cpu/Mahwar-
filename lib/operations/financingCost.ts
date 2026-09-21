// lib/operations/financingCost.ts
import { WCFinancingInputs, WCFinancingOutputs, AuditData } from './types';

export function computeWCFinancing(inputs: WCFinancingInputs): WCFinancingOutputs {
  const rate = Math.max(0, inputs.costOfCapitalRate) / 100;
  const nwc = inputs.inventory + inputs.accountsReceivable - inputs.accountsPayable;
  const annualFinancingCostOperating = Math.max(0, nwc) * rate;

  const cogs = Math.max(0, inputs.cogs);
  const dailyCogs = cogs / 365;

  const ccc = inputs.linkedCCC ?? 0;
  const cashTiedUpCCC = Math.max(0, ccc * dailyCogs);
  const annualFinancingCostCCC = cashTiedUpCCC * rate;

  const savingsPerDayReduction = dailyCogs * rate;
  const totalSensitivitySavings = savingsPerDayReduction * (inputs.sensitivityReductionDays || 0);

  return {
    netWorkingCapital: Number(nwc.toFixed(2)),
    annualFinancingCostOperating: Number(annualFinancingCostOperating.toFixed(2)),
    dailyCogs: Number(dailyCogs.toFixed(2)),
    cashTiedUpCCC: Number(cashTiedUpCCC.toFixed(2)),
    annualFinancingCostCCC: Number(annualFinancingCostCCC.toFixed(2)),
    savingsPerDayReduction: Number(savingsPerDayReduction.toFixed(2)),
    totalSensitivitySavings: Number(totalSensitivitySavings.toFixed(2)),
  };
}

export function generateWCFinancingAudit(inputs: WCFinancingInputs, outputs: WCFinancingOutputs): AuditData {
  return {
    toolName: "Working Capital Financing Cost",
    toolNameAr: "تكلفة تمويل رأس المال العامل",
    summary: `Quantifies the carrying cost of operating liquidity locked in inventory and receivables at ${inputs.costOfCapitalRate}% cost of capital.`,
    summaryAr: `حساب التكلفة المالية السنوية لرأس المال المجمد في المخزون والذمم المدينة بمعدل فائدة/تكلفة رأس مال ${inputs.costOfCapitalRate}%.`,
    steps: [
      {
        title: "1. Net Operating Working Capital (NOWC)",
        formula: "NOWC = Inventory + Accounts Receivable - Accounts Payable",
        substitution: `${inputs.inventory} + ${inputs.accountsReceivable} - ${inputs.accountsPayable}`,
        result: `${outputs.netWorkingCapital.toLocaleString()} SAR`,
        explanation: "Operating liquidity locked before vendor credit offset.",
      },
      {
        title: "2. Balance Sheet Carrying Cost",
        formula: "Annual Cost = NOWC × Cost of Capital Rate (%)",
        substitution: `${outputs.netWorkingCapital.toLocaleString()} × ${(inputs.costOfCapitalRate / 100).toFixed(4)}`,
        result: `${outputs.annualFinancingCostOperating.toLocaleString()} SAR/yr`,
        explanation: "Dollar cost of financing tied up net working capital annually.",
      },
      {
        title: "3. CCC-Linked Daily Carrying Rate",
        formula: "Daily COGS = Annual COGS / 365 | Cash Tied Up = CCC × Daily COGS",
        substitution: `${inputs.cogs} / 365 = ${outputs.dailyCogs} | ${(inputs.linkedCCC ?? 0)} × ${outputs.dailyCogs}`,
        result: `${outputs.cashTiedUpCCC.toLocaleString()} SAR tied up`,
        explanation: "Operating cash cycle converted to monetary capital equivalence.",
      },
      {
        title: "4. CCC Reduction Sensitivity",
        formula: "Savings per Day Reduced = Daily COGS × Cost of Capital Rate",
        substitution: `${outputs.dailyCogs} × ${(inputs.costOfCapitalRate / 100).toFixed(4)}`,
        result: `${outputs.savingsPerDayReduction.toLocaleString()} SAR / day saved`,
        explanation: `Reducing CCC by ${inputs.sensitivityReductionDays} days saves ${outputs.totalSensitivitySavings.toLocaleString()} SAR annually in interest.`,
      },
    ],
  };
}

