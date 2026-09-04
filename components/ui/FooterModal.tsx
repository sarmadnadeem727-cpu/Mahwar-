"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Globe, BarChart2, BookOpen, Shield, ScrollText, BadgeCheck, 
  Sparkles, Layers, FileSpreadsheet, CheckCircle2, Lock, FileText, ChevronRight
} from "lucide-react";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

const FooterModal = ({ isOpen, onClose, type }: FooterModalProps) => {
  const { language, setPanel } = useTerminalStore();
  const isAr = language === "ar";

  const renderContent = () => {
    const key = type.toLowerCase();

    if (key.includes("privacy") || key.includes("خصوصية")) {
      return (
        <div className="space-y-6 text-slate-700">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="p-2.5 rounded-xl bg-emerald-dim text-emerald border border-emerald-border">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {isAr ? "سياسة الخصوصية وحماية البيانات" : "Privacy & Data Governance Policy"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? "معايير الأمن والسرية للبيانات المالية السيادية" : "SAMA & GCC Institutional Security Compliance Standard"}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed font-sans">
            <p className="text-sm font-medium text-slate-800">
              {isAr
                ? "في منصة محور، نلتزم بأعلى معايير السرية والأمان لبيانات أبحاثك وصيغ النمذجة المالية الخاصة بمؤسستك."
                : "At Mahwar Sovereign Terminal, we prioritize the utmost confidentiality, data integrity, and security for your quantitative research and custom deal modeling."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                  <Lock size={14} />
                  <span>{isAr ? "1. التشفير الكامل" : "1. End-to-End Encryption"}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "تشفير جميع المدخلات ومذكرات التقييم ومفاتيح API محلياً ومشفرة أثناء النقل (TLS 1.3) وفي حالة السكون."
                    : "All model inputs, custom valuation parameters, and research memos are encrypted in transit (TLS 1.3) and at rest."}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                  <CheckCircle2 size={14} />
                  <span>{isAr ? "2. عدم مشاركة البيانات" : "2. Zero Data Exposure"}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "لا يتم بيع أو مشاركة سيناريوهات الاستحواذ الخاصة بك أو مدخلات التدفقات مع أي طرف ثالث أو منافس."
                    : "We strictly do not share, sell, or commercialize your deal modeling scenarios, proprietary inputs, or research query history."}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                  <Shield size={14} />
                  <span>{isAr ? "3. الامتثال التنظيمي" : "3. Regulatory Standards"}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "تطبيق ضوابط الأمن السايبراني الصادرة عن هيئة السوق المالية والبنك المركزي السعودي (SAMA)."
                    : "Full alignment with SAMA Cybersecurity Framework & Saudi Capital Market Authority data handling requirements."}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                  <BookOpen size={14} />
                  <span>{isAr ? "4. حفظ الجلسة المستقل" : "4. Local Session Isolation"}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "يتم حفظ النماذج والتحليلات داخل بيئة العميل المحلية مع خيار التصدير الفوري وإغلاق الجلسة بشكل آمن."
                    : "Saved valuation sessions reside securely within client-side encrypted state with immediate purge options."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (key.includes("terms") || key.includes("شروط")) {
      return (
        <div className="space-y-6 text-slate-700">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="p-2.5 rounded-xl bg-emerald-dim text-emerald border border-emerald-border">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {isAr ? "شروط الخدمة والترخيص الاستخدام" : "Institutional Terms of Service"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? "اتفاقية الاستخدام لمحطة محور السيادية v2.5" : "Master Sovereign Workbench License & Terms v2.5"}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed font-sans">
            <p className="text-sm font-medium text-slate-800">
              {isAr
                ? "باستخدام منصة محور، توافق المؤسسة والمحلل المالي على الالتزام بالشروط والسياسات التالية:"
                : "By accessing or using Mahwar Sovereign Terminal, you and your organization agree to the following terms:"}
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                <h4 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                  {isAr ? "1. استخدام البيانات وتغطية الأسواق" : "1. Market Data & Professional Use"}
                </h4>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "البيانات المالية ومؤشرات أسواق الخليج (تداول، دبي، أبوظبي، قطر، الكويت) مخصصة للتحليل المالي الداخلي والنمذجة الكمية للشركات والصفقات."
                    : "Real-time & historical GCC capital market feeds (Tadawul, DFM, ADX, QSE, Boursa Kuwait) are supplied for authorized valuation and research analysis."}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                <h4 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                  {isAr ? "2. التقييمات والمسؤولية المالية" : "2. Quantitative Valuation Disclaimer"}
                </h4>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "نماذج التدفقات (DCF) والاستحواذ (LBO) والقوائم المالية هي أدوات مساعدة لصناع القرار والمحللين. لا تعتبر النماذج توصية استثمارية مباشرة."
                    : "DCF valuations, LBO return matrices, and AI research memos serve as quantitative analytical tools. Users remain responsible for ultimate deal decisions."}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                <h4 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                  {isAr ? "3. الفحص الشرعي AAOIFI" : "3. Shariah Audit Methodology"}
                </h4>
                <p className="text-slate-600 text-[11px]">
                  {isAr
                    ? "تستند مؤشرات الفحص الشرعي وتنقية الأرباح إلى المعيار الشرعي رقم 21 الصادر عن هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI)."
                    : "Shariah compliance screenings and purification metrics strictly compute against AAOIFI Standard No. 21 quantitative thresholds."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (key.includes("licens") || key.includes("تراخيص")) {
      return (
        <div className="space-y-6 text-slate-700 text-center py-2">
          <div className="w-14 h-14 bg-emerald-dim border border-emerald-border rounded-2xl flex items-center justify-center mx-auto text-emerald">
            <BadgeCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              {isAr ? "ترخيص المنصة المؤسسية" : "Sovereign Enterprise License"}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {isAr ? "مسجلة ومحمية للمؤسسات والشركات الاستثمارية" : "Certified Workspace License & Intellectual Property Rights"}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            {isAr
              ? "منصة محور مسجلة ومحمية بموجب قوانين الملكية الفكرية والأنظمة المالية في المملكة العربية السعودية ودول مجلس التعاون الخليجي."
              : "Mahwar is a registered financial intelligence system protected under Saudi Intellectual Property Authority laws and GCC financial software regulations."}
          </p>

          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl font-mono text-xs max-w-sm mx-auto space-y-2">
            <div className="flex justify-between text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              <span>{isAr ? "معرف الترخيص النشط" : "ACTIVE LICENSE ID"}</span>
              <span className="text-emerald">VERIFIED</span>
            </div>
            <div className="text-slate-900 font-bold text-sm">
              2026-MAHWAR-SOVEREIGN-ENT
            </div>
            <div className="text-[10px] text-slate-500">
              {isAr ? "المرخص له: المؤسسات المالية والشركات" : "Authorized User: Sovereign Capital Workbench"}
            </div>
          </div>
        </div>
      );
    }

    if (key.includes("docu") || key.includes("وثائق")) {
      return (
        <div className="space-y-6 text-slate-700">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="p-2.5 rounded-xl bg-emerald-dim text-emerald border border-emerald-border">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {isAr ? "دليل أدوات المنصة والنمذجة" : "Terminal Documentation & Module Guide"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? "شرح كامل لأدوات النمذجة والتحليل الكمي" : "Complete reference for sovereign analytical engines"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "hub" as PanelType, title: isAr ? "مركز الاستخبارات" : "Intelligence Hub", tag: "HUB" },
              { id: "news" as PanelType, title: isAr ? "الأخبار المباشرة" : "Financial News Wire", tag: "NEWS" },
              { id: "screener" as PanelType, title: isAr ? "مقارنة الشركات" : "Company Comparator", tag: "COMPARE" },
              { id: "bi_report" as PanelType, title: isAr ? "تقارير ذكاء الأعمال" : "BI Report Engine", tag: "REPORTS" },
              { id: "DCF" as PanelType, title: isAr ? "نموذج DCF 5 سنوات" : "DCF Valuation Engine", tag: "VALUATION" },
              { id: "LBO" as PanelType, title: isAr ? "باني صفقات LBO" : "LBO Deal Builder", tag: "PRIVATE EQ" },
              { id: "FS" as PanelType, title: isAr ? "القوائم المالية الثلاث" : "3-Statement Model", tag: "ACCOUNTING" },
              { id: "shariah" as PanelType, title: isAr ? "الفحص الشرعي AAOIFI" : "Shariah Screening", tag: "COMPLIANCE" },
            ].map((mod) => (
              <div
                key={mod.id}
                onClick={() => {
                  setPanel(mod.id);
                  onClose();
                }}
                className="p-3 bg-slate-50 border border-[#E2E8F0] hover:border-emerald rounded-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold text-emerald tracking-wider uppercase">
                    {mod.tag}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald transition-colors mt-0.5">
                    {mod.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-emerald pt-2 mt-2 border-t border-[#E2E8F0]/60">
                  <span>{isAr ? "تشغيل" : "Launch"}</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (key.includes("indices") || key.includes("مؤشرات")) {
      return (
        <div className="space-y-6 text-slate-700">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
            <div className="p-2.5 rounded-xl bg-emerald-dim text-emerald border border-emerald-border">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {isAr ? "المؤشرات المالية العالمية والخليجية" : "Global & GCC Market Indices"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? "تتبع المؤشرات الرئيسية والنفط في الوقت الفعلي" : "Real-time tracking of regional bourses & global benchmarks"}
              </p>
            </div>
          </div>

          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-[#E2E8F0] text-[10px] uppercase font-bold">
                  <th className="p-3">{isAr ? "المؤشر" : "Index / Commodity"}</th>
                  <th className="p-3">{isAr ? "السوق" : "Bourse"}</th>
                  <th className="p-3">{isAr ? "القيمة" : "Value"}</th>
                  <th className="p-3">{isAr ? "التغير" : "Change"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {[
                  { name: "TASI Benchmark", market: "Saudi Arabia", val: "12,180.40", chg: "+0.65%", up: true },
                  { name: "DFM General Index", market: "Dubai", val: "4,720.15", chg: "+1.12%", up: true },
                  { name: "ADX General Index", market: "Abu Dhabi", val: "9,340.80", chg: "-0.18%", up: false },
                  { name: "QSE Index", market: "Qatar", val: "10,210.50", chg: "+0.42%", up: true },
                  { name: "Brent Crude Oil", market: "Commodity", val: "$78.45", chg: "+0.85%", up: true },
                  { name: "S&P 500 Index", market: "US Market", val: "5,842.20", chg: "+0.45%", up: true },
                ].map((idx, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-900 font-bold">{idx.name}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{idx.market}</td>
                    <td className="p-3 text-slate-800">{idx.val}</td>
                    <td className={`p-3 font-bold ${idx.up ? "text-emerald font-bold" : "text-rose-600"}`}>
                      {idx.chg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="py-16 text-center text-slate-500 font-mono text-xs italic">
        {isAr ? "المحتوى قيد التحديث..." : "Content under refinement..."}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 selection:bg-emerald selection:text-white">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`
              relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden z-10 font-sans
              ${isAr ? 'font-arabic' : ''}
            `}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-slate-100 border border-[#E2E8F0] rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Body */}
            <div className="relative z-10 max-h-[75vh] overflow-y-auto pr-1">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FooterModal;

