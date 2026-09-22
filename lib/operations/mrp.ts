// Material requirements planning — multi-level BOM explosion with lead-time offsetting and lot sizing.
export interface BomItem { id: string; name: string; parentId: string | null; qtyPer: number; leadTimeWeeks: number; onHand: number; safetyStock: number; lotSize: number /* 0 = lot-for-lot */; scheduledReceipts: number[] }
export interface MrpInputs { horizonWeeks: number; masterSchedule: number[]; items: BomItem[] }
export interface MrpRow { itemId: string; name: string; level: number; gross: number[]; scheduled: number[]; projected: number[]; net: number[]; plannedReceipts: number[]; plannedReleases: number[]; pastDue: number }
export interface MrpOutputs { rows: MrpRow[]; levels: Record<string, number>; totalPlannedOrders: number; pastDueItems: string[]; peakWeekLoad: { week: number; orders: number } }

export function computeMrp(i: MrpInputs): MrpOutputs {
  const H = i.horizonWeeks;
  const zeros = () => Array.from({ length: H }, () => 0);
  const byId = new Map(i.items.map((it) => [it.id, it]));
  const levels: Record<string, number> = {};
  const levelOf = (id: string, depth = 0): number => {
    const it = byId.get(id); if (!it) return depth;
    if (!it.parentId || depth > 20) return depth;
    return levelOf(it.parentId, depth + 1);
  };
  i.items.forEach((it) => { levels[it.id] = levelOf(it.id); });
  const ordered = [...i.items].sort((a, b) => levels[a.id] - levels[b.id]);
  const releases = new Map<string, number[]>();
  const rows: MrpRow[] = [];
  const pastDueItems: string[] = [];
  const weekLoad = zeros();
  for (const it of ordered) {
    const gross = zeros();
    if (!it.parentId) i.masterSchedule.slice(0, H).forEach((q, w) => { gross[w] = q; });
    else (releases.get(it.parentId) ?? zeros()).forEach((q, w) => { gross[w] = q * it.qtyPer; });
    const scheduled = zeros(); it.scheduledReceipts.slice(0, H).forEach((q, w) => { scheduled[w] = q; });
    const projected = zeros(), net = zeros(), planRec = zeros(), planRel = zeros();
    let onHand = it.onHand; let pastDue = 0;
    for (let w = 0; w < H; w++) {
      const available = onHand + scheduled[w] - gross[w];
      if (available < it.safetyStock) {
        const need = it.safetyStock - available;
        net[w] = need;
        const lot = it.lotSize > 0 ? Math.ceil(need / it.lotSize) * it.lotSize : need;
        planRec[w] = lot;
        const rel = w - it.leadTimeWeeks;
        if (rel >= 0) { planRel[rel] += lot; weekLoad[rel] += 1; } else { pastDue += lot; }
        onHand = available + lot;
      } else onHand = available;
      projected[w] = onHand;
    }
    if (pastDue > 0) pastDueItems.push(it.name);
    releases.set(it.id, planRel);
    rows.push({ itemId: it.id, name: it.name, level: levels[it.id], gross, scheduled, projected, net, plannedReceipts: planRec, plannedReleases: planRel, pastDue });
  }
  const peak = weekLoad.reduce((best, n, w) => (n > best.orders ? { week: w + 1, orders: n } : best), { week: 1, orders: 0 });
  return { rows, levels, totalPlannedOrders: rows.reduce((a, r) => a + r.plannedReleases.filter((x) => x > 0).length, 0), pastDueItems, peakWeekLoad: peak };
}
