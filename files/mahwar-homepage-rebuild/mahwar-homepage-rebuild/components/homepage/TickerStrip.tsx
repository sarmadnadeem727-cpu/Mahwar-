"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import { direction, formatNumber, formatSigned, formatSignedPct } from "../../lib/format";
import { rise, stage, useMotionOff } from "../../lib/motion";
import { exchanges, tickers, type Ticker } from "../../lib/sample-data";

/** Seconds for one full pass — scales with row count so speed stays constant. */
const SECONDS_PER_ITEM = 2.6;

export function TickerStrip() {
  const off = useMotionOff();
  const style = { "--mw-marquee-duration": `${tickers.length * SECONDS_PER_ITEM}s` } as CSSProperties;

  return (
    <motion.section
      aria-label="Sample GCC market ticker"
      variants={rise}
      custom={stage.ticker}
      initial={off ? false : "hidden"}
      animate="visible"
      className="border-y border-line bg-surface-0"
    >
      <div className="mx-auto flex max-w-page items-stretch">
        {/* Fixed label cell keeps the strip from reading as pure decoration */}
        <div className="hidden shrink-0 items-center gap-2 border-e border-line px-4 font-mono text-mono-xs text-ink-500 sm:flex">
          <span className="text-ink-900">GCC</span>
          <span>Sample</span>
        </div>

        {/* Marquee: the list is rendered twice; translating −50% loops without a seam. */}
        <div
          className={cn("relative flex-1 overflow-hidden", off && "overflow-x-auto")}
          style={style}
          // Under reduced motion the strip is a plain horizontally scrollable row.
        >
          <ul
            className={cn(
              "flex w-max items-stretch",
              !off && "motion-safe:animate-mw-marquee motion-safe:hover:[animation-play-state:paused]",
            )}
          >
            {tickers.map((t) => (
              <TickerCell key={`a-${t.exchange}-${t.symbol}`} t={t} />
            ))}
            {!off &&
              tickers.map((t) => <TickerCell key={`b-${t.exchange}-${t.symbol}`} t={t} ariaHidden />)}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

function TickerCell({ t, ariaHidden = false }: { t: Ticker; ariaHidden?: boolean }) {
  const ex = exchanges[t.exchange];
  const dir = direction(t.change);
  const tone = dir === "up" ? "text-accent-700" : dir === "down" ? "text-neg-500" : "text-ink-500";
  const arrow = dir === "up" ? "\u25B4" : dir === "down" ? "\u25BE" : "\u2013";

  return (
    <li
      aria-hidden={ariaHidden || undefined}
      className="flex h-10 items-center gap-2.5 whitespace-nowrap border-e border-line px-4 font-mono text-mono-sm"
      dir="ltr"
    >
      <span className="text-mono-xs text-ink-300">{ex.code}</span>
      <span className="font-medium text-ink-900">{t.symbol}</span>
      <span className="text-ink-700">{t.isIndex ? formatNumber(t.price, 2) : `${ex.currency} ${formatNumber(t.price, ex.decimals)}`}</span>
      <span className={cn("flex items-center gap-1", tone)}>
        <span aria-hidden="true" className="text-mono-xs">
          {arrow}
        </span>
        {formatSigned(t.change, t.isIndex ? 2 : ex.decimals)}
        <span className="text-mono-xs">({formatSignedPct(t.pct, 2)})</span>
      </span>
    </li>
  );
}
