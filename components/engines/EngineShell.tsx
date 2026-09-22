"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import OperationsHeader from "@/components/operations/shared/OperationsHeader";
import FormulaAuditModal from "@/components/operations/shared/FormulaAuditModal";
import { exportToExcel, exportRowsToPdf } from "@/components/operations/shared/exportOperations";
import { panelReveal } from "@/lib/motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import type { AuditData } from "@/lib/operations/types";
import { APP, getTool } from "@/lib/registry";
import type { PanelType } from "@/store/useTerminalStore";

/**
 * EngineShell — the frame every engine uses: registry-driven header, audit
 * trail, vector PDF / Excel export, and an inputs column that becomes a
 * collapsible drawer on phones so results stay above the fold.
 */
interface EngineShellProps {
  id: PanelType;
  icon: React.ReactNode;
  audit: AuditData;
  exportRows: Record<string, string | number>[];
  onReset?: () => void;
  inputs: React.ReactNode;
  children: React.ReactNode;
  /** Width of the inputs column on xl screens. */
  inputsWidth?: number;
}

export default function EngineShell({ id, icon, audit, exportRows, onReset, inputs, children, inputsWidth = 360 }: EngineShellProps) {
  const language = useTerminalStore((s) => s.language);
  const currency = useTerminalStore((s) => s.currency);
  const toast = useTerminalStore((s) => s.toast);
  const isAr = language === "ar";
  const tool = getTool(id);
  const [auditOpen, setAuditOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [inputsOpen, setInputsOpen] = useState(true);
  const domId = `engine-${id}`;

  const excel = () => {
    exportToExcel([{ name: tool?.code ?? "Engine", data: exportRows }], `MAHWAR_${tool?.code ?? id}`);
    toast(isAr ? "تم تصدير ملف Excel" : "Excel exported");
  };
  const pdf = async () => {
    setExporting(true);
    await new Promise((r) => window.setTimeout(r, 30));
    const ok = exportRowsToPdf(exportRows, `MAHWAR_${tool?.code ?? id}`, {
      title: tool?.en ?? id, subtitle: tool?.descEn, code: tool?.code, currency, author: APP.author,
      audit: audit.steps.map((s) => ({ title: s.title, formula: s.formula, substitution: s.substitution, result: s.result })),
    });
    setExporting(false);
    toast(ok ? (isAr ? "تم تصدير PDF" : "PDF exported") : (isAr ? "فشل التصدير" : "Export failed"), ok ? "ok" : "err");
  };

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="space-y-5 md:space-y-6" dir={isAr ? "rtl" : "ltr"} id={domId}>
      <OperationsHeader
        categoryTag={tool?.tag ?? ""}
        title={tool?.en ?? ""}
        titleAr={tool?.ar}
        subtitle={tool?.descEn ?? ""}
        subtitleAr={tool?.descAr}
        icon={icon}
        isAr={isAr}
        suite={tool?.suite}
        onOpenAudit={() => setAuditOpen(true)}
        onExportExcel={excel}
        onExportPdf={pdf}
        onResetDefaults={onReset}
        isExportingPdf={exporting}
      />
      <div className="xl:grid xl:gap-6 space-y-5 xl:space-y-0" style={{ gridTemplateColumns: `${inputsWidth}px minmax(0,1fr)` }}>
        <aside className="panel-input self-start xl:sticky xl:top-2">
          <button
            type="button"
            onClick={() => setInputsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 xl:cursor-default xl:pointer-events-none"
            aria-expanded={inputsOpen}
          >
            <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-fg-3 uppercase">
              <SlidersHorizontal size={12} className="text-emerald-light" /> {isAr ? "المدخلات" : "Inputs"}
            </span>
            <ChevronDown size={14} className={`text-fg-3 transition-transform xl:hidden ${inputsOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`${inputsOpen ? "block" : "hidden"} xl:block px-5 pb-5 space-y-3`}>{inputs}</div>
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
        <input type="number" inputMode="decimal" value={Number.isFinite(value) ? value : ""} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="terminal-input w-full h-10 md:h-9" dir="ltr" />
        {suffix && <span className="ms-2 font-mono text-[11px] text-fg-3 w-10 shrink-0">{suffix}</span>}
      </span>
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[12px] text-fg-2">{label}</span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="terminal-input mt-1 w-full h-10 md:h-9" />
    </label>
  );
}

export function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-[12px] text-fg-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="terminal-input mt-1 w-full h-10 md:h-9 cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="w-full flex items-center justify-between py-1.5 text-[12px] text-fg-2" aria-pressed={value}>
      <span>{label}</span>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-emerald" : "bg-ink-5"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-ink-0 transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

/** KPI tile row with count-up. */
export function Kpis({ items, cols = 4 }: { items: { label: string; value: string; accent?: "emerald" | "gold" | "neg" | "warn"; sub?: string }[]; cols?: 3 | 4 }) {
  const color = { emerald: "text-emerald-light", gold: "text-gold", neg: "text-neg", warn: "text-warn" };
  return (
    <div className={`grid grid-cols-2 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-3`}>
      {items.map((k) => (
        <div key={k.label} className="panel-result p-3.5 md:p-4 min-w-0">
          <div className="font-mono text-[10px] text-fg-3 uppercase tracking-wider truncate">{k.label}</div>
          <div className={`mt-1 font-mono text-xl md:text-2xl num truncate ${k.accent ? color[k.accent] : "text-fg"}`}>{k.value}</div>
          {k.sub && <div className="mt-0.5 text-[11px] text-fg-3 truncate">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/** Titled card. */
export function Card({ title, children, className = "", right }: { title?: string; children: React.ReactNode; className?: string; right?: React.ReactNode }) {
  return (
    <div className={`panel-data p-4 md:p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3 gap-3">
          {title && <div className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider">{title}</div>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/** Horizontal-scroll wrapper so tables never break the phone layout. */
export function TableScroll({ children, maxH = "max-h-96" }: { children: React.ReactNode; maxH?: string }) {
  return <div className={`panel-data overflow-auto ${maxH} -mx-1 md:mx-0`}><div className="min-w-[560px]">{children}</div></div>;
}

export const fmt = (n: number, d = 0) => (Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");
export const pct = (n: number, d = 1) => (Number.isFinite(n) ? `${n.toFixed(d)}%` : "—");
export const uid = () => Math.random().toString(36).slice(2, 8);
