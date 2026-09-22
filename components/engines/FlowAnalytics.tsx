"use client";
import React, { useMemo, useState } from "react";
import { Timer } from "lucide-react";
import EngineShell, { Field, Kpis, Card, fmt, pct } from "./EngineShell";
import { computeFlow, type FlowInputs } from "@/lib/operations/flow";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: FlowInputs = { wip: 860, throughputPerHour: 95, shiftMinutes: 480, plannedDowntimeMin: 45, unplannedDowntimeMin: 38, demandPerShift: 640, idealCycleSec: 32, totalPieces: 690, defectPieces: 21 };

export default function FlowAnalytics() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<FlowInputs>(DEFAULTS);
  const set = <K extends keyof FlowInputs>(k: K, v: FlowInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeFlow(i), [i]);
  useSessionSave("flow", i, { oee: o.oee * 100, taktSec: o.taktSec, leadTimeHours: o.leadTimeHours, utilisationPct: o.utilisationPct });
  const bar = (label: string, v: number, color: string) => (
    <div key={label}><div className="flex justify-between text-[11px] text-fg-2 mb-1"><span>{label}</span><span className="font-mono">{pct(v * 100)}</span></div><div className="h-2 rounded-full bg-ink-4 overflow-hidden"><div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, v * 100)}%` }} /></div></div>
  );

  return (
    <EngineShell id="flow" icon={<Timer size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Flow, takt & OEE", toolNameAr: "التدفق وزمن التاكت والفعالية الكلية",
        summary: "Little's law gives lead time from WIP and throughput; takt = available time / demand; OEE = availability × performance × quality.", summaryAr: "قانون ليتل يعطي زمن الانتظار؛ التاكت = الوقت المتاح / الطلب؛ OEE = التوافر × الأداء × الجودة.",
        steps: [
          { title: "Lead time (Little)", formula: "L = WIP / throughput", substitution: `${i.wip} / ${i.throughputPerHour}`, result: `${o.leadTimeHours.toFixed(2)} h` },
          { title: "Takt", formula: "(shift − planned downtime) × 60 / demand", substitution: `(${i.shiftMinutes} − ${i.plannedDowntimeMin}) × 60 / ${i.demandPerShift}`, result: `${o.taktSec.toFixed(1)} s` },
          { title: "Availability", formula: "run time / planned time", substitution: `${i.shiftMinutes - i.plannedDowntimeMin - i.unplannedDowntimeMin} / ${i.shiftMinutes - i.plannedDowntimeMin}`, result: pct(o.availability * 100) },
          { title: "Performance", formula: "ideal cycle × pieces / run time", substitution: `${i.idealCycleSec}s × ${i.totalPieces} / run`, result: pct(o.performance * 100) },
          { title: "Quality", formula: "(pieces − defects) / pieces", substitution: `(${i.totalPieces} − ${i.defectPieces}) / ${i.totalPieces}`, result: pct(o.quality * 100) },
          { title: "OEE", formula: "A × P × Q", substitution: `${(o.availability * 100).toFixed(1)}% × ${(o.performance * 100).toFixed(1)}% × ${(o.quality * 100).toFixed(1)}%`, result: pct(o.oee * 100) },
        ],
      }}
      exportRows={[{ Metric: "Lead time (h)", Value: o.leadTimeHours }, { Metric: "Takt (s)", Value: o.taktSec }, { Metric: "Effective cycle (s)", Value: o.effectiveCycleSec }, { Metric: "Availability %", Value: o.availability * 100 }, { Metric: "Performance %", Value: o.performance * 100 }, { Metric: "Quality %", Value: o.quality * 100 }, { Metric: "OEE %", Value: o.oee * 100 }, { Metric: "Capacity / shift", Value: o.capacityPerShift }, { Metric: "Utilisation %", Value: o.utilisationPct }]}
      inputs={<>
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-1">{isAr ? "قانون ليتل" : "Little's law"}</div>
        <Field label={isAr ? "الأعمال قيد التنفيذ (وحدات)" : "Work in process (units)"} value={i.wip} onChange={(v) => set("wip", v)} />
        <Field label={isAr ? "الإنتاجية / ساعة" : "Throughput / hour"} value={i.throughputPerHour} onChange={(v) => set("throughputPerHour", v)} />
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "الوردية" : "Shift"}</div>
        <Field label={isAr ? "مدة الوردية" : "Shift length"} value={i.shiftMinutes} onChange={(v) => set("shiftMinutes", v)} suffix="min" />
        <Field label={isAr ? "توقف مخطط" : "Planned downtime"} value={i.plannedDowntimeMin} onChange={(v) => set("plannedDowntimeMin", v)} suffix="min" />
        <Field label={isAr ? "توقف غير مخطط" : "Unplanned downtime"} value={i.unplannedDowntimeMin} onChange={(v) => set("unplannedDowntimeMin", v)} suffix="min" />
        <Field label={isAr ? "الطلب / وردية" : "Demand / shift"} value={i.demandPerShift} onChange={(v) => set("demandPerShift", v)} />
        <Field label={isAr ? "زمن الدورة المثالي" : "Ideal cycle time"} value={i.idealCycleSec} onChange={(v) => set("idealCycleSec", v)} suffix="s" />
        <Field label={isAr ? "القطع المنتجة" : "Pieces produced"} value={i.totalPieces} onChange={(v) => set("totalPieces", v)} />
        <Field label={isAr ? "القطع المعيبة" : "Defective pieces"} value={i.defectPieces} onChange={(v) => set("defectPieces", v)} />
      </>}>
      <Kpis items={[
        { label: "OEE", value: pct(o.oee * 100), accent: o.oee >= 0.85 ? "emerald" : o.oee >= 0.6 ? "warn" : "neg", sub: isAr ? "الأفضل عالمياً ≥ 85%" : "world class ≥ 85%" },
        { label: isAr ? "زمن التاكت" : "Takt time", value: `${o.taktSec.toFixed(1)} s`, sub: `${isAr ? "الدورة الفعلية" : "actual cycle"} ${o.effectiveCycleSec.toFixed(1)} s`, accent: o.bottleneck ? "neg" : "emerald" },
        { label: isAr ? "زمن الانتظار" : "Lead time", value: `${o.leadTimeHours.toFixed(1)} h`, accent: "gold", sub: isAr ? "قانون ليتل" : "Little's law" },
        { label: isAr ? "الاستخدام" : "Utilisation", value: pct(o.utilisationPct), sub: `${isAr ? "الطاقة" : "capacity"} ${fmt(o.capacityPerShift)} / ${isAr ? "وردية" : "shift"}`, accent: o.utilisationPct > 100 ? "neg" : undefined },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={isAr ? "مكونات OEE" : "OEE components"}>
          <div className="space-y-4">
            {bar(isAr ? "التوافر" : "Availability", o.availability, "bg-emerald")}
            {bar(isAr ? "الأداء" : "Performance", o.performance, "bg-gold")}
            {bar(isAr ? "الجودة" : "Quality", o.quality, "bg-pos")}
          </div>
        </Card>
        <Card title={isAr ? "الدقائق المفقودة لكل وردية" : "Minutes lost per shift"}>
          <ul className="space-y-2 font-mono text-[12px]">
            {[["availability", isAr ? "توقفات" : "Downtime losses", o.lossMinutes.availability], ["performance", isAr ? "سرعة / توقفات صغيرة" : "Speed & micro-stops", o.lossMinutes.performance], ["quality", isAr ? "عيوب" : "Defects", o.lossMinutes.quality]].map(([k, l, v]) => (
              <li key={k as string} className="flex items-center justify-between"><span className="text-fg-2 font-sans">{l}</span><span className="text-neg">{fmt(v as number, 1)} min</span></li>
            ))}
            <li className="flex items-center justify-between pt-2 border-t border-line"><span className="text-fg-2 font-sans">{isAr ? "الهدف: وحدات قيد التنفيذ" : "WIP target at takt"}</span><span className="text-emerald-light">{fmt(o.wipTarget)}</span></li>
          </ul>
          {o.bottleneck && <p className="mt-3 text-[12px] text-neg">{isAr ? "الدورة الفعلية أبطأ من التاكت — هذه المحطة عنق زجاجة." : "Actual cycle is slower than takt — this station is the bottleneck."}</p>}
        </Card>
      </div>
    </EngineShell>
  );
}
