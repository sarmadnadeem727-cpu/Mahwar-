// lib/finance/irr.ts
// Newton-Raphson + bisection fallback. Used by LBO and custom CF series.

export const npv = (r: number, cfs: number[]) =>
  cfs.reduce((a, cf, t) => a + cf / Math.pow(1 + r, t), 0);

export const dnpv = (r: number, cfs: number[]) =>
  cfs.reduce((a, cf, t) => (t === 0 ? a : a - (t * cf) / Math.pow(1 + r, t + 1)), 0);

export function hasMultipleSignChanges(cfs: number[]): boolean {
  let c = 0,
    p = 0;
  for (const cf of cfs) {
    const s = cf > 0 ? 1 : cf < 0 ? -1 : 0;
    if (s && p && s !== p) c++;
    if (s) p = s;
  }
  return c > 1;
}

export function irrNR(cfs: number[], guess = 0.2, max = 200, tol = 1e-8): number | null {
  let r = guess;
  for (let k = 0; k < max; k++) {
    const f = npv(r, cfs),
      fp = dnpv(r, cfs);
    if (Math.abs(fp) < 1e-12) break;
    const rn = Math.max(-0.999, Math.min(20, r - f / fp));
    if (Math.abs(rn - r) < tol) return rn;
    r = rn;
  }
  return null;
}

export function irrBisect(cfs: number[], lo = -0.99, hi = 10, max = 300, tol = 1e-8): number | null {
  let flo = npv(lo, cfs),
    fhi = npv(hi, cfs);
  if (flo * fhi > 0) return null;
  for (let k = 0; k < max; k++) {
    const mid = (lo + hi) / 2,
      fm = npv(mid, cfs);
    if (Math.abs(fm) < tol || (hi - lo) / 2 < tol) return mid;
    if (flo * fm < 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

export function computeIrr(cfs: number[]): { irr: number | null; warning?: string } {
  if (!cfs.some(c => c < 0) || !cfs.some(c => c > 0))
    return { irr: null, warning: "No sign change — IRR undefined" };
  const multi = hasMultipleSignChanges(cfs);
  const nr = irrNR(cfs);
  if (nr !== null && !multi) return { irr: nr };
  const bis = irrBisect(cfs);
  return {
    irr: bis,
    warning: multi
      ? "Multiple sign changes — IRR may not be unique. Use MOIC."
      : nr === null
      ? "NR failed — bisection used."
      : undefined,
  };
}

