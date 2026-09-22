"use client";

import type { StateStorage } from "zustand/middleware";

/**
 * lib/privacy/vault.ts — encrypted-at-rest storage for the terminal session.
 *
 * What it protects against: another person on the same machine reading
 * valuation inputs out of localStorage, browser-profile backups and sync
 * carrying plaintext deal models, and casual devtools inspection.
 *
 * What it does NOT protect against, stated plainly so nobody oversells it:
 * a script running on this origin (same-origin JavaScript can ask the vault
 * to decrypt), or an attacker with full control of the device.
 *
 * How it works:
 *   • An AES-GCM-256 key is generated once per browser profile, marked
 *     `extractable: false`, and kept in IndexedDB. It can be *used* by this
 *     origin but its bytes can never be read out, exported or synced.
 *   • Every write is `{ v:1, alg:"AES-GCM", iv, ct }` (base64). A fresh IV per
 *     write. Reads decrypt; a plaintext record from an older build is read once
 *     and re-written encrypted on the next save.
 *   • Two modes. `persistent` keeps the envelope in localStorage so the session
 *     survives a restart. `ephemeral` keeps it in sessionStorage so closing the
 *     tab forgets everything. The device key itself lives in IndexedDB either way.
 *   • Without WebCrypto (plain http on a LAN, some embedded browsers) the vault
 *     degrades to plaintext and says so through `vaultStatus()`, rather than
 *     silently pretending.
 */

export type VaultMode = "persistent" | "ephemeral";

const DB_NAME = "mahwar-vault";
const DB_STORE = "keys";
const KEY_ID = "device-key-v1";
export const MODE_KEY = "mahwar-privacy-mode";
const ENVELOPE_PREFIX = '{"v":1,"alg":"AES-GCM"';

interface Envelope { v: 1; alg: "AES-GCM"; iv: string; ct: string }

let keyPromise: Promise<CryptoKey | null> | null = null;
let lastStatus: VaultStatus = { encrypted: false, reason: "not-initialised", mode: "persistent" };

export interface VaultStatus {
  encrypted: boolean;
  reason: "ok" | "no-webcrypto" | "no-indexeddb" | "not-initialised" | "error";
  mode: VaultMode;
}

const hasWindow = () => typeof window !== "undefined";

export function getMode(): VaultMode {
  if (!hasWindow()) return "persistent";
  try { return localStorage.getItem(MODE_KEY) === "ephemeral" ? "ephemeral" : "persistent"; } catch { return "persistent"; }
}

function backend(mode = getMode()): Storage {
  return mode === "ephemeral" ? sessionStorage : localStorage;
}

export function vaultStatus(): VaultStatus {
  return { ...lastStatus, mode: getMode() };
}

// ---- key management -------------------------------------------------------

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(DB_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadOrCreateKey(): Promise<CryptoKey | null> {
  if (!hasWindow()) return null;
  if (!window.crypto?.subtle) { lastStatus = { encrypted: false, reason: "no-webcrypto", mode: getMode() }; return null; }
  if (!window.indexedDB) { lastStatus = { encrypted: false, reason: "no-indexeddb", mode: getMode() }; return null; }
  try {
    const db = await openDb();
    let key = await idbGet<CryptoKey>(db, KEY_ID);
    if (!key) {
      key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      await idbPut(db, KEY_ID, key);
    }
    db.close();
    lastStatus = { encrypted: true, reason: "ok", mode: getMode() };
    return key;
  } catch {
    lastStatus = { encrypted: false, reason: "error", mode: getMode() };
    return null;
  }
}

function deviceKey(): Promise<CryptoKey | null> {
  if (!keyPromise) keyPromise = loadOrCreateKey();
  return keyPromise;
}

// ---- encoding -------------------------------------------------------------

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const u8 = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function seal(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  const env: Envelope = { v: 1, alg: "AES-GCM", iv: toB64(iv), ct: toB64(ct) };
  return JSON.stringify(env);
}

async function open(key: CryptoKey, raw: string): Promise<string | null> {
  try {
    const env = JSON.parse(raw) as Envelope;
    if (env.v !== 1 || env.alg !== "AES-GCM") return null;
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(env.iv) }, key, fromB64(env.ct));
    return dec.decode(pt);
  } catch {
    return null;
  }
}

export const isEnvelope = (raw: string | null): boolean => !!raw && raw.startsWith(ENVELOPE_PREFIX);

// ---- the zustand storage adapter -----------------------------------------

export const vaultStorage: StateStorage = {
  async getItem(name) {
    if (!hasWindow()) return null;
    // Whichever backend holds it wins; a mode switch moves the record (see setMode).
    const raw = backend().getItem(name) ?? backend(getMode() === "ephemeral" ? "persistent" : "ephemeral").getItem(name);
    if (!raw) return null;
    if (!isEnvelope(raw)) return raw; // plaintext from an older build — re-sealed on next write
    const key = await deviceKey();
    if (!key) return null; // sealed on a device we can no longer unlock
    return open(key, raw);
  },
  async setItem(name, value) {
    if (!hasWindow()) return;
    const key = await deviceKey();
    const store = backend();
    try {
      store.setItem(name, key ? await seal(key, value) : value);
      // Never leave a stale copy in the other backend.
      backend(getMode() === "ephemeral" ? "persistent" : "ephemeral").removeItem(name);
    } catch { /* quota or private mode — the in-memory state still works */ }
  },
  removeItem(name) {
    if (!hasWindow()) return;
    try { localStorage.removeItem(name); sessionStorage.removeItem(name); } catch { /* ignore */ }
  },
};

/** Switch persistence mode and move the sealed record across. */
export async function setMode(mode: VaultMode, names: string[]) {
  if (!hasWindow()) return;
  const from = backend(getMode());
  const to = backend(mode);
  localStorage.setItem(MODE_KEY, mode);
  if (from === to) return;
  for (const n of names) {
    const raw = from.getItem(n);
    if (raw !== null) { to.setItem(n, raw); from.removeItem(n); }
  }
}

/** Forget the device key (and with it every sealed record) — the nuclear option. */
export function destroyDeviceKey(): Promise<void> {
  keyPromise = null;
  if (!hasWindow() || !window.indexedDB) return Promise.resolve();
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}

/** Warm the key early so the first save is not delayed by IndexedDB. */
export function primeVault() { if (hasWindow()) void deviceKey(); }
