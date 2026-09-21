"use client";

import React from "react";
import { motion } from "framer-motion";
import { Languages, ShieldCheck, FileOutput, Terminal, Database, Calculator } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { reveal, staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

/**
 * What makes the terminal trustworthy — six concrete commitments, stated plainly.
 * Sized bento: the two that matter most (audit trail, GCC accounting) get the wide cells.
 */
export default function CapabilitiesBento() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const cells = [
    {
      icon: Calculator, wide: true,
      en: "Every number has an audit trail",
      ar: "لكل رقم سجل تدقيق",
      descEn: "Each engine ships a formula trace: inputs, intermediate steps and the equation used. Open it before you trust a result.",
      descAr: "كل محرك يرفق سجل صيغ: المدخلات والخطوات الوسيطة والمعادلة المستخدمة. افتحه قبل أن تثق بالنتيجة.",
    },
    {
      icon: ShieldCheck, wide: true,
      en: "GCC accounting, not a US template",
      ar: "محاسبة خليجية لا قالباً أمريكياً",
      descEn: "Zakat at 2.5% of the base with no tax shield, IFRS / Saudi GAAP toggles, AAOIFI Standard 21 screens, GCC common tariff in landed cost.",
      descAr: "زكاة 2.5٪ دون درع ضريبي، تبديل بين IFRS والمعايير السعودية، فحص أيوفي 21، والتعرفة الخليجية الموحدة في التكلفة الواصلة.",
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
      descEn: "Full RTL layout, Cairo typography, bilingual exports.",
      descAr: "تخطيط RTL كامل وخط Cairo وتصدير ثنائي اللغة.",
    },
    {
      icon: Database,
      en: "Your session survives a refresh",
      ar: "جلستك تبقى بعد التحديث",
      descEn: "Analyses persist locally in the browser. Nothing leaves your machine unless you export it.",
      descAr: "التحليلات تُحفظ محلياً في المتصفح. لا يغادر شيء جهازك إلا عند التصدير.",
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
    <section className="py-28 bg-ink-2/40 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "الالتزامات" : "Commitments"}</p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "ما يجعل المحطة جديرة بالثقة." : "What makes the terminal worth trusting."}
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {cells.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.en}
                variants={staggerItem}
                className={`panel-data p-6 flex flex-col gap-4 ${c.wide ? "lg:col-span-2" : ""}`}
              >
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

