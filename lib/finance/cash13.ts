// 13-week direct cash-flow forecast with revolver logic and liquidity runway.
export interface CashWeek { week: number; receipts: number; payroll: number; suppliers: number; opex: number; capex: number; debtService: number; other: number }
export interface Cash13Inputs { openingCash: number; minimumCash: number; revolverLimit: number; revolverRatePct: number; weeks: CashWeek[] }
export interface CashWeekOut extends CashWeek {
  totalOut: number; netFlow: number; cashBeforeRevolver: number; draw: number; repay: number; revolverBalance: number; endingCash: number; interest: number; breach: boolean;
}
export interface Cash13Outputs { rows: CashWeekOut[]; minCash: number; minCashWeek: number; peakRevolver: number; totalReceipts: number; totalDisbursements: number; netChange: number; runwayWeeks: number | null; totalInterest: number; unfundedGap: number }

export function computeCash13(i: Cash13Inputs): Cash13Outputs {
  let cash = i.openingCash, revolver = 0, minCash = Infinity, minWeek = 1, peak = 0, totIn = 0, totOut = 0, totInt = 0, gap = 0;
  const weeklyRate = i.revolverRatePct / 100 / 52;
  const rows: CashWeekOut[] = i.weeks.map((w) => {
    const interest = revolver * weeklyRate;
    const totalOut = w.payroll + w.suppliers + w.opex + w.capex + w.debtService + w.other + interest;
    const netFlow = w.receipts - totalOut;
    const before = cash + netFlow;
    let draw = 0, repay = 0;
    if (before < i.minimumCash) {
      draw = Math.min(i.minimumCash - before, Math.max(0, i.revolverLimit - revolver));
    } else if (revolver > 0) {
      repay = Math.min(revolver, before - i.minimumCash);
    }
    revolver = revolver + draw - repay;
    const ending = before + draw - repay;
    const breach = ending < i.minimumCash - 1e-6;
    if (breach) gap = Math.max(gap, i.minimumCash - ending);
    cash = ending;
    if (ending < minCash) { minCash = ending; minWeek = w.week; }
    peak = Math.max(peak, revolver);
    totIn += w.receipts; totOut += totalOut; totInt += interest;
    return { ...w, totalOut, netFlow, cashBeforeRevolver: before, draw, repay, revolverBalance: revolver, endingCash: ending, interest, breach };
  });
  const avgBurn = rows.length ? rows.reduce((a, r) => a + r.netFlow, 0) / rows.length : 0;
  const runwayWeeks = avgBurn < 0 ? (i.openingCash + i.revolverLimit) / -avgBurn : null;
  return { rows, minCash: rows.length ? minCash : i.openingCash, minCashWeek: minWeek, peakRevolver: peak, totalReceipts: totIn, totalDisbursements: totOut, netChange: cash - i.openingCash, runwayWeeks, totalInterest: totInt, unfundedGap: gap };
}

/** Seed a 13-week plan from a handful of drivers so the analyst edits numbers instead of typing 91 cells. */
export function seedWeeks(d: { weeklySales: number; collectionLagWeeks: number; grossMarginPct: number; weeklyPayroll: number; weeklyOpex: number; capexWeek: number; capexAmount: number; debtServiceWeek: number; debtServiceAmount: number; seasonalityPct: number }): CashWeek[] {
  return Array.from({ length: 13 }, (_, k) => {
    const week = k + 1;
    const season = 1 + (d.seasonalityPct / 100) * Math.sin((week / 13) * Math.PI * 2);
    const sales = d.weeklySales * season;
    const lagged = d.weeklySales * (1 + (d.seasonalityPct / 100) * Math.sin(((week - d.collectionLagWeeks) / 13) * Math.PI * 2));
    return {
      week,
      receipts: Math.round(lagged),
      payroll: week % 2 === 0 ? Math.round(d.weeklyPayroll * 2) : 0,
      suppliers: Math.round(sales * (1 - d.grossMarginPct / 100)),
      opex: Math.round(d.weeklyOpex),
      capex: week === d.capexWeek ? d.capexAmount : 0,
      debtService: week === d.debtServiceWeek ? d.debtServiceAmount : 0,
      other: 0,
    };
  });
}
