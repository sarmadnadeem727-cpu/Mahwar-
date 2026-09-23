"use client";

import React from "react";
import { motion } from "framer-motion";
import { Languages, ShieldCheck, FileOutput, Terminal, HardDrive, Calculator } from "lucide-react";
import { useTerminalStore, LANGUAGES } from "@/store/useTerminalStore";
import { ZAKAT_RATE_LABEL, AAOIFI_RECEIVABLES_MAX_PCT } from "@/lib/constants";
import { reveal, staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

/**
 * TRUST — light-inverted. Six commitments, each under fifteen words, stated
 * as a grid rather than prose. The local-first line is unambiguous: there is
 * no account and nothing is ever synced to a server.
 */
export default function TrustChapter() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const cells = [
    {
      icon: Calculator,
      en: "Every number has an audit trail",
      ar: "لكل رقم سجل تدقيق",
      descEn: "Each engine shows its inputs, intermediate steps and the equation used.",
      descAr: "كل محرك يعرض مدخلاته وخطواته الوسيطة والمعادلة المستخدمة.",
    },
    {
      icon: ShieldCheck,
      en: "GCC accounting, not a US template",
      ar: "محاسبة خليجية لا قالباً أمريكياً",
      descEn: `Zakat at ${ZAKAT_RATE_LABEL} with no tax shield, IFRS / Saudi GAAP, AAOIFI ${AAOIFI_RECEIVABLES_MAX_PCT}% screens.`,
      descAr: `زكاة ${ZAKAT_RATE_LABEL} دون درع ضريبي، IFRS / المعايير السعودية، فحص أيوفي ${AAOIFI_RECEIVABLES_MAX_PCT}٪.`,
    },
    {
      icon: Terminal,
      en: "A command line, like the pros use",
      ar: "سطر أوامر كما يستخدمه المحترفون",
      descEn: "Type DCF, EOQ or CCC and press GO. ⌘K opens the palette.",
      descAr: "اكتب DCF أو EOQ أو CCC واضغط GO. ⌘K يفتح اللوحة.",
    },
    {
      icon: Languages,
      en: "Arabic and English, mirrored",
      ar: "عربي وإنجليزي بواجهة معكوسة",
      descEn: `${LANGUAGES.length} languages, full RTL layout, bilingual exports.`,
      descAr: `لغتان، تخطيط RTL كامل، وتصدير ثنائي اللغة.`,
    },
    {
      icon: HardDrive,
      en: "No account. Nothing leaves your browser.",
      ar: "بلا حساب. لا شيء يغادر متصفحك.",
      descEn: "Analyses live in this browser's local storage only. There is no server sync, ever.",
      descAr: "التحليلات تُحفظ في تخزين هذا المتصفح فقط. لا مزامنة مع أي خادم، أبداً.",
    },
    {
      icon: FileOutput,
      en: "One report from everything",
      ar: "تقرير واحد من كل شيء",
      descEn: "The BI engine consolidates every saved analysis into PDF or Excel.",
      descAr: "محرك التقارير يجمع كل تحليل محفوظ في PDF أو Excel.",
    },
  ];

  return (
    <section id="trust" data-chapter="trust" className="section-light py-24 lg:py-32 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">05 · {isAr ? "الالتزامات" : "Trust"}</p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "ما يجعل المحطة جديرة بالثقة." : "What makes the terminal worth trusting."}
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {cells.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.en} variants={staggerItem} className="panel-data p-6 flex flex-col gap-4">
                <Icon size={18} className="text-emerald-light" />
                <h3 className="font-serif text-2xl text-fg leading-tight">{isAr ? c.ar : c.en}</h3>
                <p className="text-[13.5px] text-fg-2 leading-relaxed">{isAr ? c.descAr : c.descEn}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
