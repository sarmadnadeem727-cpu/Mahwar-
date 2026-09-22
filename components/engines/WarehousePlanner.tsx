"use client";
import React, { useMemo, useState } from "react";
import { Warehouse } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import EngineShell, { Field, Select, Kpis, Card, fmt, pct } from "./EngineShell";
import { computeWarehouse, type WarehouseInputs } from "@/lib/operations/warehouse";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: WarehouseInputs = { floorAreaSqm: 12_000, clearHeightM: 11, aisleAndDockPct: 42, palletFootprintSqm: 1.2, palletHeightM: 1.6, beamClearanceM: 0.25, rackingType: "selective", inventoryUnits: 1_450_000, unitsPerPallet: 48, monthlyGrowthPct: 2.2, monthlyRentPerSqm: 28, monthlyOpsCost: 165_000, targetUtilisationPct: 85 };

export default function WarehousePlanner() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<WarehouseInputs>(DEFAULTS);
  const set = <K extends keyof WarehouseInputs>(k: K, v: WarehouseInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeWarehouse(i), [i]);
  useSessionSave("warehouse", i, { usablePositions: o.usablePositions, utilisationPct: o.utilisationPct, monthsToFull: o.monthsToFull, costPerPositionMonth: o.costPerPositionMonth });

  return (
    <EngineShell id="warehouse" icon={<Warehouse size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Warehouse capacity", toolNameAr: "سعة المستودع",
        summary: "Pallet positions = storage area / footprint × rack access factor × levels × honeycombing factor; months of headroom from compound growth.", summaryAr: "مواقع المنصات = المساحة / البصمة × عامل الرفوف × الطبقات × عامل الشغور.",
        steps: [
          { title: "Storage area", formula: "floor × (1 − aisles & docks %)", substitution: `${fmt(i.floorAreaSqm)} × (1 − ${i.aisleAndDockPct}%)`, result: `${fmt(o.storageAreaSqm)} m²` },
          { title: "Levels", formula: "⌊clear height / (pallet + beam)⌋", substitution: `⌊${i.clearHeightM} / (${i.palletHeightM} + ${i.beamClearanceM})⌋`, result: String(o.levels) },
          { title: "Usable positions", formula: "ground × levels × honeycomb", substitution: `${fmt(o.groundPositions)} × ${o.levels}`, result: fmt(o.usablePositions) },
          { title: "Pallets needed", formula: "⌈units / units per pallet⌉", substitution: `⌈${fmt(i.inventoryUnits)} / ${i.unitsPerPallet}⌉`, result: fmt(o.palletsNeeded) },
          { title: "Months to full", formula: "ln(capacity / pallets) / ln(1 + g)", substitution: `g = ${i.monthlyGrowthPct}%`, result: o.monthsToFull === null ? "n/a" : `${o.monthsToFull.toFixed(1)}` },
        ],
      }}
      exportRows={[{ Metric: "Storage area m²", Value: o.storageAreaSqm }, { Metric: "Levels", Value: o.levels }, { Metric: "Total positions", Value: o.totalPositions }, { Metric: "Usable positions", Value: o.usablePositions }, { Metric: "Pallets needed", Value: o.palletsNeeded }, { Metric: "Utilisation %", Value: o.utilisationPct }, { Metric: "Months to target", Value: o.monthsToTarget ?? "" }, { Metric: "Months to full", Value: o.monthsToFull ?? "" }, { Metric: "Cost / position / month", Value: o.costPerPositionMonth }]}
      inputs={<>
        <Field label={isAr ? "مساحة الأرضية" : "Floor area"} value={i.floorAreaSqm} onChange={(v) => set("floorAreaSqm", v)} suffix="m²" />
        <Field label={isAr ? "الارتفاع الصافي" : "Clear height"} value={i.clearHeightM} onChange={(v) => set("clearHeightM", v)} suffix="m" step={0.5} />
        <Field label={isAr ? "الممرات والأرصفة" : "Aisles, docks & offices"} value={i.aisleAndDockPct} onChange={(v) => set("aisleAndDockPct", v)} suffix="%" />
        <Select label={isAr ? "نوع الرفوف" : "Racking"} value={i.rackingType} onChange={(v) => set("rackingType", v)} options={[{ value: "selective", label: isAr ? "انتقائي" : "Selective" }, { value: "double_deep", label: isAr ? "مزدوج العمق" : "Double-deep" }, { value: "drive_in", label: isAr ? "الدخول بالرافعة" : "Drive-in" }]} />
        <Field label={isAr ? "بصمة المنصة" : "Pallet footprint"} value={i.palletFootprintSqm} onChange={(v) => set("palletFootprintSqm", v)} suffix="m²" step={0.05} />
        <Field label={isAr ? "ارتفاع المنصة المحملة" : "Loaded pallet height"} value={i.palletHeightM} onChange={(v) => set("palletHeightM", v)} suffix="m" step={0.05} />
        <Field label={isAr ? "خلوص العارضة" : "Beam clearance"} value={i.beamClearanceM} onChange={(v) => set("beamClearanceM", v)} suffix="m" step={0.05} />
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "المخزون والتكلفة" : "Inventory & cost"}</div>
        <Field label={isAr ? "وحدات المخزون" : "Inventory units"} value={i.inventoryUnits} onChange={(v) => set("inventoryUnits", v)} />
        <Field label={isAr ? "وحدات / منصة" : "Units per pallet"} value={i.unitsPerPallet} onChange={(v) => set("unitsPerPallet", v)} />
        <Field label={isAr ? "النمو الشهري" : "Monthly growth"} value={i.monthlyGrowthPct} onChange={(v) => set("monthlyGrowthPct", v)} suffix="%" step={0.1} />
        <Field label={isAr ? "الاستخدام المستهدف" : "Target utilisation"} value={i.targetUtilisationPct} onChange={(v) => set("targetUtilisationPct", v)} suffix="%" />
        <Field label={isAr ? "الإيجار / م² / شهر" : "Rent / m² / month"} value={i.monthlyRentPerSqm} onChange={(v) => set("monthlyRentPerSqm", v)} suffix={currency} />
        <Field label={isAr ? "تشغيل شهري" : "Monthly ops cost"} value={i.monthlyOpsCost} onChange={(v) => set("monthlyOpsCost", v)} suffix={currency} />
      </>}>
      <Kpis items={[
        { label: isAr ? "المواقع القابلة للاستخدام" : "Usable pallet positions", value: fmt(o.usablePositions), accent: "emerald", sub: `${o.levels} ${isAr ? "طبقات" : "levels"} · ${fmt(o.groundPositions)} ${isAr ? "أرضي" : "ground"}` },
        { label: isAr ? "الاستخدام" : "Utilisation", value: pct(o.utilisationPct), accent: o.utilisationPct > 95 ? "neg" : o.utilisationPct > i.targetUtilisationPct ? "warn" : "emerald", sub: `${fmt(o.palletsNeeded)} ${isAr ? "منصة" : "pallets"}` },
        { label: isAr ? "أشهر حتى الامتلاء" : "Months to full", value: o.monthsToFull === null ? "∞" : fmt(o.monthsToFull, 1), accent: "gold", sub: o.monthsToTarget === null ? undefined : `${fmt(o.monthsToTarget, 1)} ${isAr ? "حتى الهدف" : "to target"}` },
        { label: isAr ? "التكلفة / موقع / شهر" : "Cost / position / month", value: fmt(o.costPerPositionMonth, 2), sub: currency },
      ]} />
      <Card title={isAr ? "توقع 24 شهراً" : "24-month projection"}>
        <div className="h-60">
          <ResponsiveContainer>
            <AreaChart data={o.projection} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="month" {...T.axis} />
              <YAxis {...T.axis} width={56} tickFormatter={(v) => fmt(v)} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v)} labelFormatter={(l) => `month ${l}`} />
              <ReferenceLine y={o.usablePositions} stroke={T.colors.negative} strokeDasharray="4 3" label={{ value: "capacity", fill: T.colors.negative, fontSize: 10 }} />
              <ReferenceLine y={o.usablePositions * (i.targetUtilisationPct / 100)} stroke={T.colors.gold} strokeDasharray="2 4" />
              <Area type="monotone" dataKey="pallets" stroke={T.colors.emerald} fill={T.colors.emeraldDim} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </EngineShell>
  );
}
