"use client";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore } from "@/store/useTerminalStore";
import { runCommand, type CommandResult } from "@/lib/commands";
import { downloadSession } from "@/lib/session";

/** One hook that wires the command parser to the store — used by the GO line and the console. */
export function useCommandRunner() {
  const { language, currency, savedCount, setPanel, setLanguage, setCurrency, clearSessionAnalyses, clearConsole, toast, pushCommand, logConsole } = useTerminalStore(
    useShallow((s) => ({
      language: s.language, currency: s.currency, savedCount: Object.keys(s.sessionAnalyses).length,
      setPanel: s.setPanel, setLanguage: s.setLanguage, setCurrency: s.setCurrency, clearSessionAnalyses: s.clearSessionAnalyses,
      clearConsole: s.clearConsole, toast: s.toast, pushCommand: s.pushCommand, logConsole: s.logConsole,
    }))
  );

  return useCallback((raw: string): CommandResult => {
    const result = runCommand(raw, {
      language, currency, savedCount,
      setPanel, setLanguage, setCurrency, clearSession: clearSessionAnalyses, clearConsole, downloadSession, toast,
      leave: () => { window.location.href = "/"; },
    });
    if (raw.trim()) { pushCommand(raw.trim()); if (raw.trim().toUpperCase() !== "CLEAR") logConsole(raw.trim(), result.out, result.ok); }
    return result;
  }, [language, currency, savedCount, setPanel, setLanguage, setCurrency, clearSessionAnalyses, clearConsole, toast, pushCommand, logConsole]);
}
