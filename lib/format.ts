/**
 * Formatting helpers. Always en-US digit grouping so IBM Plex Mono columns
 * align regardless of the document locale; Arabic UI copy is handled by the
 * surrounding layout, not by digit shaping.
 */

const nf = (min: number, max: number): Intl.NumberFormat =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: min, maximumFractionDigits: max });

const cache = new Map<string, Intl.NumberFormat>();
const formatter = (decimals: number): Intl.NumberFormat => {
  const key = String(decimals);
  const hit = cache.get(key);
  if (hit) return hit;
  const f = nf(decimals, decimals);
  cache.set(key, f);
  return f;
};

/** 1234.5 → "1,234.50" */
export function formatNumber(value: number, decimals = 2): string {
  return formatter(decimals).format(value);
}

/** 18.4 → "+18.4%" · -0.65 → "−0.65%" (true minus sign) */
export function formatSignedPct(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  return `${sign}${formatter(decimals).format(Math.abs(value))}%`;
}

/** 0.35 → "+0.35" · -0.6 → "−0.60" */
export function formatSigned(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  return `${sign}${formatter(decimals).format(Math.abs(value))}`;
}

/** 38.45 → "SAR 38.45" */
export function formatMoney(value: number, currency = "SAR", decimals = 2): string {
  return `${currency} ${formatter(decimals).format(value)}`;
}

/** 2.65 → "2.65x" */
export function formatMultiple(value: number, decimals = 2): string {
  return `${formatter(decimals).format(value)}x`;
}

export type Direction = "up" | "down" | "flat";

export function direction(value: number): Direction {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
