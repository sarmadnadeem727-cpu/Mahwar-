"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, CheckSquare, Printer, RefreshCw, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import ReactMarkdown from "react-markdown";

export default function BIReportEngine() {
  const { sessionAnalyses, language } = useTerminalStore();
  const isAr = language === 'ar';

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  // Available Modules state checks
  const modulesConfig = [
    { id: "dcf", label: isAr ? "تقييم التدفقات النقدية (DCF)" : "DCF Valuation Engine", hasData: !!sessionAnalyses.dcf },
    { id: "lbo", label: isAr ? "باني صفقات الاستحواذ (LBO)" : "LBO Deal Builder", hasData: !!sessionAnalyses.lbo },
    { id: "threeStatement", label: isAr ? "نموذج القوائم الثلاث" : "3-Statement Projections", hasData: !!sessionAnalyses.threeStatement },
    { id: "shariah", label: isAr ? "الفحص الشرعي (AAOIFI)" : "AAOIFI Shariah Screening", hasData: !!sessionAnalyses.shariah },
    { id: "comparator", label: isAr ? "مقارنة الشركات" : "Company Comparator", hasData: !!sessionAnalyses.comparator },
    { id: "researchMemo", label: isAr ? "تقرير الأبحاث بالذكاء الاصطناعي" : "AI Research Memo", hasData: !!sessionAnalyses.researchMemo }
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
      const imgWidth = 210; // A4 size width
      const pageHeight = 295; // A4 size height
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

  const isDcfActive = selectedModules.includes("dcf") && sessionAnalyses.dcf;
  const isLboActive = selectedModules.includes("lbo") && sessionAnalyses.lbo;
  const isThreeStatementActive = selectedModules.includes("threeStatement") && sessionAnalyses.threeStatement;
  const isShariahActive = selectedModules.includes("shariah") && sessionAnalyses.shariah;
  const isComparatorActive = selectedModules.includes("comparator") && sessionAnalyses.comparator;
  const isResearchMemoActive = selectedModules.includes("researchMemo") && sessionAnalyses.researchMemo;

  const hasAnySelection = selectedModules.length > 0;

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Self-contained CSS for printing cleanly */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #bi-report-print-area {
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
          }
          #bi-report-print-area * {
            color: black !important;
            border-color: #bbb !important;
          }
          #bi-report-print-area h2, 
          #bi-report-print-area h3, 
          #bi-report-print-area h4 {
            color: #0E7C69 !important;
          }
          .recharts-text {
            fill: #333 !important;
          }
          .glass-panel {
            background: white !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      {/* HEADER CONTROL BAR */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="text-[var(--emerald)]" size={24} />
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#171717]">
              {t("panel_bi_report", language)}
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {isAr ? "محرك تقارير الاستخبارات المالية المتكاملة" : "Consolidated Session Report Builder"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={triggerPrint}
            disabled={!hasAnySelection}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer transition-colors"
          >
            <Printer size={13} />
            <span>{isAr ? "طباعة التقرير" : "Print Report"}</span>
          </button>

          <button
            onClick={exportPDF}
            disabled={!hasAnySelection || generating}
            className="px-5 py-2 bg-[var(--emerald)] hover:bg-[#12A189] text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
          >
            {generating ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>{isAr ? "تحميل التقرير PDF" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 no-print">
        {/* MODULES CHECKLIST SELECTOR (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-mono text-xs font-bold text-[#171717] uppercase tracking-wider border-b border-slate-200 pb-3">
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
                      ? "bg-slate-50 border-slate-150 opacity-40 cursor-not-allowed text-slate-400" 
                      : active 
                      ? "bg-[var(--emerald)]/10 border-[var(--emerald)] text-[var(--emerald)] font-bold cursor-pointer" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">{m.label}</span>
                    {!m.hasData && (
                      <span className="text-[9px] text-amber-600 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle size={10} />
                        {isAr ? "لا توجد بيانات — شغل الأداة أولاً" : "No data — run tool first"}
                      </span>
                    )}
                  </div>
                  <CheckSquare size={16} className={active ? "text-[var(--emerald)]" : "opacity-20"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTRUCTIONAL CALLOUT */}
        <div className="col-span-12 lg:col-span-8 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-650 flex items-center gap-2">
          <AlertCircle size={15} className="text-[var(--emerald)]" />
          <span>{isAr ? "تلميح: يتم ملء التقرير تلقائيًا بالبيانات التي قمت بحسابها في أدوات النموذج والاستعلامات أعلاه." : "Tip: The report compiles calculations, tables, and graphs from active sessions populated by each tool."}</span>
        </div>
      </div>

      {/* REPORT EXECUTIVE PREVIEW (PRINT AREA) */}
      <div 
        id="bi-report-print-area" 
        className="bg-white p-10 rounded-xl border border-slate-200 space-y-10 text-slate-800 max-w-4xl mx-auto shadow-md"
      >
        {/* REPORT HEADER */}
        <div className="border-b border-slate-250 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wider text-[#171717]">
              MAHWAR FINANCIAL INTELLIGENCE REPORT
            </h1>
            <p className="text-[10px] font-mono text-[var(--emerald)] uppercase tracking-widest mt-1 font-bold">
              Consolidated Corporate Valuation & GCC Synthesis
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-500">
            <p>{isAr ? "تاريخ الإصدار" : "Report Date"}: {new Date().toLocaleDateString()}</p>
            <p>{isAr ? "الجهة المعدّة" : "Prepared by"}: Antigravity Engine</p>
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
            {isDcfActive && (
              <div className="space-y-4 border-b border-slate-200 pb-8">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>1. {isAr ? "تحليل تقييم التدفقات النقدية المخصومة" : "Discounted Cash Flow (DCF) Valuation"}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  {isAr ? "خلاصة نموذج التقييم وبناء القيمة الجوهرية بناءً على المدخلات المحددة:" : "Valuation highlights detailing intrinsic valuation based on customized model parameters:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">WACC</span>
                    <span className="text-[#171717] font-bold text-sm">{sessionAnalyses.dcf.outputs.wacc}%</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[var(--emerald)] block text-[9px] font-bold">Intrinsic Value</span>
                    <span className="text-[var(--emerald)] font-bold text-sm">SAR {sessionAnalyses.dcf.outputs.intrinsicValuePerShare}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Upside / Downside</span>
                    <span className="text-[#171717] font-bold text-sm">{sessionAnalyses.dcf.outputs.upsidePct}%</span>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-250 text-slate-500 bg-slate-50">
                        <th className="p-2">Metric</th>
                        {sessionAnalyses.dcf.outputs.fcfProjections?.map((p: any) => (
                          <th key={p.year} className="text-right p-2">{p.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 font-bold">Revenue (M)</td>
                        {sessionAnalyses.dcf.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-800">{p.revenue.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2">EBITDA (M)</td>
                        {sessionAnalyses.dcf.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-700">{p.ebitda.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-250 bg-emerald-50/50 font-bold text-[var(--emerald)]">
                        <td className="p-2">Free Cash Flow (FCF)</td>
                        {sessionAnalyses.dcf.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold">{p.fcf.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. LBO MODEL SECTION */}
            {isLboActive && (
              <div className="space-y-4 border-b border-slate-200 pb-8">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>2. {isAr ? "تحليل صفقات الاستحواذ المدعوم بالديون" : "Leveraged Buyout (LBO) Transaction Model"}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  {isAr ? "تحليلات عائد الاستثمار، وحصص الديون، ومعدل العائد الداخلي المخطط:" : "Equity waterfall analysis, debt returns repayment, and exit returns mapping:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Sponsor Equity Required</span>
                    <span className="text-[#171717] font-bold text-sm">SAR {sessionAnalyses.lbo.outputs.sponsorEquity.toLocaleString()}M</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">MOIC Multiple</span>
                    <span className="text-[#171717] font-bold text-sm">{sessionAnalyses.lbo.outputs.moic}x</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-pulse">
                    <span className="text-[var(--emerald)] block text-[9px] font-bold">Projected IRR</span>
                    <span className="text-[var(--emerald)] font-bold text-sm">{sessionAnalyses.lbo.outputs.irr}%</span>
                  </div>
                </div>

                <div className="h-[200px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionAnalyses.lbo.outputs.irrData}>
                      <XAxis dataKey="year" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                      <Bar dataKey="irr" fill="#0E7C69" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3. THREE STATEMENT PROJECTIONS */}
            {isThreeStatementActive && (
              <div className="space-y-4 border-b border-slate-200 pb-8">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>3. {isAr ? "التوقعات المالية المتكاملة للقوائم الثلاث" : "3-Statement Projections Summary"}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  {isAr ? "توقعات القوائم الثلاث (الأرباح والخسائر، الميزانية، التدفقات) لـ 5 سنوات قادمة:" : "5-year linked model outputs for income statement and corporate items:"}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-250 text-slate-500 bg-slate-50">
                        <th className="p-2">Line Item (M)</th>
                        {sessionAnalyses.threeStatement.outputs.projections?.map((p: any) => (
                          <th key={p.year} className="text-right p-2">{p.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 font-bold text-[var(--emerald)]">Revenue</td>
                        {sessionAnalyses.threeStatement.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold text-[var(--emerald)]">{p.rev.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2">EBITDA</td>
                        {sessionAnalyses.threeStatement.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-700">{p.ebitda.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2">Zakat or Tax</td>
                        {sessionAnalyses.threeStatement.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-red-650">-{p.zakatOrTax.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-250 font-bold bg-slate-50">
                        <td className="p-2 text-[#171717]">Net Income</td>
                        {sessionAnalyses.threeStatement.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold text-[#171717]">{p.netIncome.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. SHARIAH SCREENING */}
            {isShariahActive && (
              <div className="space-y-4 border-b border-slate-200 pb-8">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>4. {isAr ? "فحص التوافق مع الشريعة الإسلامية" : "AAOIFI Shariah Compliance Audit"}</span>
                </h3>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-250 rounded-lg">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">Compliance Verdict</span>
                    <span className="font-mono text-sm font-bold text-[var(--emerald)]">{sessionAnalyses.shariah.outputs.verdict}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">Purification Fee / Share</span>
                    <span className="font-mono text-sm font-bold text-slate-800">SAR {sessionAnalyses.shariah.outputs.purificationPerShare}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center font-mono text-[10px] pt-2">
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Debt Ratio</span>
                    <span className="text-[#171717] font-bold">{sessionAnalyses.shariah.outputs.debtRatio}% / 33%</span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Interest Ratio</span>
                    <span className="text-[#171717] font-bold">{sessionAnalyses.shariah.outputs.interestRatio}% / 5%</span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Receivables Ratio</span>
                    <span className="text-[#171717] font-bold">{sessionAnalyses.shariah.outputs.receivablesRatio}% / 49%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COMPANY COMPARATOR */}
            {isComparatorActive && (
              <div className="space-y-4 border-b border-slate-200 pb-8">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>5. {isAr ? "مقارنة الشركات المحددة ومصفوفة الأداء" : "Company Peer Comparator Matrix"}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  {isAr ? "جدول مقارنة الشركات والصفقات المدخلة يدوياً:" : "Comparison breakdown of custom companies entered during the session:"}
                </p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-250 text-slate-500 bg-slate-50">
                        <th className="p-2">Ticker</th>
                        <th className="p-2">Company</th>
                        <th className="p-2">Sector</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">PE</th>
                        <th className="p-2 text-right">Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionAnalyses.comparator.rows.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 font-bold text-[var(--emerald)]">{row.ticker}</td>
                          <td className="p-2 text-slate-800">{isAr ? row.nameAr : row.name}</td>
                          <td className="p-2 text-slate-550">{row.sector}</td>
                          <td className="p-2 text-right text-[#171717] font-bold">SAR {row.price}</td>
                          <td className="p-2 text-right text-slate-700">{row.pe}x</td>
                          <td className="p-2 text-right text-green-700 font-bold">{row.divYield}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. AI RESEARCH MEMO */}
            {isResearchMemoActive && (
              <div className="space-y-4 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#171717] flex items-center gap-2">
                  <span className="text-[var(--emerald)]">◎</span>
                  <span>6. {isAr ? "مذكرة أبحاث الملكية الفكرية بالذكاء الاصطناعي" : "AI Equity Research Memo"}</span>
                </h3>
                <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 font-sans text-slate-800 leading-relaxed text-xs">
                  <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#171717] prose-headings:font-bold prose-h1:text-sm prose-h2:text-xs prose-p:text-[11px] prose-li:text-[11px] prose-strong:text-[#171717]">
                    <ReactMarkdown>{sessionAnalyses.researchMemo.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* REPORT FOOTER */}
        <div className="border-t border-slate-250 pt-6 text-center font-mono text-[9px] text-slate-400">
          <p>© {new Date().getFullYear()} Mahwar Investment Suite. Developed by Muhammad Sarmad Nadeem.</p>
          <p className="mt-1 font-bold text-slate-500">CONFIDENTIAL | FOR GCC CAPITAL MARKETS COMPLIANCE REVIEW</p>
        </div>
      </div>
    </motion.div>
  );
}
