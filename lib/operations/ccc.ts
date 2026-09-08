// lib/operations/ccc.ts
import { CCCPeriodInput, CCCOutput, AuditData } from './types';

export function computePeriodCCC(input: CCCPeriodInput): CCCOutput {
  const cogs = Math.max(0.0001, input.cogs);
  const revenue = Math.max(0.0001, input.revenue);
  const days = Math.max(1, input.daysInPeriod);

  const avgInv = input.useBeginningEnding
    ? ((input.beginningInventory ?? 0) + (input.endingInventory ?? 0)) / 2
    : input.averageInventory;

  const avgAR = input.useBeginningEnding
    ? ((input.beginningAR ?? 0) + (input.endingAR ?? 0)) / 2
    : input.averageAR;

  const avgAP = input.useBeginningEnding
    ? ((input.beginningAP ?? 0) + (input.endingAP ?? 0)) / 2
    : input.averageAP;

  const dio = (avgInv / cogs) * days;
  const dso = (avgAR / revenue) * days;
  const dpo = (avgAP / cogs) * days;
  const ccc = dio + dso - dpo;

  return {
    dio: Number(dio.toFixed(2)),
    dso: Number(dso.toFixed(2)),
    dpo: Number(dpo.toFixed(2)),
    ccc: Number(ccc.toFixed(2)),
    periodLabel: input.periodLabel,
  };
}

export function generateCCCAudit(input: CCCPeriodInput, output: CCCOutput): AuditData {
  const avgInv = input.useBeginningEnding
    ? `(${input.beginningInventory ?? 0} + ${input.endingInventory ?? 0}) / 2 = ${((input.beginningInventory ?? 0) + (input.endingInventory ?? 0)) / 2}`
    : `${input.averageInventory}`;

  const avgAR = input.useBeginningEnding
    ? `(${input.beginningAR ?? 0} + ${input.endingAR ?? 0}) / 2 = ${((input.beginningAR ?? 0) + (input.endingAR ?? 0)) / 2}`
    : `${input.averageAR}`;

  const avgAP = input.useBeginningEnding
    ? `(${input.beginningAP ?? 0} + ${input.endingAP ?? 0}) / 2 = ${((input.beginningAP ?? 0) + (input.endingAP ?? 0)) / 2}`
    : `${input.averageAP}`;

  return {
    toolName: "Cash Conversion Cycle (CCC)",
    toolNameAr: "دورة التحويل النقدي (CCC)",
    summary: `CCC measures net cash flow delay from raw material payment to collection. Current CCC is ${output.ccc} days.`,
    summaryAr: `تقيس دورة التحويل النقدي الفترة الزمنية لتجميد النقد بين شراء المخزون وتحصيل مستحقات المبيعات. تبلغ الدورة الحالية ${output.ccc} يوماً.`,
    steps: [
      {
        title: "1. Days Inventory Outstanding (DIO)",
        formula: "DIO = (Average Inventory / COGS) × Days in Period",
        substitution: `(${avgInv} / ${input.cogs}) × ${input.daysInPeriod}`,
        result: `${output.dio} days`,
        explanation: "How many days it takes to turn inventory into completed sales.",
      },
      {
        title: "2. Days Sales Outstanding (DSO)",
        formula: "DSO = (Average Accounts Receivable / Revenue) × Days in Period",
        substitution: `(${avgAR} / ${input.revenue}) × ${input.daysInPeriod}`,
        result: `${output.dso} days`,
        explanation: "Average time required to collect cash from credit customers.",
      },
      {
        title: "3. Days Payable Outstanding (DPO)",
        formula: "DPO = (Average Accounts Payable / COGS) × Days in Period",
        substitution: `(${avgAP} / ${input.cogs}) × ${input.daysInPeriod}`,
        result: `${output.dpo} days`,
        explanation: "Average duration company takes to pay back trade suppliers.",
      },
      {
        title: "4. Net Cash Conversion Cycle (CCC)",
        formula: "CCC = DIO + DSO - DPO",
        substitution: `${output.dio} + ${output.dso} - ${output.dpo}`,
        result: `${output.ccc} days`,
        explanation: output.ccc < 30
          ? "Highly lean working capital cycle. Low external financing burden."
          : "Capital tied up in operating cycle; opportunities to accelerate collections or optimize buffer inventory.",
      },
    ],
  };
}
