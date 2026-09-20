"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../../lib/cn";
import { easeSlow, useMotionOff } from "../../lib/motion";
import { color } from "../../lib/tokens";
import type { VisualKey } from "../../lib/tools";

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */

export type VisualSize = "sm" | "lg";

const MARGIN = { top: 4, right: 4, bottom: 0, left: 4 };

/** Mono annotation placed over a chart corner. */
function Note({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute font-mono text-mono-xs text-ink-500", className)}>
      {children}
    </span>
  );
}

/** Horizontal stacked bar built from plain divs — cost stacks, capital structure. */
function Stack({
  segments,
  emphasis = 0,
}: {
  segments: ReadonlyArray<{ label: string; value: number }>;
  /** Index of the segment drawn in accent */
  emphasis?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2">
      <div className="flex h-5 w-full overflow-hidden rounded-none">
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%` }}
            className={cn(
              "h-full border-e border-surface-0 last:border-e-0",
              i === emphasis ? "bg-accent-500" : i % 2 === 0 ? "bg-ink-300" : "bg-line-strong",
            )}
            title={s.label}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-mono-xs text-ink-500">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5",
                i === emphasis ? "bg-accent-500" : i % 2 === 0 ? "bg-ink-300" : "bg-line-strong",
              )}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Financial suite                                                    */
/* ------------------------------------------------------------------ */

const fcf = [1020, 1075, 1110, 1180, 1250, 1310, 1365, 1440, 1520, 1590].map((v, i) => ({ i, v }));

function DcfSparkline() {
  return (
    <div className="relative h-full w-full">
      <Note className="start-1 top-0">FCF 2026–2030 · SAR M</Note>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fcf} margin={{ ...MARGIN, top: 18 }}>
          <YAxis hide domain={["dataMin - 80", "dataMax + 40"]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color.accent500}
            strokeWidth={1.5}
            fill={color.accent100}
            fillOpacity={0.9}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const paydown = [100, 88, 74, 59, 42, 26];

function LboReturns() {
  return (
    <div className="flex h-full w-full items-stretch gap-4">
      <div className="flex flex-col justify-end">
        <span className="font-mono text-mono-xs text-ink-500">Sponsor IRR</span>
        <span className="font-mono text-mono-xl text-accent-700">24.8%</span>
        <span className="mt-1 font-mono text-mono-sm text-ink-700">2.65x MOIC</span>
      </div>
      <div className="flex h-full flex-1 gap-1.5 border-s border-line ps-3">
        {paydown.map((p, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn("w-full", i === paydown.length - 1 ? "bg-accent-500" : "bg-ink-300")}
                style={{ height: `${p}%` }}
              />
            </div>
            <span className="font-mono text-mono-xs text-ink-300">Y{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceRing({ ratio = 0.142, limit = 0.33 }: { ratio?: number; limit?: number }) {
  const off = useMotionOff();
  const share = ratio / limit; // fraction of the allowed threshold consumed
  return (
    <div className="flex h-full w-full items-center gap-5">
      <svg viewBox="0 0 80 80" className="h-full max-h-28 w-auto shrink-0" aria-hidden="true">
        <circle cx="40" cy="40" r="32" fill="none" stroke={color.line} strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r="32"
          fill="none"
          stroke={color.accent500}
          strokeWidth="6"
          strokeLinecap="butt"
          transform="rotate(-90 40 40)"
          initial={off ? { pathLength: share } : { pathLength: 0 }}
          whileInView={{ pathLength: share }}
          viewport={{ once: true }}
          transition={easeSlow}
        />
        {/* threshold marker at 100% of the limit */}
        <line x1="40" y1="4" x2="40" y2="14" stroke={color.ink900} strokeWidth="1.5" />
        <text
          x="40"
          y="44"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="13"
          fill={color.ink900}
        >
          {`${(ratio * 100).toFixed(1)}%`}
        </text>
      </svg>
      <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-mono-xs">
        <dt className="text-ink-500">Debt / assets</dt>
        <dd className="text-accent-700">{`${(ratio * 100).toFixed(1)}% < ${limit * 100}%`}</dd>
        <dt className="text-ink-500">Interest income</dt>
        <dd className="text-accent-700">2.1% &lt; 5%</dd>
        <dt className="text-ink-500">Standard 21</dt>
        <dd className="text-ink-900">Pass</dd>
      </dl>
    </div>
  );
}

const statements = Array.from({ length: 6 }, (_, i) => ({
  y: 2025 + i,
  is: 100 + i * 14,
  bs: 180 + i * 9,
  cf: 60 + i * 12,
}));

function StatementFlow() {
  return (
    <div className="relative h-full w-full">
      <Note className="end-1 top-0">IS · BS · CF</Note>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={statements} margin={{ ...MARGIN, top: 18 }}>
          <YAxis hide domain={[40, 260]} />
          <Line type="linear" dataKey="bs" stroke={color.ink300} strokeWidth={1.25} dot={false} isAnimationActive={false} />
          <Line type="linear" dataKey="is" stroke={color.ink700} strokeWidth={1.25} dot={false} isAnimationActive={false} />
          <Line type="linear" dataKey="cf" stroke={color.accent500} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Three statement columns with the NI → RE and CF → cash tie-outs drawn as links. */
function LinkedStatements() {
  return (
    <svg viewBox="0 0 220 88" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {[0, 1, 2].map((c) => (
        <g key={c} transform={`translate(${c * 78} 0)`}>
          <rect x="0" y="10" width="64" height="70" fill={color.surface1} stroke={color.line} />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x="8" y={20 + r * 13} width={r === 3 ? 30 : 46} height="4" fill={r === 3 ? color.accent500 : color.lineStrong} />
          ))}
          <text x="4" y="6" fontFamily="var(--font-mono)" fontSize="8" fill={color.ink500}>
            {["Income", "Balance", "Cash flow"][c]}
          </text>
        </g>
      ))}
      <path d="M64 61 C 72 61, 72 46, 78 46" fill="none" stroke={color.accent500} strokeWidth="1.25" />
      <path d="M142 61 C 150 61, 150 33, 156 33" fill="none" stroke={color.accent500} strokeWidth="1.25" />
      <circle cx="78" cy="46" r="1.5" fill={color.accent500} />
      <circle cx="156" cy="33" r="1.5" fill={color.accent500} />
    </svg>
  );
}

const grid: ReadonlyArray<ReadonlyArray<{ t: string; kind?: "formula" | "num" | "head" }>> = [
  [{ t: "", kind: "head" }, { t: "A", kind: "head" }, { t: "B", kind: "head" }, { t: "C", kind: "head" }],
  [{ t: "1", kind: "head" }, { t: "Revenue" }, { t: "12,400", kind: "num" }, { t: "=B1*1.12", kind: "formula" }],
  [{ t: "2", kind: "head" }, { t: "COGS" }, { t: "7,900", kind: "num" }, { t: "=B2*1.08", kind: "formula" }],
  [{ t: "3", kind: "head" }, { t: "Gross profit" }, { t: "=B1-B2", kind: "formula" }, { t: "=C1-C2", kind: "formula" }],
];

function FormulaGrid() {
  return (
    <div className="grid h-full w-full grid-cols-[1.25rem_1fr_1fr_1fr] content-center gap-px border border-line bg-line font-mono text-mono-xs">
      {grid.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={cn(
              "truncate px-1.5 py-1",
              cell.kind === "head" && "bg-surface-1 text-ink-300",
              cell.kind === "num" && "bg-surface-0 text-end text-ink-900",
              cell.kind === "formula" && "bg-accent-50 text-end text-accent-700",
              !cell.kind && "bg-surface-0 text-ink-700",
              r === 3 && c === 3 && "ring-1 ring-inset ring-accent-500",
            )}
          >
            {cell.t}
          </div>
        )),
      )}
    </div>
  );
}

const bins = [2, 4, 7, 11, 16, 22, 27, 30, 26, 20, 14, 9, 5, 3].map((n, i) => ({ i, n }));
const medianBin = 7;

function Histogram() {
  return (
    <div className="relative h-full w-full">
      <Note className="start-1 top-0">5,000 runs · P50 SAR 38.5</Note>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ ...MARGIN, top: 18 }} barCategoryGap={2}>
          <YAxis hide domain={[0, 34]} />
          <Bar dataKey="n" isAnimationActive={false}>
            {bins.map((b) => (
              <Cell key={b.i} fill={b.i === medianBin ? color.accent500 : color.lineStrong} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CostStack() {
  return (
    <Stack
      segments={[
        { label: "Headline 1,500", value: 1500 },
        { label: "Debt 320", value: 320 },
        { label: "Fees 95", value: 95 },
        { label: "Integration 80", value: 80 },
        { label: "Earn-out 50", value: 50 },
      ]}
      emphasis={0}
    />
  );
}

function CapitalStructure() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3">
      <Stack
        segments={[
          { label: "Equity 62% @ 10.6%", value: 62 },
          { label: "Debt 38% @ 4.2%", value: 38 },
        ]}
        emphasis={0}
      />
      <div className="font-mono text-mono-sm text-ink-900">
        WACC <span className="text-accent-700">8.9%</span>
      </div>
    </div>
  );
}

function DocumentVisual() {
  const off = useMotionOff();
  const lines = [52, 40, 46, 30, 44];
  return (
    <div className="flex h-full w-full items-center gap-4">
      <svg viewBox="0 0 64 80" className="h-full max-h-24 w-auto" aria-hidden="true">
        <path d="M2 2h40l20 20v56H2z" fill={color.surface0} stroke={color.lineStrong} strokeWidth="1.5" />
        <path d="M42 2v20h20" fill="none" stroke={color.lineStrong} strokeWidth="1.5" />
        {lines.map((w, i) => (
          <motion.rect
            key={i}
            x="12"
            y={30 + i * 9}
            height="3"
            fill={i === 0 ? color.accent500 : color.line}
            initial={off ? { width: w } : { width: 0 }}
            whileInView={{ width: w }}
            viewport={{ once: true }}
            transition={{ ...easeSlow, delay: off ? 0 : i * 0.05 }}
          />
        ))}
      </svg>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-mono-xs">
        <dt className="text-ink-500">Format</dt>
        <dd className="text-ink-900">PDF · XLSX</dd>
        <dt className="text-ink-500">Sections</dt>
        <dd className="text-ink-900">DCF · LBO · FS</dd>
        <dt className="text-ink-500">Status</dt>
        <dd className="text-accent-700">Ready</dd>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Operations suite                                                   */
/* ------------------------------------------------------------------ */

const eoq = Array.from({ length: 16 }, (_, i) => {
  const q = 400 + i * 220;
  const ordering = 180000 / q;
  const holding = q * 0.12;
  return { q, ordering, holding, total: ordering + holding };
});

function EoqCurve() {
  const min = eoq.reduce((m, p) => (p.total < m.total ? p : m), eoq[0]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={eoq} margin={MARGIN}>
        <XAxis dataKey="q" hide type="number" domain={["dataMin", "dataMax"]} />
        <YAxis hide domain={[0, 520]} />
        <Line type="monotone" dataKey="ordering" stroke={color.ink300} strokeWidth={1.25} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="holding" stroke={color.ink300} strokeWidth={1.25} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="total" stroke={color.accent500} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <ReferenceDot x={min.q} y={min.total} r={3} fill={color.accent500} stroke={color.surface0} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const bell = Array.from({ length: 41 }, (_, i) => {
  const z = -3 + i * 0.15;
  return { z, p: Math.exp(-0.5 * z * z), tail: z >= 1.65 ? Math.exp(-0.5 * z * z) : 0 };
});

function ServiceLevel() {
  return (
    <div className="relative h-full w-full">
      <Note className="end-1 top-0">z = 1.65 · 95%</Note>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={bell} margin={{ ...MARGIN, top: 18 }}>
          <XAxis dataKey="z" hide type="number" domain={[-3, 3]} />
          <YAxis hide domain={[0, 1.05]} />
          <Area type="monotone" dataKey="p" stroke={color.ink300} strokeWidth={1.25} fill={color.surface2} isAnimationActive={false} dot={false} />
          <Area type="monotone" dataKey="tail" stroke="none" fill={color.accent100} isAnimationActive={false} dot={false} />
          <ReferenceLine x={1.65} stroke={color.accent500} strokeWidth={1.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const pareto = [38, 22, 12, 8, 6, 4, 3, 3, 2, 2].reduce<Array<{ i: number; v: number; cum: number }>>((acc, v, i) => {
  const prev = acc.length ? acc[acc.length - 1].cum : 0;
  acc.push({ i, v, cum: prev + v });
  return acc;
}, []);

function Pareto() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={pareto} margin={MARGIN} barCategoryGap={3}>
        <YAxis yAxisId="v" hide domain={[0, 40]} />
        <YAxis yAxisId="c" hide domain={[0, 100]} />
        <Bar yAxisId="v" dataKey="v" isAnimationActive={false}>
          {pareto.map((p) => (
            <Cell key={p.i} fill={p.i < 2 ? color.accent500 : p.i < 5 ? color.ink300 : color.lineStrong} />
          ))}
        </Bar>
        <Line yAxisId="c" type="monotone" dataKey="cum" stroke={color.ink900} strokeWidth={1.25} dot={false} isAnimationActive={false} />
        <ReferenceLine yAxisId="c" y={80} stroke={color.line} strokeDasharray="2 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const demand = Array.from({ length: 18 }, (_, i) => {
  const base = 820 + i * 14 + Math.sin(i / 1.9) * 60;
  return i < 12 ? { i, actual: base, forecast: undefined } : { i, actual: undefined, forecast: base + 10 };
}).map((p, i, arr) => (i === 11 ? { ...p, forecast: arr[11].actual } : p));

function DemandTrend() {
  return (
    <div className="relative h-full w-full">
      <Note className="start-1 top-0">Actual → forecast</Note>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={demand} margin={{ ...MARGIN, top: 18 }}>
          <YAxis hide domain={[700, 1120]} />
          <Line type="monotone" dataKey="actual" stroke={color.ink700} strokeWidth={1.25} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="forecast" stroke={color.accent500} strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          <ReferenceLine x={11} stroke={color.line} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const trajectory = Array.from({ length: 24 }, (_, i) => {
  const cycle = i % 6;
  return { i, stock: cycle === 0 ? 100 : 100 - cycle * 14 };
});

function InventoryTrajectory() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trajectory} margin={MARGIN}>
        <YAxis hide domain={[0, 110]} />
        <Area type="linear" dataKey="stock" stroke={color.accent500} strokeWidth={1.25} fill={color.accent100} isAnimationActive={false} dot={false} />
        <ReferenceLine y={30} stroke={color.neg500} strokeDasharray="2 2" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LandedCost() {
  return (
    <Stack
      segments={[
        { label: "FOB 412", value: 412 },
        { label: "Freight 46", value: 46 },
        { label: "Insurance 6", value: 6 },
        { label: "Duty 21", value: 21 },
        { label: "Handling 32", value: 32 },
      ]}
      emphasis={0}
    />
  );
}

function TcoCompare() {
  const rows = [
    { label: "Option A", parts: [1.6, 0.8, 0.34, 0.1] },
    { label: "Option B", parts: [1.9, 0.45, 0.2, 0.06] },
  ];
  const max = 2.9;
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3">
      {rows.map((r, ri) => {
        const total = r.parts.reduce((a, b) => a + b, 0);
        return (
          <div key={r.label} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-2 font-mono text-mono-xs">
            <span className="text-ink-500">{r.label}</span>
            <div className="flex h-4" style={{ width: `${(total / max) * 100}%` }}>
              {r.parts.map((p, i) => (
                <div
                  key={i}
                  style={{ width: `${(p / total) * 100}%` }}
                  className={cn(
                    "border-e border-surface-0 last:border-e-0",
                    ri === 1 && i === 0 ? "bg-accent-500" : i % 2 === 0 ? "bg-ink-300" : "bg-line-strong",
                  )}
                />
              ))}
            </div>
            <span className={cn("text-end", ri === 1 ? "text-accent-700" : "text-ink-900")}>{total.toFixed(2)}M</span>
          </div>
        );
      })}
      <span className="font-mono text-mono-xs text-ink-300">Acquire · Operate · Maintain · Dispose</span>
    </div>
  );
}

const radar = [
  { k: "Quality", v: 88 },
  { k: "Delivery", v: 76 },
  { k: "Cost", v: 82 },
  { k: "Response", v: 70 },
  { k: "Compliance", v: 94 },
];

function RadarSwatch() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radar} outerRadius="72%" margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <PolarGrid stroke={color.line} />
        <PolarAngleAxis dataKey="k" tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: color.ink500 }} />
        <Radar dataKey="v" stroke={color.accent500} strokeWidth={1.25} fill={color.accent100} fillOpacity={0.8} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const sites = [
  { x: 46.7, y: 24.7, w: 40, name: "Riyadh" },
  { x: 50.1, y: 26.4, w: 55, name: "Dammam" },
  { x: 39.2, y: 21.5, w: 30, name: "Jeddah" },
  { x: 55.3, y: 25.3, w: 25, name: "Dubai" },
  { x: 51.5, y: 25.3, w: 18, name: "Doha" },
  { x: 48.0, y: 29.4, w: 14, name: "Kuwait" },
];
const optimum = [{ x: 49.1, y: 25.8, w: 60, name: "Optimum" }];

function ScatterSwatch() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 6, right: 8, bottom: 6, left: 8 }}>
        <XAxis dataKey="x" type="number" hide domain={[38, 57]} />
        <YAxis dataKey="y" type="number" hide domain={[20, 31]} />
        <Scatter data={sites} fill={color.ink300} isAnimationActive={false} />
        <Scatter data={optimum} fill={color.accent500} isAnimationActive={false} shape="diamond" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/** DIO + DSO − DPO laid out as a day-count timeline. */
function CycleDays({ dio = 48, dso = 62, dpo = 41, footer }: { dio?: number; dso?: number; dpo?: number; footer?: string }) {
  const span = dio + dso;
  const pct = (n: number) => `${(n / span) * 100}%`;
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 font-mono text-mono-xs">
      {/* Row 1: operating cycle (DIO + DSO). Row 2: payables offset, then the cash gap. */}
      <div className="flex h-3 w-full">
        <div className="h-full border-e border-surface-0 bg-ink-300" style={{ width: pct(dio) }} />
        <div className="h-full bg-line-strong" style={{ width: pct(dso) }} />
      </div>
      <div className="flex h-3 w-full">
        <div className="h-full border-e border-surface-0 bg-neg-100" style={{ width: pct(dpo) }} />
        <div className="h-full bg-accent-500" style={{ width: pct(span - dpo) }} />
      </div>
      <div className="grid grid-cols-4 gap-2 text-ink-500">
        <span>
          DIO <span className="text-ink-900">{dio}</span>
        </span>
        <span>
          DSO <span className="text-ink-900">{dso}</span>
        </span>
        <span>
          DPO <span className="text-neg-500">−{dpo}</span>
        </span>
        <span className="text-end">
          CCC <span className="text-accent-700">{span - dpo}d</span>
        </span>
      </div>
      {footer && <span className="text-ink-300">{footer}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dispatcher                                                         */
/* ------------------------------------------------------------------ */

export function ToolVisual({ kind, size = "sm" }: { kind: VisualKey; size?: VisualSize }) {
  return (
    <div className={cn("w-full", size === "lg" ? "h-40" : "h-24")}>
      <VisualSwitch kind={kind} />
    </div>
  );
}

function VisualSwitch({ kind }: { kind: VisualKey }) {
  switch (kind) {
    case "dcf-sparkline":
      return <DcfSparkline />;
    case "lbo-returns":
      return <LboReturns />;
    case "compliance-ring":
      return <ComplianceRing />;
    case "statement-flow":
      return <StatementFlow />;
    case "linked-statements":
      return <LinkedStatements />;
    case "formula-grid":
      return <FormulaGrid />;
    case "histogram":
      return <Histogram />;
    case "cost-stack":
      return <CostStack />;
    case "capital-structure":
      return <CapitalStructure />;
    case "document":
      return <DocumentVisual />;
    case "eoq-curve":
      return <EoqCurve />;
    case "service-level":
      return <ServiceLevel />;
    case "pareto":
      return <Pareto />;
    case "demand-trend":
      return <DemandTrend />;
    case "inventory-trajectory":
      return <InventoryTrajectory />;
    case "landed-cost":
      return <LandedCost />;
    case "tco-compare":
      return <TcoCompare />;
    case "radar":
      return <RadarSwatch />;
    case "scatter":
      return <ScatterSwatch />;
    case "cycle-days":
      return <CycleDays />;
    case "financing-cost":
      return <CycleDays footer="69 d × SAR 12.4M × 6.5% ÷ 365 = SAR 152K" />;
  }
}
