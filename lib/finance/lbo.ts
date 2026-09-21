// lib/finance/lbo.ts

import { computeIrr } from "./irr";
import { InsufficientDataError } from "./dcf";


export interface DebtTranche {
  name: string;
  type: "SENIOR" | "MEZZ" | "PIK" | "RCF";
  openingBalance: number;
  commitment: number;
  spreadBps: number;
  benchmarkRate: number; // e.g. SAIBOR
  amortPctPa: number;
  cashSweepPct: number;
  seniority: number;
}

export interface LboYearInput {
  yearIndex: number;
  year: number;
  revenue: number;
  ebitdaMargin: number;
  capex: number;
  deltaNwc: number;
  taxesZakat: number; // Zakat + income tax paid as cash outflow
}

function runYear(tranches: DebtTranche[], minCash: number, cashOpen: number, inp: LboYearInput) {
  const ebitda = (inp.revenue || 0) * (inp.ebitdaMargin || 0);
  const sorted = [...tranches].sort((a, b) => a.seniority - b.seniority);

  const withSvc = sorted.map(t => ({
    ...t,
    rate: t.benchmarkRate + t.spreadBps / 10000,
    interest: t.openingBalance * (t.benchmarkRate + t.spreadBps / 10000),
    mandAmort: t.type === "PIK" || t.type === "RCF" ? 0 : t.commitment * t.amortPctPa,
  }));

  const totI = withSvc.reduce((s, t) => s + (t.interest || 0), 0);
  const totA = withSvc.reduce((s, t) => s + (t.mandAmort || 0), 0);
  const cfads = ebitda - (inp.capex || 0) - (inp.deltaNwc || 0) - (inp.taxesZakat || 0) - totI - totA;

  let sw = Math.max(0, cashOpen + cfads - minCash);
  const swept = withSvc.map(t => {
    if (t.type === "PIK" || t.type === "RCF") return { ...t, sweep: 0 };
    const s = Math.min(sw * t.cashSweepPct, Math.max(0, t.openingBalance - t.mandAmort));
    sw = Math.max(0, sw - s);
    return { ...t, sweep: s };
  });

  const closed = swept.map(t => ({
    ...t,
    closing:
      t.type === "PIK"
        ? t.openingBalance + t.interest
        : Math.max(0, t.openingBalance - t.mandAmort - (t.sweep ?? 0)),
  }));

  const totalSweep = swept.reduce((s, t) => s + (t.sweep ?? 0), 0);
  const cashClose = cashOpen + cfads - totalSweep;
  const debtOpen = tranches.reduce((s, t) => s + t.openingBalance, 0);
  const debtClose = closed.reduce((s, t) => s + t.closing, 0);

  return {
    ebitda,
    cfads,
    totI,
    totA,
    totalSweep,
    cashOpen,
    cashClose,
    debtOpen,
    debtClose,
    updatedTranches: closed.map(t => ({ ...t, openingBalance: t.closing })),
    trancheDetails: closed.map(t => ({
      name: t.name,
      type: t.type,
      opening: t.openingBalance,
      rate: t.rate,
      interest: t.interest,
      mandAmort: t.mandAmort,
      sweep: t.sweep ?? 0,
      closing: t.closing,
    })),
  };
}

export function runLbo(
  initialTranches: DebtTranche[],
  yearInputs: LboYearInput[],
  entryEv: number,
  entryEbitda: number,
  transactionFees: number,
  exitYear: number,
  exitMultiple: number,
  minCash = 0,
  openingCash = 0
) {
  if (!yearInputs || yearInputs.length === 0) {
    throw new InsufficientDataError("No projected years provided for LBO model.");
  }
  const totalDebt = initialTranches.reduce((s, t) => s + (t.openingBalance || 0), 0);
  const equityCheck = (entryEv || 0) + (transactionFees || 0) - totalDebt;
  let tranches = initialTranches;
  let cash = openingCash;
  interface YearResult {
    yearIndex: number;
    year: number;
    ebitda: number;
    cfads: number;
    totI: number;
    totA: number;
    totalSweep: number;
    cashOpen: number;
    cashClose: number;
    debtOpen: number;
    debtClose: number;
    updatedTranches: DebtTranche[];
    trancheDetails: {
      name: string;
      type: string;
      opening: number;
      rate: number;
      interest: number;
      mandAmort: number;
      sweep: number;
      closing: number;
    }[];
    isExit: boolean;
    exitEv: number;
    exitEquity: number;
  }
  const years: YearResult[] = [];
  const cfs = [-equityCheck];

  for (const inp of yearInputs) {
    const yr = runYear(tranches, minCash, cash, inp);
    tranches = yr.updatedTranches;
    cash = yr.cashClose;
    const isExit = inp.yearIndex === exitYear;
    const exitEv = isExit ? yr.ebitda * exitMultiple : 0;
    const exitEq = isExit ? exitEv - yr.debtClose : 0;
    cfs.push(isExit ? exitEq : 0);
    years.push({
      yearIndex: inp.yearIndex,
      year: inp.year,
      ...yr,
      isExit,
      exitEv,
      exitEquity: exitEq,
    });
  }

  const exitYr = years.find(y => y.isExit);
  if (!exitYr) {
    throw new InsufficientDataError("Exit year not found within projected years.");
  }
  const { irr, warning } = computeIrr(cfs);
  const moic = equityCheck > 0 ? exitYr.exitEquity / equityCheck : 0;

  const eyRange = [3, 4, 5, 6, 7].filter(ey => ey <= yearInputs.length);
  const emRange = [6, 7, 8, 9, 10, 11, 12];
  const sensitivity = eyRange.map(ey => {
    const eyYr = years[ey - 1];
    return {
      exitYear: ey,
      exitMultipleRange: emRange,
      irrs: emRange.map(em => {
        const { irr: r } = computeIrr([
          -equityCheck,
          ...Array(ey - 1).fill(0),
          eyYr.ebitda * em - eyYr.debtClose,
        ]);
        return r != null ? parseFloat((r * 100).toFixed(2)) : NaN;
      }),
      moics: emRange.map(em =>
        parseFloat(((eyYr.ebitda * em - eyYr.debtClose) / equityCheck).toFixed(2))
      ),
    };
  });

  return {
    sourcesUses: {
      entryEv: entryEv || 0,
      transactionFees: transactionFees || 0,
      totalUses: (entryEv || 0) + (transactionFees || 0),
      totalDebt,
      equityCheck,
      entryLeverage: entryEbitda > 0 ? totalDebt / entryEbitda : 0,
      entryEquityPct: ((entryEv || 0) + (transactionFees || 0)) > 0 ? (equityCheck / ((entryEv || 0) + (transactionFees || 0))) * 100 : 0,
    },
    years,
    cashFlows: cfs,
    irr: irr != null ? parseFloat((irr * 100).toFixed(2)) : null,
    irrWarning: warning,
    moic: parseFloat(moic.toFixed(2)),
    exitYear,
    exitEv: exitYr.exitEv,
    exitDebt: exitYr.debtClose,
    exitEquity: exitYr.exitEquity,
    returnsSensitivity: sensitivity,
    exitMultipleRange: emRange,
  };
}

