"use client";

import React, { useState } from "react";
import { FileSpreadsheet, FileText, Calculator, BookmarkCheck, RotateCcw } from "lucide-react";
import type { SuiteId } from "@/lib/registry";

interface OperationsHeaderProps {
  categoryTag: string;
  categoryTagAr?: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  subtitleAr?: string;
  icon: React.ReactNode;
  suite?: SuiteId;
  onOpenAudit: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSaveSession?: () => void;
  onResetDefaults?: () => void;
  isExportingPdf?: boolean;
  isAr?: boolean;
}

const SUITE_PREFIX: Record<SuiteId, string> = { platform: "SYS", finance: "FIN", operations: "OPS", research: "RES" };

/** Shared header for every engine: title, audit trail and exports. Buttons collapse to icons on phones. */
export default function OperationsHeader({
  categoryTag, categoryTagAr, title, titleAr, subtitle, subtitleAr, icon, suite = "operations",
  onOpenAudit, onExportExcel, onExportPdf, onSaveSession, onResetDefaults,
  isExportingPdf = false, isAr = false,
}: OperationsHeaderProps) {
  const [saved, setSaved] = useState(false);
  const save = () => { onSaveSession?.(); setSaved(true); window.setTimeout(() => setSaved(false), 2000); };
  const accent = suite === "finance" ? "emerald" : "gold";
  const accentText = accent === "emerald" ? "text-emerald-light" : "text-gold";
  const accentBox = accent === "emerald" ? "border-emerald/40 bg-emerald/10 text-emerald-light" : "border-gold/40 bg-gold/10 text-gold";

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 md:pb-5 border-b border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-start gap-3 md:gap-4 min-w-0">
        <div className={`mt-1 p-2 md:p-2.5 rounded border shrink-0 ${accentBox}`}>{icon}</div>
        <div className="min-w-0">
          <p className={`font-mono text-[10.5px] tracking-[0.18em] ${accentText}`}>
            {SUITE_PREFIX[suite]} · {(isAr && categoryTagAr ? categoryTagAr : categoryTag).toUpperCase()}
          </p>
          <h1 className={`mt-1 font-serif text-[22px] md:text-3xl text-fg leading-tight ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr && titleAr ? titleAr : title}
          </h1>
          <p className="mt-1 text-[12px] md:text-[12.5px] text-fg-3 max-w-2xl leading-relaxed">{isAr && subtitleAr ? subtitleAr : subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <button onClick={onOpenAudit} className="btn-secondary" title={isAr ? "عرض خطوات الحساب" : "Show the formula trace"}>
          <Calculator size={13} className="text-emerald-light" /> <span>{isAr ? "سجل الحساب" : "Audit trail"}</span>
        </button>
        <button onClick={onExportExcel} className="btn-secondary" title="Export to Excel"><FileSpreadsheet size={13} className="text-emerald-light" /> <span className="hidden sm:inline">Excel</span></button>
        <button onClick={onExportPdf} disabled={isExportingPdf} className="btn-secondary" title="Export to PDF">
          <FileText size={13} className="text-emerald-light" /> <span className="hidden sm:inline">{isExportingPdf ? (isAr ? "جارٍ التصدير…" : "Exporting…") : "PDF"}</span>
        </button>
        {onSaveSession && (
          <button onClick={save} className={`btn-secondary ${saved ? "border-emerald text-emerald-light" : ""}`}>
            <BookmarkCheck size={13} /> {saved ? (isAr ? "تم الحفظ" : "Saved") : (isAr ? "حفظ" : "Save")}
          </button>
        )}
        {onResetDefaults && (
          <button onClick={onResetDefaults} className="p-2 rounded text-fg-3 hover:text-fg hover:bg-ink-4 transition-colors" title={isAr ? "استعادة القيم الافتراضية" : "Reset to sample inputs"} aria-label="Reset">
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
