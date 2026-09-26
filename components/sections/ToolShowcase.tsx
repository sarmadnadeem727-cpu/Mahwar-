"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { CLUSTERS, SUITES, TOOLS, toolsBySuite, type SuiteId, type ToolDef } from "@/lib/registry";
import { computeEOQ } from "@/lib/operations/eoq";
import { computeSafetyStock } from "@/lib/operations/safetyStock";
import { reveal, viewportOnce } from "@/lib/motion";

/** Tiny SVG line from a numeric series — used for the live preview cards. */
function Spark({ values, accent = "emerald", marker }: { values: number[]; accent?: "emerald" | "gold"; marker?: number }) {
  const w = 240;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / (max - min || 1)) * (h - 8) - 4,
  ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const stroke = accent === "emerald" ? "var(--emerald-light)" : "var(--gold)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`fill-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#fill-${accent})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
      {marker !== undefined && (
        <circle cx={pts[marker][0]} cy={pts[marker][1]} r="3.5" fill={stroke} className="animate-pulse" />
      )}
    </svg>
  );
}

function LivePreviews({ isAr }: { isAr: boolean }) {
  const eoq = useMemo(
    () =>
      computeEOQ({
        annualDemand: 24_000,
        orderSetupCost: 180,
        holdingCostMode: "direct",
        directHoldingCost: 6.2,
        unitCost: 40,
        holdingCostPct: 0,
      }),
    []
  );
  const ss = useMemo(
    () =>
      computeSafetyStock({
        dailyDemand: 300,
        demandStdDev: 70,
        leadTimeDays: 12,
        leadTimeStdDev: 2,
        serviceLevelPct: 95,
        useManualZ: false,
      }),
    []
  );

  const curve = eoq.curveData.map((p) => p.totalCost);
  const optimalIdx = Math.max(0, eoq.curveData.findIndex((p) => p.isOptimal));
  const ssCurve = ss.sensitivityPoints.map((p) => p.safetyStock);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="panel-data p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] text-emerald-light">EOQ</span>
          <span className="font-mono text-[11px] text-fg-3">{isAr ? "منحنى التكلفة الكلية" : "total cost curve"}</span>
        </div>
        <div className="mt-3">
          <Spark values={curve} marker={optimalIdx >= 0 ? optimalIdx : undefined} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px]">
          <span className="text-fg-2">Q* = {Math.round(eoq.eoq).toLocaleString()}</span>
          <span className="text-fg-3">{Math.round(eoq.annualInventoryCost).toLocaleString()} /yr</span>
        </div>
      </div>
      <div className="panel-data p-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] text-gold">SS</span>
          <span className="font-mono text-[11px] text-fg-3">{isAr ? "مستوى الخدمة مقابل المخزون" : "service level vs buffer"}</span>
        </div>
        <div className="mt-3">
          <Spark values={ssCurve} accent="gold" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px]">
          <span className="text-fg-2">95% → {Math.round(ss.safetyStock).toLocaleString()} units</span>
          <span className="text-fg-3">ROP {Math.round(ss.reorderPoint).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function ToolShowcase() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [suite, setSuite] = useState<SuiteId>("finance");
  const tools = toolsBySuite(suite);

  const grouped = useMemo(() => {
    const map = new Map<string, ToolDef[]>();
    tools.forEach((t) => {
      const key = t.cluster ?? "other";
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [tools]);

  return (
    <section id="modules" className="py-28 bg-ink-2/40 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sticky rail */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
              <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "الوحدات" : "Modules"}</p>
              <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
                {isAr ? `${TOOLS.length} محركاً. كود واحد لكل منها.` : `${TOOLS.length} engines. One code for each.`}
              </h2>
              <p className="mt-5 text-fg-2 leading-relaxed">
                {isAr
                  ? "اكتب الكود في سطر الأوامر واضغط GO، كما في بلومبرغ. كل محرك يحفظ نتائجه في الجلسة ويظهر في تقرير واحد."
                  : "Type the code on the command line and press GO, the Bloomberg way. Every engine saves into the session and lands in one report."}
              </p>
            </motion.div>

            <div className="mt-8 flex lg:flex-col gap-2">
              {SUITES.filter((s) => s.id === "finance" || s.id === "operations" || s.id === "research").map((s) => {
                const active = suite === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSuite(s.id)}
                    className={`text-start rounded-2xl border px-5 py-3.5 transition-all duration-200 apple-touch-target ${
                      active
                        ? "border-emerald/40 bg-emerald/15 text-fg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_6px_20px_rgba(28,139,108,0.22)]"
                        : "border-line bg-ink-2/60 text-fg-2 hover:border-line-strong hover:bg-ink-3/80 hover:text-fg"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="text-sm font-semibold tracking-tight">{isAr ? s.ar : s.en}</div>
                    <div className="font-mono text-[10.5px] text-fg-3 mt-1">
                      {toolsBySuite(s.id).length} {isAr ? "محرك" : "engines"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <LivePreviews isAr={isAr} />
              <p className="mt-3 font-mono text-[10px] text-fg-4">
                {isAr ? "المعاينات محسوبة من نفس المكتبات المستخدمة في المحطة." : "Previews are computed from the same libraries the terminal uses."}
              </p>
            </div>
          </div>
        </div>

        {/* Module grid */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={suite}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {grouped.map(([clusterId, list]) => {
                const cluster = CLUSTERS[clusterId];
                return (
                  <div key={clusterId}>
                    {cluster && (
                      <h3 className="font-serif text-xl text-fg-2 mb-4">{isAr ? cluster.ar : cluster.en}</h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {list.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.id}
                            href={`/dashboard?panel=${tool.id}`}
                            className="card-nav group p-5 flex flex-col gap-3 min-h-[168px]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[11px] tracking-wider text-emerald-light">{tool.code}</span>
                              <Icon size={16} className="text-fg-3 group-hover:text-emerald-light transition-colors" />
                            </div>
                            <div className="text-[15px] font-medium text-fg leading-snug">{isAr ? tool.ar : tool.en}</div>
                            <p className="text-[12.5px] text-fg-3 leading-relaxed flex-1">{isAr ? tool.descAr : tool.descEn}</p>
                            <div className="flex items-center justify-between font-mono text-[10px] text-fg-4">
                              <span>{tool.tag}</span>
                              <ArrowUpRight size={13} className="text-fg-4 group-hover:text-emerald-light transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

