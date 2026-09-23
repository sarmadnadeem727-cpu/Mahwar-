/**
 * lib/constants.ts — facts that are shown in the UI and must never be typed twice.
 *
 * Every number the landing page or the dashboard chrome displays comes either
 * from an array's `.length` (engines, hubs, corridors, currencies…) or from a
 * constant declared here. Nothing below is decorative: each value is also what
 * the engines actually compute with, so a stat on the homepage cannot drift
 * away from the terminal.
 */
import pkg from "../package.json";

/** Build version — read from package.json, the only place it is written. */
export const APP_VERSION: string = pkg.version;

/** Saudi Zakat rate applied to the Zakat base (ZATCA). Used by DCF / 3S defaults and quoted on the landing page. */
export const ZAKAT_RATE = 0.025;

/** AAOIFI Shariah Standard 21 — receivables + cash must stay below this share of total assets. */
export const AAOIFI_RECEIVABLES_MAX_PCT = 49;

/** Percent string for copy, derived from the same constant the engines use. */
export const ZAKAT_RATE_LABEL = `${(ZAKAT_RATE * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
