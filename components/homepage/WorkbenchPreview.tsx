"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { formatMoney, formatMultiple, formatNumber, formatSignedPct } from "../../lib/format";
import { risePanel, stage, useMotionOff } from "../../lib/mw-motion";
import { CountUp } from "../ui/CountUp";
import { Panel, PanelHeader } from "../ui/Panel";
import { StatusDot, Tag } from "../ui/Tag";

/**
 * SAMPLE figures — mirrors the live product's demonstration model
 * (Saudi Aramco valuation sample). Not connected to any backend.
 */
const sample = {
  dcf: { intrinsic: 38.45, market: 32.48, upside: 18.4, wacc: 8.9, growth: 8.0 },
  lbo: { irr: 24.8, moic: 2.65, seniorDebt: 55, exitMultiple: 10.0 },
  aaoifi: { debtToAssets: 14.2, limit: 33, interestIncome: 2.1, purification: 0.04 },
} as const;

const t0 = stage.workbenchFigures;

export function WorkbenchPreview({ className }: { className?: string }) {
  const off = useMotionOff();
  return (
    <motion.div
      variants={risePanel}
      custom={stage.workbenchPanel}
      initial={off ? false : "hidden"}
      animate="visible"
      className={className}
    >
      <Panel tone="float" className="overflow-hidden">
        <PanelHeader>
          <span className="flex items-center gap-2 text-ink-700">
            <StatusDot pulse />
            Workbench
          </span>
          <span className="truncate">SAUDI_ARAMCO_VALUATION.MODEL</span>
          <Tag>Sample</Tag>
        </PanelHeader>

        <div className="divide-y divide-line">
          {/* DCF */}
          <Row label="DCF intrinsic value" sub={`WACC ${formatNumber(sample.dcf.wacc, 1)}% · 5Y growth ${formatNumber(sample.dcf.growth, 1)}%`}>
            <CountUp value={sample.dcf.intrinsic} format={(n) => formatMoney(n)} delay={t0} className="font-mono text-mono-lg text-ink-900" />
            <span className="font-mono text-mono-sm text-accent-700">
              <CountUp value={sample.dcf.upside} format={(n) => formatSignedPct(n)} delay={t0 + 0.05} /> upside
            </span>
          </Row>

          {/* LBO */}
          <Row label="LBO sponsor IRR" sub={`Senior debt ${sample.lbo.seniorDebt}% · exit ${formatMultiple(sample.lbo.exitMultiple, 1)} · 5Y hold`}>
            <CountUp value={sample.lbo.irr} format={(n) => `${formatNumber(n, 1)}%`} delay={t0 + 0.08} className="font-mono text-mono-lg text-ink-900" />
            <span className="font-mono text-mono-sm text-ink-700">
              <CountUp value={sample.lbo.moic} format={(n) => formatMultiple(n)} delay={t0 + 0.13} /> MOIC
            </span>
          </Row>

          {/* AAOIFI */}
          <Row
            label="AAOIFI Standard 21"
            sub={`Debt / assets ${formatNumber(sample.aaoifi.debtToAssets, 1)}% < ${sample.aaoifi.limit}% · purification ${formatMoney(sample.aaoifi.purification)} / sh`}
          >
            <span className="font-mono text-mono-lg text-accent-700">Pass</span>
            <span className="flex gap-1.5">
              <Tag tone="positive">Debt</Tag>
              <Tag tone="positive">Interest</Tag>
            </span>
          </Row>
        </div>

        <div className="border-t border-line bg-surface-1 px-3 py-2 font-mono text-mono-xs text-ink-300">
          Sample outputs. Not connected to a live model.
        </div>
      </Panel>
    </motion.div>
  );
}

function Row({ label, sub, children }: { label: string; sub: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-x-4 px-3 py-3">
      <div className="min-w-0">
        <div className="text-caption text-ink-700">{label}</div>
        <div className="mt-0.5 truncate font-mono text-mono-xs text-ink-500">{sub}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-end">{children}</div>
    </div>
  );
}
