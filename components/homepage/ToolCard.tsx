"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { cascadeItem } from "../../lib/mw-motion";
import type { Tool } from "../../lib/tools";
import { Button } from "../ui/Button";
import { Tag } from "../ui/Tag";
import { ToolVisual } from "./ToolVisuals";

/**
 * Two treatments, one component:
 *  featured — white, hairline border, e1 shadow, large visual, full description.
 *  compact  — no own border/shadow; the parent grid draws shared hairlines so
 *             eleven tools read as one instrument panel, not eleven cards.
 */
export function ToolCard({ tool, treatment }: { tool: Tool; treatment: "featured" | "compact" }) {
  const featured = treatment === "featured";
  const href = tool.panel ? `/dashboard?panel=${tool.panel}` : tool.href;

  return (
    <motion.article
      variants={cascadeItem}
      className={cn(
        "group relative flex flex-col bg-surface-0",
        featured ? "rounded-panel border border-line p-6 shadow-e1" : "p-5",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <Tag>{tool.category}</Tag>
          <h3 className={cn("mt-2 font-sans font-semibold text-ink-900", featured ? "text-heading" : "text-title")}>{tool.title}</h3>
        </div>
      </header>

      <p className={cn("mt-2 text-ink-700", featured ? "max-w-prose text-body-sm" : "text-caption")}>{tool.description}</p>

      <div className={cn("mt-4", featured ? "mt-6" : "")}>
        <ToolVisual kind={tool.visual} size={featured ? "lg" : "sm"} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 border-t border-line pt-3 font-mono text-mono-xs">
        <dd className="text-ink-700">{tool.metrics[0]}</dd>
        <dd className="text-end text-ink-700">{tool.metrics[1]}</dd>
      </dl>

      <div className="mt-auto pt-4">
        <Button href={href} variant="tertiary" label={`Launch ${tool.title}`}>
          Launch Engine
        </Button>
      </div>
    </motion.article>
  );
}
