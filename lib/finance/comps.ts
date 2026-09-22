// Comparable-company valuation: peer multiples → implied enterprise / equity value ranges.
export interface Peer { id: string; name: string; evRevenue: number; evEbitda: number; pe: number }
export interface CompsInputs {
  revenue: number; ebitda: number; netIncome: number; netDebt: number; sharesOutstanding: number; currentPrice: number;
  peers: Peer[];
}
export interface MultipleStats { key: "evRevenue" | "evEbitda" | "pe"; label: string; min: number; p25: number; median: number; p75: number; max: number; n: number }
export interface ImpliedRange { key: MultipleStats["key"]; label: string; low: number; mid: number; high: number; lowPs: number; midPs: number; highPs: number }
export interface CompsOutputs { stats: MultipleStats[]; implied: ImpliedRange[]; blendedPerShare: number; upsidePct: number; targetMultiples: { evRevenue: number; evEbitda: number; pe: number } }

function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function computeComps(i: CompsInputs): CompsOutputs {
  const defs: { key: MultipleStats["key"]; label: string }[] = [
    { key: "evRevenue", label: "EV / Revenue" },
    { key: "evEbitda", label: "EV / EBITDA" },
    { key: "pe", label: "P / E" },
  ];
  const stats: MultipleStats[] = defs.map((d) => {
    const vals = i.peers.map((p) => p[d.key]).filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
    return { key: d.key, label: d.label, n: vals.length, min: quantile(vals, 0), p25: quantile(vals, 0.25), median: quantile(vals, 0.5), p75: quantile(vals, 0.75), max: quantile(vals, 1) };
  });
  const shares = Math.max(i.sharesOutstanding, 1e-9);
  const toEquity = (ev: number) => ev - i.netDebt;
  const implied: ImpliedRange[] = stats.map((s) => {
    let low = 0, mid = 0, high = 0;
    if (s.key === "evRevenue") { low = toEquity(s.p25 * i.revenue); mid = toEquity(s.median * i.revenue); high = toEquity(s.p75 * i.revenue); }
    else if (s.key === "evEbitda") { low = toEquity(s.p25 * i.ebitda); mid = toEquity(s.median * i.ebitda); high = toEquity(s.p75 * i.ebitda); }
    else { low = s.p25 * i.netIncome; mid = s.median * i.netIncome; high = s.p75 * i.netIncome; }
    return { key: s.key, label: s.label, low, mid, high, lowPs: low / shares, midPs: mid / shares, highPs: high / shares };
  });
  const usable = implied.filter((r) => Number.isFinite(r.midPs) && r.midPs > 0);
  const blendedPerShare = usable.length ? usable.reduce((a, r) => a + r.midPs, 0) / usable.length : 0;
  const upsidePct = i.currentPrice > 0 ? ((blendedPerShare - i.currentPrice) / i.currentPrice) * 100 : 0;
  const mcap = i.currentPrice * shares;
  const ev = mcap + i.netDebt;
  return {
    stats, implied, blendedPerShare, upsidePct,
    targetMultiples: { evRevenue: i.revenue > 0 ? ev / i.revenue : 0, evEbitda: i.ebitda > 0 ? ev / i.ebitda : 0, pe: i.netIncome > 0 ? mcap / i.netIncome : 0 },
  };
}
