"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, X, ShieldCheck, 
  ArrowRight, Sparkles, RefreshCw, Eye
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { ingestFinancialDocument, type IngestionResult, type ExtractedField } from "@/lib/ingestion/documentIngestion";

interface DocumentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEngine: "FS" | "zscore" | "ratios";
  onApply: (extractedData: Record<string, number>, fileName: string) => void;
}

export default function DocumentIngestionModal({
  isOpen,
  onClose,
  targetEngine,
  onApply,
}: DocumentIngestionModalProps) {
  const { language, currency, toast } = useTerminalStore();
  const isAr = language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [reviewedValues, setReviewedValues] = useState<Record<string, number | null>>({});

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await processFile(selected);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    setFile(dropped);
    await processFile(dropped);
  };

  const processFile = async (f: File) => {
    setIsLoading(true);
    setStatus(isAr ? "جاري قراءة المستند..." : "Reading document...");
    setProgress(10);

    try {
      const res = await ingestFinancialDocument(f, (st, pct) => {
        setStatus(st);
        setProgress(pct);
      });

      setResult(res);

      // Initialize reviewed values with extracted numbers
      const initialMap: Record<string, number | null> = {};
      Object.entries(res.fields).forEach(([k, field]) => {
        initialMap[k] = field.value;
      });
      setReviewedValues(initialMap);

      toast(
        isAr
          ? `تم استخراج البيانات من ${f.name}. يرجى مراجعة الأرقام قبل التطبيق.`
          : `Extracted figures from ${f.name}. Review fields before applying.`,
        "ok"
      );
    } catch (err: any) {
      console.error(err);
      toast(
        isAr ? "فشل استخراج البيانات من الملف." : "Failed to extract data from document.",
        "err"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (key: string, val: string) => {
    const parsed = val.trim() === "" ? null : Number(val);
    setReviewedValues((prev) => ({
      ...prev,
      [key]: isNaN(parsed as number) ? null : parsed,
    }));
  };

  const handleApply = () => {
    if (!result || !file) return;

    // Filter out nulls
    const cleanNumbers: Record<string, number> = {};
    Object.entries(reviewedValues).forEach(([k, v]) => {
      if (v !== null && !isNaN(v)) {
        cleanNumbers[k] = v;
      }
    });

    onApply(cleanNumbers, file.name);
    onClose();
  };

  if (!isOpen) return null;

  // Filter fields relevant to the current engine
  const targetFields = result
    ? Object.values(result.fields).filter(
        (f) => !f.requiredFor || f.requiredFor.includes(targetEngine)
      )
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-0/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-ink-1 border border-line rounded-2xl shadow-2xl overflow-hidden font-mono"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-ink-2/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald-light">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-bold text-fg text-sm uppercase">
                  {isAr ? "استيراد القوائم المالية الذكي" : "Financial Statement Ingestion"}
                </h3>
                <p className="text-[11px] text-fg-3">
                  {isAr
                    ? "استخراج فوري للأرقام من ملفات PDF أو الصور — مع المراجعة قبل التطبيق"
                    : "Extract income & balance sheet items from PDF/Image — review before applying"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-fg-3 hover:text-fg hover:bg-ink-3 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* PRIVACY DISCLOSURE BANNER */}
          <div className="px-6 py-2.5 bg-emerald/10 border-b border-emerald/20 flex items-center gap-2.5 text-xs text-emerald-light font-sans">
            <ShieldCheck size={16} className="shrink-0 text-emerald-light" />
            <span>
              {isAr
                ? "أمان وخصوصية تامة: تتم جميع عمليات معالجة النصوص وOCR داخل متصفحك محلياً عبر WebAssembly. لا يتم إرسال أي مستندات إلى أي خادم خارجي."
                : "100% Client-Side Privacy: Text extraction & OCR execute entirely inside your browser via WebAssembly. Your financial statements never leave your machine."}
            </span>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!result ? (
              // DROPZONE
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isLoading
                    ? "border-emerald/40 bg-emerald/5"
                    : "border-line hover:border-emerald/50 hover:bg-ink-2/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isLoading ? (
                  <div className="space-y-3 w-full max-w-xs">
                    <RefreshCw size={32} className="animate-spin text-emerald-light mx-auto" />
                    <p className="text-xs font-bold text-fg">{status}</p>
                    <div className="w-full bg-ink-3 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-light h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-ink-2 border border-line mb-3 text-fg-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-fg mb-1">
                      {isAr
                        ? "اضغط لاختيار ملف أو اسحبه إلى هنا"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-fg-3 max-w-md">
                      {isAr
                        ? "يدعم ملفات PDF الممسوحة ضوئياً والرقمية، وصور PNG و JPG و WEBP للقوائم المالية."
                        : "Supports digital & scanned PDFs, PNG, JPG, and WEBP financial reports."}
                    </p>
                  </>
                )}
              </div>
            ) : (
              // REVIEW SCREEN
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-ink-2 border border-line text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-light" />
                    <span className="font-bold text-fg">{result.fileName}</span>
                    <span className="text-fg-4">
                      ({result.method === "pdf-text" ? "Vector PDF" : "Tesseract OCR"})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                    }}
                    className="text-emerald-light hover:underline text-xs"
                  >
                    {isAr ? "تحميل ملف آخر" : "Upload another"}
                  </button>
                </div>

                <div className="text-xs font-sans text-fg-3">
                  {isAr
                    ? "تم استخراج البنود التالية. الحقول ذات الدقة العالية معبأة مسبقاً، بينما تترك البنود غير المؤكدة فارغة ومميزة لإدخالها يدوياً. لا يتم اعتماد أي بند دون مراجعتك."
                    : "The following items were mapped. High-confidence fields are prefilled; unconfident items are left blank and highlighted for manual entry. Values are never applied without your review."}
                </div>

                {/* FIELDS TABLE */}
                <div className="border border-line rounded-lg overflow-hidden bg-ink-2/40">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-ink-3 text-fg-3 border-b border-line text-left rtl:text-right">
                        <th className="p-3">{isAr ? "البند المالي" : "Financial Line Item"}</th>
                        <th className="p-3">{isAr ? "القيمة المستخرجة" : "Extracted Value"}</th>
                        <th className="p-3">{isAr ? "الحالة / الدقة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {targetFields.map((field) => {
                        const currentVal = reviewedValues[field.key];
                        const isBlank = currentVal === null || currentVal === undefined;

                        return (
                          <tr
                            key={field.key}
                            className={`transition-colors ${
                              isBlank ? "bg-warn/5" : "hover:bg-ink-3/40"
                            }`}
                          >
                            <td className="p-3">
                              <span className="font-bold text-fg block">
                                {isAr ? field.labelAr : field.labelEn}
                              </span>
                              {field.rawMatch && (
                                <span className="text-[10px] text-fg-4 block truncate max-w-xs font-sans">
                                  Match: {field.rawMatch}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                placeholder={isAr ? "أدخل يدوياً..." : "Enter manually..."}
                                value={currentVal ?? ""}
                                onChange={(e) => handleValueChange(field.key, e.target.value)}
                                className={`w-36 px-2.5 py-1.5 rounded bg-ink-3 border font-mono text-xs font-bold text-right ${
                                  isBlank
                                    ? "border-warn/60 focus:border-warn text-warn"
                                    : "border-line focus:border-emerald-light text-fg"
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              {field.confidence === "high" && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-light">
                                  <CheckCircle2 size={12} />
                                  <span>{isAr ? "مؤكد" : "Detected"}</span>
                                </span>
                              )}
                              {field.confidence === "medium" && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-fg-3">
                                  <span>{isAr ? "مشتق" : "Derived"}</span>
                                </span>
                              )}
                              {field.confidence === "unconfident" && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-warn">
                                  <AlertTriangle size={12} />
                                  <span>{isAr ? "مطلوب الإدخال" : "Manual Required"}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-ink-2/60">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleApply}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <span>{isAr ? "تطبيق القيم على النموذج" : "Apply Values to Model"}</span>
                <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
