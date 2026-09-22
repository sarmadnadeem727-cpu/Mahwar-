"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import gulf from "@/lib/geo/gulf.json";
import { HUBS, HUB_MAP, ROUTES, type Route } from "@/lib/geo/hubs";
import { timeline, addDraw, stagger, prefersReducedMotion, onceInView, releaseDrawable, DURATION } from "@/lib/anime";

/**
 * GulfMap — a real map. Coastlines come from Natural Earth (lib/geo/gulf.json,
 * bundled at build time, 34 KB), projected with d3-geo Mercator and drawn as
 * SVG. GCC states are lit; neighbours sit in the dark. Corridors are bezier
 * paths between real hub coordinates, and small vehicles ride them with
 * SVG animateMotion (no JS per frame).
 *
 * Entrance (anime.js, once, when the map scrolls into view): neighbouring
 * land fades up, the six GCC coastlines draw on west → east, their fill
 * lights, corridors draw by kind (road, sea, capital), hubs pop west → east
 * and labels settle last. Only then do the dashed flows and vehicles start.
 */

/** Draw order for the coastlines — Saudi first, then clockwise round the Gulf. */
const GCC_ORDER: Record<string, number> = { "Saudi Arabia": 0, Kuwait: 1, Bahrain: 2, Qatar: 3, "United Arab Emirates": 4, Oman: 5 };

/**
 * Hub label placement. Most labels sit to the right of western hubs and to the
 * left of eastern ones; the exceptions below keep Dammam / Manama (8 px apart
 * on this projection) and the Abu Dhabi / Dubai pair from colliding.
 */
const LABEL_POS: Record<string, { dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  dmm: { dx: -13, dy: -6, anchor: "end" },
  bah: { dx: 13, dy: 10, anchor: "start" },
  auh: { dx: -13, dy: 12, anchor: "end" },
  dxb: { dx: 13, dy: -4, anchor: "start" },
};

const W = 1000;
const H = 620;
const BBOX: Feature<Geometry> = {
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [[[33.2, 12.4], [61.8, 12.4], [61.8, 32.6], [33.2, 32.6], [33.2, 12.4]]] },
};

const projection = geoMercator().fitExtent([[0, 0], [W, H]], BBOX);
const path = geoPath(projection);
const graticule = geoGraticule10();
const project = (lon: number, lat: number) => projection([lon, lat]) ?? [0, 0];

