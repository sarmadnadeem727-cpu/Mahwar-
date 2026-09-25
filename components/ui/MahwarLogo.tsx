"use client";

import React from "react";
import { motion } from "framer-motion";

interface MahwarLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

/**
 * The Mahwar mark, drawn from the brand logo: a split teal outer ring, navy
 * axes and diagonals passing through its gaps, a second teal ring carrying four
 * gold nodes, two navy orbits around a navy core ring, and a solid teal centre.
 * Every colour is a theme token, so the mark reads on both light and dark.
 */
const MahwarLogo = ({ size = 120, animate = true, className = "" }: MahwarLogoProps) => {
  const C = 200;
  const R_OUTER = 168;
  const R_MID = 124;
  const R_CORE = 52;

  // Outer ring: six arcs with gaps at the vertical axis and the four diagonals.
  const gaps = [90, 270, 45, 135, 225, 315];
  const gapHalf = 9;
  const outerArcs: string[] = [];
  const sorted = [...gaps].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i] + gapHalf;
    const end = (i === sorted.length - 1 ? sorted[0] + 360 : sorted[i + 1]) - gapHalf;
    outerArcs.push(arc(C, C, R_OUTER, start, end));
  }
  // Middle ring: two long arcs, gaps at 12 and 6 o'clock where the vertical bars sit.
  const midArcs = [arc(C, C, R_MID, 100, 260), arc(C, C, R_MID, 280, 440)];

  const nodeAngles = [135, 30, 210, 315];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        {/* Outer split ring — teal */}
        <g stroke="var(--emerald)" strokeWidth="12" strokeLinecap="butt">
          {outerArcs.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* Vertical navy bars through the top / bottom gaps */}
        <g stroke="var(--navy)" strokeWidth="12" strokeLinecap="butt">
          <line x1={C} y1={C - R_OUTER - 14} x2={C} y2={C - R_MID + 4} />
          <line x1={C} y1={C + R_MID - 4} x2={C} y2={C + R_OUTER + 14} />
        </g>

        {/* Diagonal navy lines through the four diagonal gaps */}
        <g stroke="var(--navy)" strokeWidth="10" strokeLinecap="butt">
          {[45, 135, 225, 315].map((a) => {
            const p1 = polar(C, C, R_CORE + 22, a);
            const p2 = polar(C, C, R_OUTER + 18, a);
            return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}
        </g>

        {/* Middle ring — teal, carries the gold nodes */}
        <g stroke="var(--emerald)" strokeWidth="9">
          {midArcs.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* Orbits — two navy ellipses at ±45°, the "atom" of capital and goods */}
        <motion.g
          style={{ originX: "200px", originY: "200px" }}
          animate={animate ? { rotate: [0, 360] } : undefined}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx={C} cy={C} rx={118} ry={48} stroke="var(--navy)" strokeWidth="9" transform={`rotate(45 ${C} ${C})`} />
          <ellipse cx={C} cy={C} rx={118} ry={48} stroke="var(--navy)" strokeWidth="9" transform={`rotate(-45 ${C} ${C})`} />
        </motion.g>

        {/* Core ring — navy — and the solid teal centre */}
        <circle cx={C} cy={C} r={R_CORE} stroke="var(--navy)" strokeWidth="10" />
        <motion.circle
          cx={C}
          cy={C}
          r={22}
          fill="var(--emerald-deep)"
          animate={animate ? { scale: [1, 1.08, 1] } : undefined}
          style={{ originX: "200px", originY: "200px" }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Gold nodes riding the middle ring */}
        <motion.g
          style={{ originX: "200px", originY: "200px" }}
          animate={animate ? { rotate: [0, -360] } : undefined}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {nodeAngles.map((a) => {
            const p = polar(C, C, R_MID, a);
            return <circle key={a} cx={p.x} cy={p.y} r={11} fill="var(--gold)" />;
          })}
        </motion.g>
      </svg>
    </div>
  );
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: +(cx + r * Math.cos(rad)).toFixed(2), y: +(cy + r * Math.sin(rad)).toFixed(2) };
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default MahwarLogo;
