// components/operations/shared/FormulaAuditModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Calculator, ShieldCheck, ChevronRight } from "lucide-react";
import { AuditData } from "@/lib/operations/types";

interface FormulaAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditData | null;
  isAr?: boolean;
}

export default function FormulaAuditModal({
  isOpen,
  onClose,
  auditData,
  isAr = false,
}: FormulaAuditModalProps) {
  if (!isOpen || !auditData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* MODAL HEADER */}
          <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
                <Calculator size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="label-pill label-pill-emerald text-[9px]">
                    {isAr ? "سجل التدقيق الرياضي" : "FORMULA AUDIT TRACE"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isAr ? "التحقق المالي" : "VERIFIED CALCULATION"}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 mt-0.5">
                  {isAr ? auditData.toolNameAr : auditData.toolName}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* SUMMARY CALLOUT */}
          <div className="px-5 py-3.5 bg-emerald/5 border-b border-emerald/10 text-xs font-medium text-slate-700 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr ? auditData.summaryAr : auditData.summary}
            </p>
          </div>

          {/* AUDIT STEPS LIST */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 font-mono text-xs">
            {auditData.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="font-bold text-slate-900 text-xs">
                    {step.title}
                  </span>
                  <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded">
                    STEP {idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] w-24 shrink-0">
                      Formula:
                    </span>
                    <span className="text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {step.formula}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="text-slate-400 font-bold uppercase text-[9px] w-24 shrink-0">
                      Input Values:
                    </span>
                    <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {step.substitution}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pt-1">
                    <span className="text-emerald font-bold uppercase text-[9px] w-24 shrink-0">
                      Computed:
                    </span>
                    <span className="font-bold text-emerald bg-emerald-dim border border-emerald-border px-2.5 py-0.5 rounded text-xs">
                      = {step.result}
                    </span>
                  </div>
                </div>

                {step.explanation && (
                  <p className="text-[11px] font-sans text-slate-500 pt-1 border-t border-dashed border-slate-200 leading-relaxed">
                    {step.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* MODAL FOOTER */}
          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono">
              {isAr ? "حساب فوري من جهة العميل بدون خوادم خارجية" : "Deterministic Client-Side Computation"}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs rounded transition-colors cursor-pointer"
            >
              {isAr ? "إغلاق السجل" : "Close Audit Trace"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
