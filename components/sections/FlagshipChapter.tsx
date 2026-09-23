"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, animate, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { FLAGSHIPS, TOOL_MAP, type ToolDef } from "@/lib/registry";
import { timeline, addDraw, prefersReducedMotion, DURATION } from "@/lib/anime";
import { EASE_OUT } from "@/lib/motion";
import {
  dcfPreview, lboPreview, monteCarloPreview, eoqPreview, cccPreview, zscorePreview,
  type DcfPreview, type LboPreview, type MonteCarloPreview, type EoqPreview, type CccPreview, type ZPreview,
} from "@/lib/landing/previews";

/**
 * FLAGSHIP — six back-to-back full-viewport chapters, one per flagship engine.
 * This is the one place the page is allowed to feel cinematic: every demo is
 * computed from the engine library (lib/landing/previews.ts) and reveals
 * itself — numbers count up, curves draw in, bars grow — the first time it
 * scrolls into view. prefers-reduced-motion collapses all of that to a fade.
 */

const ACCENT: Record<string, string> = {
  DCF: "flagship-dcf", LBO: "flagship-lbo", monte_carlo: "flagship-mc", eoq: "flagship-eoq", ccc: "flagship-ccc", zscore: "flagship-z",
};

const SOLVES: Record<string, { en: string; ar: string }> = {
  DCF: { en: "What is this business worth if its cash flows are what we think — and how much of that answer is just the terminal value?", ar: "كم تساوي هذه الشركة إذا كانت تدفقاتها كما نتوقع — وكم من الإجابة هو مجرد القيمة النهائية؟" },
  LBO: { en: "Can the deal carry this much debt, and what does the sponsor earn once the waterfall has been paid?", ar: "هل تتحمل الصفقة هذا القدر من الدين، وماذا يربح المستثمر بعد سداد الشلال؟" },
  monte_carlo: { en: "Stop defending a single number. Show the whole distribution and the odds the market is wrong.", ar: "توقف عن الدفاع عن رقم واحد. اعرض التوزيع كاملاً واحتمال أن السوق مخطئ." },
  eoq: { en: "How much to order at a time, so ordering cost and holding cost stop fighting each other.", ar: "كم تطلب في كل مرة كي تتوقف تكلفة الطلب وتكلفة التخزين عن التصادم." },
  ccc: { en: "How many days your cash sits inside inventory and receivables before it comes back.", ar: "كم يوماً يبقى نقدك عالقاً في المخزون والذمم قبل أن يعود." },
  zscore: { en: "One score for how close a counterparty is to distress — before the covenant tells you.", ar: "درجة واحدة لمدى اقتراب الطرف المقابل من التعثر — قبل أن يخبرك التعهد." },
};

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------------------------------------------------------- shared bits */

function CountUp({ value, decimals = 0, active, prefix = "", suffix = "", className = "" }: { value: number; decimals?: number; active: boolean; prefix?: string; suffix?: string; className?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!active) return;
    if (reduce) { setV(value); return; }
    const ctrl = animate(0, value, { duration: 1.4, ease: EASE_OUT, onUpdate: (x) => setV(x) });
    return () => ctrl.stop();
  }, [active, value, reduce]);
  return <span dir="ltr" className={`inline-block font-mono num ${className}`}>{prefix}{fmt(v, decimals)}{suffix}</span>;
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[28px] leading-none text-fg">{children}</div>
      <div className="mt-1.5 text-[11px] text-fg-3">{label}</div>
    </div>
  );
}

/** Draws every `[data-draw]` stroke inside `root` once `active` flips true. */
function useDrawOn(root: React.RefObject<SVGSVGElement | null>, active: boolean, each = 0) {
  useEffect(() => {
    const el = root.current;
    if (!el || !active) return;
    if (prefersReducedMotion()) { el.querySelectorAll<SVGElement>("[data-draw]").forEach((p) => { p.style.opacity = "1"; }); return; }
    const tl = timeline();
    addDraw(tl, el, "[data-draw]", { duration: DURATION.draw, each, position: 0 });
    tl.add(el.querySelectorAll("[data-after]"), { opacity: [0, 1], duration: DURATION.fast }, "-=600");
    // createDrawable owns stroke-dasharray while drawing; hand the dash pattern back afterwards.
    tl.then(() => {
      el.querySelectorAll<SVGElement>("[data-dash]").forEach((p) => {
        p.removeAttribute("stroke-dashoffset");
        p.setAttribute("stroke-dasharray", p.getAttribute("data-dash") ?? "");
      });
    });
    return () => { tl.cancel(); };
  }, [root, active, each]);
}

