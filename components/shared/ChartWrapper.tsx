"use client";

import React, { ReactNode } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  isAr?: boolean;
  className?: string;
}

export default function ChartWrapper({
  title,
  subtitle,
  children,
  onExportPDF,
  onExportExcel,
  isAr = false,
  className = "",
}: ChartWrapperProps) {
  return (
    <div className={`panel-data overflow-hidden flex flex-col ${className}`} dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-line bg-ink-3/90">
        <div>
          <h3 className="font-mono font-bold text-fg text-sm uppercase tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-[10px] font-mono text-fg-3 uppercase mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExportExcel && (
            <button 
              onClick={onExportExcel}
              className="p-1.5 text-fg-3 hover:text-emerald hover:bg-emerald/10 rounded transition-colors"
              title="Export to Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          )}
          {onExportPDF && (
            <button 
              onClick={onExportPDF}
              className="p-1.5 text-fg-3 hover:text-neg hover:bg-neg/10 rounded transition-colors"
              title="Export to PDF"
            >
              <FileText size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Chart Content Area */}
      <div className="p-4 flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
