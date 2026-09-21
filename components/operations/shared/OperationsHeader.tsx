"use client";

import React, { useState } from "react";
import { FileSpreadsheet, FileText, Calculator, BookmarkCheck, RotateCcw } from "lucide-react";

interface OperationsHeaderProps {
  categoryTag: string;
  categoryTagAr?: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  subtitleAr?: string;
  icon: React.ReactNode;
  onOpenAudit: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSaveSession?: () => void;
  onResetDefaults?: () => void;
  isExportingPdf?: boolean;
  isAr?: boolean;
}

/** Shared header for every operations engine: title, audit trail and exports. */
export default function OperationsHeader({
  categoryTag, categoryTagAr, title, titleAr, subtitle, subtitleAr, icon,
  onOpenAudit, onExportExcel, onExportPdf, onSaveSession, onResetDefaults,
  isExportingPdf = false, isAr = false,
}: OperationsHeaderProps) {
  const [saved, setSaved] = useState(false);
  const save = () => {
    onSaveSession?.();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2.5 rounded border border-gold/40 bg-gold/10 text-gold shrink-0">{icon}</div>
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.18em] text-gold">
            OPS · {(isAr && categoryTagAr ? categoryTagAr : categoryTag).toUpperCase()}
          </p>
          <h1 className={`mt-1 font-serif text-2xl md:text-3xl text-fg leading-tight ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr && titleAr ? titleAr : title}
          </h1>
          <p className="mt-1 text-[12.5px] text-fg-3 max-w-2xl">{isAr && subtitleAr ? subtitleAr : subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <button onClick={onOpenAudit} className="btn-secondary" title={isAr ? "عرض خطوات الحساب" : "Show the formula trace"}>
          <Calculator size={13} className="text-emerald-light" /> {isAr ? "سجل الحساب" : "Audit trail"}
        </button>
        <button onClick={onExportExcel} className="btn-secondary"><FileSpreadsheet size={13} className="text-emerald-light" /> Excel</button>
        <button onClick={onExportPdf} disabled={isExportingPdf} className="btn-secondary">
          <FileText size={13} className="text-emerald-light" /> {isExportingPdf ? (isAr ? "جارٍ التصدير…" : "Exporting…") : "PDF"}
        </button>
        {onSaveSession && (
          <button onClick={save} className={`btn-secondary ${saved ? "border-emerald text-emerald-light" : ""}`}>
            <BookmarkCheck size={13} /> {saved ? (isAr ? "تم الحفظ" : "Saved") : (isAr ? "حفظ" : "Save")}
          </button>
        )}
        {onResetDefaults && (
          <button onClick={onResetDefaults} className="p-2 rounded text-fg-3 hover:text-fg hover:bg-ink-4 transition-colors" title={isAr ? "استعادة القيم الافتراضية" : "Reset to sample inputs"}>
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
