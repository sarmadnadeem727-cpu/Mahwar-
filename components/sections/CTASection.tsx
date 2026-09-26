"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import FlowField from "@/components/ui/FlowField";
import { reveal, viewportOnce } from "@/lib/motion";

export default function CTASection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  return (
    <section className="relative py-32 overflow-hidden bg-ink-0 border-t border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 opacity-70">
        <FlowField density={0.6} />
      </div>
      <div className="absolute inset-0 vignette" />
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative max-w-3xl mx-auto px-6 text-center"
      >
        <div className="inline-flex items-center gap-2 font-mono text-sm text-fg-2" dir="ltr">
          <span className="text-emerald-light">{">"}</span>
          <span>mahwar</span>
          <span className="text-gold">GO</span>
          <span className="w-[8px] h-[16px] bg-emerald-light animate-blink inline-block" />
        </div>
        <h2 className={`mt-6 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
          {isAr ? "المحطة جاهزة. لا حساب مطلوب." : "The terminal is ready. No account needed."}
        </h2>
        <p className="mt-5 text-fg-2 leading-relaxed">
          {isAr
            ? "افتح أي محرك، أدخل أرقامك، صدّر التقرير. كل شيء يعمل في متصفحك."
            : "Open any engine, enter your numbers, export the report. Everything runs in your browser."}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-[14px] apple-touch-target shadow-[0_4px_20px_rgba(28,139,108,0.4)]">
            {isAr ? "ادخل إلى المحطة" : "Enter the terminal"}
          </Link>
          <Link href="/dashboard?panel=screener" className="btn-secondary px-7 py-3.5 text-[14px] apple-touch-target">
            {isAr ? "افتح فاحص الأسهم" : "Open the stock screener"}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

