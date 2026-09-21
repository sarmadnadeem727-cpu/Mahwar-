"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import OperationsHeader from "@/components/operations/shared/OperationsHeader";
import FormulaAuditModal from "@/components/operations/shared/FormulaAuditModal";
import { exportToExcel, exportToPdf } from "@/components/operations/shared/exportOperations";
import { panelReveal } from "@/lib/motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import type { AuditData } from "@/lib/operations/types";
import { getTool } from "@/lib/registry";
import type { PanelType } from "@/store/useTerminalStore";

/**
 * EngineShell — the frame every new engine uses: registry-driven header,
 * audit-trail modal, Excel / PDF export, inputs column + results column.
 * Keeps each engine file down to its inputs, its maths and its charts.
 */
interface EngineShellProps {
  id: PanelType;
  icon: React.ReactNode;
  audit: AuditData;
  exportRows: Record<string, string | number>[];
  onReset?: () => void;
  inputs: React.ReactNode;
  children: React.ReactNode;
}

export default function EngineShell({ id, icon, audit, exportRows, onReset, inputs, children }: EngineShellProps) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const tool = getTool(id);
  const [auditOpen, setAuditOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const domId = `engine-${id}`;

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="space-y-6" dir={isAr ? "rtl" : "ltr"} id={domId}>
      <OperationsHeader
        categoryTag={tool?.tag ?? ""}
        title={tool?.en ?? ""}
        titleAr={tool?.ar}
        subtitle={tool?.descEn ?? ""}
        subtitleAr={tool?.descAr}
        icon={icon}
        isAr={isAr}
        onOpenAudit={() => setAuditOpen(true)}
        onExportExcel={() => exportToExcel([{ name: tool?.code ?? "Engine", data: exportRows }], `MAHWAR_${tool?.code ?? id}`)}
        onExportPdf={async () => { setExporting(true); await exportToPdf(domId, `MAHWAR_${tool?.code ?? id}`); setExporting(false); }}
        onResetDefaults={onReset}
        isExportingPdf={exporting}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <aside className="panel-input p-5 space-y-3 self-start">
          <h2 className="font-mono text-[10.5px] tracking-[0.18em] text-fg-3 uppercase">{isAr ? "المدخلات" : "Inputs"}</h2>
          {inputs}
        </aside>
        <section className="space-y-5 min-w-0">{children}</section>
      </div>
      <FormulaAuditModal isOpen={auditOpen} onClose={() => setAuditOpen(false)} auditData={audit} isAr={isAr} />
    </motion.div>
  );
}

/** Compact labelled number input for engine sidebars. */
export function Field({ label, value, onChange, suffix, step = "any", min, max, hint }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number | string; min?: number; max?: number; hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-[12px] text-fg-2"><span>{label}</span>{hint && <span className="text-fg-4 font-mono text-[10px]">{hint}</span>}</span>
      <span className="mt-1 flex items-center">
        <input type="number" value={Number.isFinite(value) ? value : ""} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="terminal-input w-full" dir="ltr" />
        {suffix && <span className="ms-2 font-mono text-[11px] text-fg-3 w-10">{suffix}</span>}
      </span>
    </label>
  );
}

export function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-[12px] text-fg-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="terminal-input mt-1 w-full cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** KPI tile row. */
export function Kpis({ items }: { items: { label: string; value: string; accent?: "emerald" | "gold" | "neg"; sub?: string }[] }) {
  const color = { emerald: "text-emerald-light", gold: "text-gold", neg: "text-neg" };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((k) => (
        <div key={k.label} className="panel-result p-4">
          <div className="font-mono text-[10px] text-fg-3 uppercase tracking-wider">{k.label}</div>
          <div className={`mt-1 font-mono text-2xl num ${k.accent ? color[k.accent] : "text-fg"}`}>{k.value}</div>
          {k.sub && <div className="mt-0.5 text-[11px] text-fg-3">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export const fmt = (n: number, d = 0) => (Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "∞");

