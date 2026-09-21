// Loan / murabaha schedule builder — level payment, equal principal or bullet.
export type AmortMethod = "annuity" | "equal_principal" | "bullet";
export interface AmortInputs {
  principal: number; annualRatePct: number; years: number; paymentsPerYear: 1 | 2 | 4 | 12;
  method: AmortMethod; gracePeriods?: number; upfrontFeePct?: number;
}
export interface AmortRow { period: number; payment: number; interest: number; principal: number; balance: number }
export interface AmortOutputs {
  schedule: AmortRow[]; payment: number; totalInterest: number; totalPaid: number; effectiveAnnualRatePct: number; aprWithFeesPct: number;
}
export function buildAmortization(i: AmortInputs): AmortOutputs {
  const n = Math.max(1, Math.round(i.years * i.paymentsPerYear));
  const r = i.annualRatePct / 100 / i.paymentsPerYear;
  const grace = Math.min(i.gracePeriods ?? 0, n - 1);
  const amortN = n - grace;
  const schedule: AmortRow[] = [];
  let bal = i.principal;
  const annuity = r > 0 ? (bal * r) / (1 - Math.pow(1 + r, -amortN)) : bal / amortN;
  for (let k = 1; k <= n; k++) {
    const interest = bal * r;
    let principal = 0;
    if (k > grace) {
      if (i.method === "annuity") principal = annuity - interest;
      else if (i.method === "equal_principal") principal = i.principal / amortN;
      else principal = k === n ? bal : 0;
    }
    principal = Math.min(principal, bal);
    bal -= principal;
    schedule.push({ period: k, payment: interest + principal, interest, principal, balance: Math.max(0, bal) });
  }
  const totalInterest = schedule.reduce((s, x) => s + x.interest, 0);
  const totalPaid = schedule.reduce((s, x) => s + x.payment, 0);
  const fee = (i.upfrontFeePct ?? 0) / 100 * i.principal;
  const cfs = [-(i.principal - fee), ...schedule.map((x) => x.payment)];
  const irrP = irr(cfs);
  return {
    schedule, payment: schedule.find((x) => x.period > grace)?.payment ?? 0, totalInterest, totalPaid,
    effectiveAnnualRatePct: (Math.pow(1 + r, i.paymentsPerYear) - 1) * 100,
    aprWithFeesPct: irrP === null ? i.annualRatePct : (Math.pow(1 + irrP, i.paymentsPerYear) - 1) * 100,
  };
}
function irr(cfs: number[]): number | null {
  let lo = -0.99, hi = 1;
  const npv = (r: number) => cfs.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0);
  if (npv(lo) * npv(hi) > 0) return null;
  for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (npv(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

