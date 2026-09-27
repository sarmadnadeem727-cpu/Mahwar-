"use client";

import React from "react";
import { Link2, Sparkles, ExternalLink, RotateCcw } from "lucide-react";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";

interface ProvenanceBadgeProps {
  engineId?: PanelType;
  metricLabelEn: string;
  metricLabelAr: string;
  originalValue: number | string;
  unit?: string;
  isModified?: boolean;
  onReset?: () => void;
  className?: string;
  sourceNote?: string;
}

export default function ProvenanceBadge({
  engineId,
  metricLabelEn,
  metricLabelAr,
  originalValue,
  unit = "",
  isModified = false,
  onReset,
  className = "",
  sourceNote,
}: ProvenanceBadgeProps) {
  const language = useTerminalStore((s) => s.language);
  const setPanel = useTerminalStore((s) => s.setPanel);
  const isAr = language === "ar";

  const engineCode = engineId?.toUpperCase() ?? "SHARED";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
        isModified
          ? "bg-ink-3/90 border-warn/40 text-warn"
          : "bg-emerald/10 border-emerald/30 text-emerald-light"
      } ${className}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Link2 size={13} className="shrink-0 text-emerald-light" />
        <span className="font-bold uppercase tracking-wider text-[10px] bg-ink-2 px-1.5 py-0.5 rounded border border-line">
          {engineCode}
        </span>
        <span className="truncate text-fg-2">
          {isAr
            ? `${metricLabelAr} (${originalValue}${unit ? ` ${unit}` : ""}) مأخوذة من نتيجة ${engineCode}`
            : `${metricLabelEn} (${originalValue}${unit ? ` ${unit}` : ""}) pulled from ${sourceNote ?? `${engineCode} result`}`}
          <span className="text-fg-4 ms-1.5 font-sans italic">
            ({isAr ? "قابلة للتعديل" : "edit if needed"})
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isModified && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-fg-3 hover:text-fg px-1.5 py-0.5 rounded hover:bg-ink-3 transition-colors"
            title={isAr ? "استعادة القيمة الأصلية" : "Reset to pulled value"}
          >
            <RotateCcw size={11} />
            <span>{isAr ? "استعادة" : "Reset"}</span>
          </button>
        )}
        {engineId && (
          <button
            type="button"
            onClick={() => setPanel(engineId)}
            className="flex items-center gap-0.5 text-[11px] text-emerald-light hover:underline px-1 py-0.5"
            title={isAr ? `فتح ${engineCode}` : `Open ${engineCode}`}
          >
            <span>{engineCode}</span>
            <ExternalLink size={10} className={isAr ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </div>
  );
}
