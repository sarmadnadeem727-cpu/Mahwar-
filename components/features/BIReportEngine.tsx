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
        backgroundColor: "#0B0E14",
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

  const dcfData = sessionAnalyses.dcf;
  const lboData = sessionAnalyses.lbo;
  const threeStatementData = sessionAnalyses.threeStatement;
  const shariahData = sessionAnalyses.shariah;
  const comparatorData = sessionAnalyses.comparator;
  const researchMemoData = sessionAnalyses.researchMemo;

  const isDcfActive = selectedModules.includes("dcf") && !!dcfData;
  const isLboActive = selectedModules.includes("lbo") && !!lboData;
  const isThreeStatementActive = selectedModules.includes("threeStatement") && !!threeStatementData;
  const isShariahActive = selectedModules.includes("shariah") && !!shariahData;
  const isComparatorActive = selectedModules.includes("comparator") && !!comparatorData;
  const isResearchMemoActive = selectedModules.includes("researchMemo") && !!researchMemoData;

  const hasAnySelection = selectedModules.length > 0;

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-slate-100 font-mono"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Self-contained CSS for printing cleanly */}
      <style>{`
        @media print {
          body {
            background: #0B0E14 !important;
            color: #F8FAFC !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #bi-report-print-area {
            background: #0B0E14 !important;
            color: #F8FAFC !important;
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
      <div className="bg-[#121721] p-6 rounded-sm border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-xl">
        <div className="flex items-center gap-3">
          <FileText className="text-terminal-emerald" size={24} />
          <div>
            <h2 className="font-mono text-2xl font-extrabold text-white uppercase">
              {t("panel_bi_report", language)}
            </h2>
            <span className="text-xs font-mono text-slate-400 uppercase">
              {isAr ? "محرك تقارير الاستخبارات المالية المتكاملة" : "Consolidated Session Report Builder"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={triggerPrint}
            disabled={!hasAnySelection}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B0E14] border border-[#1E293B] hover:border-terminal-emerald text-slate-200 font-mono text-xs font-bold rounded-sm disabled:opacity-40 cursor-pointer transition-colors uppercase"
          >
            <Printer size={13} />
            <span>{isAr ? "طباعة التقرير" : "Print Report"}</span>
          </button>

          <button
            onClick={exportPDF}
            disabled={!hasAnySelection || generating}
            className="px-5 py-2 bg-terminal-emerald hover:bg-terminal-emerald-light text-black font-mono text-xs font-black rounded-sm flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 transition-colors uppercase tracking-wider"
          >
            {generating ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>{isAr ? "تحميل التقرير PDF" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 no-print">
        {/* MODULES CHECKLIST SELECTOR (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 bg-[#121721] p-6 rounded-sm border border-[#1E293B] space-y-4 shadow-xl">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-[#1E293B] pb-3">
            {isAr ? "اختر الأقسام المطلوبة للتقرير" : "Select Report Content Modules"}
          </h3>

          <div className="space-y-2">
            {modulesConfig.map((m) => {
              const active = selectedModules.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => m.hasData && toggleModule(m.id)}
                  className={`p-3.5 rounded-sm border flex items-center justify-between transition-all ${
                    !m.hasData 
                      ? "bg-[#0B0E14] border-[#1E293B] opacity-40 cursor-not-allowed text-slate-500" 
                      : active 
                      ? "bg-terminal-emerald-dim border-terminal-border-emerald text-terminal-emerald font-bold cursor-pointer" 
                      : "bg-[#0B0E14] border-[#1E293B] text-slate-300 hover:border-terminal-emerald cursor-pointer"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs uppercase">{m.label}</span>
                    {!m.hasData && (
                      <span className="text-[9px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle size={10} />
                        {isAr ? "لا توجد بيانات — شغل الأداة أولاً" : "No data — run tool first"}
                      </span>
                    )}
                  </div>
                  <CheckSquare size={16} className={active ? "text-terminal-emerald" : "opacity-20"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTRUCTIONAL CALLOUT */}
        <div className="col-span-12 lg:col-span-8 p-4 rounded-sm border border-[#1E293B] bg-[#121721] text-xs font-mono text-slate-300 flex items-center gap-2 shadow-xl">
          <AlertCircle size={15} className="text-terminal-emerald shrink-0" />
          <span>{isAr ? "تلميح: يتم ملء التقرير تلقائيًا بالبيانات التي قمت بحسابها في أدوات النموذج والاستعلامات أعلاه." : "Tip: The report compiles calculations, tables, and graphs from active sessions populated by each tool."}</span>
        </div>
      </div>

      {/* REPORT EXECUTIVE PREVIEW (PRINT AREA) */}
      <div 
        id="bi-report-print-area" 
        className="bg-[#121721] p-10 rounded-sm border border-[#1E293B] space-y-10 text-slate-100 max-w-4xl mx-auto shadow-2xl font-mono"
      >
        {/* REPORT HEADER */}
        <div className="border-b border-[#1E293B] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-mono text-2xl font-extrabold tracking-wider text-white uppercase">
              MAHWAR FINANCIAL INTELLIGENCE REPORT
            </h1>
            <p className="text-[10px] font-mono text-terminal-emerald uppercase tracking-widest mt-1 font-bold">
              Consolidated Corporate Valuation & GCC Synthesis
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <p>{isAr ? "تاريخ الإصدار" : "Report Date"}: {new Date().toLocaleDateString()}</p>
            <p>{isAr ? "الجهة المعدّة" : "Prepared by"}: Antigravity Engine</p>
          </div>
        </div>

        {/* CONDITIONAL SECTIONS */}
        {selectedModules.length === 0 ? (
          <div className="py-20 text-center font-mono text-sm text-slate-500">
            {isAr ? "الرجاء اختيار وحدة واحدة على الأقل من القائمة لبناء التقرير." : "Please select active data modules to render the report preview."}
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. DCF MODEL SECTION */}
            {isDcfActive && dcfData && (
              <div className="space-y-4 border-b border-[#1E293B] pb-8">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>1. {isAr ? "تحليل تقييم التدفقات النقدية المخصومة" : "Discounted Cash Flow (DCF) Valuation"}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {isAr ? "خلاصة نموذج التقييم وبناء القيمة الجوهرية بناءً على المدخلات المحددة:" : "Valuation highlights detailing intrinsic valuation based on customized model parameters:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block text-[9px]">WACC</span>
                    <span className="text-white font-bold text-sm">{dcfData.outputs.wacc}%</span>
                  </div>
                  <div className="p-3 bg-terminal-emerald-dim border border-terminal-border-emerald rounded-sm">
                    <span className="text-terminal-emerald block text-[9px] font-bold">Intrinsic Value</span>
                    <span className="text-terminal-emerald font-bold text-sm">SAR {dcfData.outputs.intrinsicValuePerShare}</span>
                  </div>
                  <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block text-[9px]">Upside / Downside</span>
                    <span className="text-white font-bold text-sm">{dcfData.outputs.upsidePct}%</span>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-400 bg-[#0B0E14]">
                        <th className="p-2">Metric</th>
                        {dcfData.outputs.fcfProjections?.map((p: any) => (
                          <th key={p.year} className="text-right p-2">{p.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      <tr>
                        <td className="p-2 font-bold text-white">Revenue (M)</td>
                        {dcfData.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-200">{p.revenue.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-300">EBITDA (M)</td>
                        {dcfData.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-300">{p.ebitda.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="bg-terminal-emerald-dim font-bold text-terminal-emerald">
                        <td className="p-2">Free Cash Flow (FCF)</td>
                        {dcfData.outputs.fcfProjections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold">{p.fcf.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. LBO MODEL SECTION */}
            {isLboActive && lboData && (
              <div className="space-y-4 border-b border-[#1E293B] pb-8">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>2. {isAr ? "تحليل صفقات الاستحواذ المدعوم بالديون" : "Leveraged Buyout (LBO) Transaction Model"}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {isAr ? "تحليلات عائد الاستثمار، وحصص الديون، ومعدل العائد الداخلي المخطط:" : "Equity waterfall analysis, debt returns repayment, and exit returns mapping:"}
                </p>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center py-2">
                  <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block text-[9px]">Sponsor Equity Required</span>
                    <span className="text-white font-bold text-sm">SAR {lboData.outputs.sponsorEquity.toLocaleString()}M</span>
                  </div>
                  <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block text-[9px]">MOIC Multiple</span>
                    <span className="text-white font-bold text-sm">{lboData.outputs.moic}x</span>
                  </div>
                  <div className="p-3 bg-terminal-emerald-dim border border-terminal-border-emerald rounded-sm">
                    <span className="text-terminal-emerald block text-[9px] font-bold">Projected IRR</span>
                    <span className="text-terminal-emerald font-bold text-sm">{lboData.outputs.irr}%</span>
                  </div>
                </div>

                <div className="h-[200px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lboData.outputs.irrData}>
                      <XAxis dataKey="year" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Bar dataKey="irr" fill="#00FF9D" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3. THREE STATEMENT PROJECTIONS */}
            {isThreeStatementActive && threeStatementData && (
              <div className="space-y-4 border-b border-[#1E293B] pb-8">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>3. {isAr ? "التوقعات المالية المتكاملة للقوائم الثلاث" : "3-Statement Projections Summary"}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {isAr ? "توقعات القوائم الثلاث (الأرباح والخسائر، الميزانية، التدفقات) لـ 5 سنوات قادمة:" : "5-year linked model outputs for income statement and corporate items:"}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-400 bg-[#0B0E14]">
                        <th className="p-2">Line Item (M)</th>
                        {threeStatementData.outputs.projections?.map((p: any) => (
                          <th key={p.year} className="text-right p-2">{p.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      <tr className="bg-terminal-emerald-dim font-bold text-terminal-emerald">
                        <td className="p-2">Revenue</td>
                        {threeStatementData.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold text-terminal-emerald">{p.rev.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-300">EBITDA</td>
                        {threeStatementData.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-slate-300">{p.ebitda.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-400">Zakat or Tax</td>
                        {threeStatementData.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 text-rose-400">-{p.zakatOrTax.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="font-bold bg-[#0B0E14] text-white">
                        <td className="p-2">Net Income</td>
                        {threeStatementData.outputs.projections?.map((p: any) => (
                          <td key={p.year} className="text-right p-2 font-bold text-white">{p.netIncome.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. SHARIAH SCREENING */}
            {isShariahActive && shariahData && (
              <div className="space-y-4 border-b border-[#1E293B] pb-8">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>4. {isAr ? "فحص التوافق مع الشريعة الإسلامية" : "AAOIFI Shariah Compliance Audit"}</span>
                </h3>
                
                <div className="flex items-center justify-between p-4 bg-terminal-emerald-dim border border-terminal-border-emerald rounded-sm">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Compliance Verdict</span>
                    <span className="font-mono text-sm font-bold text-terminal-emerald">{shariahData.outputs.verdict}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Purification Fee / Share</span>
                    <span className="font-mono text-sm font-bold text-white">SAR {shariahData.outputs.purificationPerShare}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center font-mono text-[10px] pt-2">
                  <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block">Debt Ratio</span>
                    <span className="text-white font-bold">{shariahData.outputs.debtRatio}% / 33%</span>
                  </div>
                  <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block">Interest Ratio</span>
                    <span className="text-white font-bold">{shariahData.outputs.interestRatio}% / 5%</span>
                  </div>
                  <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded-sm">
                    <span className="text-slate-400 block">Receivables Ratio</span>
                    <span className="text-white font-bold">{shariahData.outputs.receivablesRatio}% / 49%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COMPANY COMPARATOR */}
            {isComparatorActive && comparatorData && (
              <div className="space-y-4 border-b border-[#1E293B] pb-8">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>5. {isAr ? "مقارنة الشركات المحددة ومصفوفة الأداء" : "Company Peer Comparator Matrix"}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {isAr ? "جدول مقارنة الشركات والصفقات المدخلة يدوياً:" : "Comparison breakdown of custom companies entered during the session:"}
                </p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-400 bg-[#0B0E14]">
                        <th className="p-2">Ticker</th>
                        <th className="p-2">Company</th>
                        <th className="p-2">Sector</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">PE</th>
                        <th className="p-2 text-right">Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {comparatorData.rows.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-terminal-emerald">{row.ticker}</td>
                          <td className="p-2 text-slate-200">{isAr ? row.nameAr : row.name}</td>
                          <td className="p-2 text-slate-400">{row.sector}</td>
                          <td className="p-2 text-right text-white font-bold">SAR {row.price}</td>
                          <td className="p-2 text-right text-slate-300">{row.pe}x</td>
                          <td className="p-2 text-right text-terminal-emerald font-bold">{row.divYield}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. AI RESEARCH MEMO */}
            {isResearchMemoActive && researchMemoData && (
              <div className="space-y-4 pb-4">
                <h3 className="font-mono text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-terminal-emerald">◎</span>
                  <span>6. {isAr ? "مذكرة أبحاث الملكية الفكرية بالذكاء الاصطناعي" : "AI Equity Research Memo"}</span>
                </h3>
                <div className="p-6 rounded-sm bg-[#0B0E14] border border-[#1E293B] font-mono text-slate-200 leading-relaxed text-xs">
                  <div className="prose prose-invert max-w-none prose-headings:font-mono prose-headings:text-white prose-headings:font-bold prose-h1:text-sm prose-h2:text-xs prose-p:text-[11px] prose-li:text-[11px] prose-strong:text-terminal-emerald">
                    <ReactMarkdown>{researchMemoData.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* REPORT FOOTER */}
        <div className="border-t border-[#1E293B] pt-6 text-center font-mono text-[9px] text-slate-500">
          <p>© {new Date().getFullYear()} Mahwar Investment Suite. Developed by Muhammad Sarmad Nadeem.</p>
          <p className="mt-1 font-bold text-slate-400 uppercase tracking-widest">CONFIDENTIAL | FOR GCC CAPITAL MARKETS COMPLIANCE REVIEW</p>
        </div>
      </div>
    </motion.div>
  );
}
