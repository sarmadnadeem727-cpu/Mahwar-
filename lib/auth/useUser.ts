"use client";

import { useEffect, useState } from "react";

export interface TerminalUser { name: string | null; email: string | null; image: string | null }
export interface UserState { loading: boolean; configured: boolean; user: TerminalUser | null }

let cache: UserState | null = null;
const listeners = new Set<(s: UserState) => void>();

async function load() {
  try {
    const res = await fetch("/api/session", { cache: "no-store" });
    const json = (await res.json()) as { configured: boolean; user: TerminalUser | null };
    cache = { loading: false, configured: json.configured, user: json.user };
  } catch {
    cache = { loading: false, configured: false, user: null };
  }
  listeners.forEach((l) => l(cache!));
}

/** Tiny shared session hook — one fetch per page, no provider needed. */
export function useUser(): UserState {
  const [state, setState] = useState<UserState>(cache ?? { loading: true, configured: false, user: null });
  useEffect(() => {
    listeners.add(setState);
    if (!cache) void load();
    else setState(cache);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}

export function refreshUser() { cache = null; void load(); }
