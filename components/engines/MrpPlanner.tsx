"use client";
import React, { useMemo, useState } from "react";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import EngineShell, { Field, Kpis, Card, TableScroll, fmt, uid } from "./EngineShell";
import { computeMrp, type MrpInputs, type BomItem } from "@/lib/operations/mrp";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const ITEMS: BomItem[] = [
  { id: "fg", name: "Split AC unit (FG)", parentId: null, qtyPer: 1, leadTimeWeeks: 1, onHand: 120, safetyStock: 40, lotSize: 0, scheduledReceipts: [] },
  { id: "comp", name: "Compressor", parentId: "fg", qtyPer: 1, leadTimeWeeks: 3, onHand: 200, safetyStock: 50, lotSize: 250, scheduledReceipts: [0, 250] },
  { id: "coil", name: "Copper coil set", parentId: "fg", qtyPer: 2, leadTimeWeeks: 2, onHand: 300, safetyStock: 100, lotSize: 0, scheduledReceipts: [] },
  { id: "pcb", name: "Control PCB", parentId: "fg", qtyPer: 1, leadTimeWeeks: 4, onHand: 150, safetyStock: 60, lotSize: 500, scheduledReceipts: [] },
  { id: "cu", name: "Copper tube (m)", parentId: "coil", qtyPer: 6, leadTimeWeeks: 2, onHand: 2_000, safetyStock: 500, lotSize: 2_000, scheduledReceipts: [] },
];
const DEFAULTS: MrpInputs = { horizonWeeks: 8, masterSchedule: [300, 320, 340, 360, 380, 400, 420, 440], items: ITEMS };
const ROWS: { k: "gross" | "scheduled" | "projected" | "net" | "plannedReceipts" | "plannedReleases"; en: string; ar: string }[] = [
  { k: "gross", en: "Gross requirements", ar: "الاحتياج الإجمالي" }, { k: "scheduled", en: "Scheduled receipts", ar: "الاستلامات المجدولة" }, { k: "projected", en: "Projected on hand", ar: "المتوقع المتاح" },
  { k: "net", en: "Net requirements", ar: "الاحتياج الصافي" }, { k: "plannedReceipts", en: "Planned order receipts", ar: "استلام الأوامر المخططة" }, { k: "plannedReleases", en: "Planned order releases", ar: "إطلاق الأوامر المخططة" },
];

