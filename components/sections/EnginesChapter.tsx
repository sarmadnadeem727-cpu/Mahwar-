"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { ENGINES, FLAGSHIP_IDS, enginesByCluster, SUITES, toolsBySuite } from "@/lib/registry";
import { reveal, staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

/**
 * ENGINES — light-inverted. The ONLY place the full engine list appears on
 * the landing page: one dense, categorised function list (think a Bloomberg
 * function directory, not a card wall). Each row is code · name · launch.
 */
export default function EnginesChapter() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const groups = enginesByCluster();
  const flagship = new Set<string>(FLAGSHIP_IDS);

  return (
    <section id="engines" data-chapter="engines" className="section-light relative py-24 lg:py-32 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">02 · {isAr ? "المحركات" : "Engines"}</p>
            <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
              {isAr ? `${ENGINES.length} محركاً. كود واحد لكل منها.` : `${ENGINES.length} engines. One code for each.`}
            </h2>
            <p className="mt-4 text-fg-2 leading-relaxed">
              {isAr
                ? "اكتب الكود في سطر الأوامر واضغط GO. كل محرك يحفظ نتيجته في الجلسة ويظهر في التقرير الموحد."
                : "Type the code on the command line and press GO. Every engine saves into the session and lands in one report."}
            </p>
          </div>
          <dl className="flex gap-8 font-mono text-[11px] text-fg-3 shrink-0">
            {SUITES.filter((s) => s.id !== "platform").map((s) => (
              <div key={s.id}>
                <dt className="text-2xl text-fg num">{toolsBySuite(s.id).length}</dt>
                <dd className="mt-1">{isAr ? s.shortAr : s.short}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-10"
        >
          {groups.map(({ cluster, tools }) => (
            <motion.div key={cluster.id} variants={staggerItem}>
              <div className="flex items-baseline justify-between border-b border-line-strong pb-2">
                <h3 className="font-serif text-lg text-fg">{isAr ? cluster.ar : cluster.en}</h3>
                <span className="font-mono text-[10px] text-fg-4">{tools.length}</span>
              </div>
              <ul className="mt-1 divide-y divide-line">
                {tools.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard?panel=${t.id}`}
                      className="group flex items-center gap-3 py-2 -mx-2 px-2 rounded hover:bg-emerald-dim transition-colors"
                    >
                      <span className={`font-mono text-[11px] w-14 shrink-0 tracking-wider ${flagship.has(t.id) ? "text-emerald-light" : "text-fg-3"}`}>{t.code}</span>
                      <span className="flex-1 text-[13.5px] text-fg-2 group-hover:text-fg truncate">{isAr ? t.ar : t.en}</span>
                      {flagship.has(t.id) && <span className="font-mono text-[9px] tracking-[0.18em] text-emerald-light">{isAr ? "رئيسي" : "FLAGSHIP"}</span>}
                      <ArrowUpRight size={12} className={`text-fg-4 group-hover:text-emerald-light transition-colors shrink-0 ${isAr ? "-scale-x-100" : ""}`} />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
