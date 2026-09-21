"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Menu, Command, CornerDownLeft } from "lucide-react";
import { useTerminalStore, type Currency } from "@/store/useTerminalStore";
import { getTool, resolveCommand, TOOLS } from "@/lib/registry";
import CommandPalette from "@/components/ui/CommandPalette";

const CURRENCIES: Currency[] = ["SAR", "AED", "KWD", "BHD", "OMR", "QAR", "USD"];

/**
 * TopBar — the command line. Type a function code (DCF, EOQ, CCC…) and press
 * Enter / GO, exactly like a Bloomberg keyboard. ⌘K / Ctrl+K opens the palette,
 * "/" focuses the line from anywhere.
 */
export default function TopBar() {
  const { activePanel, setPanel, language, setLanguage, currency, setCurrency, isMobileMenuOpen, setMobileMenuOpen } = useTerminalStore();
  const isAr = language === "ar";
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tool = getTool(activePanel);

  const suggestion = useMemo(() => (cmd.trim() ? resolveCommand(cmd) : undefined), [cmd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = () => {
    const hit = resolveCommand(cmd);
    if (hit) {
      setPanel(hit.id);
      setCmd("");
      setFlash("ok");
    } else {
      setFlash("err");
    }
    window.setTimeout(() => setFlash(null), 600);
  };

  return (
    <>
      <header
        className="h-14 min-h-14 border-b border-line bg-ink-2/90 backdrop-blur-xl flex items-center gap-3 px-3 md:px-5 sticky top-0 z-20 no-print"
        dir={isAr ? "rtl" : "ltr"}
      >
        <button
          className="lg:hidden p-2 text-fg-3 hover:text-fg rounded hover:bg-ink-4"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        {/* Active module */}
        <div className="hidden sm:flex items-center gap-2.5 min-w-0 shrink-0">
          <span className="font-mono text-[11px] tracking-wider text-emerald-light">{tool?.code ?? "HOME"}</span>
          <span className="text-[13px] text-fg truncate max-w-[220px]">{tool ? (isAr ? tool.ar : tool.en) : ""}</span>
        </div>

        {/* GO line */}
        <div className="flex-1 flex justify-center min-w-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className={`relative flex items-center gap-2 w-full max-w-xl h-9 px-3 rounded border bg-ink-1 font-mono text-[12px] transition-colors ${
              flash === "err" ? "border-neg/60" : flash === "ok" ? "border-emerald" : "border-line-strong focus-within:border-emerald"
            }`}
            dir="ltr"
          >
            <span className="text-emerald-light select-none">{">"}</span>
            <input
              ref={inputRef}
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && suggestion) {
                  e.preventDefault();
                  setCmd(suggestion.code);
                }
              }}
              placeholder={isAr ? "اكتب كوداً مثل DCF أو EOQ ثم اضغط GO" : "Type a code — DCF, EOQ, CCC — then GO"}
              className="flex-1 bg-transparent outline-none text-fg placeholder:text-fg-4 min-w-0"
              spellCheck={false}
              autoComplete="off"
              aria-label="Command line"
            />
            {suggestion && cmd && suggestion.code.toLowerCase() !== cmd.trim().toLowerCase() && (
              <span className="hidden md:inline text-[10px] text-fg-3 whitespace-nowrap">
                tab → <span className="text-fg-2">{suggestion.code}</span>
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald/15 text-emerald-light text-[10px] font-bold tracking-wider hover:bg-emerald/25"
              aria-label="Go"
            >
              GO <CornerDownLeft size={10} />
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-line text-[10px] text-fg-3 hover:text-fg"
              title="Command palette"
            >
              <Command size={10} />K
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-8 bg-ink-1 border border-line-strong text-[11px] font-mono text-fg px-2 rounded focus:outline-none focus:border-emerald cursor-pointer"
            aria-label="Reporting currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="h-8 flex items-center gap-1.5 px-2.5 bg-ink-1 border border-line-strong hover:border-emerald/40 text-[11px] font-mono text-fg-2 hover:text-fg rounded transition-colors"
          >
            <Globe size={12} className="text-emerald-light" />
            <span className="hidden sm:inline">{isAr ? "EN" : "ع"}</span>
          </button>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} tools={TOOLS} />
    </>
  );
}