/* ------------------------------------------------------------------ DCF */

function DcfDemo({ d, active, isAr }: { d: DcfPreview; active: boolean; isAr: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6 order-2 sm:order-1">
        <Stat label={isAr ? "السعر الضمني للسهم" : "implied price / share"}><CountUp value={d.impliedPrice} decimals={2} active={active} className="text-acc" /></Stat>
        <Stat label={isAr ? "تكلفة رأس المال (WACC)" : "WACC, Zakat-aware"}><CountUp value={d.wacc * 100} decimals={2} active={active} suffix="%" /></Stat>
        <Stat label={isAr ? "القيمة النهائية من قيمة المنشأة" : "terminal value as % of EV"}><CountUp value={d.tvPct} decimals={0} active={active} suffix="%" /></Stat>
      </div>

      <div className="order-1 sm:order-2 overflow-x-auto" dir="ltr">
        <table className="w-full border-collapse font-mono text-[11.5px]">
          <caption className="text-start pb-2 text-[10px] tracking-[0.18em] text-fg-4 uppercase">
            {isAr ? "حساسية السعر: WACC × النمو النهائي" : "price sensitivity · WACC × terminal growth"}
          </caption>
          <thead>
            <tr>
              <th className="text-fg-4 font-normal text-start pb-2 pe-2">g ↓ / WACC →</th>
              {d.grid[0].cells.map((c) => (
                <th key={c.wacc} className="text-fg-3 font-normal text-end pb-2 px-2">{(c.wacc * 100).toFixed(1)}%</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.grid.map((row, ri) => (
              <tr key={row.growth}>
                <th className="text-fg-3 font-normal text-start py-1 pe-2">{(row.growth * 100).toFixed(1)}%</th>
                {row.cells.map((c, ci) => {
                  const rel = c.price == null ? 0 : c.price / d.currentPrice - 1;
                  return (
                    <motion.td
                      key={c.wacc}
                      initial={{ opacity: 0 }}
                      animate={active ? { opacity: 1 } : {}}
                      transition={{ delay: 0.15 + (ri * 5 + ci) * 0.035, duration: 0.4 }}
                      className={`text-end px-2 py-1.5 border border-line ${c.base ? "bg-acc-dim text-acc font-semibold" : rel >= 0 ? "text-fg" : "text-fg-3"}`}
                      style={!c.base && rel > 0 ? { backgroundColor: `rgba(23,168,138,${Math.min(0.28, rel * 0.35)})` } : undefined}
                    >
                      {c.price == null ? "—" : fmt(c.price, 2)}
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 font-mono text-[10px] text-fg-4">
          {isAr ? `السعر الحالي ${fmt(d.currentPrice, 2)} · الخلية المميزة هي الحالة الأساسية` : `market ${fmt(d.currentPrice, 2)} · highlighted cell is the base case · shaded cells sit above market`}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ LBO */

function LboDemo({ d, active, isAr }: { d: LboPreview; active: boolean; isAr: boolean }) {
  const max = Math.max(...d.debtPath.map((p) => p.debt));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-end">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6">
        <Stat label={isAr ? "معدل العائد الداخلي للمستثمر" : "sponsor IRR"}><CountUp value={d.irr} decimals={1} active={active} suffix="%" className="text-acc" /></Stat>
        <Stat label={isAr ? "مضاعف رأس المال" : "MOIC"}><CountUp value={d.moic} decimals={2} active={active} suffix="×" /></Stat>
        <Stat label={isAr ? "الرفع عند الدخول" : "entry leverage"}><CountUp value={d.entryLeverage} decimals={1} active={active} suffix="× EBITDA" /></Stat>
      </div>
      <div dir="ltr">
        <div className="flex items-end gap-2 h-44">
          {d.debtPath.map((p, i) => (
            <div key={p.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="font-mono text-[10px] text-fg-3 num">{(p.debt / p.ebitda).toFixed(1)}×</span>
              <motion.div
                className={`w-full rounded-t-sm ${i === 0 ? "bg-acc" : "bg-ink-5"}`}
                style={{ height: `${(p.debt / max) * 100}%`, originY: 1 }}
                initial={{ scaleY: 0 }}
                animate={active ? { scaleY: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.09, duration: 0.7, ease: EASE_OUT }}
              />
              <span className="font-mono text-[10px] text-fg-4">{p.year === 0 ? (isAr ? "دخول" : "entry") : `Y${p.year}`}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] text-fg-4">
          {isAr ? "الدين القائم بعد الإطفاء الإلزامي وكنس النقد · الرقم أعلى كل عمود هو صافي الدين / EBITDA" : "debt outstanding after mandatory amortisation and cash sweep · label is debt / EBITDA"}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Monte Carlo */

function McDemo({ d, active, isAr }: { d: MonteCarloPreview; active: boolean; isAr: boolean }) {
  const maxCount = Math.max(...d.histogramData.map((b) => b.count));
  const lo = d.histogramData[0].minVal;
  const hi = d.histogramData[d.histogramData.length - 1].maxVal;
  const pos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  const marks = [
    { v: d.p10, l: "P10" }, { v: d.p50, l: "P50" }, { v: d.p90, l: "P90" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-end">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6">
        <Stat label={isAr ? "الوسيط P50 للسهم" : "P50 value / share"}><CountUp value={d.p50} decimals={2} active={active} className="text-acc" /></Stat>
        <Stat label={isAr ? "احتمال أن السوق يقلّل من القيمة" : "probability of upside vs market"}><CountUp value={d.probUpside} decimals={1} active={active} suffix="%" /></Stat>
        <Stat label={isAr ? "عدد المحاكاة" : "seeded simulations"}><CountUp value={d.iterationsRun} active={active} /></Stat>
      </div>
      <div dir="ltr">
        <div className="relative h-40">
          <div className="absolute inset-0 flex items-end gap-[3px]">
            {d.histogramData.map((b, i) => (
              <motion.div
                key={b.rangeLabel}
                className="flex-1 rounded-t-sm bg-acc"
                style={{ height: `${(b.count / maxCount) * 100}%`, originY: 1, opacity: 0.35 + (b.count / maxCount) * 0.65 }}
                initial={{ scaleY: 0 }}
                animate={active ? { scaleY: 1 } : {}}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE_OUT }}
              />
            ))}
          </div>
          {marks.map((m) => (
            <motion.div key={m.l} initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ delay: 1.1, duration: 0.4 }} className="absolute top-0 bottom-0 border-l border-dashed border-fg-3" style={{ left: pos(m.v) }}>
              <span className="absolute -top-4 -translate-x-1/2 font-mono text-[9.5px] text-fg-3">{m.l}</span>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ delay: 1.3, duration: 0.4 }} className="absolute top-0 bottom-0 border-l-2 border-gold" style={{ left: pos(d.currentMarketPrice) }}>
            <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-[9.5px] text-gold whitespace-nowrap">{isAr ? "السوق" : "market"} {fmt(d.currentMarketPrice, 1)}</span>
          </motion.div>
        </div>
        <p className="mt-7 font-mono text-[10px] text-fg-4">
          {isAr ? `${fmt(lo, 0)} – ${fmt(hi, 0)} لكل سهم · 14 فئة · توزيع طبيعي على النمو والهامش وWACC والنمو النهائي` : `${fmt(lo, 0)} – ${fmt(hi, 0)} per share · 14 bins · normal draws on growth, margin, WACC and terminal growth`}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ EOQ */

function EoqDemo({ d, active, isAr }: { d: EoqPreview; active: boolean; isAr: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useDrawOn(ref, active, 260);
  const W = 520, H = 200, PAD = { l: 8, r: 8, t: 14, b: 22 };
  const pts = d.curve;
  const qs = pts.map((p) => p.q);
  const qMin = Math.min(...qs), qMax = Math.max(...qs);
  const yMax = Math.max(...pts.map((p) => p.totalCost)) * 1.05;
  const x = (q: number) => PAD.l + ((q - qMin) / (qMax - qMin)) * (W - PAD.l - PAD.r);
  const y = (c: number) => H - PAD.b - (c / yMax) * (H - PAD.t - PAD.b);
  const path = (key: "orderingCost" | "holdingCost" | "totalCost") => pts.map((p, i) => `${i ? "L" : "M"}${x(p.q).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const opt = pts.find((p) => p.isOptimal) ?? pts[Math.floor(pts.length / 2)];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-end">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6">
        <Stat label={isAr ? "حجم الطلب الأمثل Q*" : "optimal order size Q*"}><CountUp value={d.eoq} active={active} className="text-acc" /></Stat>
        <Stat label={isAr ? "طلبات في السنة" : "orders per year"}><CountUp value={d.ordersPerYear} decimals={1} active={active} /></Stat>
        <Stat label={isAr ? "تكلفة المخزون السنوية" : "annual inventory cost"}><CountUp value={d.annualInventoryCost} active={active} /></Stat>
      </div>
      <div dir="ltr">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img" aria-label="EOQ total cost curve">
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--line-strong)" />
          <path data-draw data-dash="4 4" d={path("orderingCost")} fill="none" stroke="var(--fg-3)" strokeWidth="1.2" strokeDasharray="4 4" />
          <path data-draw data-dash="1.5 3" d={path("holdingCost")} fill="none" stroke="var(--fg-3)" strokeWidth="1.2" strokeDasharray="1.5 3" />
          <path data-draw d={path("totalCost")} fill="none" stroke="var(--acc)" strokeWidth="2" />
          <g data-after style={{ opacity: 0 }}>
            <line x1={x(opt.q)} x2={x(opt.q)} y1={PAD.t} y2={H - PAD.b} stroke="var(--acc)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(opt.q)} cy={y(opt.totalCost)} r="4.5" fill="var(--acc)" />
            <text x={x(opt.q) + 8} y={y(opt.totalCost) - 8} fontFamily="var(--font-mono)" fontSize="10" fill="var(--acc)">Q* = {fmt(opt.q)}</text>
            <text x={PAD.l} y={H - 6} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-4)">{fmt(qMin)}</text>
            <text x={W - PAD.r} y={H - 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-4)">{fmt(qMax)} {isAr ? "وحدة / طلب" : "units / order"}</text>
          </g>
        </svg>
        <p className="mt-2 font-mono text-[10px] text-fg-4">
          {isAr ? "الخط الممتلئ: التكلفة الكلية · متقطع: تكلفة الطلب · منقّط: تكلفة التخزين" : "solid: total cost · dashed: ordering cost · dotted: holding cost"}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ CCC */

function CccDemo({ d, active, isAr }: { d: CccPreview; active: boolean; isAr: boolean }) {
  const L = d.latest;
  const span = L.dio + L.dso; // DPO is subtracted, drawn as a negative segment
  const w = (v: number) => `${(v / span) * 100}%`;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-end">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6">
        <Stat label={isAr ? "دورة التحويل النقدي · أيام" : "cash conversion cycle · days"}><CountUp value={L.ccc} decimals={1} active={active} className="text-acc" /></Stat>
        <Stat label={isAr ? "التغير عبر ثلاثة أرباع" : "change over three quarters"}><CountUp value={d.deltaDays} decimals={1} active={active} prefix={d.deltaDays > 0 ? "+" : ""} suffix={isAr ? " يوم" : " d"} /></Stat>
      </div>
      <div dir="ltr">
        <div className="space-y-3">
          {[
            { k: "DIO", v: L.dio, l: isAr ? "أيام المخزون" : "days inventory outstanding", neg: false },
            { k: "DSO", v: L.dso, l: isAr ? "أيام التحصيل" : "days sales outstanding", neg: false },
            { k: "DPO", v: L.dpo, l: isAr ? "أيام السداد (تُطرح)" : "days payables outstanding (subtracted)", neg: true },
          ].map((row, i) => (
            <div key={row.k} className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3">
              <span className="font-mono text-[11px] text-fg-3">{row.k}</span>
              <div className="h-5 bg-ink-3 rounded-sm overflow-hidden">
                <motion.div
                  className={`h-full ${row.neg ? "bg-ink-5" : "bg-acc"}`}
                  style={{ width: w(row.v), originX: 0, opacity: row.neg ? 0.9 : 1 - i * 0.18 }}
                  initial={{ scaleX: 0 }}
                  animate={active ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.18, duration: 0.8, ease: EASE_OUT }}
                />
              </div>
              <span className="font-mono text-[11px] text-fg text-end num">{row.neg ? "−" : ""}{fmt(row.v, 1)}</span>
            </div>
          ))}
          <div className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3 pt-2 border-t border-line">
            <span className="font-mono text-[11px] text-acc">CCC</span>
            <span className="text-[11px] text-fg-3">{isAr ? "= DIO + DSO − DPO" : "= DIO + DSO − DPO"}</span>
            <span className="font-mono text-[11px] text-acc text-end num">{fmt(L.ccc, 1)}</span>
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          {d.periods.map((p) => (
            <div key={p.periodLabel} className="flex-1 rounded border border-line px-3 py-2">
              <div className="font-mono text-[10px] text-fg-4">{p.periodLabel}</div>
              <div className="font-mono text-[15px] text-fg num">{fmt(p.ccc, 1)}<span className="text-[10px] text-fg-4"> d</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Altman Z */

function ZDemo({ d, active, isAr }: { d: ZPreview; active: boolean; isAr: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useDrawOn(ref, active, 120);
  const reduce = useReducedMotion();
  const MAX = 5;
  const cx = 150, cy = 150, R = 118;
  const ang = (v: number) => Math.PI - (Math.min(MAX, Math.max(0, v)) / MAX) * Math.PI;
  const pt = (v: number, r = R) => ({ x: cx + Math.cos(ang(v)) * r, y: cy - Math.sin(ang(v)) * r });
  const arc = (a: number, b: number) => {
    const p = pt(a), q = pt(b);
    return `M${p.x.toFixed(1)},${p.y.toFixed(1)} A${R},${R} 0 0 1 ${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  };
  const { distress, safe } = d.thresholds;
  const needleDeg = -90 + (Math.min(MAX, d.z) / MAX) * 180;
  const zoneLabel = d.zone === "safe" ? (isAr ? "منطقة آمنة" : "safe zone") : d.zone === "grey" ? (isAr ? "منطقة رمادية" : "grey zone") : (isAr ? "منطقة التعثر" : "distress zone");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-end">
      <div className="flex flex-wrap sm:flex-col gap-8 sm:gap-6">
        <Stat label={zoneLabel}><CountUp value={d.z} decimals={2} active={active} className="text-acc" /></Stat>
        <Stat label={isAr ? "احتمال التعثر الضمني · سنة" : "implied one-year default probability"}><CountUp value={d.impliedPd * 100} decimals={1} active={active} suffix="%" /></Stat>
      </div>
      <div dir="ltr" className="max-w-[340px]">
        <svg ref={ref} viewBox="0 0 300 170" className="w-full h-auto overflow-visible" role="img" aria-label="Altman Z-score gauge">
          <path data-draw d={arc(0, distress)} fill="none" stroke="var(--neg)" strokeOpacity="0.7" strokeWidth="10" strokeLinecap="butt" />
          <path data-draw d={arc(distress, safe)} fill="none" stroke="var(--fg-3)" strokeOpacity="0.7" strokeWidth="10" />
          <path data-draw d={arc(safe, MAX)} fill="none" stroke="var(--acc)" strokeWidth="10" />
          <g data-after style={{ opacity: 0 }}>
            {[0, distress, safe, MAX].map((v) => {
              const p = pt(v, R + 18);
              return <text key={v} x={p.x} y={p.y + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-4)">{v.toFixed(v ? 2 : 0)}</text>;
            })}
          </g>
          <motion.g
            style={{ originX: "150px", originY: "150px" }}
            initial={{ rotate: -90 }}
            animate={active ? { rotate: needleDeg } : {}}
            transition={reduce ? { duration: 0 } : { delay: 0.9, duration: 1.2, ease: EASE_OUT }}
          >
            <line x1={cx} y1={cy} x2={cx} y2={cy - R + 16} stroke="var(--fg-1)" strokeWidth="2" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="var(--fg-1)" />
          </motion.g>
          <text x={cx} y={cy - 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-3)">Z</text>
        </svg>
        <div className="mt-2 grid grid-cols-3 font-mono text-[10px] text-fg-4">
          <span>{isAr ? "تعثر" : "distress"} &lt; {distress}</span>
          <span className="text-center">{isAr ? "رمادية" : "grey"}</span>
          <span className="text-end">{isAr ? "آمن" : "safe"} &gt; {safe}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- the chapter */

function FlagshipSection({ tool, index, isAr, children }: { tool: ToolDef; index: number; isAr: boolean; children: (active: boolean) => React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const reduce = useReducedMotion();
  const solves = SOLVES[tool.id];
  return (
    <section
      ref={ref}
      id={`flagship-${tool.id}`}
      data-flagship={tool.id}
      className={`flagship ${ACCENT[tool.id]} relative min-h-[100svh] flex items-center py-20 border-t border-line overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute top-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[820px] max-h-[820px] rounded-full blur-3xl opacity-60 ${isAr ? "-left-[20vw]" : "-right-[20vw]"}`} style={{ background: "radial-gradient(circle, var(--acc-dim) 0%, transparent 65%)" }} />
      </div>
      <motion.div
        className="relative w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center"
        initial={{ opacity: 0, y: reduce ? 0 : 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] tracking-[0.2em] text-acc">
            <span dir="ltr" className="inline-block">{String(index + 1).padStart(2, "0")} / {String(FLAGSHIPS.length).padStart(2, "0")} · {tool.code}</span>
          </p>
          <h3 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>{isAr ? tool.ar : tool.en}</h3>
          <p className="mt-5 text-fg-2 text-base sm:text-lg leading-relaxed max-w-md">{isAr ? solves.ar : solves.en}</p>
          <p className="mt-4 text-[13px] text-fg-3 leading-relaxed max-w-md">{isAr ? tool.descAr : tool.descEn}</p>
          <Link href={`/dashboard?panel=${tool.id}`} className="btn-ghost mt-7 text-[12px]">
            {isAr ? `افتح ${tool.code}` : `Open ${tool.code}`} <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>
        <div className="lg:col-span-7">
          <div className="panel-data p-5 sm:p-7 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-acc opacity-70" aria-hidden="true" />
            {children(inView)}
            <p className="mt-6 pt-4 border-t border-line font-mono text-[10px] text-fg-4">
              {isAr ? "محسوب الآن من نفس مكتبة المحرك التي تعمل داخل المحطة — بمدخلات عينة موثّقة." : "Computed just now by the same engine library that runs inside the terminal — from a documented sample input."}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function FlagshipChapter() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const p = useMemo(() => ({ dcf: dcfPreview(), lbo: lboPreview(), mc: monteCarloPreview(), eoq: eoqPreview(), ccc: cccPreview(), z: zscorePreview() }), []);

  const demos: Record<string, (active: boolean) => React.ReactNode> = {
    DCF: (a) => <DcfDemo d={p.dcf} active={a} isAr={isAr} />,
    LBO: (a) => <LboDemo d={p.lbo} active={a} isAr={isAr} />,
    monte_carlo: (a) => <McDemo d={p.mc} active={a} isAr={isAr} />,
    eoq: (a) => <EoqDemo d={p.eoq} active={a} isAr={isAr} />,
    ccc: (a) => <CccDemo d={p.ccc} active={a} isAr={isAr} />,
    zscore: (a) => <ZDemo d={p.z} active={a} isAr={isAr} />,
  };

  return (
    <div id="flagship" data-chapter="flagship" className="bg-ink-1" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
        <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">03 · {isAr ? "المحركات الرئيسية" : "Flagship"}</p>
        <h2 className={`mt-4 font-serif text-display-lg text-fg max-w-3xl ${isAr ? "font-cairo font-bold" : ""}`}>
          {isAr ? `${FLAGSHIPS.length} محركات تحمل معظم العمل. كل واحد يحسب أمامك.` : `${FLAGSHIPS.length} engines carry most of the work. Each one computes in front of you.`}
        </h2>
      </div>
      {FLAGSHIPS.map((tool, i) => (
        <FlagshipSection key={tool.id} tool={TOOL_MAP[tool.id]} index={i} isAr={isAr}>
          {demos[tool.id]}
        </FlagshipSection>
      ))}
    </div>
  );
}
