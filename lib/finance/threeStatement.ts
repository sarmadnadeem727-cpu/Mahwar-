// lib/finance/threeStatement.ts
import { InsufficientDataError } from "./dcf";

/**
 * KSA Statutory Reserve: 10% of NI until reserve = 30% of share capital
 */
export function statutoryReserveTransfer(opening: number, netIncome: number, shareCapital: number) {
  const max = shareCapital * 0.3;
  const room = Math.max(0, max - opening);
  const required = netIncome > 0 ? netIncome * 0.1 : 0;
  const actual = Math.min(required, room);
  return { opening, netIncome, shareCapital, max, required, actual, closing: opening + actual };
}

/**
 * EOSB Movement (IAS 19): service cost + interest cost + actuarial GL - benefits paid
 */
export function eosbMovement(
  open: number,
  service: number,
  interest: number,
  actuarial: number,
  paid: number
) {
  return {
    opening: open,
    serviceCost: service,
    interestCost: interest,
    actuarialGL: actuarial,
    benefitsPaid: paid,
    closing: open + service + interest + actuarial - paid,
  };
}

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  ebitda?: number;
  da?: number;
  interestIncome?: number;
  interestExpense?: number;
  zakatExpense?: number;
  incomeTaxExpense?: number;
  minorityInterestPl?: number;
}

export interface BalanceSheet {
  cash: number;
  accountsReceivable?: number;
  inventory?: number;
  totalCurrentAssets?: number;
  otherCurrentAssets?: number;
  ppeNet?: number;
  rouAssets?: number;
  intangibles?: number;
  ltInvestments?: number;
  accountsPayable?: number;
  shortTermDebt?: number;
  currentLease?: number;
  zakatPayable?: number;
  accruedLiabilities?: number;
  longTermDebt?: number;
  sukuk?: number;
  ltLeaseliabilities?: number;
  eosbLiability?: number;
  shareCapital?: number;
  statutoryReserve?: number;
  retainedEarnings?: number;
  oci?: number;
  minorityInterestBs?: number;
}

export interface CashFlow {
  netIncomeCf?: number;
  daAddback?: number;
  eosbAddback?: number;
  workingCapitalChange?: number;
  otherOperatingAdj?: number;
  zakatPaid?: number;
  taxPaid?: number;
  capex?: number;
  acquisitions?: number;
  disposals?: number;
  debtIssuance?: number;
  debtRepayment?: number;
  sukukIssuance?: number;
  sukukRepayment?: number;
  leasePrincipalPaid?: number;
  dividendsPaid?: number;
  equityIssuance?: number;
  shareBuybacks?: number;
  openingCash?: number;
  changeInCash?: number;
}

