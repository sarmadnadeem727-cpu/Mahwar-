"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, CheckSquare, Printer, RefreshCw, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function BIReportEngine() {
  const { sessionAnalyses, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  // Available Modules state checks (clean light theme, no screener)
  const modulesConfig = [
    { id: "dcf", label: isAr ? "تقييم التدفقات النقدية (DCF)" : "DCF Valuation Engine", hasData: !!sessionAnalyses.dcf },
    { id: "lbo", label: isAr ? "باني صفقات الاستحواذ (LBO)" : "LBO Deal Builder", hasData: !!sessionAnalyses.lbo },
    { id: "threeStatement", label: isAr ? "نموذج القوائم الثلاث" : "3-Statement Projections", hasData: !!sessionAnalyses.threeStatement },
    { id: "customModel", label: isAr ? "باني النماذج المخصصة" : "Custom Model Builder", hasData: !!sessionAnalyses.customModel },
    { id: "shariah", label: isAr ? "الفحص الشرعي (AAOIFI)" : "AAOIFI Shariah Screening", hasData: !!sessionAnalyses.shariah },
  ];

  // Auto-select modules with data initially
  useEffect(() => {
    const active = modulesConfig.filter(m => m.hasData).map(m => m.id);
    setSelectedModules(active);
  }, [sessionAnalyses]);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById("bi-report-print-area");
    if (!element) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#FFFFFF",
        scale: 1.8,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`MAHWAR_INTEGRATED_REPORT.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const dcfData = sessionAnalyses.dcf;
  const lboData = sessionAnalyses.lbo;
  const threeStatementData = sessionAnalyses.threeStatement;
  const shariahData = sessionAnalyses.shariah;
  const customModelData = sessionAnalyses.customModel;

  const isDcfActive = selectedModules.includes("dcf") && !!dcfData;
  const isLboActive = selectedModules.includes("lbo") && !!lboData;
  const isThreeStatementActive = selectedModules.includes("threeStatement") && !!threeStatementData;
  const isShariahActive = selectedModules.includes("shariah") && !!shariahData;
  const isCustomModelActive = selectedModules.includes("customModel") && !!customModelData;

  const hasAnySelection = selectedModules.length > 0;

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-slate-800 font-sans"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Self-contained CSS for printing cleanly in light mode */}
      <style>{`
        @media print {
          body {
            background: #FFFFFF !important;
            color: #0F172A !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #bi-report-print-area {
            background: #FFFFFF !important;
            color: #0F172A !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* HEADER CONTROL BAR */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-dim text-emerald border border-emerald-border">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">
              {t("panel_bi_report", language)}
            </h2>
            <span className="text-xs font-mono text-slate-500 uppercase">
              {isAr ? "محرك تقارير الاستخبارات المالية المتكاملة" : "Consolidated Session Report Builder"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={triggerPrint}
            disabled={!hasAnySelection}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-[#E2E8F0] hover:border-emerald text-slate-700 font-mono text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer transition-colors uppercase"
          >
            <Printer size={13} />
            <span>{isAr ? "طباعة التقرير" : "Print Report"}</span>
          </button>

          <button
            onClick={exportPDF}
            disabled={!hasAnySelection || generating}
            className="px-5 py-2 bg-emerald hover:bg-emerald-light text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-colors uppercase tracking-wider"
          >
            {generating ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>{isAr ? "تحميل التقرير PDF" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 no-print">
        {/* MODULES CHECKLIST SELECTOR */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg border border-[#E2E8F0] space-y-4 shadow-xs">
          <h3 className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
            {isAr ? "اختر الأقسام المطلوبة للتقرير" : "Select Report Content Modules"}
          </h3>

          <div className="space-y-2">
            {modulesConfig.map((m) => {
              const active = selectedModules.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => m.hasData && toggleModule(m.id)}
                  className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                    !m.hasData 
                      ? "bg-slate-50 border-[#E2E8F0] opacity-40 cursor-not-allowed text-slate-400" 
                      : active 
                      ? "bg-emerald-dim border-emerald-border text-emerald font-bold cursor-pointer" 
                      : "bg-slate-50 border-[#E2E8F0] text-slate-700 hover:border-emerald cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs uppercase">{m.label}</span>
                    {!m.hasData && (
                      <span className="text-[9px] text-amber-600 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle size={10} />
                        {isAr ? "لا توجد بيانات — شغل الأداة أولاً" : "No data — run tool first"}
                      </span>
                    )}
                  </div>
                  <CheckSquare size={16} className={active ? "text-emerald" : "text-slate-300"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTRUCTIONAL CALLOUT */}
        <div className="col-span-12 lg:col-span-8 p-5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-sans text-slate-600 flex items-center gap-3 shadow-xs">
          <AlertCircle size={18} className="text-emerald shrink-0" />
          <span className="leading-relaxed">
            {isAr 
              ? "تلميح: يتم ملء التقرير تلقائيًا بالبيانات التي قمت بحسابها في أدوات النموذج والاستعلامات أثناء الجلسة الحالية." 
              : "Tip: The synthesis report compiles valuation metrics, returns schedules, and audited outputs from active sessions populated by each sovereign financial tool."}
          </span>
        </div>
      </div>

      {/* REPORT EXECUTIVE PREVIEW (PRINT AREA) */}
      <div 
        id="bi-report-print-area" 
        className="bg-white p-10 rounded-lg border border-[#E2E8F0] space-y-10 text-slate-800 max-w-4xl mx-auto shadow-sm font-sans"
      >
        {/* REPORT HEADER */}
        <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
              MAHWAR FINANCIAL INTELLIGENCE REPORT
            </h1>
            <p className="text-[11px] font-mono text-emerald uppercase tracking-wider mt-1 font-bold">
              Consolidated Corporate Valuation & GCC Synthesis
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            <p>{isAr ? "تاريخ الإصدار" : "Report Date"}: {new Date().toLocaleDateString()}</p>
            <p>{isAr ? "الجهة المعدّة" : "Prepared by"}: Mahwar Sovereign Terminal</p>
          </div>
        </div>

        {/* CONDITIONAL SECTIONS */}
        {selectedModules.length === 0 ? (
          <div className="py-20 text-center font-mono text-sm text-slate-400">
            {isAr ? "الرجاء اختيار وحدة واحدة على الأقل من القائمة لبناء التقرير." : "Please select active data modules to render the report preview."}
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. DCF MODEL SECTION */}
            {isDcfActive && dcfData && (
              <div className="space-y-4 border-b border-[#E2E8F0] pb-8">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald">◎</span>
                  <span>1. {isAr ? "تحليل تقييم التدفقات النقدية المخصومة" : "Discounted Cash Flow (DCF) Valuation"}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isAr ? "خلاصة نموذج التقييم وبناء القيمة الجوهرية بناءً على المدخلات المحددة:" : "Valuation highlights detailing intrinsic valuation based on customized model parameters:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">WACC</span>
                    <span className="text-slate-900 font-bold text-sm">{dcfData.outputs.wacc}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Enterprise Value</span>
                    <span className="text-slate-900 font-bold text-sm">SAR {dcfData.outputs.enterpriseValue}M</span>
                  </div>
                  <div className="p-3 bg-emerald-dim border border-emerald-border rounded-lg">
                    <span className="text-emerald block text-[10px] font-bold">Intrinsic Value / Share</span>
                    <span className="text-emerald font-extrabold text-sm">SAR {dcfData.outputs.intrinsicValuePerShare}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LBO MODEL SECTION */}
            {isLboActive && lboData && (
              <div className="space-y-4 border-b border-[#E2E8F0] pb-8">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald">◎</span>
                  <span>2. {isAr ? "تحليل الاستحواذ المدعوم بالقروض (LBO)" : "Leveraged Buyout (LBO) Deal Analysis"}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isAr ? "مؤشرات العوائد الرأسمالية للمستثمر وشلالات الديون:" : "Private equity returns profile and debt waterfall performance:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Sponsor IRR</span>
                    <span className="text-emerald font-bold text-sm">{lboData.outputs.irr}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">MOIC Multiple</span>
                    <span className="text-slate-900 font-bold text-sm">{lboData.outputs.moic}x</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Senior Debt Service</span>
                    <span className="text-slate-900 font-bold text-sm">SAR {lboData.outputs.debtRepaid}M</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. THREE STATEMENT MODEL SECTION */}
            {isThreeStatementActive && threeStatementData && (
              <div className="space-y-4 border-b border-[#E2E8F0] pb-8">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald">◎</span>
                  <span>3. {isAr ? "القوائم المالية الثلاث المتكاملة" : "Integrated 3-Statement Forecast Highlights"}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isAr ? "مخرجات القوائم المالية المتوافقة مع معايير IFRS والزكاة السعودية:" : "Linked revenue, profitability, and cash position over the forecast period:"}
                </p>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">5Y Projected Revenue</span>
                    <span className="text-slate-900 font-bold text-sm">SAR {threeStatementData.outputs.revY5}M</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">5Y Cumulative FCF</span>
                    <span className="text-emerald font-bold text-sm">SAR {threeStatementData.outputs.cumFcf}M</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SHARIAH COMPLIANCE SECTION */}
            {isShariahActive && shariahData && (
              <div className="space-y-4 border-b border-[#E2E8F0] pb-8">
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-emerald">◎</span>
                  <span>4. {isAr ? "تدقيق الامتثال الشرعي (AAOIFI)" : "AAOIFI Standard No. 21 Compliance Audit"}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isAr ? "نتيجة تدقيق نسب الميزانية ومقدار التطهير المطلوب للسهم:" : "Balance sheet screening ratios and purification requirement per share:"}
                </p>

                <div className="p-4 bg-emerald-dim border border-emerald-border rounded-lg flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-600 block text-[10px] uppercase font-bold">Audit Verdict</span>
                    <span className="text-emerald font-extrabold text-sm">{shariahData.outputs.verdict}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 block text-[10px] uppercase font-bold">Purification Amount</span>
                    <span className="text-slate-900 font-bold text-sm">SAR {shariahData.outputs.purificationPerShare} / share</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center font-mono text-[11px] pt-2">
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Debt Ratio</span>
                    <span className="text-slate-900 font-bold">{shariahData.outputs.debtRatio}% / 33%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Interest Ratio</span>
                    <span className="text-slate-900 font-bold">{shariahData.outputs.interestRatio}% / 5%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <span className="text-slate-500 block text-[10px]">Receivables Ratio</span>
                    <span className="text-slate-900 font-bold">{shariahData.outputs.receivablesRatio}% / 49%</span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* REPORT FOOTER */}
        <div className="border-t border-[#E2E8F0] pt-6 text-center font-mono text-[10px] text-slate-500">
          <p>© {new Date().getFullYear()} Mahwar Sovereign Terminal. Developed by Muhammad Sarmad Nadeem.</p>
          <p className="mt-1 font-bold text-slate-600 uppercase tracking-widest">CONFIDENTIAL | FOR GCC CAPITAL MARKETS COMPLIANCE REVIEW</p>
        </div>
      </div>
    </motion.div>
  );
}
