"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { cascadeGroup, cascadeItem, inViewOnce, useMotionOff } from "../../lib/motion";
import { headlines, type Headline } from "../../lib/sample-data";
import { Button } from "../ui/Button";
import { Panel, PanelHeader } from "../ui/Panel";
import { StatusDot, Tag } from "../ui/Tag";

/** Three sample headlines, one per wire feed. Arabic rows render RTL. */
export function NewsPreview({ className }: { className?: string }) {
  const off = useMotionOff();
  const reveal = off
    ? {}
    : ({ variants: cascadeGroup, initial: "hidden", whileInView: "visible", viewport: inViewOnce } as const);

  return (
    <Panel tone="float" as="section" className={cn("flex flex-col overflow-hidden", className)}>
      <PanelHeader>
        <span className="flex items-center gap-2 text-ink-700">
          <StatusDot pulse />
          GCC Wire
        </span>
        <span>AST · UTC+3</span>
        <Tag>Sample</Tag>
      </PanelHeader>

      <motion.ol {...reveal} className="divide-y divide-line">
        {headlines.map((h) => (
          <HeadlineRow key={h.id} h={h} />
        ))}
      </motion.ol>

      <div className="mt-auto flex items-center justify-between border-t border-line px-4 py-3">
        <span className="font-mono text-mono-xs text-ink-500">Tadawul · DFM · ADX · QSE · Arabic wire · logistics</span>
        <Button href="#" variant="tertiary">
          View Full Wire
        </Button>
      </div>
    </Panel>
  );
}

function HeadlineRow({ h }: { h: Headline }) {
  const ar = h.lang === "ar";
  return (
    <motion.li variants={cascadeItem} className="grid grid-cols-[3rem_1fr] gap-x-3 px-4 py-3.5">
      <time className="pt-0.5 font-mono text-mono-xs text-ink-500" dir="ltr">
        {h.time}
      </time>
      <div className="min-w-0">
        <div className={cn("flex items-center gap-2 font-mono text-mono-xs text-ink-500", ar && "flex-row-reverse")}>
          <span lang={ar ? "ar" : undefined}>{h.source}</span>
        </div>
        <p
          lang={ar ? "ar" : undefined}
          dir={ar ? "rtl" : "ltr"}
          className={cn("mt-1 text-body-sm text-ink-900", ar ? "text-end leading-relaxed" : "text-start")}
        >
          {h.title}
        </p>
      </div>
    </motion.li>
  );
}
