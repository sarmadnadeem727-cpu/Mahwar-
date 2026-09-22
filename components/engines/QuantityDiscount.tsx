"use client";
import React, { useMemo, useState } from "react";
import { Tags, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Kpis, Card, TableScroll, fmt, uid } from "./EngineShell";
import { computeQuantityDiscount, type QdInputs, type PriceBreak } from "@/lib/operations/quantityDiscount";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const BREAKS: PriceBreak[] = [{ id: "b1", minQty: 0, unitPrice: 58 }, { id: "b2", minQty: 1_000, unitPrice: 55.5 }, { id: "b3", minQty: 2_500, unitPrice: 53.2 }, { id: "b4", minQty: 5_000, unitPrice: 51.9 }];
const DEFAULTS: QdInputs = { annualDemand: 48_000, orderCost: 320, holdingPct: 18, breaks: BREAKS };

export default function QuantityDiscount() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<QdInputs>(DEFAULTS);
  const set = <K extends keyof QdInputs>(k: K, v: QdInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const setB = (id: string, patch: Partial<PriceBreak>) => set("breaks", i.breaks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const o = useMemo(() => computeQuantityDiscount(i), [i]);
  useSessionSave("quantityDiscount", i, { bestQ: o.bestQ, bestPrice: o.bestPrice, bestTotal: o.bestTotal, savings: o.savings });

  return (
    <EngineShell id="quantity_discount" icon={<Tags size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Quantity-discount EOQ", toolNameAr: "حجم الطلب الاقتصادي مع خصومات الكمية",
        summary: "For each price break compute EOQ at that price, lift it to the break's minimum if needed, then total = ordering + holding + purchase; pick the lowest.", summaryAr: "لكل شريحة سعر يُحسب EOQ ويُرفع لحد الشريحة ثم تُقارن التكلفة الكلية.",
        steps: o.rows.map((r) => ({ title: `Break ≥ ${fmt(r.minQty)} @ ${r.unitPrice}`, formula: "Q* = √(2DS/H), H = p × h%", substitution: `√(2×${fmt(i.annualDemand)}×${i.orderCost}/${r.holdingPerUnit.toFixed(2)}) → ${fmt(r.rawEoq)} ${r.adjustedQ !== Math.round(r.rawEoq) ? `→ ${fmt(r.adjustedQ)}` : ""}`, result: `total ${fmt(r.total)}` })),
      }}
      exportRows={o.rows.map((r) => ({ "Min qty": r.minQty, "Unit price": r.unitPrice, "Raw EOQ": r.rawEoq, "Order qty": r.adjustedQ, Ordering: r.ordering, Holding: r.holding, Purchase: r.purchase, Total: r.total, Best: r.best ? "yes" : "" }))}
      inputs={<>
        <Field label={isAr ? "الطلب السنوي" : "Annual demand"} value={i.annualDemand} onChange={(v) => set("annualDemand", v)} />
        <Field label={isAr ? "تكلفة الطلب" : "Ordering cost"} value={i.orderCost} onChange={(v) => set("orderCost", v)} suffix={currency} />
        <Field label={isAr ? "تكلفة الاحتفاظ" : "Holding cost"} value={i.holdingPct} onChange={(v) => set("holdingPct", v)} suffix="%/yr" step={0.5} />
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-fg-2">{isAr ? "شرائح السعر" : "Price breaks"}</span>
            <button onClick={() => set("breaks", [...i.breaks, { id: uid(), minQty: (i.breaks[i.breaks.length - 1]?.minQty ?? 0) * 2 || 1_000, unitPrice: (i.breaks[i.breaks.length - 1]?.unitPrice ?? 50) * 0.97 }])} className="btn-ghost"><Plus size={12} /> {isAr ? "إضافة" : "Add"}</button>
          </div>
          <div className="grid grid-cols-[1fr_1fr_24px] gap-1 font-mono text-[9px] text-fg-4 mb-1"><span>{isAr ? "من كمية" : "min qty"}</span><span>{isAr ? "سعر الوحدة" : "unit price"}</span><span /></div>
          <div className="space-y-1.5">{i.breaks.map((b) => (
            <div key={b.id} className="grid grid-cols-[1fr_1fr_24px] gap-1 items-center">
              <input type="number" value={b.minQty} onChange={(e) => setB(b.id, { minQty: Number(e.target.value) })} className="terminal-input h-8 px-2" />
              <input type="number" step={0.1} value={b.unitPrice} onChange={(e) => setB(b.id, { unitPrice: Number(e.target.value) })} className="terminal-input h-8 px-2" />
              <button onClick={() => set("breaks", i.breaks.filter((x) => x.id !== b.id))} className="text-fg-4 hover:text-neg" aria-label="Remove"><Trash2 size={13} /></button>
            </div>
          ))}</div>
        </div>
      </>}>
      <Kpis items={[
        { label: isAr ? "كمية الطلب المثلى" : "Optimal order qty", value: fmt(o.bestQ), accent: "emerald", sub: `@ ${fmt(o.bestPrice, 2)} ${currency}` },
        { label: isAr ? "التكلفة السنوية الكلية" : "Total annual cost", value: fmt(o.bestTotal), sub: currency },
        { label: isAr ? "التوفير مقابل السعر الأساسي" : "Saving vs base price", value: fmt(o.savings), accent: o.savings > 0 ? "emerald" : undefined, sub: `${((o.savings / Math.max(o.baselineTotal, 1)) * 100).toFixed(2)}%` },
        { label: isAr ? "طلبات / سنة" : "Orders / year", value: fmt(i.annualDemand / Math.max(o.bestQ, 1), 1), accent: "gold" },
      ]} />
      <Card title={isAr ? "التكلفة الكلية مقابل الكمية" : "Total cost vs order quantity"}>
        <div className="h-60">
          <ResponsiveContainer>
            <LineChart data={o.curve} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="q" {...T.axis} tickFormatter={(v) => fmt(v)} />
              <YAxis {...T.axis} width={64} domain={["auto", "auto"]} tickFormatter={(v) => fmt(v / 1000) + "k"} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Q ${fmt(Number(l))}`} />
              {i.breaks.filter((b) => b.minQty > 0).map((b) => <ReferenceLine key={b.id} x={b.minQty} stroke={T.colors.slateLight} strokeDasharray="2 4" />)}
              <ReferenceLine x={Math.round(o.bestQ)} stroke={T.colors.gold} strokeDasharray="4 3" />
              <Line type="stepAfter" dataKey="total" stroke={T.colors.emerald} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <TableScroll maxH="max-h-72">
        <table className="terminal-table"><thead><tr><th>{isAr ? "الشريحة" : "Break"}</th><th>{isAr ? "السعر" : "Price"}</th><th>EOQ</th><th>{isAr ? "الكمية" : "Order Q"}</th><th>{isAr ? "طلب" : "Ordering"}</th><th>{isAr ? "احتفاظ" : "Holding"}</th><th>{isAr ? "شراء" : "Purchase"}</th><th>{isAr ? "الإجمالي" : "Total"}</th></tr></thead>
          <tbody>{o.rows.map((r) => <tr key={r.breakId} className={r.best ? "bg-emerald/5" : ""}><td className="text-emerald-light">≥ {fmt(r.minQty)}</td><td>{fmt(r.unitPrice, 2)}</td><td className="text-fg-3">{fmt(r.rawEoq)}</td><td className="text-fg">{fmt(r.adjustedQ)}</td><td>{fmt(r.ordering)}</td><td>{fmt(r.holding)}</td><td>{fmt(r.purchase)}</td><td className={r.best ? "text-gold font-semibold" : ""}>{fmt(r.total)}</td></tr>)}</tbody></table>
      </TableScroll>
    </EngineShell>
  );
}
