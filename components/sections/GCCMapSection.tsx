"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { reveal, viewportOnce } from "@/lib/motion";

/**
 * GCC corridor network. Hubs are placed at their real coordinates
 * (equirectangular projection of lon/lat) so the geometry is honest, but the
 * drawing is a schematic of routes — not a political map — which lets it render
 * instantly with zero external requests.
 */

type HubKind = "capital" | "port" | "financial";
interface Hub { id: string; en: string; ar: string; lon: number; lat: number; kind: HubKind }

const HUBS: Hub[] = [
  { id: "ruh", en: "Riyadh", ar: "الرياض", lon: 46.72, lat: 24.63, kind: "capital" },
  { id: "jed", en: "Jeddah", ar: "جدة", lon: 39.19, lat: 21.49, kind: "port" },
  { id: "dmm", en: "Dammam", ar: "الدمام", lon: 50.1, lat: 26.43, kind: "port" },
  { id: "kwi", en: "Kuwait City", ar: "الكويت", lon: 47.98, lat: 29.38, kind: "capital" },
  { id: "bah", en: "Manama", ar: "المنامة", lon: 50.58, lat: 26.23, kind: "financial" },
  { id: "doh", en: "Doha", ar: "الدوحة", lon: 51.53, lat: 25.29, kind: "financial" },
  { id: "auh", en: "Abu Dhabi", ar: "أبوظبي", lon: 54.37, lat: 24.47, kind: "capital" },
  { id: "dxb", en: "Dubai / Jebel Ali", ar: "دبي / جبل علي", lon: 55.3, lat: 25.2, kind: "port" },
  { id: "mct", en: "Muscat", ar: "مسقط", lon: 58.41, lat: 23.59, kind: "port" },
  { id: "sll", en: "Salalah", ar: "صلالة", lon: 54.09, lat: 17.02, kind: "port" },
];

type Route = { a: string; b: string; kind: "road" | "sea" | "capital"; bend?: number };
const ROUTES: Route[] = [
  { a: "jed", b: "ruh", kind: "road" },
  { a: "ruh", b: "dmm", kind: "road" },
  { a: "dmm", b: "kwi", kind: "road", bend: -18 },
  { a: "dmm", b: "bah", kind: "road" },
  { a: "bah", b: "doh", kind: "road" },
  { a: "doh", b: "auh", kind: "road", bend: 10 },
  { a: "auh", b: "dxb", kind: "road" },
  { a: "dxb", b: "mct", kind: "road", bend: 14 },
  { a: "jed", b: "sll", kind: "sea", bend: 60 },
  { a: "sll", b: "mct", kind: "sea", bend: 30 },
  { a: "mct", b: "dxb", kind: "sea", bend: -26 },
  { a: "dxb", b: "doh", kind: "sea", bend: -28 },
  { a: "doh", b: "kwi", kind: "sea", bend: 36 },
  { a: "ruh", b: "dxb", kind: "capital", bend: -40 },
  { a: "ruh", b: "doh", kind: "capital", bend: -20 },
  { a: "ruh", b: "kwi", kind: "capital", bend: 18 },
];

const W = 1000;
const H = 560;
const LON = [35.5, 61];
const LAT = [15.5, 31];
const px = (lon: number) => ((lon - LON[0]) / (LON[1] - LON[0])) * W;
const py = (lat: number) => H - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * H;
const hubById = Object.fromEntries(HUBS.map((h) => [h.id, h]));

function routePath(r: Route) {
  const a = hubById[r.a];
  const b = hubById[r.b];
  const ax = px(a.lon), ay = py(a.lat), bx = px(b.lon), by = py(b.lat);
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const d = Math.hypot(bx - ax, by - ay) || 1;
  const nx = -(by - ay) / d, ny = (bx - ax) / d;
  const bend = r.bend ?? 0;
  return `M${ax},${ay} Q${mx + nx * bend},${my + ny * bend} ${bx},${by}`;
}

const STYLE: Record<Route["kind"], { stroke: string; dash: string; width: number; speed: string }> = {
  road: { stroke: "var(--fg-3)", dash: "0", width: 1, speed: "0s" },
  sea: { stroke: "var(--gold)", dash: "6 8", width: 1.2, speed: "18s" },
  capital: { stroke: "var(--emerald-light)", dash: "2 10", width: 1.4, speed: "10s" },
};

