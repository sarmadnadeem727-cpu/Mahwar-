"use client";

import React, { useId, useMemo } from "react";
import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import gulf from "@/lib/geo/gulf.json";
import { HUBS, HUB_MAP, ROUTES, type Route } from "@/lib/geo/hubs";

/**
 * GulfMap — a real map. Coastlines come from Natural Earth (lib/geo/gulf.json,
 * bundled at build time, 34 KB), projected with d3-geo Mercator and drawn as
 * SVG. GCC states are lit; neighbours sit in the dark. Corridors are bezier
 * paths between real hub coordinates, and small vehicles ride them with
 * SVG animateMotion (no JS per frame).
 */

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
  className?: string;
}

export default function GulfMap({ isAr, hover = null, onHover, onSelect, highlight = null, showVehicles = true, showLabels = true, className = "" }: GulfMapProps) {
  const uid = useId().replace(/:/g, "");
  const fc = gulf as unknown as FeatureCollection;

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
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto ${className}`} role="img" aria-label={isAr ? "خريطة الخليج" : "Gulf map"}>
      <defs>
        <radialGradient id={`sea-${uid}`} cx="55%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#0d2530" />
          <stop offset="60%" stopColor="#09161c" />
          <stop offset="100%" stopColor="#060d11" />
        </radialGradient>
        <linearGradient id={`gcc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#173a34" />
          <stop offset="100%" stopColor="#0f2924" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
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
        <path key={l.name} d={l.d} fill="#101a1f" stroke="rgba(158,190,180,0.14)" strokeWidth="0.6" />
      ))}

      {/* GCC states — lit */}
      <g filter={`url(#shadow-${uid})`}>
        {land.filter((l) => l.gcc).map((l) => (
          <path key={l.name} d={l.d} fill={`url(#gcc-${uid})`} stroke="var(--emerald)" strokeWidth="0.9" strokeOpacity="0.7" />
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
          <text key={l.name} x={cx} y={cy + dy} textAnchor="middle" fontSize={l.name === "Saudi Arabia" ? 22 : 11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="rgba(158,190,180,0.28)">
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
            key={key}
            d={d}
            fill="none"
            stroke={s.stroke}
            strokeWidth={lit ? s.width + 1.2 : s.width}
            strokeDasharray={s.dash}
            opacity={opacity}
            className={r.kind === "road" ? "" : `flow-${uid}`}
            style={{ ["--dur" as string]: s.dur, transition: "opacity 0.3s, stroke-width 0.3s" }}
            filter={lit ? `url(#glow-${uid})` : undefined}
          />
        );
      })}

      {/* Vehicles */}
      {showVehicles && routes.map(({ r, key }, i) => {
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
        const right = h.lon < 52 || h.id === "mct";
        const port = h.kind === "port";
        return (
          <g key={h.id} onMouseEnter={() => onHover?.(h.id)} onMouseLeave={() => onHover?.(null)} onClick={() => onSelect?.(h.id)} className={onSelect ? "cursor-pointer" : ""}>
            <circle cx={x} cy={y} r={active ? 22 : 12} fill={port ? "var(--gold)" : "var(--emerald-light)"} opacity={active ? 0.22 : 0.1} style={{ transition: "r 0.3s, opacity 0.3s" }} />
            <circle cx={x} cy={y} r={port ? 4.5 : 3.6} fill={port ? "var(--gold)" : "var(--emerald-light)"} />
            <circle cx={x} cy={y} r={8} fill="none" stroke={port ? "rgba(217,179,110,0.5)" : "var(--emerald-border)"} strokeWidth="1" />
            {showLabels && (
              <text x={x + (right ? 13 : -13)} y={y + 4} textAnchor={right ? "start" : "end"} fontSize="11.5" fontFamily="var(--font-mono)" fill={active ? "var(--fg-1)" : "var(--fg-2)"} style={{ paintOrder: "stroke", stroke: "rgba(6,13,17,0.85)", strokeWidth: 3 }}>
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
          <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-3)">
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

