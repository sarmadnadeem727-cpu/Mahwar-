"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { TOOLS, toolsBySuite } from "@/lib/registry";
import { reveal, viewportOnce } from "@/lib/motion";

/** Ticker strip of every function code the GO line understands. */
export function EngineTape() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const items = [...TOOLS, ...TOOLS];
  return (
    <div className="relative border-y border-line bg-ink-2/60 overflow-hidden" dir="ltr" aria-hidden="true">
      <div className={`flex w-max whitespace-nowrap py-3 ${isAr ? "animate-marquee-rtl" : "animate-marquee"} hover:[animation-play-state:paused]`}>
        {items.map((tool, i) => (
          <span key={`${tool.id}-${i}`} className="flex items-center gap-3 px-6 font-mono text-[11px] tracking-wider">
            <span className="text-emerald-light">{tool.code}</span>
            <span className="text-fg-3">{isAr ? tool.ar : tool.en}</span>
            <span className="text-ink-5">/</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-1 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-1 to-transparent" />
    </div>
  );
}

/**
 * The thesis: a supply-chain decision is a finance decision.
 * Left column = finance engines, right column = operations engines,
 * with the cash-conversion cycle as the physical bridge in the middle.
 */
export default function ThesisSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const finance = toolsBySuite("finance");
  const ops = toolsBySuite("operations");

  const bridge = [
    { en: "Inventory days", ar: "أيام المخزون", code: "DIO", side: "ops" },
    { en: "Receivable days", ar: "أيام التحصيل", code: "DSO", side: "ops" },
    { en: "Payable days", ar: "أيام السداد", code: "DPO", side: "ops" },
    { en: "Cash conversion cycle", ar: "دورة التحويل النقدي", code: "CCC", side: "both" },
    { en: "Working-capital cost", ar: "تكلفة رأس المال العامل", code: "WCF", side: "fin" },
    { en: "Free cash flow", ar: "التدفق النقدي الحر", code: "DCF", side: "fin" },
  ];

  return (
    <section id="thesis" className="relative py-28 bg-ink-1 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "الفكرة" : "The idea"}</p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr
              ? "كل قرار في سلسلة الإمداد هو قرار مالي. لذلك تعيش المحركات معاً."
              : "Every supply-chain decision is a financing decision. So the engines live together."}
          </h2>
          <p className="mt-6 text-fg-2 text-base sm:text-lg leading-relaxed max-w-2xl">
            {isAr
              ? "حجم الطلب الأمثل يحدد المخزون، والمخزون يحدد أيام التحويل النقدي، والدورة النقدية تحدد كم تدفع للبنك. تجعل محور هذه السلسلة مرئية: نتيجة أداة العمليات تصبح مدخلاً لأداة التمويل."
              : "An order quantity sets inventory, inventory sets days-in-cycle, and the cycle sets what you pay the bank. Mahwar makes that chain visible: the output of an operations tool is an input to a finance tool."}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-start">
          {/* Finance column */}
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="panel-data p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-2xl text-fg">{isAr ? "المالية" : "Finance"}</h3>
              <span className="font-mono text-[11px] text-fg-3">{finance.length} {isAr ? "محركات" : "engines"}</span>
            </div>
            <ul className="mt-5 divide-y divide-line">
              {finance.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center gap-3">
                  <span className="font-mono text-[10px] w-12 text-emerald-light">{t.code}</span>
                  <span className="text-sm text-fg-2">{isAr ? t.ar : t.en}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Bridge */}
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative self-stretch flex flex-col justify-center lg:px-2"
            aria-label={isAr ? "الجسر بين العمليات والمالية" : "Bridge between operations and finance"}
          >
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald/50 to-transparent" />
            <ol className="relative flex lg:flex-col flex-wrap justify-center gap-2 lg:gap-3">
              {bridge.map((b, i) => (
                <li
                  key={b.code}
                  className={`relative flex items-center gap-3 rounded-xl border px-4 py-2.5 bg-ink-2/90 backdrop-blur-md transition-transform hover:scale-[1.02] ${
                    b.side === "both"
                      ? "border-emerald/50 bg-emerald/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_16px_rgba(28,139,108,0.25)]"
                      : "border-line shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  }`}
                >
                  <span className={`font-mono text-[11px] font-semibold ${b.side === "both" ? "text-emerald-light" : "text-gold"}`}>{b.code}</span>
                  <span className="text-[12.5px] font-medium text-fg-2">{isAr ? b.ar : b.en}</span>
                  {i < bridge.length - 1 && <span className="hidden lg:block absolute left-1/2 -bottom-3 w-px h-3 bg-emerald/40" />}
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Operations column */}
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="panel-data p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-2xl text-fg">{isAr ? "سلاسل الإمداد" : "Supply chain"}</h3>
              <span className="font-mono text-[11px] text-fg-3">{ops.length} {isAr ? "محركات" : "engines"}</span>
            </div>
            <ul className="mt-5 divide-y divide-line">
              {ops.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center gap-3">
                  <span className="font-mono text-[10px] w-12 text-gold">{t.code}</span>
                  <span className="text-sm text-fg-2">{isAr ? t.ar : t.en}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link href="/features" className="btn-ghost text-[12px]">
            {isAr ? "استعرض النصفين: المالية وسلاسل الإمداد" : "See both halves: finance and supply chain"}
            <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </Link>
          <Link href="/dashboard?panel=ccc" className="btn-ghost text-[12px]">
            {isAr ? "ابدأ من دورة التحويل النقدي" : "Start from the cash conversion cycle"}
            <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>
      </div>
    </section>
  );
}

