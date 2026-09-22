"use client";
import { useTerminalStore, type SessionFile } from "@/store/useTerminalStore";

export function downloadSession() {
  const file = useTerminalStore.getState().exportSession();
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mahwar-session-${file.exportedAt.slice(0, 10)}.json`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function pickSessionFile(): Promise<SessionFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      try {
        const text = await f.text();
        const parsed = JSON.parse(text) as SessionFile;
        resolve(parsed && parsed.app === "mahwar" ? parsed : null);
      } catch { resolve(null); }
    };
    input.click();
  });
}
