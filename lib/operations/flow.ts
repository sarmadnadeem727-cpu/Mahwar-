// Process flow analytics — Little's law, takt time, OEE and capacity headroom.
export interface FlowInputs {
  wip: number; throughputPerHour: number;
  shiftMinutes: number; plannedDowntimeMin: number; unplannedDowntimeMin: number;
  demandPerShift: number; idealCycleSec: number; totalPieces: number; defectPieces: number;
}
export interface FlowOutputs {
  leadTimeHours: number; taktSec: number; effectiveCycleSec: number; availability: number; performance: number; quality: number; oee: number;
  capacityPerShift: number; utilisationPct: number; headroomPct: number; bottleneck: boolean; wipTarget: number; lossMinutes: { availability: number; performance: number; quality: number };
}
export function computeFlow(i: FlowInputs): FlowOutputs {
  const planned = Math.max(0, i.shiftMinutes - i.plannedDowntimeMin);
  const run = Math.max(0, planned - i.unplannedDowntimeMin);
  const availability = planned > 0 ? run / planned : 0;
  const idealMin = (i.idealCycleSec / 60) * i.totalPieces;
  const performance = run > 0 ? Math.min(1, idealMin / run) : 0;
  const quality = i.totalPieces > 0 ? (i.totalPieces - i.defectPieces) / i.totalPieces : 0;
  const oee = availability * performance * quality;
  const taktSec = i.demandPerShift > 0 ? (planned * 60) / i.demandPerShift : 0;
  const effectiveCycleSec = i.totalPieces > 0 ? (run * 60) / i.totalPieces : 0;
  const capacityPerShift = i.idealCycleSec > 0 ? (planned * 60 * oee) / i.idealCycleSec : 0;
  const utilisationPct = capacityPerShift > 0 ? (i.demandPerShift / capacityPerShift) * 100 : 0;
  const leadTimeHours = i.throughputPerHour > 0 ? i.wip / i.throughputPerHour : 0;
  const wipTarget = i.throughputPerHour * (taktSec > 0 ? (i.idealCycleSec / taktSec) : 1);
  return {
    leadTimeHours, taktSec, effectiveCycleSec, availability, performance, quality, oee, capacityPerShift, utilisationPct,
    headroomPct: 100 - utilisationPct, bottleneck: effectiveCycleSec > taktSec && taktSec > 0, wipTarget,
    lossMinutes: { availability: planned - run, performance: run * (1 - performance), quality: run * performance * (1 - quality) },
  };
}
