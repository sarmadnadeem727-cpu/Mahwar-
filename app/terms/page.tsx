"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScrollText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function TermsPage() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-32 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald hover:underline mb-8 uppercase tracking-wider">
          <ArrowLeft size={14} className="rtl:rotate-180" />
          <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
        </Link>

        <div className="flex items-center gap-4 pb-6 border-b border-[#E2E8F0] mb-8">
          <div className="p-3 bg-emerald-dim border border-emerald-border rounded-xl text-emerald">
            <ScrollText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">
              {isAr ? "شروط الخدمة والترخيص المؤسسي" : "Institutional Terms of Service"}
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
              {isAr ? "اتفاقية الاستخدام لمحطة محور السيادية v2.5" : "Master Sovereign Workbench License & Terms v2.5"}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          <p className="text-base font-medium text-slate-800">
            {isAr
              ? "باستخدام منصة محور، توافق المؤسسة والمحلل المالي على الالتزام بالشروط والسياسات التالية:"
              : "By accessing or using Mahwar Sovereign Terminal, you and your organization agree to the following terms:"}
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                {isAr ? "1. استخدام البيانات وتغطية الأسواق" : "1. Market Data & Professional Use"}
              </h3>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "البيانات المالية ومؤشرات أسواق الخليج (تداول، دبي، أبوظبي، قطر، الكويت) مخصصة للتحليل المالي الداخلي والنمذجة الكمية للشركات والصفقات."
                  : "Real-time & historical GCC capital market feeds (Tadawul, DFM, ADX, QSE, Boursa Kuwait) are supplied for authorized valuation and research analysis."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                {isAr ? "2. التقييمات والمسؤولية المالية" : "2. Quantitative Valuation Disclaimer"}
              </h3>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "نماذج التدفقات (DCF) والاستحواذ (LBO) والقوائم المالية هي أدوات مساعدة لصناع القرار والمحللين. لا تعتبر النماذج توصية استثمارية مباشرة."
                  : "DCF valuations, LBO return matrices, and AI research memos serve as quantitative analytical tools. Users remain responsible for ultimate deal decisions."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
              <h3 className="font-bold text-slate-900 mb-1 font-mono text-xs">
                {isAr ? "3. الفحص الشرعي AAOIFI" : "3. Shariah Audit Methodology"}
              </h3>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "تستند مؤشرات الفحص الشرعي وتنقية الأرباح إلى المعيار الشرعي رقم 21 الصادر عن هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI)."
                  : "Shariah compliance screenings and purification metrics strictly compute against AAOIFI Standard No. 21 quantitative thresholds."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
