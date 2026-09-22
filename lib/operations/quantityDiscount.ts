// EOQ with all-units quantity discounts: evaluate each price break, adjust EOQ to the feasible range, pick the cheapest.
export interface PriceBreak { id: string; minQty: number; unitPrice: number }
export interface QdInputs { annualDemand: number; orderCost: number; holdingPct: number; breaks: PriceBreak[] }
export interface QdRow { breakId: string; minQty: number; maxQty: number | null; unitPrice: number; holdingPerUnit: number; rawEoq: number; adjustedQ: number; feasible: boolean; ordering: number; holding: number; purchase: number; total: number; best: boolean }
export interface QdOutputs { rows: QdRow[]; bestQ: number; bestPrice: number; bestTotal: number; baselineTotal: number; savings: number; curve: { q: number; total: number }[] }

export function computeQuantityDiscount(i: QdInputs): QdOutputs {
  const breaks = [...i.breaks].sort((a, b) => a.minQty - b.minQty);
  const rows: QdRow[] = breaks.map((b, k) => {
    const next = breaks[k + 1];
    const maxQty = next ? next.minQty - 1 : null;
    const h = b.unitPrice * (i.holdingPct / 100);
    const rawEoq = h > 0 ? Math.sqrt((2 * i.annualDemand * i.orderCost) / h) : 0;
    const adjustedQ = Math.max(rawEoq, b.minQty);
    const feasible = maxQty === null || adjustedQ <= maxQty || rawEoq < b.minQty;
    const q = maxQty !== null && adjustedQ > maxQty ? b.minQty : adjustedQ;
    const ordering = q > 0 ? (i.annualDemand / q) * i.orderCost : 0;
    const holding = (q / 2) * h;
    const purchase = i.annualDemand * b.unitPrice;
    return { breakId: b.id, minQty: b.minQty, maxQty, unitPrice: b.unitPrice, holdingPerUnit: h, rawEoq, adjustedQ: q, feasible, ordering, holding, purchase, total: ordering + holding + purchase, best: false };
  });
  const best = rows.reduce((b, r) => (r.total < b.total ? r : b), rows[0]);
  if (best) best.best = true;
  const baseline = rows[0];
  const maxQ = Math.max(best?.adjustedQ ?? 0, breaks[breaks.length - 1]?.minQty ?? 0) * 1.6;
  const priceAt = (q: number) => [...breaks].reverse().find((b) => q >= b.minQty)?.unitPrice ?? breaks[0]?.unitPrice ?? 0;
  const curve = Array.from({ length: 40 }, (_, k) => {
    const q = Math.max(1, (maxQ / 39) * k);
    const p = priceAt(q);
    return { q: Math.round(q), total: (i.annualDemand / q) * i.orderCost + (q / 2) * p * (i.holdingPct / 100) + i.annualDemand * p };
  });
  return { rows, bestQ: best?.adjustedQ ?? 0, bestPrice: best?.unitPrice ?? 0, bestTotal: best?.total ?? 0, baselineTotal: baseline?.total ?? 0, savings: (baseline?.total ?? 0) - (best?.total ?? 0), curve };
}
