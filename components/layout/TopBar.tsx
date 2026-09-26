"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Menu, Command, CornerDownLeft } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore, CURRENCIES, type Currency } from "@/store/useTerminalStore";
import { getTool, TOOLS } from "@/lib/registry";
import { suggest } from "@/lib/commands";
import { useCommandRunner } from "@/lib/useCommandRunner";
import CommandPalette from "@/components/ui/CommandPalette";
import SessionMenu from "@/components/layout/SessionMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * TopBar — the GO line. Same grammar as the console (`lib/commands.ts`):
 * `DCF`, `DCF GO`, `HELP`, `CUR USD`, `SAVE`, `RESET CONFIRM` …
 * ⌘K / Ctrl+K opens the palette, "/" focuses the line, ↑/↓ walks history.
 */
export default function TopBar() {
  const { activePanel, language, setLanguage, currency, setCurrency, isMobileMenuOpen, setMobileMenuOpen, history } = useTerminalStore(
    useShallow((s) => ({
      activePanel: s.activePanel, language: s.language, setLanguage: s.setLanguage, currency: s.currency, setCurrency: s.setCurrency,
      isMobileMenuOpen: s.isMobileMenuOpen, setMobileMenuOpen: s.setMobileMenuOpen, history: s.commandHistory,
    }))
  );
  const run = useCommandRunner();
  const isAr = language === "ar";
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tool = getTool(activePanel);
  const suite = tool?.suite === "finance" ? "FIN" : tool?.suite === "operations" ? "OPS" : tool?.suite === "research" ? "RES" : "SYS";

  const hints = useMemo(() => suggest(cmd, 4), [cmd]);
  const first = hints[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      else if (e.key === "/" && !typing) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (text = cmd) => {
    if (!text.trim()) return;
    const res = run(text);
    setFlash({ tone: res.ok ? "ok" : "err", text: res.out.split("\n")[0] });
    if (res.ok) { setCmd(""); setCursor(null); }
    window.setTimeout(() => setFlash(null), res.ok ? 900 : 1800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && first) { e.preventDefault(); setCmd(first.code + " "); }
    else if (e.key === "ArrowUp") {
      e.preventDefault(); if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next); setCmd(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) { setCursor(null); setCmd(""); } else { setCursor(next); setCmd(history[next]); }
    } else if (e.key === "Escape") { setCmd(""); setCursor(null); inputRef.current?.blur(); }
  };

  return (
    <>
      <header
        className="h-14 min-h-14 border-b border-line liquid-glass-subtle flex items-center gap-2 md:gap-3 px-2.5 md:px-5 sticky top-0 z-20 no-print"
        dir={isAr ? "rtl" : "ltr"}
      >
        <button
          className="lg:hidden apple-touch-target text-fg-3 hover:text-fg rounded-lg hover:bg-ink-4/60 transition-colors"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        {/* Active module */}
        <div className="hidden sm:flex items-center gap-2.5 min-w-0 shrink-0">
          <span className="font-mono text-[10px] tracking-[0.2em] text-fg-4">{suite}</span>
          <span className="font-mono text-[11px] tracking-wider text-emerald-light font-medium">{tool?.code ?? "HOME"}</span>
          <span className="text-[13px] text-fg truncate max-w-[220px] hidden md:inline font-medium">{tool ? (isAr ? tool.ar : tool.en) : ""}</span>
        </div>

        {/* GO line — Apple Spotlight style */}
        <div className="flex-1 flex justify-center min-w-0">
          <form
            onSubmit={(e) => { e.preventDefault(); go(); }}
            className={`relative flex items-center gap-2 w-full max-w-xl h-9 px-3.5 rounded-full border bg-ink-1/90 backdrop-blur-md font-mono text-[12px] transition-all ${
              flash?.tone === "err"
                ? "border-neg/60 shadow-[0_0_0_3px_rgba(209,67,67,0.15)]"
                : flash?.tone === "ok"
                ? "border-emerald shadow-[0_0_0_3px_var(--emerald-dim)]"
                : "border-line-strong focus-within:border-emerald/60 focus-within:shadow-[0_0_0_3px_var(--emerald-dim)]"
            }`}
            dir="ltr"
          >
            <span className="text-emerald-light select-none font-bold">{">"}</span>
            <input
              ref={inputRef}
              value={cmd}
              onChange={(e) => { setCmd(e.target.value); setCursor(null); }}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={isAr ? "اكتب كوداً أو HELP ثم GO" : "Type a code — DCF, MRP, HELP — then GO"}
              className="flex-1 bg-transparent outline-none text-fg placeholder:text-fg-4 min-w-0"
              spellCheck={false} autoComplete="off" autoCapitalize="characters" enterKeyHint="go" aria-label="Command line"
            />
            {flash && (
              <span className={`absolute -bottom-5 left-3 text-[10px] whitespace-nowrap max-w-[90%] truncate ${flash.tone === "ok" ? "text-emerald-light" : "text-neg"}`}>{flash.text}</span>
            )}
            {!flash && first && cmd.trim() && first.code.toLowerCase() !== cmd.trim().toLowerCase() && (
              <span className="hidden md:inline text-[10px] text-fg-3 whitespace-nowrap">tab → <span className="text-fg-2">{first.code}</span></span>
            )}
            <button
              type="submit"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald/15 text-emerald-light text-[10px] font-bold tracking-wider hover:bg-emerald/25 transition-colors"
              aria-label="Go"
            >
              GO <CornerDownLeft size={10} />
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-line text-[10px] text-fg-3 hover:text-fg transition-colors"
              title="Command palette"
            >
              <Command size={10} />K
            </button>
            {focused && hints.length > 1 && cmd.trim() && (
              <div className="absolute top-11 left-0 right-0 rounded-2xl border border-line liquid-glass shadow-[var(--shadow-modal)] p-1.5 z-40">
                {hints.map((h) => (
                  <button
                    key={h.kind + h.code}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); go(h.code); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left hover:bg-ink-4/60 transition-colors"
                  >
                    <span className={`w-14 text-[11px] font-mono ${h.kind === "verb" ? "text-gold" : "text-emerald-light"}`}>{h.code}</span>
                    <span className="text-[11px] text-fg-2 truncate">{h.label}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-8 bg-ink-1/90 border border-line-strong text-[11px] font-mono text-fg px-2 rounded-lg focus:outline-none focus:border-emerald cursor-pointer transition-colors"
            aria-label="Reporting currency"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ThemeToggle isAr={isAr} />
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="h-8 flex items-center gap-1.5 px-2.5 bg-ink-1/90 border border-line-strong hover:border-emerald/40 text-[11px] font-mono text-fg-2 hover:text-fg rounded-lg transition-colors apple-touch-target"
            aria-label="Switch language"
          >
            <Globe size={12} className="text-emerald-light" />
            <span>{isAr ? "EN" : "ع"}</span>
          </button>
          <SessionMenu isAr={isAr} />
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} tools={TOOLS} />
    </>
  );
}
