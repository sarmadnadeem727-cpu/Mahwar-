import { HUB_MAP, haversineKm } from "@/lib/geo/hubs";
import type { AuditData } from "./types";

export type Mode = "sea" | "road" | "air";

export interface ModeParams {
  speedKmh: number;        // cruising speed
  detour: number;          // route length / great-circle length
  ratePerTonneKm: number;  // freight rate, reporting currency per tonne-km
  gCo2PerTonneKm: number;  // emission factor
  handlingDays: number;    // port / terminal dwell at both ends combined
}

/** Editable defaults — typical planning figures, not quotes. */
export const MODE_DEFAULTS: Record<Mode, ModeParams> = {
  sea: { speedKmh: 30, detour: 1.25, ratePerTonneKm: 0.02, gCo2PerTonneKm: 16, handlingDays: 3 },
  road: { speedKmh: 60, detour: 1.3, ratePerTonneKm: 0.1, gCo2PerTonneKm: 100, handlingDays: 0.5 },
  air: { speedKmh: 800, detour: 1.02, ratePerTonneKm: 1.2, gCo2PerTonneKm: 600, handlingDays: 1 },
};

export interface CorridorInputs {
  originId: string;
  destId: string;
  mode: Mode;
  cargoTonnes: number;
  cargoValue: number;        // total shipment value, reporting currency
  carryingRatePct: number;   // annual inventory carrying rate applied to in-transit stock
  params: Record<Mode, ModeParams>;
}

export interface ModeResult {
  mode: Mode;
  greatCircleKm: number;
  routeKm: number;
  transitDays: number;
  totalDays: number;
  freightCost: number;
  inTransitCost: number;
  totalCost: number;
  co2Tonnes: number;
}

export interface CorridorOutputs {
  selected: ModeResult;
  all: ModeResult[];
}

export function computeMode(i: CorridorInputs, mode: Mode): ModeResult {
  const a = HUB_MAP[i.originId], b = HUB_MAP[i.destId];
  const p = i.params[mode];
  const greatCircleKm = haversineKm(a, b);
  const routeKm = greatCircleKm * p.detour;
  const transitDays = routeKm / p.speedKmh / 24;
  const totalDays = transitDays + p.handlingDays;
  const freightCost = routeKm * i.cargoTonnes * p.ratePerTonneKm;
  const inTransitCost = (i.cargoValue * (i.carryingRatePct / 100) * totalDays) / 365;
  return {
    mode, greatCircleKm, routeKm, transitDays, totalDays, freightCost, inTransitCost,
    totalCost: freightCost + inTransitCost,
    co2Tonnes: (routeKm * i.cargoTonnes * p.gCo2PerTonneKm) / 1_000_000,
  };
}

export function computeCorridor(i: CorridorInputs): CorridorOutputs {
  const all = (["sea", "road", "air"] as Mode[]).map((m) => computeMode(i, m));
  return { selected: all.find((r) => r.mode === i.mode)!, all };
}

export function generateCorridorAudit(i: CorridorInputs, o: CorridorOutputs): AuditData {
  const s = o.selected, p = i.params[i.mode];
  const f = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });
  return {
    toolName: "Corridor planner", toolNameAr: "مخطط الممرات",
    summary: "Great-circle distance from hub coordinates, scaled by a mode detour factor; time, freight, in-transit carrying cost and CO₂ follow.",
    summaryAr: "المسافة الدائرية من إحداثيات المراكز مضروبة بمعامل الانحراف؛ ثم الوقت والشحن وتكلفة المخزون العابر والانبعاثات.",
    steps: [
      { title: "Great-circle distance", formula: "d = 2R·asin(√(sin²(Δφ/2) + cosφ₁·cosφ₂·sin²(Δλ/2)))", substitution: `${HUB_MAP[i.originId].en} → ${HUB_MAP[i.destId].en}`, result: `${f(s.greatCircleKm, 0)} km` },
      { title: "Route distance", formula: "D = d × detour", substitution: `${f(s.greatCircleKm, 0)} × ${p.detour}`, result: `${f(s.routeKm, 0)} km` },
      { title: "Transit time", formula: "t = D / v / 24 + handling", substitution: `${f(s.routeKm, 0)} / ${p.speedKmh} / 24 + ${p.handlingDays}`, result: `${f(s.totalDays, 1)} days` },
      { title: "Freight cost", formula: "F = D × tonnes × rate", substitution: `${f(s.routeKm, 0)} × ${i.cargoTonnes} × ${p.ratePerTonneKm}`, result: f(s.freightCost, 0) },
      { title: "In-transit carrying cost", formula: "C = value × r × days / 365", substitution: `${f(i.cargoValue, 0)} × ${i.carryingRatePct}% × ${f(s.totalDays, 1)} / 365`, result: f(s.inTransitCost, 0) },
      { title: "Emissions", formula: "CO₂ = D × tonnes × factor / 10⁶", substitution: `${f(s.routeKm, 0)} × ${i.cargoTonnes} × ${p.gCo2PerTonneKm} g`, result: `${f(s.co2Tonnes, 2)} t` },
    ],
  };
}

