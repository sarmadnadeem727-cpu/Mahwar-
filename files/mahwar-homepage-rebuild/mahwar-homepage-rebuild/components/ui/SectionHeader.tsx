import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Section heading block. Serif is reserved for display headlines (hero H1
 * and section H2s); everything below that is Inter.
 * The mono index is legitimate here: the homepage sections are a top-to-bottom sequence.
 */
export function SectionHeader({
  index,
  title,
  lede,
  aside,
  className,
}: {
  index: string;
  title: ReactNode;
  lede?: ReactNode;
  /** End-aligned mono meta, e.g. "10 engines" */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 border-t border-line pt-6 lg:grid-cols-12", className)}>
      <div className="font-mono text-mono-sm text-ink-500 lg:col-span-2">{index}</div>
      <div className="lg:col-span-7">
        <h2 className="text-balance font-serif text-display-md text-ink-900">{title}</h2>
        {lede && <p className="mt-3 max-w-prose text-body-sm text-ink-700">{lede}</p>}
      </div>
      {aside && <div className="font-mono text-mono-sm text-ink-500 lg:col-span-3 lg:text-end">{aside}</div>}
    </div>
  );
}
