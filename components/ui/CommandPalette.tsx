"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { SUITES, TOOLS, type ToolDef } from "@/lib/registry";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tools?: ToolDef[];
}

export default function CommandPalette({ isOpen, onClose, tools = TOOLS }: CommandPaletteProps) {
  const { setPanel, language, sessionAnalyses, recentPanels, activePanel } = useTerminalStore();
  const isAr = language === "ar";
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Empty query: the panels opened most recently come first, then everything else in registry order.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recent = recentPanels.filter((p) => p !== activePanel).map((id) => tools.find((t) => t.id === id)).filter((t): t is ToolDef => !!t).slice(0, 5);
      const recentIds = new Set(recent.map((t) => t.id));
      return [...recent, ...tools.filter((t) => !recentIds.has(t.id))];
    }
    return tools
      .map((t) => {
        const hay = [t.code, t.id, t.en, t.ar, t.tag, ...t.keywords].join(" ").toLowerCase();
        let score = 0;
        if (t.code.toLowerCase() === q) score += 100;
        if (t.code.toLowerCase().startsWith(q)) score += 50;
        if (t.en.toLowerCase().startsWith(q) || t.ar.startsWith(q)) score += 30;
        if (hay.includes(q)) score += 10;
        return { t, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.t);
  }, [query, tools, recentPanels, activePanel]);

  const recentCount = query.trim() ? 0 : Math.min(5, recentPanels.filter((p) => p !== activePanel && tools.some((t) => t.id === p)).length);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const choose = (tool: ToolDef) => {
    setPanel(tool.id);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[index]) { e.preventDefault(); choose(results[index]); }
    else if (e.key === "Escape") onClose();
  };

  const suiteName = (id: ToolDef["suite"]) => {
    const s = SUITES.find((x) => x.id === id);
    return s ? (isAr ? s.shortAr : s.short) : "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "لوحة الأوامر" : "Command palette"}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl liquid-glass rounded-2xl overflow-hidden shadow-[var(--shadow-modal)] border border-line"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="flex items-center gap-3 px-4 h-13 border-b border-line bg-ink-1/30">
              <Search size={16} className="text-fg-3 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder={isAr ? "ابحث عن محرك أو اكتب كوده…" : "Search an engine or type its code…"}
                className="flex-1 bg-transparent outline-none text-sm text-fg placeholder:text-fg-4 py-3"
                spellCheck={false}
              />
              <kbd className="font-mono text-[10px] text-fg-4 border border-line rounded-md px-1.5 py-0.5 bg-ink-2/60">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2.5 px-1 scrollbar-thin space-y-0.5">
              {results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-fg-3">
                  {isAr ? "لا يوجد محرك بهذا الاسم." : "No engine matches that."}
                </div>
              )}
              {results.map((tool, i) => {
                const Icon = tool.icon;
                const active = i === index;
                const saved = tool.sessionKey && sessionAnalyses[tool.sessionKey];
                const heading = recentCount > 0 && (i === 0 || i === recentCount);
                return (
                  <React.Fragment key={tool.id}>
                  {heading && (
                    <div className="px-3 pt-2.5 pb-1 font-mono text-[10px] tracking-[0.18em] uppercase text-fg-4">
                      {i === 0 ? (isAr ? "الأخيرة" : "Recent") : (isAr ? "كل المحركات" : "All engines")}
                    </div>
                  )}
                  <button
                    data-idx={i}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => choose(tool)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-start transition-all duration-150 ${
                      active
                        ? "bg-emerald/15 text-fg font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "text-fg-2 hover:bg-ink-3/50 hover:text-fg"
                    }`}
                  >
                    <span className={`font-mono text-[11px] w-14 shrink-0 ${active ? "text-emerald-light font-bold" : "text-fg-3"}`}>{tool.code}</span>
                    <Icon size={16} className={`shrink-0 transition-colors ${active ? "text-emerald-light" : "text-fg-3"}`} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] text-fg truncate">{isAr ? tool.ar : tool.en}</span>
                      <span className="block text-[11px] text-fg-3 truncate">{suiteName(tool.suite)} · {isAr ? tool.descAr : tool.descEn}</span>
                    </span>
                    {saved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-light shadow-[0_0_6px_var(--emerald-light)] shrink-0" />}
                    {active && <CornerDownLeft size={12} className="text-emerald-light shrink-0" />}
                  </button>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-line font-mono text-[10px] text-fg-4 flex gap-4 bg-ink-1/20">
              <span>↑↓ {isAr ? "تنقل" : "navigate"}</span>
              <span>↵ {isAr ? "فتح" : "open"}</span>
              <span>{results.length} / {tools.length}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

