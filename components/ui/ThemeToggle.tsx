"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";

type Mode = "light" | "dark" | "system";
const ORDER: Mode[] = ["light", "dark", "system"];

const LABEL: Record<Mode, { en: string; ar: string }> = {
  light: { en: "Light", ar: "فاتح" },
  dark: { en: "Dark", ar: "داكن" },
  system: { en: "System", ar: "النظام" },
};

interface ThemeToggleProps {
  isAr?: boolean;
  /** `chip` = compact control for toolbars; `menu` = three explicit buttons. */
  variant?: "chip" | "menu";
  className?: string;
}

/**
 * ThemeToggle — one tap cycles light → dark → system. Renders nothing
 * theme-specific until mounted so server and client markup agree.
 */
export default function ThemeToggle({ isAr = false, variant = "chip", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode = (mounted ? (theme as Mode) : "light") ?? "light";
  const Icon = mode === "system" ? MonitorSmartphone : (mounted ? resolvedTheme : "light") === "dark" ? Moon : Sun;

  if (variant === "menu") {
    return (
      <div className={`inline-flex rounded border border-line-strong overflow-hidden ${className}`} role="group" aria-label={isAr ? "السمة" : "Theme"}>
        {ORDER.map((m) => {
          const I = m === "light" ? Sun : m === "dark" ? Moon : MonitorSmartphone;
          const active = mounted && mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setTheme(m)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono transition-colors ${
                active ? "bg-emerald text-white dark:text-ink-0" : "bg-ink-1 text-fg-2 hover:text-fg hover:bg-ink-3"
              }`}
            >
              <I size={12} />
              <span>{isAr ? LABEL[m].ar : LABEL[m].en}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`h-8 flex items-center gap-1.5 px-2 md:px-2.5 bg-ink-1 border border-line-strong hover:border-emerald/40 text-[11px] font-mono text-fg-2 hover:text-fg rounded transition-colors ${className}`}
      aria-label={isAr ? `السمة: ${LABEL[mode].ar}` : `Theme: ${LABEL[mode].en}`}
      title={isAr ? `السمة: ${LABEL[mode].ar}` : `Theme: ${LABEL[mode].en}`}
    >
      <Icon size={12} className="text-emerald-light" />
      <span className="hidden sm:inline">{isAr ? LABEL[mode].ar : LABEL[mode].en}</span>
    </button>
  );
}
