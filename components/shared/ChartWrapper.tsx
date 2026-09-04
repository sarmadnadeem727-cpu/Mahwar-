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
    <div className={`bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden flex flex-col ${className}`} dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-slate-50/50">
        <div>
          <h3 className="font-mono font-bold text-slate-900 text-sm uppercase tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExportExcel && (
            <button 
              onClick={onExportExcel}
              className="p-1.5 text-slate-400 hover:text-emerald hover:bg-emerald/10 rounded transition-colors"
              title="Export to Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
          )}
          {onExportPDF && (
            <button 
              onClick={onExportPDF}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
