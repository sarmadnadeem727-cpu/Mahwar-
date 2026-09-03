"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Lock, CheckCircle2, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">
              {isAr ? "سياسة الخصوصية وحماية البيانات" : "Privacy & Data Governance Policy"}
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
              {isAr ? "تطبيق معايير الأمن السايبراني وحماية سرية بيانات التحليل المالي" : "SAMA & GCC Institutional Data Governance Standard v2.5"}
            </p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed font-sans">
          <p className="text-base font-medium text-slate-800">
            {isAr
              ? "في منصة محور السيادية (Mahwar Terminal)، نلتزم بأعلى معايير السرية والأمان لبيانات أبحاثك وصيغ النمذجة المالية الخاصة بمؤسستك."
              : "At Mahwar Sovereign Terminal, we prioritize the utmost confidentiality, data integrity, and security for your quantitative financial research and custom deal modeling."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                <Lock size={16} />
                <span>{isAr ? "1. التشفير الكامل" : "1. End-to-End Encryption"}</span>
              </div>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "تشفير جميع المدخلات ومذكرات التقييم ومفاتيح API محلياً ومشفرة أثناء النقل (TLS 1.3) وفي حالة السكون."
                  : "All model inputs, custom valuation parameters, and research memos are encrypted in transit (TLS 1.3) and at rest."}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                <CheckCircle2 size={16} />
                <span>{isAr ? "2. عدم مشاركة البيانات" : "2. Zero Data Exposure"}</span>
              </div>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "لا يتم بيع أو مشاركة سيناريوهات الاستحواذ الخاصة بك أو مدخلات التدفقات مع أي طرف ثالث أو منافس."
                  : "We strictly do not share, sell, or commercialize your deal modeling scenarios, proprietary inputs, or research query history."}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                <Shield size={16} />
                <span>{isAr ? "3. الامتثال التنظيمي" : "3. Regulatory Standards"}</span>
              </div>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "تطبيق ضوابط الأمن السايبراني الصادرة عن هيئة السوق المالية والبنك المركزي السعودي (SAMA)."
                  : "Full alignment with SAMA Cybersecurity Framework & Saudi Capital Market Authority data handling requirements."}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald font-bold font-mono text-xs">
                <BookOpen size={16} />
                <span>{isAr ? "4. حفظ الجلسة المستقل" : "4. Local Session Isolation"}</span>
              </div>
              <p className="text-slate-600 text-xs">
                {isAr
                  ? "يتم حفظ النماذج والتحليلات داخل بيئة العميل المحلية مع خيار التصدير الفوري وإغلاق الجلسة بشكل آمن."
                  : "Saved valuation sessions reside securely within client-side encrypted state with immediate purge options."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
