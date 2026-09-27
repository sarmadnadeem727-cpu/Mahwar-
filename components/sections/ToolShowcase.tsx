"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Activity, Layers } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { CLUSTERS, SUITES, TOOLS, toolsBySuite, type SuiteId, type ToolDef } from "@/lib/registry";
import { computeEOQ } from "@/lib/operations/eoq";
import { computeSafetyStock } from "@/lib/operations/safetyStock";
import { reveal, viewportOnce } from "@/lib/motion";

/** Core engines that form the real operational-to-financial chain. */
const CORE_CHAIN_IDS = new Set(["eoq", "ccc", "wc_financing", "wacc", "DCF", "FS", "zscore", "ratios"]);

/** Tiny SVG line from a numeric series — used for live mini-preview cards. */
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
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14 overflow-visible" aria-hidden="true">
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

/** Mini preview widget for core chain engines inside the grid. */
function CoreEngineMiniPreview({ toolId, isAr }: { toolId: string; isAr: boolean }) {
  if (toolId === "eoq") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-1.5">
        <div className="flex justify-between text-fg-3">
          <span>Q* = 1,180 units</span>
          <span className="text-emerald-light">Cost Minimized</span>
        </div>
        <Spark values={[12000, 8500, 6200, 5100, 4800, 5200, 6400, 8100]} marker={4} />
      </div>
    );
  }

  if (toolId === "ccc") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-2">
        <div className="flex justify-between items-center text-fg-3">
          <span>DIO 45d + DSO 55d − DPO 36d</span>
          <span className="text-emerald-light font-bold">CCC = 64d</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-ink-4">
          <div className="bg-gold/80" style={{ width: "45%" }} title="DIO 45d" />
          <div className="bg-emerald/70" style={{ width: "55%" }} title="DSO 55d" />
          <div className="bg-neg/60" style={{ width: "36%" }} title="DPO 36d" />
        </div>
      </div>
    );
  }

  if (toolId === "wc_financing") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-1.5">
        <div className="flex justify-between text-fg-3">
          <span>NOWC: SAR 1.25M</span>
          <span className="text-emerald-light font-bold">-10d = SAR 85k/yr</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-fg-4">
          <span className="w-2 h-2 rounded-full bg-emerald-light" />
          <span>{isAr ? "وفورات تمويل نقدية مباشرة" : "Direct interest expense savings unlocked"}</span>
        </div>
      </div>
    );
  }

  if (toolId === "wacc") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-2">
        <div className="flex justify-between text-fg-3">
          <span>Equity 70% (10.5%) + Debt 30% (4.8%)</span>
          <span className="text-emerald-light font-bold">WACC = 8.8%</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-ink-4">
          <div className="bg-emerald-light" style={{ width: "70%" }} />
          <div className="bg-fg-3" style={{ width: "30%" }} />
        </div>
      </div>
    );
  }

  if (toolId === "DCF") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-1.5">
        <div className="flex justify-between text-fg-3">
          <span>5Y FCF PV + Terminal Value</span>
          <span className="text-emerald-light font-bold">+18.4% Upside</span>
        </div>
        <Spark values={[240, 275, 310, 355, 410]} accent="emerald" />
      </div>
    );
  }

  if (toolId === "FS") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-2">
        <div className="flex justify-between text-fg-3">
          <span>{isAr ? "قوائم ثلاث مترابطة" : "Integrated 3-Statement Bridge"}</span>
          <span className="text-emerald-light font-bold">Zakat 2.5%</span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-6 items-end">
          {[40, 55, 68, 82, 100].map((h, i) => (
            <div key={i} className="bg-emerald/30 hover:bg-emerald/60 rounded-t transition-colors" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (toolId === "zscore") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-2">
        <div className="flex justify-between text-fg-3">
          <span>Altman Z-Score = 2.49</span>
          <span className="text-emerald-light font-bold">Safe Zone</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden bg-ink-4">
          <div className="absolute inset-y-0 left-0 bg-neg/70" style={{ width: "30%" }} />
          <div className="absolute inset-y-0 bg-warn/60" style={{ left: "30%", width: "25%" }} />
          <div className="absolute inset-y-0 right-0 bg-emerald/70" style={{ left: "55%" }} />
        </div>
      </div>
    );
  }

  if (toolId === "ratios") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ink-2/80 border border-line/60 font-mono text-[11px] space-y-1.5">
        <div className="flex justify-between text-fg-3">
          <span>DuPont ROE = 14.8%</span>
          <span className="text-emerald-light font-bold">Score 82/100</span>
        </div>
        <div className="text-[10px] text-fg-4 truncate">
          Margin (9.3%) × Turnover (0.69) × Leverage (2.3)
        </div>
      </div>
    );
  }

  return null;
}

function LiveRailPreviews({ isAr }: { isAr: boolean }) {
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
                  ? "اكتب الكود في سطر الأوامر واضغط GO، كما في بلومبرغ. المحركات المركزية (المميزة) تشكل السلسلة المترابطة من المخزون إلى التقييم، بينما تشكل بقية المحركات المكتبة المساندة الكاملة."
                  : "Type the code on the command line and press GO, the Bloomberg way. The highlighted core engines form the connected operations-to-valuation chain; the rest provide the full supporting library."}
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
              <LiveRailPreviews isAr={isAr} />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {list.map((tool) => {
                        const Icon = tool.icon;
                        const isCore = CORE_CHAIN_IDS.has(tool.id);

                        return (
                          <Link
                            key={tool.id}
                            href={`/dashboard?panel=${tool.id}`}
                            className={`group p-5 flex flex-col gap-3 rounded-2xl transition-all duration-200 ${
                              isCore
                                ? "sm:col-span-2 border border-emerald/40 bg-gradient-to-br from-ink-2 to-emerald/5 hover:border-emerald-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_rgba(28,139,108,0.12)] min-h-[190px]"
                                : "card-nav min-h-[160px]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-light">
                                  {tool.code}
                                </span>
                                {isCore && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/15 border border-emerald/30 text-emerald-light text-[10px] font-mono font-bold">
                                    <Sparkles size={10} />
                                    <span>{isAr ? "السلسلة المركزية" : "Core Chain"}</span>
                                  </span>
                                )}
                              </div>
                              <Icon size={16} className="text-fg-3 group-hover:text-emerald-light transition-colors" />
                            </div>

                            <div className="text-[15px] font-medium text-fg leading-snug">{isAr ? tool.ar : tool.en}</div>
                            <p className="text-[12.5px] text-fg-3 leading-relaxed flex-1">{isAr ? tool.descAr : tool.descEn}</p>

                            {/* Live mini preview for core chain engines */}
                            {isCore && <CoreEngineMiniPreview toolId={tool.id} isAr={isAr} />}

                            <div className="flex items-center justify-between font-mono text-[10px] text-fg-4 pt-1">
                              <span>{tool.tag}</span>
                              <div className="flex items-center gap-1 group-hover:text-emerald-light transition-colors">
                                <span className="text-[10px]">{isAr ? "تشغيل" : "Launch"}</span>
                                <ArrowUpRight size={13} className={isAr ? "rotate-180" : ""} />
                              </div>
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
