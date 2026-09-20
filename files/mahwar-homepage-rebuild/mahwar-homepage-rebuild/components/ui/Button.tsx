import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Three-level action hierarchy.
 *  primary   — the one action per view we want taken (emerald, filled)
 *  secondary — an alternative path (outlined, white)
 *  tertiary  — inline / in-card actions (mono text + chevron)
 * All interactive elements share `rounded-ui`.
 */
export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "md" | "lg";

interface ButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  /** aria-label when visible text alone is not descriptive (e.g. many "Launch Engine" links) */
  label?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ui font-medium " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent-600 text-surface-0 shadow-e1 hover:bg-accent-700 active:bg-accent-700 font-sans",
  secondary: "border border-line-strong bg-surface-0 text-ink-900 hover:border-ink-500 hover:bg-surface-1 font-sans",
  tertiary:
    "font-mono text-mono-sm text-accent-700 hover:text-accent-600 gap-1.5 underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-body-sm",
  lg: "h-12 px-6 text-body",
};

export function Button({ href, variant = "primary", size = "md", children, className, label }: ButtonProps) {
  const sized = variant === "tertiary" ? "" : sizes[size];
  return (
    <Link href={href} aria-label={label} className={cn(base, variants[variant], sized, className)}>
      {children}
      {variant === "tertiary" && <Chevron />}
    </Link>
  );
}

function Chevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 rtl:-scale-x-100" fill="none">
      <path d="M4 2.5 7.5 6 4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
