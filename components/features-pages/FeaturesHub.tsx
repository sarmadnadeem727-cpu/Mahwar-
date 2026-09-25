"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { useTerminalStore } from "@/store/useTerminalStore";
import { APP } from "@/lib/registry";
import { DIVISIONS, axisEngines, divisionClusters, divisionEngines, divisionFlagships } from "@/lib/divisions";

/**
 * /features — the two halves of the terminal, side by side, and the axis
 * where they meet. Finance on one side, supply chain on the other; the
 * working-capital engines sit on the seam because they belong to both.
 */
export default function FeaturesHub() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const axis = axisEngines();

  return (
    <div className={`min-h-screen bg-ink-1 text-fg flex flex-col ${isAr ? "font-arabic" : "font-sans"}`} dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        {/* Head */}
        <header className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{APP.name.toUpperCase()} · {APP.nameAr}</p>
          <h1 className={`mt-4 font-display text-display-lg text-fg max-w-3xl ${isAr ? "font-semibold" : ""}`}>
            {isAr ? "نصفان لمحطة واحدة." : "Two halves of one terminal."}
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] text-fg-2 leading-relaxed">
            {isAr
              ? "المالية تقرأ رأس المال، وسلاسل الإمداد تقرأ البضائع. يلتقيان عند رأس المال العامل: المخزون الذي تدفع ثمنه اليوم هو النقد الذي تحصّله غداً. اختر نصفاً لتستعرض محركاته، أو ادخل المحطة مباشرة."
              : "Finance reads capital. Supply chain reads goods. They meet at working capital: the inventory you pay for today is the cash you collect tomorrow. Pick a half to browse its engines, or go straight to the terminal."}
          </p>
        </header>

        {/* The split */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0">
            {DIVISIONS.map((d, i) => {
              const Icon = d.icon;
              const engines = divisionEngines(d);
              const flagships = divisionFlagships(d);
              const groups = divisionClusters(d);
              const accentText = d.accent === "emerald" ? "text-emerald-light" : "text-navy dark:text-fg";
              const accentBorder = d.accent === "emerald" ? "border-emerald" : "border-navy dark:border-fg-2";
              return (
                <article
                  key={d.id}
                  className={`relative panel-data p-7 md:p-9 lg:rounded-none ${i === 0 ? "lg:rounded-s-lg lg:border-e-0" : "lg:rounded-e-lg"} border-t-4 ${accentBorder}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] ${accentText}`}>
                        <Icon size={14} /> {d.code}
                      </div>
                      <h2 className={`mt-3 font-display text-3xl md:text-4xl text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? d.ar : d.en}</h2>
                      <p className="mt-2 text-[14px] text-fg-2">{isAr ? d.leadAr : d.leadEn}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <div className="font-mono text-4xl num text-fg">{engines.length}</div>
                      <div className="text-[11px] text-fg-3">{isAr ? "محركاً" : "engines"}</div>
                    </div>
                  </div>

                  <p className="mt-6 text-[14px] text-fg-2 leading-relaxed">{isAr ? d.bodyAr : d.bodyEn}</p>

                  {/* Flagships */}
                  <ul className="mt-7 grid grid-cols-2 gap-2.5">
                    {flagships.map((t) => {
                      const TI = t.icon;
                      return (
                        <li key={t.id}>
                          <Link href={`/dashboard?panel=${t.id}`} className="card-nav flex items-start gap-3 p-3.5 h-full">
                            <TI size={16} className={`mt-0.5 shrink-0 ${accentText}`} />
                            <span className="min-w-0">
                              <span className="block text-[13px] text-fg leading-snug">{isAr ? t.ar : t.en}</span>
                              <span className="block mt-0.5 font-mono text-[10px] text-fg-3">{t.code}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Cluster tape */}
                  <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-fg-3">
                    {groups.map((g) => (
                      <span key={g.cluster.id}>{isAr ? g.cluster.ar : g.cluster.en} <span className="font-mono text-fg-4">{g.tools.length}</span></span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={`/features/${d.id}`} className="btn-primary">
                      <span>{isAr ? "استعرض كل المحركات" : "Browse every engine"}</span>
                      <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
                    </Link>
                    <Link href={`/dashboard?panel=${d.entry}`} className="btn-secondary">{isAr ? "افتح في المحطة" : "Open in the terminal"}</Link>
                  </div>
                </article>
              );
            })}

            {/* The axis marker */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center w-16 h-16 rounded-full bg-ink-1 border border-line-strong shadow-terminal-card" aria-hidden="true">
              <MahwarLogo size={44} animate={false} />
            </div>
          </div>
        </section>

        {/* Where they meet */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-gold">{isAr ? "المحور" : "THE AXIS"}</p>
              <h2 className={`mt-3 font-display text-2xl md:text-3xl text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? "حيث يلتقيان" : "Where they meet"}</h2>
              <p className="mt-3 text-[14px] text-fg-2 leading-relaxed">
                {isAr
                  ? "رأس المال العامل يخص النصفين: يقيس النقد المحبوس في المخزون والذمم، وتكلفة تمويله، وكم تبقى منه لثلاثة عشر أسبوعاً."
                  : "Working capital belongs to both halves: it measures the cash locked in stock and receivables, what it costs to fund it, and how much is left over the next thirteen weeks."}
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {axis.map((t) => {
                const TI = t.icon;
                return (
                  <li key={t.id}>
                    <Link href={`/dashboard?panel=${t.id}`} className="card-nav block p-4 h-full">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-gold tracking-wider"><TI size={13} /> {t.code}</div>
                      <div className="mt-2 text-[14px] text-fg">{isAr ? t.ar : t.en}</div>
                      <div className="mt-1 text-[12px] text-fg-3 leading-relaxed">{isAr ? t.descAr : t.descEn}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