export default function MrpPlanner() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<MrpInputs>(DEFAULTS);
  const set = <K extends keyof MrpInputs>(k: K, v: MrpInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setItem = (id: string, patch: Partial<BomItem>) => set("items", i.items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const o = useMemo(() => computeMrp(i), [i]);
  useSessionSave("mrp", i, { totalPlannedOrders: o.totalPlannedOrders, pastDueItems: o.pastDueItems, peakWeek: o.peakWeekLoad.week });
  const weeks = Array.from({ length: i.horizonWeeks }, (_, k) => k + 1);

  return (
    <EngineShell id="mrp" icon={<GitBranch size={22} />} onReset={() => setI(DEFAULTS)} inputsWidth={420}
      audit={{
        toolName: "MRP planner", toolNameAr: "تخطيط الاحتياجات من المواد",
        summary: "Level-by-level explosion: gross = parent releases × qty per; net = safety stock − (on hand + receipts − gross); receipts sized to lot, releases offset by lead time.", summaryAr: "تفجير قائمة المواد مستوى بمستوى مع تعويض مدة التوريد وحجم الدفعة.",
        steps: o.rows.slice(0, 4).map((r) => ({ title: `${r.name} (level ${r.level})`, formula: "net = max(0, SS − (OH + SR − gross))", substitution: `week 1: OH ${i.items.find((x) => x.id === r.itemId)?.onHand} , gross ${r.gross[0]}`, result: `first release wk ${r.plannedReleases.findIndex((x) => x > 0) + 1 || "—"}` })),
      }}
      exportRows={o.rows.flatMap((r) => ROWS.map((row) => ({ Item: r.name, Level: r.level, Row: row.en, ...Object.fromEntries(weeks.map((w) => [`W${w}`, r[row.k][w - 1]])) })))}
      inputs={<>
        <Field label={isAr ? "الأفق (أسابيع)" : "Horizon (weeks)"} value={i.horizonWeeks} onChange={(v) => { const h = Math.max(4, Math.min(16, v)); set("horizonWeeks", h); set("masterSchedule", Array.from({ length: h }, (_, k) => i.masterSchedule[k] ?? i.masterSchedule[i.masterSchedule.length - 1] ?? 0)); }} min={4} max={16} />
        <div>
          <span className="text-[12px] text-fg-2">{isAr ? "الجدول الرئيسي (المنتج النهائي)" : "Master schedule (end item)"}</span>
          <div className="mt-1 grid grid-cols-4 gap-1">{i.masterSchedule.map((q, k) => <input key={k} type="number" value={q} onChange={(e) => set("masterSchedule", i.masterSchedule.map((x, j) => (j === k ? Number(e.target.value) : x)))} className="terminal-input h-8 px-1 text-center text-[11px]" title={`W${k + 1}`} />)}</div>
        </div>
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "قائمة المواد" : "Bill of materials"}</span>
            <button onClick={() => set("items", [...i.items, { id: uid(), name: "New part", parentId: i.items[0]?.id ?? null, qtyPer: 1, leadTimeWeeks: 2, onHand: 0, safetyStock: 0, lotSize: 0, scheduledReceipts: [] }])} className="btn-ghost"><Plus size={12} /> {isAr ? "إضافة" : "Add"}</button>
          </div>
          <div className="space-y-2">
            {i.items.map((it) => (
              <div key={it.id} className="panel-data p-2 space-y-1.5" style={{ marginInlineStart: `${(o.levels[it.id] ?? 0) * 10}px` }}>
                <div className="flex gap-1.5 items-center">
                  <input value={it.name} onChange={(e) => setItem(it.id, { name: e.target.value })} className="terminal-input h-8 flex-1 min-w-0" />
                  <select value={it.parentId ?? ""} onChange={(e) => setItem(it.id, { parentId: e.target.value || null })} className="terminal-input h-8 w-28 px-1 text-[11px]" title="Parent">
                    <option value="">{isAr ? "نهائي" : "end item"}</option>
                    {i.items.filter((p) => p.id !== it.id).map((p) => <option key={p.id} value={p.id}>{p.name.slice(0, 16)}</option>)}
                  </select>
                  <button onClick={() => set("items", i.items.filter((x) => x.id !== it.id && x.parentId !== it.id))} className="text-fg-4 hover:text-neg px-1" aria-label="Remove"><Trash2 size={13} /></button>
                </div>
                <div className="grid grid-cols-5 gap-1 font-mono text-[9px] text-fg-4 text-center"><span>qty/per</span><span>LT wk</span><span>on hand</span><span>SS</span><span>lot</span></div>
                <div className="grid grid-cols-5 gap-1">
                  <input type="number" value={it.qtyPer} onChange={(e) => setItem(it.id, { qtyPer: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" />
                  <input type="number" value={it.leadTimeWeeks} onChange={(e) => setItem(it.id, { leadTimeWeeks: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" />
                  <input type="number" value={it.onHand} onChange={(e) => setItem(it.id, { onHand: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" />
                  <input type="number" value={it.safetyStock} onChange={(e) => setItem(it.id, { safetyStock: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" />
                  <input type="number" value={it.lotSize} onChange={(e) => setItem(it.id, { lotSize: Number(e.target.value) })} className="terminal-input h-7 px-1 text-[11px] text-center" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "الأوامر المخططة" : "Planned orders", value: fmt(o.totalPlannedOrders), accent: "emerald" },
        { label: isAr ? "أصناف متأخرة" : "Past-due items", value: fmt(o.pastDueItems.length), accent: o.pastDueItems.length ? "neg" : "emerald", sub: o.pastDueItems.slice(0, 2).join(", ") || (isAr ? "لا شيء" : "none") },
        { label: isAr ? "أسبوع الذروة" : "Peak release week", value: `W${o.peakWeekLoad.week}`, sub: `${o.peakWeekLoad.orders} ${isAr ? "أوامر" : "orders"}`, accent: "gold" },
        { label: isAr ? "مستويات القائمة" : "BOM depth", value: String(Math.max(0, ...Object.values(o.levels)) + 1) },
      ]} />
      {o.rows.map((r) => (
        <Card key={r.itemId} title={`${"—".repeat(r.level)} ${r.name}`} right={r.pastDue > 0 ? <span className="label-pill text-neg border-neg/40">{isAr ? "متأخر" : "past due"} {fmt(r.pastDue)}</span> : undefined} className="!p-0">
          <TableScroll maxH="max-h-none">
            <table className="terminal-table text-[11px]">
              <thead><tr><th className="!py-2">{isAr ? "الأسبوع" : "Week"}</th>{weeks.map((w) => <th key={w} className="!py-2 text-end">{w}</th>)}</tr></thead>
              <tbody>{ROWS.map((row) => (
                <tr key={row.k}><td className="font-sans text-fg-2 whitespace-nowrap !py-1.5">{isAr ? row.ar : row.en}</td>{r[row.k].map((v, k) => <td key={k} className={`text-end !py-1.5 ${row.k === "plannedReleases" && v > 0 ? "text-emerald-light font-semibold" : row.k === "projected" && v < 0 ? "text-neg" : row.k === "net" && v > 0 ? "text-warn" : v === 0 ? "text-fg-4" : ""}`}>{v === 0 ? "·" : fmt(v)}</td>)}</tr>
              ))}</tbody>
            </table>
          </TableScroll>
        </Card>
      ))}
    </EngineShell>
  );
}
