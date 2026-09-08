// components/operations/shared/OperationsHeader.tsx
"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, Calculator, BookmarkCheck, RotateCcw, Sparkles } from "lucide-react";

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

export default function OperationsHeader({
  categoryTag,
  categoryTagAr,
  title,
  titleAr,
  subtitle,
  subtitleAr,
  icon,
  onOpenAudit,
  onExportExcel,
  onExportPdf,
  onSaveSession,
  onResetDefaults,
  isExportingPdf = false,
  isAr = false,
}: OperationsHeaderProps) {
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    if (onSaveSession) {
      onSaveSession();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2200);
    }
  };

  return (
    <div className="panel-input p-5 space-y-4 font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* TITLE & BADGES */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-lg bg-emerald-dim border border-emerald-border text-emerald shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="label-pill label-pill-emerald text-[9px]">
                {isAr && categoryTagAr ? categoryTagAr : categoryTag}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {isAr ? "محرك العمليات التشغيلية" : "OPERATIONS SUITE"}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-heading leading-tight">
              {isAr && titleAr ? titleAr : title}
            </h1>
            <p className="text-xs text-slate-muted font-sans font-medium mt-0.5">
              {isAr && subtitleAr ? subtitleAr : subtitle}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audit Trace Button */}
          <button
            onClick={onOpenAudit}
            className="btn-secondary"
            title={isAr ? "عرض تفاصيل الحسابات الرياضية" : "Inspect calculation formula steps"}
          >
            <Calculator size={13} className="text-emerald" />
            <span>{isAr ? "سجل الحسابات" : "Audit Trace"}</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="btn-secondary"
            title={isAr ? "تصدير إلى إكسل" : "Download Excel spreadsheet"}
          >
            <FileSpreadsheet size={13} className="text-emerald" />
            <span>{isAr ? "إكسل" : "Excel"}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="btn-secondary"
            title={isAr ? "تصدير تقرير PDF" : "Download PDF report"}
          >
            <FileText size={13} className="text-emerald" />
            <span>
              {isExportingPdf
                ? (isAr ? "جاري التصدير..." : "Exporting...")
                : (isAr ? "PDF" : "PDF")}
            </span>
          </button>

          {/* Save State Button */}
          {onSaveSession && (
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer border ${
                savedNotice
                  ? "bg-emerald text-white border-emerald"
                  : "bg-emerald-dim text-emerald border-emerald-border hover:bg-emerald/15"
              }`}
              title={isAr ? "حفظ النموذج في الجلسة" : "Save analysis to current session"}
            >
              <BookmarkCheck size={13} />
              <span>{savedNotice ? (isAr ? "تم الحفظ!" : "Saved!") : (isAr ? "حفظ" : "Save")}</span>
            </button>
          )}

          {/* Reset Defaults */}
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title={isAr ? "استعادة القيم الافتراضية" : "Reset inputs to sample defaults"}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
