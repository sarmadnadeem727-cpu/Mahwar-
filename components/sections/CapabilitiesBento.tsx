"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Languages, ShieldCheck, FileOutput, Terminal, Database, 
  Calculator, CheckCircle2, ArrowRight, Activity 
} from "lucide-react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";
import { reveal, viewportOnce } from "@/lib/motion";
import { computeZ } from "@/lib/finance/zscore";

export default function CapabilitiesBento() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  // Live Altman Z-Score calculation demonstrating real numbers in the formula trace
  const liveZ = useMemo(() => {
    return computeZ({
      model: "public",
      workingCapital: 420,
      retainedEarnings: 1180,
      ebit: 610,
      equityValue: 5400,
      totalLiabilities: 2900,
      sales: 4200,
      totalAssets: 6100,
    });
  }, []);

  const otherCommitments = [
    {
      icon: ShieldCheck,
      en: "GCC Accounting",
      ar: "محاسبة خليجية",
      descEn: "Zakat 2.5% base, no tax shield, IFRS / Saudi GAAP, AAOIFI 21.",
      descAr: "زكاة 2.5٪ دون درع ضريبي، ومعايير سعودية وIFRS، وأيوفي 21.",
    },
    {
      icon: Terminal,
      en: "Command Line",
      ar: "سطر أوامر احترافي",
      descEn: "Type DCF, EOQ or CCC and hit GO. ⌘K opens the palette.",
      descAr: "اكتب DCF أو EOQ أو CCC واضغط GO. ⌘K يفتح اللوحة.",
    },
    {
      icon: Languages,
      en: "Bilingual Mirrored",
      ar: "عربي وإنجليزي",
      descEn: "Full RTL typography with Cairo font, bilingual PDF & Excel exports.",
      descAr: "تخطيط RTL كامل وخط Cairo وتصدير ثنائي اللغة متطابق.",
    },
    {
      icon: Database,
      en: "Local Session",
      ar: "حفظ محلي فوري",
      descEn: "Runs client-side in browser WebAssembly. Nothing leaves your machine.",
      descAr: "يعمل محلياً في المتصفح عبر WebAssembly دون إرسال بياناتك للخارج.",
    },
    {
      icon: FileOutput,
      en: "One BI Report",
      ar: "تقرير تنفيذي موحد",
      descEn: "Consolidates all executed analyses into an executive dossier.",
      descAr: "يجمع كل التحليلات المنجزة في تقرير PDF أو Excel تنفيذي موحد.",
    },
  ];

  return (
    <section id="commitments" className="py-24 bg-ink-2/40 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">
            {isAr ? "الالتزامات والشفافية" : "Commitments & Transparency"}
          </p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "كل رقم له مسار تدقيق معلن. البرهان أمامك." : "Every number has an audit trail. See the proof, not just the claim."}
          </h2>
          <p className="mt-4 text-fg-2 text-base leading-relaxed">
            {isAr
              ? "لا توجد حسابات غامضة أو صناديق سوداء. كل محرك يرفق صيغته الرياضية والخطوات الوسيطة والتعويض بالأرقام الفعلية، ليتمكن مدققك من التحقق قبل اعتماد أي قرار."
              : "No black boxes or hidden estimates. Every engine publishes its mathematical formula, intermediate steps, and real numeric substitutions so your auditor can verify before trusting."}
          </p>
        </motion.div>

        {/* HERO LIVE FORMULA-TRACE CONTAINER (SHOW, DON'T TELL) */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 rounded-3xl border border-emerald/30 bg-ink-1 shadow-[0_16px_48px_-16px_rgba(28,139,108,0.25)] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-line bg-ink-2/70 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald-light">
                <Calculator size={18} />
              </div>
              <div>
                <span className="font-bold text-fg block">
                  {isAr ? "سجل التدقيق الحي: مؤشر ألتمان للسلامة المالية (Z-Score)" : "Live Formula Trace: Altman Z-Score Solvency Engine"}
                </span>
                <span className="text-[10px] text-fg-4">
                  {isAr ? "معادلة معتمدة · تعويض بالأرقام الحقيقية لحظياً" : "Certified Equation · Real-time numeric substitution"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald/15 border border-emerald/30 text-emerald-light text-[11px] font-bold">
                <CheckCircle2 size={13} />
                <span>{isAr ? "منطقة آمنة (Z = 2.49)" : "Safe Zone (Z = 2.49)"}</span>
              </span>
              <Link
                href="/dashboard?panel=zscore"
                className="text-fg-3 hover:text-fg text-xs flex items-center gap-1 transition-colors"
              >
                <span>{isAr ? "افتح المحرك" : "Open Engine"}</span>
                <ArrowRight size={12} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
          </div>

          {/* Trace Body */}
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {liveZ.components.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-ink-2/60 border border-line/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-fg-3">
                    <span className="truncate">{c.name.split(" / ")[0]}</span>
                    <span className="text-emerald-light font-bold">w = {c.weight}</span>
                  </div>
                  <div className="text-xs text-fg font-bold">
                    Ratio = {c.ratio.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-fg-3 pt-1 border-t border-line/40 flex justify-between">
                    <span>{c.weight} × {c.ratio.toFixed(3)}</span>
                    <span className="text-fg font-bold text-emerald-light">= +{c.contribution.toFixed(3)}</span>
                  </div>
                </div>
              ))}

              {/* Total Calculation Tile */}
              <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/30 space-y-2 md:col-span-2 lg:col-span-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-emerald">
                  <span className="font-bold">{isAr ? "حاصل المعادلة النهائية" : "Net Score Aggregate"}</span>
                  <Activity size={14} className="text-emerald-light animate-pulse" />
                </div>
                <div className="text-2xl font-serif text-fg">
                  Z = {liveZ.z.toFixed(2)}
                </div>
                <div className="text-[10px] text-fg-3 pt-1 border-t border-emerald/20 flex justify-between">
                  <span>{isAr ? "احتمال التعثر لسنة واحدة" : "1-Yr Default Prob."}</span>
                  <span className="font-bold text-emerald-light">{(liveZ.impliedPd * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Substitution Summary Line */}
            <div className="p-4 rounded-xl bg-ink-3/80 border border-line font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-fg-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-light font-bold">Z =</span>
                <span className="text-fg-3">
                  0.083 + 0.271 + 0.330 + 1.117 + 0.688 = <strong className="text-fg">2.49</strong>
                </span>
              </div>
              <span className="text-[10px] text-fg-4 italic font-sans">
                {isAr ? "مضمون بنسبة 100٪ بدون افتراضات تقديرية غير معلنة" : "100% mathematically disclosed · Zero unverified black-box estimates"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* COMPACT FOOTER STRIP FOR THE OTHER 5 COMMITMENTS */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono"
        >
          {otherCommitments.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.en}
                className="p-4 rounded-2xl bg-ink-2/70 border border-line/60 hover:border-line-strong transition-all flex flex-col justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-emerald-light">
                  <Icon size={16} />
                  <span className="text-xs font-bold text-fg tracking-tight">{isAr ? c.ar : c.en}</span>
                </div>
                <p className="text-[11.5px] font-sans text-fg-3 leading-snug">
                  {isAr ? c.descAr : c.descEn}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
