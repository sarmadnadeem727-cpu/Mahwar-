"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { timeline, addDraw, addRise, stagger, prefersReducedMotion, settle, DURATION } from "@/lib/anime";
import FlowTraces from "@/components/ui/FlowTraces";
import { useTerminalStore, CURRENCIES, LANGUAGES } from "@/store/useTerminalStore";
import { APP, ENGINES, toolsBySuite } from "@/lib/registry";
import { HUBS } from "@/lib/geo/hubs";

const HEADLINE_EN = ["Capital moves.", "Goods move.", "One terminal reads both."];
const HEADLINE_AR = ["رأس المال يتحرك.", "البضائع تتحرك.", "محطة واحدة تقرأ الاثنين."];

/**
 * INTRO — dark, one viewport. Headline, the dual thesis in one line, the CTA,
 * and four live stats. Every number below is `.length` of a real array.
 */
export default function IntroChapter() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const rootRef = useRef<HTMLDivElement>(null);
  const tracesRef = useRef<SVGSVGElement>(null);
  const { scrollY } = useScroll();
  const copyOpacity = useTransform(scrollY, [0, 520], [1, 0]);
  const artY = useTransform(scrollY, [0, 800], [0, 90]);

  const financeCount = toolsBySuite("finance").length;
  const opsCount = toolsBySuite("operations").length;

  useEffect(() => {
    const root = rootRef.current;
    const traces = tracesRef.current;
    if (!root) return;
    if (prefersReducedMotion()) {
      settle(root, ["[data-hero-line]", "[data-hero-rest]"]);
      if (traces) settle(traces, ["[data-trace-node]", "[data-trace-center]", "[data-trace-core]"]);
      return;
    }
    const tl = timeline();
    const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
    const rest = root.querySelectorAll<HTMLElement>("[data-hero-rest]");
    if (traces) addDraw(tl, traces, "[data-trace-axis]", { duration: DURATION.base, position: 0 });
    if (traces) addDraw(tl, traces, "[data-trace-tick]", { duration: DURATION.fast, each: 30, position: "-=600" });
    tl.add(lines, { opacity: [0, 1], translateY: [36, 0], filter: ["blur(8px)", "blur(0px)"], delay: stagger(140), duration: 1100 }, "-=500");
    if (traces) addDraw(tl, traces, "[data-trace-path]", { duration: DURATION.draw, each: 70, from: "center", position: "-=900" });
    addRise(tl, rest, { y: 18, each: 90, position: "-=1400" });
    if (traces) {
      tl.add(traces.querySelectorAll("[data-trace-node]"), { opacity: [0, 1], scale: [0, 1], delay: stagger(40), duration: DURATION.fast }, "-=700");
      tl.add(traces.querySelectorAll("[data-trace-center], [data-trace-core]"), { opacity: [0, 1], duration: DURATION.fast }, "-=300");
    }
    // Entrance only — once drawn, the line-art stays still so it never competes with the chapters below.
    return () => { tl.cancel(); };
  }, [language]);

  const headline = isAr ? HEADLINE_AR : HEADLINE_EN;
  const stats = [
    { v: ENGINES.length, k: isAr ? "محركاً تحليلياً" : "analytics engines" },
    { v: CURRENCIES.length, k: isAr ? "عملات للتقارير" : "reporting currencies" },
    { v: HUBS.length, k: isAr ? "مركزاً خليجياً على الخريطة" : "GCC hubs on the map" },
    { v: LANGUAGES.length, k: isAr ? "لغتان، واجهة معكوسة بالكامل" : "languages, full RTL" },
  ];

  return (
    <section
      id="intro"
      data-chapter="intro"
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-ink-1 grain"
      dir={isAr ? "rtl" : "ltr"}
    >
      <motion.div style={{ y: artY }} className="absolute inset-x-0 top-[8%] h-[48%] hidden lg:block pointer-events-none opacity-[0.5] [mask-image:linear-gradient(180deg,transparent_0%,#000_18%,#000_78%,transparent_100%)]" aria-hidden="true">
        <FlowTraces ref={tracesRef} className="w-full h-full" />
      </motion.div>
      <div className="aurora absolute -top-[30%] left-1/2 -translate-x-1/2 w-[130vw] h-[90vh] pointer-events-none opacity-35" aria-hidden="true" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div ref={rootRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-36 pb-20 lg:pb-24">
        <motion.div style={{ opacity: copyOpacity }} className="max-w-4xl">
          <div data-hero-rest className="opacity-0 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-emerald-light mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald animate-pulse-ring" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-light" />
            </span>
            <span>{APP.name.toUpperCase()} · {APP.nameAr} · v{APP.version}</span>
          </div>

          <h1 className={`font-serif font-medium text-fg text-display-xl ${isAr ? "font-cairo font-bold leading-[1.15]" : ""}`}>
            {headline.map((line, i) => (
              <span key={line} data-hero-line className={`block opacity-0 ${i === 2 ? "text-emerald-light italic" : ""} ${isAr && i === 2 ? "not-italic" : ""}`}>
                {line}
              </span>
            ))}
          </h1>

          <p data-hero-rest className="opacity-0 mt-8 max-w-2xl text-base sm:text-lg text-fg-2 leading-relaxed">
            {isAr
              ? `${financeCount} محركاً مالياً و${opsCount} محركاً لسلاسل الإمداد خلف سطر أوامر واحد — لأن كل قرار في سلسلة الإمداد هو قرار تمويلي.`
              : `${financeCount} financial engines and ${opsCount} supply-chain engines behind one command line — because every supply-chain decision is a financing decision.`}
          </p>

          <div data-hero-rest className="opacity-0 mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-[12px]">
              <span>{isAr ? "ادخل إلى المحطة" : "Enter the terminal"}</span>
              <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
            </Link>
            <a href="#engines" className="btn-secondary px-6 py-3.5 text-[12px]">
              {isAr ? "استعرض المحركات" : "See every engine"}
            </a>
          </div>

          <dl data-hero-rest className="opacity-0 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl border-t border-line pt-6">
            {stats.map((s) => (
              <div key={s.k}>
                <dt className="font-mono text-2xl text-fg num">{s.v}</dt>
                <dd className="text-[11px] text-fg-3 mt-1">{s.k}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      <a href="#engines" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-fg-3 hover:text-emerald-light transition-colors hidden lg:block" aria-label={isAr ? "انتقل للأسفل" : "Scroll to content"}>
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}
