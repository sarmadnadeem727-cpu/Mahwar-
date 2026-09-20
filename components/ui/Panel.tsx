import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Panel treatments — deliberately different by content type.
 *  data   — sharp, hairline border, white. Tables, charts, tickers.
 *  float  — near-sharp radius, e2 shadow. The workbench preview, news card.
 *  well   — recessed off-white, no shadow. Groups of compact tools.
 */
export type PanelTone = "data" | "float" | "well";

interface PanelProps {
  tone?: PanelTone;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

const tones: Record<PanelTone, string> = {
  data: "rounded-none border border-line bg-surface-0",
  float: "rounded-panel border border-line bg-surface-0 shadow-e2",
  well: "rounded-none border border-line bg-surface-1",
};

export function Panel({ tone = "data", as: Tag = "div", className, children }: PanelProps) {
  return <Tag className={cn(tones[tone], className)}>{children}</Tag>;
}

/** Mono strip that sits at the top of a data/float panel. */
export function PanelHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 items-center justify-between gap-4 border-b border-line bg-surface-1 px-3 font-mono text-mono-xs text-ink-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