export default function GCCMapSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [hover, setHover] = useState<string | null>(null);

  const legend = [
    { k: "road", en: "Road & rail corridors", ar: "ممرات الطرق والسكك" },
    { k: "sea", en: "Sea lanes", ar: "الخطوط البحرية" },
    { k: "capital", en: "Capital flows", ar: "تدفقات رأس المال" },
  ] as const;

  return (
    <section id="network" className="relative py-28 bg-ink-1 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "الشبكة" : "The network"}</p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "مبنيّة للخليج: موانئه وعواصمه وأسواقه." : "Built for the Gulf: its ports, capitals and exchanges."}
          </h2>
          <p className="mt-5 text-fg-2 leading-relaxed max-w-2xl">
            {isAr
              ? "تكلفة واصلة بتعرفة خليجية موحدة، زكاة بنسبة 2.5٪ في القوائم، وسبع عملات خليجية. المحطة تفهم الجغرافيا التي تعمل فيها."
              : "Landed cost with GCC common tariff, 2.5% Zakat inside the statements, seven Gulf currencies. The terminal understands the geography it works in."}
          </p>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 panel-data relative overflow-hidden grain" dir="ltr"
        >
          <div className="absolute inset-0 grid-bg opacity-60" />
          <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full h-auto" role="img" aria-label={isAr ? "شبكة ممرات الخليج" : "GCC corridor network"}>
            <defs>
              <radialGradient id="hubGlow">
                <stop offset="0%" stopColor="var(--emerald-light)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--emerald-light)" stopOpacity="0" />
              </radialGradient>
              <style>{`
                @keyframes dashflow { to { stroke-dashoffset: -200; } }
                .flow { animation: dashflow var(--speed) linear infinite; }
                @media (prefers-reduced-motion: reduce) { .flow { animation: none; } }
              `}</style>
            </defs>

            {ROUTES.map((r) => {
              const s = STYLE[r.kind];
              const active = hover && (r.a === hover || r.b === hover);
              return (
                <path
                  key={`${r.a}-${r.b}-${r.kind}`}
                  d={routePath(r)}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={active ? s.width + 1 : s.width}
                  strokeDasharray={s.dash}
                  opacity={hover ? (active ? 1 : 0.18) : r.kind === "road" ? 0.45 : 0.85}
                  className={r.kind === "road" ? "" : "flow"}
                  style={{ ["--speed" as string]: s.speed, transition: "opacity 0.3s, stroke-width 0.3s" }}
                />
              );
            })}

            {HUBS.map((h) => {
              const x = px(h.lon), y = py(h.lat);
              const active = hover === h.id;
              const labelRight = h.lon < 52;
              return (
                <g
                  key={h.id}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <circle cx={x} cy={y} r={active ? 26 : 16} fill="url(#hubGlow)" style={{ transition: "r 0.3s" }} />
                  <circle cx={x} cy={y} r={h.kind === "port" ? 4.5 : 3.5} fill={h.kind === "port" ? "var(--gold)" : "var(--emerald-light)"} />
                  <circle cx={x} cy={y} r={9} fill="none" stroke="var(--emerald-border)" strokeWidth="1" />
                  <text
                    x={x + (labelRight ? 14 : -14)}
                    y={y + 4}
                    textAnchor={labelRight ? "start" : "end"}
                    className="font-mono"
                    fontSize="12"
                    fill={active ? "var(--fg-1)" : "var(--fg-2)"}
                  >
                    {isAr ? h.ar : h.en}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="relative border-t border-line px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10.5px] text-fg-3">
            {legend.map((l) => (
              <span key={l.k} className="flex items-center gap-2">
                <span className="w-6 border-t" style={{ borderColor: STYLE[l.k].stroke, borderStyle: l.k === "road" ? "solid" : "dashed" }} />
                {isAr ? l.ar : l.en}
              </span>
            ))}
            <span className="flex items-center gap-2 ms-auto">
              <span className="w-2 h-2 rounded-full bg-gold" /> {isAr ? "ميناء" : "port"}
              <span className="w-2 h-2 rounded-full bg-emerald-light ms-3" /> {isAr ? "عاصمة / مركز مالي" : "capital / financial centre"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
