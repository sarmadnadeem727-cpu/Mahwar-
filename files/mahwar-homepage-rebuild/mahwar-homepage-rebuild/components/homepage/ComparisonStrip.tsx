"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { cascadeGroup, cascadeItem, inViewOnce, useMotionOff } from "../../lib/motion";
import { comparison, type ComparisonRow } from "../../lib/sample-data";
import { Panel, PanelHeader } from "../ui/Panel";

/**
 * Mahwar vs. a generic global terminal — a scannable data table, not prose.
 * Rendered as a real <table> for screen readers; rows cascade in on scroll.
 */
export function ComparisonStrip({ className }: { className?: string }) {
  const off = useMotionOff();
  const reveal = off
    ? {}
    : ({ variants: cascadeGroup, initial: "hidden", whileInView: "visible", viewport: inViewOnce } as const);

  return (
    <Panel tone="data" as="section" className={cn("overflow-hidden", className)}>
      <PanelHeader>
        <span className="text-ink-700">Coverage comparison</span>
        <span>6 dimensions</span>
      </PanelHeader>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line font-mono text-mono-xs text-ink-500">
            <th scope="col" className="px-4 py-2.5 text-start font-normal">
              Dimension
            </th>
            <th scope="col" className="w-28 px-4 py-2.5 text-center font-normal text-ink-900">
              Mahwar
            </th>
            <th scope="col" className="w-36 px-4 py-2.5 text-center font-normal">
              Generic global terminal
            </th>
          </tr>
        </thead>
        <motion.tbody {...reveal}>
          {comparison.map((row) => (
            <Row key={row.dimension} row={row} />
          ))}
        </motion.tbody>
      </table>
    </Panel>
  );
}

function Row({ row }: { row: ComparisonRow }) {
  return (
    <motion.tr variants={cascadeItem} className="border-b border-line last:border-b-0 hover:bg-surface-1">
      <th scope="row" className="px-4 py-3 text-start align-top font-normal">
        <div className="text-body-sm font-medium text-ink-900">{row.dimension}</div>
        <div className="mt-0.5 text-caption text-ink-500">{row.detail}</div>
      </th>
      <td className="px-4 py-3 text-center align-top">
        <Mark value={row.mahwar} />
      </td>
      <td className="px-4 py-3 text-center align-top">
        <Mark value={row.generic} />
      </td>
    </motion.tr>
  );
}

function Mark({ value }: { value: ComparisonRow["mahwar"] }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-mono-sm text-accent-700">
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path d="M2 6.2 4.8 9 10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === "partial") {
    return <span className="font-mono text-mono-xs text-warn-500">Partial</span>;
  }
  return (
    <span className="inline-flex items-center font-mono text-mono-sm text-ink-300">
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3" fill="none">
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
      </svg>
      <span className="sr-only">No</span>
    </span>
  );
}
