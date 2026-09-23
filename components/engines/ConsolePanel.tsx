"use client";
import React, { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { TerminalSquare, Trash2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useCommandRunner } from "@/lib/useCommandRunner";
import { suggest, COMMANDS } from "@/lib/commands";
import { APP, TOOLS } from "@/lib/registry";

/**
 * ConsolePanel — `CLI`. A full-screen transcript of everything typed into the
 * terminal, sharing the exact grammar of the GO line. History with ↑/↓, Tab to
 * accept the first suggestion, click any code in HELP to run it.
 */
export default function ConsolePanel() {
  const { language, log, history, clearConsole } = useTerminalStore(
    useShallow((s) => ({ language: s.language, log: s.consoleLog, history: s.commandHistory, clearConsole: s.clearConsole }))
  );
  const run = useCommandRunner();
  const isAr = language === "ar";
  const [cmd, setCmd] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hints = suggest(cmd, 5);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [log.length]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (text = cmd) => {
    if (!text.trim()) return;
    run(text);
    setCmd("");
    setCursor(null);
    inputRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next); setCmd(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) { setCursor(null); setCmd(""); } else { setCursor(next); setCmd(history[next]); }
    } else if (e.key === "Tab" && hints[0]) {
      e.preventDefault(); setCmd(hints[0].code + " ");
    } else if (e.key === "Escape") { setCmd(""); setCursor(null); }
  };

  const prompt = "local@mahwar";

  return (
    <div className="flex flex-col h-[calc(100dvh-8.5rem)] md:h-[calc(100dvh-9.5rem)] panel-data overflow-hidden" dir="ltr">
      <div className="flex items-center justify-between gap-3 px-3 md:px-4 h-11 border-b border-line bg-ink-2/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TerminalSquare size={15} className="text-emerald-light shrink-0" />
          <span className="font-mono text-[11px] tracking-wider text-fg-2 truncate">
            SYS · CLI · {APP.name} v{APP.version} · {TOOLS.length} {isAr ? "محركاً" : "engines"}
          </span>
        </div>
        <button onClick={clearConsole} className="flex items-center gap-1 px-2 h-7 rounded border border-line text-[10px] font-mono text-fg-3 hover:text-fg hover:border-line-strong" title="CLEAR">
          <Trash2 size={11} /> <span className="hidden sm:inline">CLEAR</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 font-mono text-[12px] leading-relaxed" onClick={() => inputRef.current?.focus()}>
        {log.length === 0 && (
          <div className="text-fg-3 space-y-2">
            <p className="text-emerald-light">{isAr ? "مرحباً بك في وحدة تحكم محور." : "Welcome to the Mahwar console."}</p>
            <p>{isAr ? "اكتب كود محرك ثم Enter، أو HELP لعرض كل الأوامر." : "Type an engine code and press Enter, or HELP for every verb and code."}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["HELP", "FIN", "OPS", "DCF GO", "MRP GO", "Z GO", "C13 GO", "VER"].map((c) => (
                <button key={c} onClick={() => submit(c)} className="px-2 py-0.5 rounded border border-line text-[11px] text-fg-2 hover:text-emerald-light hover:border-emerald/40">{c}</button>
              ))}
            </div>
            <p className="text-[11px] text-fg-4 pt-2">{COMMANDS.length} {isAr ? "أمراً" : "verbs"} · ↑/↓ {isAr ? "السجل" : "history"} · Tab {isAr ? "إكمال" : "complete"}</p>
          </div>
        )}
        {log.map((line, idx) => (
          <div key={`${line.at}-${idx}`} className="mb-2">
            <div className="flex gap-2">
              <span className="text-emerald-light shrink-0">{prompt} ›</span>
              <span className="text-fg">{line.cmd}</span>
              <span className="ml-auto text-[10px] text-fg-4 shrink-0">{new Date(line.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
            {line.out && <pre className={`whitespace-pre-wrap pl-4 ${line.ok ? "text-fg-2" : "text-neg"}`}>{line.out}</pre>}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line bg-ink-2/80 px-3 md:px-4 py-2 shrink-0">
        {hints.length > 0 && cmd.trim() && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hints.map((h) => (
              <button key={h.code + h.kind} onClick={() => submit(h.code)} className={`px-2 py-0.5 rounded border text-[10px] font-mono ${h.kind === "verb" ? "border-gold/40 text-gold" : "border-emerald/40 text-emerald-light"} hover:bg-ink-4`}>
                {h.code} <span className="text-fg-3">{h.label}</span>
              </button>
            ))}
          </div>
        )}
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <span className="font-mono text-[12px] text-emerald-light select-none shrink-0">{prompt} ›</span>
          <input
            ref={inputRef}
            value={cmd}
            onChange={(e) => { setCmd(e.target.value); setCursor(null); }}
            onKeyDown={onKey}
            className="flex-1 bg-transparent outline-none font-mono text-[13px] text-fg placeholder:text-fg-4 h-10"
            placeholder={isAr ? "HELP أو كود محرك…" : "HELP, or an engine code…"}
            spellCheck={false} autoComplete="off" autoCapitalize="characters" enterKeyHint="go" aria-label="Console input"
          />
          <button type="submit" className="px-3 h-8 rounded bg-emerald/15 text-emerald-light text-[10px] font-bold tracking-wider hover:bg-emerald/25">GO</button>
        </form>
      </div>
    </div>
  );
}
