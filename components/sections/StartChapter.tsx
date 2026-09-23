"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTerminalStore, CURRENCIES, LANGUAGES } from "@/store/useTerminalStore";
import { ENGINES, toolsBySuite } from "@/lib/registry";
import { reveal, viewportOnce } from "@/lib/motion";

/** START — the closing chapter: real stats, one sentence, one CTA. No account language anywhere. */
export default function StartChapter() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const gccCurrencies = CURRENCIES.filter((c) => c !== "USD");

  const stats = [
    { v: ENGINES.length, k: isAr ? "محركاً" : "engines" },
    { v: toolsBySuite("finance").length, k: isAr ? "مالية" : "finance" },
    { v: toolsBySuite("operations").length, k: isAr ? "سلاسل إمداد" : "supply chain" },
    { v: gccCurrencies.length, k: isAr ? "عملات خليجية" : "GCC currencies" },
    { v: LANGUAGES.length, k: isAr ? "لغتان · RTL" : "languages · RTL" },
  ];

  return (
    <section id="start" data-chapter="start" className="relative min-h-[80svh] flex items-center py-28 overflow-hidden bg-ink-0 border-t border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" aria-hidden="true" />
      <div className="absolute inset-0 vignette" />
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative w-full max-w-4xl mx-auto px-6 text-center"
      >
        <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">07 · {isAr ? "ابدأ" : "Start"}</p>
        <dl className="mt-8 grid grid-cols-3 sm:grid-cols-5 gap-6">
          {stats.map((s) => (
            <div key={s.k}>
              <dt className="font-mono text-3xl text-fg num">{s.v}</dt>
              <dd className="mt-1 text-[11px] text-fg-3">{s.k}</dd>
            </div>
          ))}
        </dl>
        <h2 className={`mt-12 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
          {isAr ? "المحطة جاهزة. افتحها وابدأ الحساب." : "The terminal is ready. Open it and start computing."}
        </h2>
        <p className="mt-5 text-fg-2 leading-relaxed max-w-xl mx-auto">
          {isAr
            ? "افتح أي محرك، أدخل أرقامك، صدّر التقرير. كل شيء يعمل في متصفحك ولا شيء يُرسل إلى خادم."
            : "Open any engine, enter your numbers, export the report. Everything runs in your browser; nothing is sent to a server."}
        </p>
        <div className="mt-10">
          <Link href="/dashboard" className="btn-primary px-8 py-4 text-[12px]">
            {isAr ? "ادخل إلى المحطة" : "Enter the terminal"}
            <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
