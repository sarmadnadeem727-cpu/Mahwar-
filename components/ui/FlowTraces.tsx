"use client";

import React, { forwardRef, useMemo } from "react";

/**
 * FlowTraces — the brand line-art behind the hero headline.
 *
 * Capital traces enter from the left, goods traces from the right, and every
 * one of them terminates on a single vertical axis (محور, "axis"). The paths
 * are generated deterministically from a seed so the drawing is the same on
 * every visit, and drawn on by the hero timeline with svg.createDrawable.
 *
 * The centre node is a <path> so the timeline can morph it between a circle
 * (a coin) and a square (a container) with svg.morphTo.
 */

export const TRACE_W = 900;
export const TRACE_H = 440;
const AXIS_X = TRACE_W / 2;
const PER_SIDE = 7;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Trace { d: string; end: [number, number]; side: "L" | "R"; accent: boolean }

function buildTraces(seed = 7): Trace[] {
  const rnd = mulberry32(seed);
  const out: Trace[] = [];
  const endYs = Array.from({ length: PER_SIDE }, (_, i) => 52 + (i / (PER_SIDE - 1)) * (TRACE_H - 104));
  (["L", "R"] as const).forEach((side, s) => {
    const dir = side === "L" ? 1 : -1;
    const x0 = side === "L" ? 0 : TRACE_W;
    for (let i = 0; i < PER_SIDE; i++) {
      const yEnd = endYs[i] + (s ? 14 : -14);
      const y0 = Math.max(24, Math.min(TRACE_H - 24, yEnd + (rnd() - 0.5) * 150));
      const dy = yEnd - y0;
      const run = 90 + rnd() * 140;
      const x1 = x0 + dir * run;
      const x2 = x1 + dir * Math.abs(dy);
      const d = `M${x0},${y0.toFixed(1)} H${x1.toFixed(1)} L${x2.toFixed(1)},${yEnd.toFixed(1)} H${AXIS_X}`;
      out.push({ d, end: [AXIS_X, yEnd], side, accent: i === 3 });
    }
  });
  return out;
}

/** Circle and square as paths with the same number of segments, for morphTo. */
const CENTER_Y = TRACE_H / 2;
const R = 14;
export const NODE_CIRCLE = `M${AXIS_X - R},${CENTER_Y} A${R},${R} 0 1,1 ${AXIS_X + R},${CENTER_Y} A${R},${R} 0 1,1 ${AXIS_X - R},${CENTER_Y} Z`;
export const NODE_SQUARE = `M${AXIS_X - R},${CENTER_Y - R} H${AXIS_X + R} V${CENTER_Y + R} H${AXIS_X - R} Z`;

interface Props { className?: string; seed?: number }

const FlowTraces = forwardRef<SVGSVGElement, Props>(function FlowTraces({ className = "", seed = 7 }, ref) {
  const traces = useMemo(() => buildTraces(seed), [seed]);
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${TRACE_W} ${TRACE_H}`}
      className={className}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="trace-fade-l" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--emerald)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--emerald)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--emerald-light)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="trace-fade-r" x1="1" x2="0" y1="0" y2="0">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--gold)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* The axis — drawn first */}
      <line data-trace-axis x1={AXIS_X} y1={18} x2={AXIS_X} y2={TRACE_H - 18} stroke="var(--fg-2)" strokeWidth="1" strokeOpacity="0.55" />
      {Array.from({ length: 11 }).map((_, k) => {
        const y = 18 + (k / 10) * (TRACE_H - 36);
        return <line key={k} data-trace-tick x1={AXIS_X - (k % 5 === 0 ? 7 : 3)} y1={y} x2={AXIS_X + (k % 5 === 0 ? 7 : 3)} y2={y} stroke="var(--fg-3)" strokeWidth="1" />;
      })}

      {/* Traces */}
      {traces.map((t, i) => (
        <path
          key={i}
          data-trace-path
          data-side={t.side}
          d={t.d}
          stroke={t.side === "L" ? "url(#trace-fade-l)" : "url(#trace-fade-r)"}
          strokeWidth={t.accent ? 1.4 : 0.9}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* Terminal nodes */}
      {traces.map((t, i) => (
        <circle key={`n-${i}`} data-trace-node cx={t.end[0]} cy={t.end[1]} r={t.accent ? 3.2 : 2.2} fill={t.side === "L" ? "var(--emerald-light)" : "var(--gold)"} opacity="0" />
      ))}

      {/* Centre node — the "one terminal" — morphs coin ↔ container */}
      <path data-trace-center d={NODE_CIRCLE} stroke="var(--fg-1)" strokeWidth="1.2" fill="var(--ink-1)" opacity="0" />
      <path data-trace-center-target d={NODE_SQUARE} style={{ display: "none" }} />
      <circle data-trace-core cx={AXIS_X} cy={CENTER_Y} r="3" fill="var(--emerald-light)" opacity="0" />
    </svg>
  );
});

export default FlowTraces;