export function validateThreeStatement(is: IncomeStatement, bs: BalanceSheet, cf: CashFlow, prevBs?: BalanceSheet) {
  if (!is || !bs || !cf) {
    throw new InsufficientDataError("Missing Income Statement, Balance Sheet, or Cash Flow for validation.");
  }
  const errors: string[] = [],
    warnings: string[] = [];

  // IS derivations
  const gp = is.revenue - is.cogs;
  const ebit = (is.ebitda ?? 0) - (is.da ?? 0);
  const ni =
    ebit +
    (is.interestIncome || 0) -
    (is.interestExpense || 0) -
    (is.zakatExpense || 0) -
    (is.incomeTaxExpense || 0) -
    (is.minorityInterestPl || 0);

  // CF derivations (indirect method)
  const ocf =
    (cf.netIncomeCf || 0) +
    (cf.daAddback || 0) +
    (cf.eosbAddback || 0) +
    (cf.workingCapitalChange || 0) +
    (cf.otherOperatingAdj || 0) -
    (cf.zakatPaid || 0) -
    (cf.taxPaid || 0);
  const icf = -(cf.capex || 0) - (cf.acquisitions || 0) + (cf.disposals || 0);
  const ffcf =
    (cf.debtIssuance || 0) -
    (cf.debtRepayment || 0) +
    (cf.sukukIssuance || 0) -
    (cf.sukukRepayment || 0) -
    (cf.leasePrincipalPaid || 0) -
    (cf.dividendsPaid || 0) +
    (cf.equityIssuance || 0) -
    (cf.shareBuybacks || 0);
  const netCash = ocf + icf + ffcf;
  const closingCash = (cf.openingCash || 0) + netCash;

  // BS totals
  const tca = bs.cash + (bs.accountsReceivable || 0) + (bs.inventory || 0) + (bs.otherCurrentAssets || 0);
  const ta =
    tca + (bs.ppeNet || 0) + (bs.rouAssets || 0) + (bs.intangibles || 0) + (bs.ltInvestments || 0);
  const tcl =
    (bs.accountsPayable || 0) +
    (bs.shortTermDebt || 0) +
    (bs.currentLease || 0) +
    (bs.zakatPayable || 0) +
    (bs.accruedLiabilities || 0);
  const tl =
    tcl +
    (bs.longTermDebt || 0) +
    (bs.sukuk || 0) +
    (bs.ltLeaseliabilities || 0) +
    (bs.eosbLiability || 0);
  const te =
    (bs.shareCapital || 0) +
    (bs.statutoryReserve || 0) +
    (bs.retainedEarnings || 0) +
    (bs.oci || 0) +
    (bs.minorityInterestBs || 0);
  const tle = tl + te;

  // BALANCE CHECK
  const balDiff = Math.abs(ta - tle);
  if (balDiff > 1)
    errors.push(
      `Balance sheet out of balance: Assets ${ta.toFixed(2)} ≠ L+E ${tle.toFixed(2)}. Difference: SAR ${balDiff.toFixed(
        2
      )}M.`
    );

  // YoY RETAINED EARNINGS CHECK (if prevBs provided)
  if (prevBs) {
    const expectedRE = (prevBs.retainedEarnings || 0) + ni - (cf.dividendsPaid || 0);
    const reDiff = Math.abs((bs.retainedEarnings || 0) - expectedRE);
    if (reDiff > 5) {
      warnings.push(`RE Reconciliation: BS RE ${bs.retainedEarnings} ≠ Expected ${expectedRE.toFixed(2)} (Prev RE + NI - Div). Diff: ${reDiff.toFixed(2)}`);
    }
  }

  // CASH CHECK
  if (Math.abs(closingCash - bs.cash) > 1)
    warnings.push(
      `CF closing cash ${closingCash.toFixed(2)} ≠ BS cash ${bs.cash}. Diff: ${Math.abs(
        closingCash - bs.cash
      ).toFixed(2)}`
    );

  // NET INCOME FLOW
  if (Math.abs(ni - (cf.netIncomeCf || 0)) > 1)
    warnings.push(`IS net income ${ni.toFixed(2)} ≠ CF starting NI ${cf.netIncomeCf}`);

  // RATIOS
  const sf = (n: number | undefined, d: number | undefined) => {
    if (!d || d === 0) return null;
    return (n || 0) / d;
  };
  const totalDebt = (bs.shortTermDebt || 0) + (bs.longTermDebt || 0) + (bs.sukuk || 0);
  const netDebt = totalDebt - (bs.cash || 0);

  interface Ratios {
    grossMargin: number | null;
    ebitdaMargin: number | null;
    ebitMargin: number | null;
    netMargin: number | null;
    roe: number | null;
    roa: number | null;
    debtToEquity: number | null;
    netDebtEbitda: number | null;
    interestCoverage: number | null;
    currentRatio: number | null;
  }

  const ratios: Ratios = {
    grossMargin: sf(gp, is.revenue),
    ebitdaMargin: sf(is.ebitda, is.revenue),
    ebitMargin: sf(ebit, is.revenue),
    netMargin: sf(ni, is.revenue),
    roe: sf(ni, te),
    roa: sf(ni, ta),
    debtToEquity: sf(totalDebt, te),
    netDebtEbitda: sf(netDebt, is.ebitda),
    interestCoverage: sf(ebit, is.interestExpense),
    currentRatio: sf(tca, tcl),
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    computedTotals: { gp, ebit, ni, tca, ta, tcl, tl, te, tle, ocf, icf, fcf: ffcf, closingCash },
    ratios,
  };
}

