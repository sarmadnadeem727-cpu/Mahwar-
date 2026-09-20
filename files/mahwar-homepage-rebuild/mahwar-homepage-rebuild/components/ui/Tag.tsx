import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/** Small mono classifier: exchange codes, tool categories, statuses. */
export type TagTone = "neutral" | "positive" | "negative" | "caution";

const tones: Record<TagTone, string> = {
  neutral: "text-ink-500 border-line",
  positive: "text-accent-700 border-accent-100 bg-accent-50",
  negative: "text-neg-500 border-neg-100 bg-neg-100",
  caution: "text-warn-500 border-line",
};

export function Tag({ children, tone = "neutral", className }: { children: ReactNode; tone?: TagTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-ui border px-1.5 font-mono text-mono-xs uppercase leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status dot. `pulse` animates only when the user allows motion. */
export function StatusDot({ tone = "positive", pulse = false }: { tone?: "positive" | "neutral"; pulse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        tone === "positive" ? "bg-accent-500" : "bg-ink-300",
        pulse && "motion-safe:animate-mw-pulse",
      )}
    />
  );
}
