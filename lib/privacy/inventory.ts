"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { isEnvelope, getMode, setMode, destroyDeviceKey, vaultStatus, MODE_KEY, type VaultMode } from "@/lib/privacy/vault";

/**
 * lib/privacy/inventory.ts — what this app keeps, where, and how to remove it.
 *
 * The inventory is computed from the real browser storage at call time, not
 * from a static list, so the privacy centre can never drift from what the
 * code actually stores. Every key the app writes is registered in KNOWN so
 * it can be explained in plain language; anything else under the "mahwar"
 * prefix is still listed, just as "unregistered".
 */

export const SESSION_STORAGE_KEY = "mahwar-terminal-v5";
export const PRIVACY_PREFS_KEY = "mahwar-privacy-v1";
export const BOOT_FLAG_KEY = "mahwar-booted";

export interface KnownRecord {
  key: string;
  where: "localStorage" | "sessionStorage" | "indexedDB" | "cookie";
  en: string;
  ar: string;
  /** Contains user-entered financial or operational inputs. */
  sensitive: boolean;
}

export const KNOWN: KnownRecord[] = [
  { key: SESSION_STORAGE_KEY, where: "localStorage", sensitive: true, en: "Your saved analyses, language, currency, recent modules and command history (sealed with the device key).", ar: "تحليلاتك المحفوظة واللغة والعملة والوحدات الأخيرة وسجل الأوامر (مختومة بمفتاح الجهاز)." },
  { key: PRIVACY_PREFS_KEY, where: "localStorage", sensitive: false, en: "Privacy preferences: whether you dismissed the first-visit notice.", ar: "تفضيلات الخصوصية: هل أغلقت إشعار الزيارة الأولى." },
  { key: MODE_KEY, where: "localStorage", sensitive: false, en: "Persistence mode flag (persistent or ephemeral).", ar: "علامة وضع الحفظ (دائم أو مؤقت)." },
  { key: BOOT_FLAG_KEY, where: "sessionStorage", sensitive: false, en: "Boot screen already shown this tab.", ar: "شاشة الإقلاع عُرضت في هذا التبويب." },
  { key: "mahwar-vault", where: "indexedDB", sensitive: false, en: "The non-extractable AES-GCM device key. Can be used by this site, never read out.", ar: "مفتاح AES-GCM غير قابل للاستخراج. يمكن للموقع استخدامه ولا يمكن قراءته." },
  { key: "__Secure-mahwar.session", where: "cookie", sensitive: false, en: "Signed sign-in token (httpOnly, 7 days). Exists only after Google sign-in.", ar: "رمز تسجيل الدخول الموقّع (httpOnly، 7 أيام). يوجد فقط بعد تسجيل الدخول عبر Google." },
];

export interface InventoryRow extends KnownRecord {
  present: boolean;
  bytes: number;
  encrypted: boolean | null;
  registered: boolean;
}

const bytesOf = (s: string | null) => (s ? new Blob([s]).size : 0);

/** Reads the browser's storage right now. */
export function readInventory(opts: { signedIn?: boolean } = {}): InventoryRow[] {
  if (typeof window === "undefined") return [];
  const rows: InventoryRow[] = [];
  const seen = new Set<string>();

  for (const k of KNOWN) {
    let present = false, bytes = 0, encrypted: boolean | null = null;
    try {
      if (k.where === "localStorage" || k.where === "sessionStorage") {
        // The session record may live in either backend depending on mode.
        const stores = k.key === SESSION_STORAGE_KEY ? [localStorage, sessionStorage] : [k.where === "localStorage" ? localStorage : sessionStorage];
        for (const st of stores) {
          const raw = st.getItem(k.key);
          if (raw !== null) { present = true; bytes += bytesOf(raw); encrypted = isEnvelope(raw); }
        }
      } else if (k.where === "indexedDB") {
        present = vaultStatus().encrypted;
      } else if (k.where === "cookie") {
        present = !!opts.signedIn;
      }
    } catch { /* storage blocked */ }
    seen.add(k.key);
    rows.push({ ...k, present, bytes, encrypted, registered: true });
  }

  // Anything else with our prefix — listed so nothing can hide.
  try {
    for (const st of [localStorage, sessionStorage] as const) {
      for (let i = 0; i < st.length; i++) {
        const key = st.key(i);
        if (!key || !key.startsWith("mahwar") || seen.has(key)) continue;
        seen.add(key);
        rows.push({ key, where: st === localStorage ? "localStorage" : "sessionStorage", en: "Unregistered key (older build).", ar: "مفتاح غير مسجّل (إصدار أقدم).", sensitive: true, present: true, bytes: bytesOf(st.getItem(key)), encrypted: isEnvelope(st.getItem(key)), registered: false });
      }
    }
  } catch { /* ignore */ }
  return rows;
}

/** Remove every local trace. Returns the number of records removed. Does not sign out — the caller does that. */
export async function purgeLocal(): Promise<number> {
  if (typeof window === "undefined") return 0;
  let n = 0;
  try {
    for (const st of [localStorage, sessionStorage] as const) {
      const keys: string[] = [];
      for (let i = 0; i < st.length; i++) { const k = st.key(i); if (k && k.startsWith("mahwar")) keys.push(k); }
      keys.forEach((k) => { st.removeItem(k); n++; });
    }
  } catch { /* ignore */ }
  await destroyDeviceKey();
  n++;
  return n;
}

/** Global Privacy Control — honoured trivially, because there is nothing to opt out of. */
export function gpcSignal(): boolean | null {
  if (typeof navigator === "undefined") return null;
  const v = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  return typeof v === "boolean" ? v : null;
}

// ---- preferences ----------------------------------------------------------

interface PrivacyPrefs {
  noticeDismissedAt: string | null;
  dismissNotice: () => void;
  /** Mirrors the vault flag so components can subscribe. */
  mode: VaultMode;
  setMode: (m: VaultMode) => Promise<void>;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const usePrivacyStore = create<PrivacyPrefs>()(
  persist(
    (set) => ({
      noticeDismissedAt: null,
      dismissNotice: () => set({ noticeDismissedAt: new Date().toISOString() }),
      mode: "persistent",
      setMode: async (mode) => {
        await setMode(mode, [SESSION_STORAGE_KEY]);
        set({ mode });
      },
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: PRIVACY_PREFS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ noticeDismissedAt: s.noticeDismissedAt }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state) usePrivacyStore.setState({ mode: getMode() });
      },
    }
  )
);
