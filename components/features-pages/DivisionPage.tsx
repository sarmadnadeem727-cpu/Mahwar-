"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleDot, Circle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTerminalStore } from "@/store/useTerminalStore";
import { DIVISION_MAP, axisEngines, divisionClusters, divisionEngines, divisionFlagships, type DivisionId } from "@/lib/divisions";

/**
 * /features/[division] — every engine of one half, grouped by cluster, with
 * the shared working-capital axis and what comes next for this half.
 */
export default function DivisionPage({ id }: { id: DivisionId }) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const d = DIVISION_MAP[id];
  const other = DIVISION_MAP[id === "finance" ? "supply-chain" : "finance"];
  const Icon = d.icon;
  const groups = divisionClusters(d);
  const engines = divisionEngines(d);
  const flagships = divisionFlagships(d);
  const axis = axisEngines();
  const accentText = d.accent === "emerald" ? "text-emerald-light" : "text-navy dark:text-fg";
  const accentBg = d.accent === "emerald" ? "bg-emerald" : "bg-navy dark:bg-fg-2";

  return (
    <div className={`min-h-screen bg-ink-1 text-fg flex flex-col ${isAr ? "font-arabic" : "font-sans"}`} dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/features" className="btn-ghost">
            <ArrowLeft size={13} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "كل الميزات" : "All features"}</span>
          </Link>

          {/* Head */}
          <header className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-end">
            <div>
              <div className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] ${accentText}`}><Icon size={14} /> {d.code}</div>
              <h1 className={`mt-3 font-display text-display-lg text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? d.ar : d.en}</h1>
              <p className="mt-4 max-w-2xl text-[16px] text-fg-2 leading-relaxed">{isAr ? d.bodyAr : d.bodyEn}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/dashboard?panel=${d.entry}`} className="btn-primary">
                  <span>{isAr ? "افتح في المحطة" : "Open in the terminal"}</span>
                  <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
                </Link>
                <Link href={`/features/${other.id}`} className="btn-secondary">{isAr ? `النصف الآخر: ${other.ar}` : `The other half: ${other.en}`}</Link>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
              {[
                { v: engines.length, k: isAr ? "محركاً" : "engines" },
                { v: groups.length, k: isAr ? "مجموعات" : "clusters" },
                { v: axis.length, k: isAr ? "على المحور" : "on the axis" },
              ].map((s) => (
                <div key={s.k}><dt className="font-mono text-3xl num text-fg">{s.v}</dt><dd className="text-[11px] text-fg-3 mt-1">{s.k}</dd></div>
              ))}
            </dl>
          </header>

          {/* Flagships */}
          <section className="mt-14">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {flagships.map((t) => {
                const TI = t.icon;
                return (
                  <li key={t.id}>
                    <Link href={`/dashboard?panel=${t.id}`} className="card-nav block p-5 h-full">
                      <div className="flex items-center justify-between">
                        <TI size={18} className={accentText} />
                        <span className="label-pill">{t.tag}</span>
                      </div>
                      <div className="mt-4 text-[15px] text-fg leading-snug">{isAr ? t.ar : t.en}</div>
                      <div className="mt-2 text-[12px] text-fg-3 leading-relaxed">{isAr ? t.descAr : t.descEn}</div>
                      <div className="mt-4 font-mono text-[10px] text-fg-4 tracking-wider">{t.code} GO</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Every engine by cluster */}
          <section className="mt-16">
            <h2 className={`font-display text-2xl text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? "كل المحركات" : "Every engine"}</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {groups.map((g) => (
                <div key={g.cluster.id} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 py-6">
                  <div>
                    <div className="text-[14px] text-fg">{isAr ? g.cluster.ar : g.cluster.en}</div>
                    <div className="mt-1 font-mono text-[11px] text-fg-4">{g.tools.length} {isAr ? "محرك" : g.tools.length === 1 ? "engine" : "engines"}</div>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {g.tools.map((t) => (
                      <li key={t.id}>
                        <Link href={`/dashboard?panel=${t.id}`} className="group flex items-start gap-3 py-1">
                          <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${accentBg}`} />
                          <span className="min-w-0">
                            <span className="text-[13.5px] text-fg group-hover:text-emerald-light transition-colors">{isAr ? t.ar : t.en}</span>
                            <span className="ms-2 font-mono text-[10px] text-fg-4">{t.code}</span>
                            <span className="block text-[12px] text-fg-3 leading-relaxed mt-0.5">{isAr ? t.descAr : t.descEn}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Shared axis */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-8 py-6">
                <div>
                  <div className="text-[14px] text-gold">{isAr ? "المحور المشترك" : "Shared axis"}</div>
                  <div className="mt-1 font-mono text-[11px] text-fg-4">{isAr ? "رأس المال العامل" : "working capital"}</div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {axis.map((t) => (
                    <li key={t.id}>
                      <Link href={`/dashboard?panel=${t.id}`} className="group flex items-start gap-3 py-1">
                        <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 bg-gold" />
                        <span className="min-w-0">
                          <span className="text-[13.5px] text-fg group-hover:text-emerald-light transition-colors">{isAr ? t.ar : t.en}</span>
                          <span className="ms-2 font-mono text-[10px] text-fg-4">{t.code}</span>
                          <span className="block text-[12px] text-fg-3 leading-relaxed mt-0.5">{isAr ? t.descAr : t.descEn}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
            <div>
              <h2 className={`font-display text-2xl text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? "ما التالي لهذا النصف" : "What comes next for this half"}</h2>
              <p className="mt-3 text-[14px] text-fg-2 leading-relaxed">
                {isAr ? "التحديثات التي ننتقل إليها بعد هذا الإصدار، بالترتيب." : "The updates we move to after this release, in order."}
              </p>
            </div>
            <ol className="space-y-2">
              {d.roadmap.map((r, i) => (
                <li key={i} className="panel-data flex items-start gap-3 px-4 py-3">
                  {r.status === "next" ? <CircleDot size={15} className="mt-0.5 text-emerald-light shrink-0" /> : <Circle size={15} className="mt-0.5 text-fg-4 shrink-0" />}
                  <span className="text-[13.5px] text-fg leading-relaxed">{isAr ? r.ar : r.en}</span>
                  <span className={`ms-auto shrink-0 label-pill ${r.status === "next" ? "label-pill-emerald" : ""}`}>{r.status === "next" ? (isAr ? "التالي" : "next") : (isAr ? "مخطط" : "planned")}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