export function routePath(r: Route) {
  const a = HUB_MAP[r.a], b = HUB_MAP[r.b];
  const [ax, ay] = project(a.lon, a.lat);
  const [bx, by] = project(b.lon, b.lat);
  const mx = (ax + bx) / 2, my = (ay + by) / 2, d = Math.hypot(bx - ax, by - ay) || 1;
  const nx = -(by - ay) / d, ny = (bx - ax) / d, bend = r.bend ?? 0;
  return `M${ax.toFixed(1)},${ay.toFixed(1)} Q${(mx + nx * bend).toFixed(1)},${(my + ny * bend).toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
}

const STYLE = {
  road: { stroke: "var(--fg-3)", dash: "0", width: 1.1, dur: "0s" },
  sea: { stroke: "var(--gold)", dash: "5 7", width: 1.3, dur: "20s" },
  capital: { stroke: "var(--emerald-light)", dash: "2 9", width: 1.4, dur: "11s" },
} as const;

/** Tiny vehicle glyphs, drawn pointing +x so animateMotion rotate="auto" works. */
const Ship = () => (
  <g>
    <path d="M-9,2 L9,2 L6,6 L-6,6 Z" fill="var(--gold)" />
    <rect x="-5" y="-3" width="8" height="5" fill="var(--gold)" opacity="0.85" />
    <rect x="-2" y="-6" width="2" height="3" fill="var(--fg-1)" />
  </g>
);
const Truck = () => (
  <g>
    <rect x="-8" y="-4" width="11" height="7" fill="var(--fg-2)" />
    <rect x="3" y="-2" width="5" height="5" fill="var(--fg-3)" />
    <circle cx="-5" cy="4" r="1.6" fill="var(--ink-0)" />
    <circle cx="4" cy="4" r="1.6" fill="var(--ink-0)" />
  </g>
);
const Pulse = () => <circle r="3" fill="var(--emerald-light)" />;

interface GulfMapProps {
  isAr: boolean;
  hover?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Highlight one corridor (from → to hub ids); others fade. */
  highlight?: { a: string; b: string } | null;
  showVehicles?: boolean;
  showLabels?: boolean;
  /** Play the draw-on entrance the first time the map is visible (default true). */
  animateIn?: boolean;
  className?: string;
}

export default function GulfMap({ isAr, hover = null, onHover, onSelect, highlight = null, showVehicles = true, showLabels = true, animateIn = true, className = "" }: GulfMapProps) {
  const uid = useId().replace(/:/g, "");
  const fc = gulf as unknown as FeatureCollection;
  const svgRef = useRef<SVGSVGElement>(null);
  // "drawn" flips once the entrance has finished (or immediately when it is skipped);
  // flows, vehicles and hover glow only exist after that.
  const [drawn, setDrawn] = useState(() => !animateIn || prefersReducedMotion());

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !animateIn || prefersReducedMotion()) return;
    let tl: ReturnType<typeof timeline> | null = null;
    const stop = onceInView(el, () => {
      tl = timeline();
      tl.add(el.querySelectorAll("[data-land]"), { opacity: [0, 1], duration: DURATION.base }, 0);
      addDraw(tl, el, "[data-gcc]", { duration: 1500, each: 220, position: "-=500" });
      tl.add(el.querySelectorAll("[data-gcc]"), { fillOpacity: [0, 1], duration: DURATION.slow }, "-=900");
      tl.add(el.querySelectorAll("[data-country-label]"), { opacity: [0, 1], delay: stagger(80), duration: DURATION.base }, "-=1100");
      addDraw(tl, el, "[data-corridor='road']", { duration: 1100, each: 90, position: "-=1000" });
      addDraw(tl, el, "[data-corridor='sea']", { duration: 1300, each: 110, position: "-=700" });
      addDraw(tl, el, "[data-corridor='capital']", { duration: 900, each: 120, position: "-=800" });
      tl.add(el.querySelectorAll("[data-hub-halo]"), { r: [0, 12], opacity: [0, 0.1], delay: stagger(70), duration: DURATION.base, ease: "outBack" }, "-=1000");
      tl.add(el.querySelectorAll("[data-hub-dot='port']"), { r: [0, 4.5], delay: stagger(140), duration: DURATION.fast, ease: "outBack" }, "<");
      tl.add(el.querySelectorAll("[data-hub-dot='city']"), { r: [0, 3.6], delay: stagger(140), duration: DURATION.fast, ease: "outBack" }, "<");
      tl.add(el.querySelectorAll("[data-hub-ring]"), { r: [0, 8], opacity: [0, 1], delay: stagger(70), duration: DURATION.base }, "<+=80");
      tl.add(el.querySelectorAll("[data-hub-label]"), { opacity: [0, 1], translateX: [isAr ? 6 : -6, 0], delay: stagger(60), duration: DURATION.base }, "-=600");
      tl.add(el.querySelectorAll("[data-scalebar]"), { opacity: [0, 1], duration: DURATION.base }, "-=400");
      tl.then(() => {
        // Hand the corridors back to CSS: the dashed flow needs its own dasharray.
        releaseDrawable(el, "[data-corridor]");
        setDrawn(true);
      });
    });
    return () => { stop(); tl?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateIn]);

  const land = useMemo(() => fc.features.map((f) => ({ name: f.properties?.name as string, gcc: !!f.properties?.gcc, d: path(f) ?? "" })), [fc]);
  const gratD = useMemo(() => path(graticule) ?? "", []);
  const routes = useMemo(() => ROUTES.map((r) => ({ r, d: routePath(r), key: `${r.a}-${r.b}-${r.kind}` })), []);

  const isLit = (r: Route) => {
    if (highlight) return (r.a === highlight.a && r.b === highlight.b) || (r.a === highlight.b && r.b === highlight.a);
    if (hover) return r.a === hover || r.b === hover;
    return null; // no focus
  };

  const labelsFor = land.filter((l) => l.gcc);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto ${className}`} role="img" aria-label={isAr ? "خريطة الخليج" : "Gulf map"} data-drawn={drawn ? "1" : "0"}>
      <defs>
        <radialGradient id={`sea-${uid}`} cx="55%" cy="45%" r="75%">
          <stop offset="0%" style={{ stopColor: "var(--sea-0)" }} />
          <stop offset="60%" style={{ stopColor: "var(--sea-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--sea-2)" }} />
        </radialGradient>
        <linearGradient id={`gcc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--land-lit-0)" }} />
          <stop offset="100%" style={{ stopColor: "var(--land-lit-1)" }} />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--ink-0)" floodOpacity="0.6" />
        </filter>
        <pattern id={`hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(158,190,180,0.06)" strokeWidth="1" />
        </pattern>
        <style>{`
          @keyframes dash-${uid} { to { stroke-dashoffset: -240; } }
          .flow-${uid} { animation: dash-${uid} var(--dur) linear infinite; }
          @media (prefers-reduced-motion: reduce) { .flow-${uid} { animation: none; } }
        `}</style>
      </defs>

      {/* Sea */}
      <rect width={W} height={H} fill={`url(#sea-${uid})`} />
      <rect width={W} height={H} fill={`url(#hatch-${uid})`} />
      <path d={gratD} fill="none" stroke="rgba(158,190,180,0.07)" strokeWidth="0.6" />

      {/* Neighbouring land */}
      {land.filter((l) => !l.gcc).map((l) => (
        <path key={l.name} data-land d={l.d} fill="var(--ink-3)" stroke="rgba(158,190,180,0.14)" strokeWidth="0.6" style={{ opacity: drawn ? 1 : 0 }} />
      ))}

      {/* GCC states — lit */}
      <g filter={`url(#shadow-${uid})`}>
        {land.filter((l) => l.gcc).sort((a, b) => (GCC_ORDER[a.name] ?? 9) - (GCC_ORDER[b.name] ?? 9)).map((l) => (
          <path key={l.name} data-gcc d={l.d} fill={`url(#gcc-${uid})`} stroke="var(--emerald)" strokeWidth="0.9" strokeOpacity="0.7" style={{ fillOpacity: drawn ? 1 : 0 }} />
        ))}
      </g>

      {/* Country labels */}
      {showLabels && labelsFor.map((l) => {
        const f = fc.features.find((x) => x.properties?.name === l.name)!;
        const [cx, cy] = path.centroid(f);
        const short: Record<string, [string, string]> = {
          "Saudi Arabia": ["SAUDI ARABIA", "السعودية"], "United Arab Emirates": ["UAE", "الإمارات"], Qatar: ["QATAR", "قطر"],
          Kuwait: ["KUWAIT", "الكويت"], Bahrain: ["", ""], Oman: ["OMAN", "عُمان"],
        };
        const lab = short[l.name] ?? [l.name.toUpperCase(), l.name];
        if (!lab[0]) return null;
        const dy = l.name === "Saudi Arabia" ? 30 : l.name === "Oman" ? 10 : 0;
        return (
          <text key={l.name} data-country-label x={cx} y={cy + dy} textAnchor="middle" fontSize={l.name === "Saudi Arabia" ? 22 : 11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="rgba(158,190,180,0.28)" style={{ opacity: drawn ? 1 : 0 }}>
            {isAr ? lab[1] : lab[0]}
          </text>
        );
      })}

      {/* Corridors */}
      {routes.map(({ r, d, key }) => {
        const s = STYLE[r.kind];
        const lit = isLit(r);
        const opacity = lit === null ? (r.kind === "road" ? 0.55 : 0.9) : lit ? 1 : 0.12;
        return (
          <path
            key={`${key}-${drawn ? "live" : "draw"}`}
            data-corridor={r.kind}
            d={d}
            fill="none"
            stroke={s.stroke}
            strokeWidth={lit ? s.width + 1.2 : s.width}
            strokeDasharray={drawn ? s.dash : undefined}
            opacity={opacity}
            className={r.kind === "road" || !drawn ? "" : `flow-${uid}`}
            style={{ ["--dur" as string]: s.dur, transition: drawn ? "opacity 0.3s, stroke-width 0.3s" : undefined }}
            filter={lit && drawn ? `url(#glow-${uid})` : undefined}
          />
        );
      })}

      {/* Vehicles */}
      {showVehicles && drawn && routes.map(({ r, key }, i) => {
        if (r.kind === "capital" && i % 2) return null;
        const lit = isLit(r);
        if (lit === false) return null;
        const dur = r.kind === "sea" ? 26 + (i % 5) * 4 : r.kind === "road" ? 18 + (i % 4) * 3 : 9 + (i % 3) * 2;
        return (
          <g key={`v-${key}`} opacity={0.95}>
            {r.kind === "sea" ? <Ship /> : r.kind === "road" ? <Truck /> : <Pulse />}
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate={r.kind === "capital" ? "0" : "auto"} begin={`${-(i * 3.7) % dur}s`} keyPoints={i % 2 ? "0;1" : "1;0"} keyTimes="0;1" calcMode="linear">
              <mpath href={`#${uid}-${key}`} />
            </animateMotion>
          </g>
        );
      })}
      {/* motion paths (invisible) */}
      {routes.map(({ d, key }) => <path key={`mp-${key}`} id={`${uid}-${key}`} d={d} fill="none" stroke="none" />)}

      {/* Hubs */}
      {HUBS.map((h) => {
        const [x, y] = project(h.lon, h.lat);
        const active = hover === h.id || highlight?.a === h.id || highlight?.b === h.id;
        const port = h.kind === "port";
        const lp = LABEL_POS[h.id] ?? (h.lon < 52 || h.id === "mct" ? { dx: 13, dy: 4, anchor: "start" as const } : { dx: -13, dy: 4, anchor: "end" as const });
        const r = port ? 4.5 : 3.6;
        return (
          <g key={h.id} onMouseEnter={() => onHover?.(h.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onSelect?.(h.id)} className={onSelect ? "cursor-pointer" : ""}>
            <circle data-hub-halo cx={x} cy={y} r={drawn ? (active ? 22 : 12) : 0} fill={port ? "var(--gold)" : "var(--emerald-light)"} style={{ opacity: drawn ? (active ? 0.22 : 0.1) : 0, transition: drawn ? "r 0.3s, opacity 0.3s" : undefined }} />
            <circle data-hub-dot={port ? "port" : "city"} cx={x} cy={y} r={drawn ? r : 0} fill={port ? "var(--gold)" : "var(--emerald-light)"} />
            <circle data-hub-ring cx={x} cy={y} r={drawn ? 8 : 0} fill="none" stroke={port ? "rgba(217,179,110,0.5)" : "var(--emerald-border)"} strokeWidth="1" style={{ opacity: drawn ? 1 : 0 }} />
            {showLabels && (
              <text data-hub-label x={x + lp.dx} y={y + lp.dy} textAnchor={lp.anchor} fontSize="11.5" fontFamily="var(--font-mono)" fill={active ? "var(--fg-1)" : "var(--fg-2)"} style={{ paintOrder: "stroke", stroke: "rgba(6,13,17,0.85)", strokeWidth: 3, opacity: drawn ? 1 : 0 }}>
                {isAr ? h.ar : h.en}
              </text>
            )}
          </g>
        );
      })}

      {/* Scale bar (real, from the projection) */}
      {(() => {
        const [x0, y0] = project(56, 14.2);
        const [x1] = project(56 + 500 / (111.32 * Math.cos((14.2 * Math.PI) / 180)), 14.2);
        return (
          <g data-scalebar fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-3)" style={{ opacity: drawn ? 1 : 0 }}>
            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="var(--fg-3)" strokeWidth="1" />
            <line x1={x0} y1={y0 - 4} x2={x0} y2={y0 + 4} stroke="var(--fg-3)" />
            <line x1={x1} y1={y0 - 4} x2={x1} y2={y0 + 4} stroke="var(--fg-3)" />
            <text x={(x0 + x1) / 2} y={y0 - 7} textAnchor="middle">500 km</text>
          </g>
        );
      })()}
    </svg>
  );
}

