"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { computeEOQ } from "@/lib/operations/eoq";
import { computePeriodCCC } from "@/lib/operations/ccc";
import { computeSafetyStock } from "@/lib/operations/safetyStock";
import { computeIrr } from "@/lib/finance/irr";
import { priceSukuk } from "@/lib/finance/sukuk";
import { computeNewsvendor } from "@/lib/operations/newsvendor";
import { useTerminalStore } from "@/store/useTerminalStore";
/**
 * LiveTerminal — a terminal window on the landing page that actually runs
 * Mahwar's engines. Every number printed is computed on the client from the
 * same library code the dashboard uses; nothing is a canned screenshot.
 */

import { computeZ } from "@/lib/finance/zscore";
import { computeFlow } from "@/lib/operations/flow";

type Script = { cmd: string; lines: string[] };

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

function buildScripts(): Script[] {
  const eoq = computeEOQ({
    annualDemand: 48_000,
    orderSetupCost: 320,
    holdingCostMode: "percentage",
    directHoldingCost: 0,
    unitCost: 58,
    holdingCostPct: 18,
  });

  const ccc = computePeriodCCC({
    periodId: "fy",
    periodLabel: "FY",
    revenue: 1_240_000_000,
    cogs: 812_000_000,
    useBeginningEnding: false,
    averageInventory: 168_000_000,
    averageAR: 142_000_000,
    averageAP: 96_000_000,
    daysInPeriod: 365,
  });

  const ss = computeSafetyStock({
    dailyDemand: 420,
    demandStdDev: 95,
    leadTimeDays: 18,
    leadTimeStdDev: 3,
    serviceLevelPct: 97.5,
    useManualZ: false,
  });

  const irr = computeIrr([-1_850, 410, 470, 540, 610, 980]);
  const suk = priceSukuk({ faceValue: 1000, profitRatePct: 5.25, yearsToMaturity: 5, frequency: 2, marketYieldPct: 5.9 });
  const nv = computeNewsvendor({ unitCost: 38, sellingPrice: 65, salvageValue: 12, shortageCost: 8, meanDemand: 2400, demandStdDev: 520 });

  const z = computeZ({ model: "public", workingCapital: 420, retainedEarnings: 1_180, ebit: 610, equityValue: 5_400, totalLiabilities: 2_900, sales: 4_200, totalAssets: 6_100 });
  const flow = computeFlow({ wip: 180, throughputPerHour: 42, shiftMinutes: 480, plannedDowntimeMin: 40, unplannedDowntimeMin: 35, demandPerShift: 300, idealCycleSec: 68, totalPieces: 292, defectPieces: 9 });

  return [
    {
      cmd: "Z GO",
      lines: [
        `WC 420  RE 1,180  EBIT 610  MVE 5,400  TL 2,900  S 4,200  TA 6,100`,
        `Z-score ....... ${z.z.toFixed(2)}   zone: ${z.zone}`,
        `thresholds .... distress < ${z.thresholds.distress}  safe > ${z.thresholds.safe}`,
        `implied 1y PD . ${(z.impliedPd * 100).toFixed(1)}%`,
      ],
    },
    {
      cmd: "FLOW GO",
      lines: [
        `WIP 180  TH 42/h  shift 480m  demand 300  ideal 68s`,
        `lead time ..... ${flow.leadTimeHours.toFixed(2)} h  (Little's law)`,
        `takt .......... ${flow.taktSec.toFixed(0)} s   utilisation ${flow.utilisationPct.toFixed(0)}%`,
        `OEE ........... ${(flow.oee * 100).toFixed(1)}%`,
      ],
    },
    {
      cmd: "SUK GO",
      lines: [
        `face 1,000  profit 5.25% s/a  5y   yield 5.90%`,
        `price ......... ${suk.price.toFixed(2)}  (${suk.pricePct.toFixed(2)}% of par)`,
        `mod duration .. ${suk.modifiedDuration.toFixed(3)}   convexity ${suk.convexity.toFixed(2)}`,
        `current yield . ${suk.currentYieldPct.toFixed(2)}%`,
      ],
    },
    {
      cmd: "EOQ GO",
      lines: [
        `D 48,000 units  S 320  H ${eoq.effectiveHoldingCost.toFixed(2)}/unit`,
        `EOQ ............ ${fmt(eoq.eoq)} units`,
        `orders / yr .... ${fmt(eoq.ordersPerYear, 1)}   every ${fmt(eoq.daysBetweenOrders, 1)} d`,
        `total cost ..... ${fmt(eoq.annualInventoryCost)} /yr`,
      ],
    },
    {
      cmd: "CCC GO",
      lines: [
        `revenue 1.24bn   cogs 812m   365d`,
        `DIO ${fmt(ccc.dio, 1)}  +  DSO ${fmt(ccc.dso, 1)}  −  DPO ${fmt(ccc.dpo, 1)}`,
        `cash conversion cycle ... ${fmt(ccc.ccc, 1)} days`,
        ccc.ccc > 60 ? "flag: working capital heavy" : "ok: within peer band",
      ],
    },
    {
      cmd: "SS GO",
      lines: [
        `demand 420/d σ95   lead 18d σ3   SL 97.5%`,
        `z ............. ${ss.zScore.toFixed(3)}`,
        `safety stock .. ${fmt(ss.safetyStock)} units`,
        `reorder point . ${fmt(ss.reorderPoint)} units`,
      ],
    },
    {
      cmd: "NV GO",
      lines: [
        `c 38  p 65  salvage 12  penalty 8   μ 2,400 σ 520`,
        `critical ratio  ${nv.criticalRatio.toFixed(3)}   z ${nv.z.toFixed(3)}`,
        `order Q* ...... ${fmt(nv.optimalQty)} units`,
        `E[profit] ..... ${fmt(nv.expectedProfit)}   fill ${nv.fillRatePct.toFixed(1)}%`,
      ],
    },
    {
      cmd: "NPV GO",
      lines: [
        `cf  -1,850  410  470  540  610  980`,
        `IRR ........... ${irr.irr !== null ? (irr.irr * 100).toFixed(2) + "%" : "n/a"}`,
        `sign changes .. 1   solver: newton-raphson`,
        irr.warning ? `note: ${irr.warning}` : "converged in < 200 iterations",
      ],
    },
  ];
}

export default function LiveTerminal({ className = "" }: { className?: string }) {
  const scripts = useMemo(() => buildScripts(), []);
  const language = useTerminalStore((s) => s.language);
  const isAr = language === "ar";

  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [printed, setPrinted] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const script = scripts[step % scripts.length];
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped("");
    setPrinted([]);

    const push = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

    if (reduced) {
      setTyped(script.cmd);
      setPrinted(script.lines);
      push(() => setStep((s) => s + 1), 6000);
      return;
    }

    // Type the command
    script.cmd.split("").forEach((_, i) => push(() => setTyped(script.cmd.slice(0, i + 1)), 80 * i + 300));
    const afterType = 80 * script.cmd.length + 700;
    // Print result lines
    script.lines.forEach((line, i) => push(() => setPrinted((p) => [...p, line]), afterType + 260 * i));
    push(() => setStep((s) => s + 1), afterType + 260 * script.lines.length + 3200);

    return () => timers.current.forEach(clearTimeout);
  }, [step, scripts]);

  const script = scripts[step % scripts.length];

  return (
    <div
      className={`panel-input overflow-hidden font-mono text-[12px] leading-relaxed shadow-terminal-card ${className}`}
      dir="ltr"
      aria-label="Live engine demonstration"
    >
      <div className="h-9 px-4 flex items-center justify-between border-b border-line bg-ink-3/80">
        <div className="flex items-center gap-2 text-[10px] text-fg-3">
          <span className="w-2 h-2 rounded-full bg-emerald" />
          <span className="w-2 h-2 rounded-full bg-gold/70" />
          <span className="w-2 h-2 rounded-full bg-ink-5" />
          <span className="ml-2 tracking-wider">mahwar://engine</span>
        </div>
        <span className="text-[10px] text-emerald-light tracking-wider">{isAr ? "حي" : "live"}</span>
      </div>

      <div className="p-5 min-h-[196px] bg-ink-1/60">
        <div className="flex gap-2 text-fg">
          <span className="text-emerald-light select-none">{">"}</span>
          <span className="text-gold">{typed}</span>
          <span className="w-[7px] h-[14px] bg-emerald-light animate-blink inline-block translate-y-[3px]" />
        </div>
        <div className="mt-3 space-y-1 text-fg-2">
          {printed.map((line, i) => (
            <div key={`${step}-${i}`} className={i === printed.length - 1 ? "text-fg" : ""}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-line flex items-center justify-between text-[10px] text-fg-3">
        <span>
          {scripts.map((s, i) => (
            <span key={s.cmd} className={`mr-3 ${i === step % scripts.length ? "text-emerald-light" : ""}`}>
              {s.cmd.replace(" GO", "")}
            </span>
          ))}
        </span>
        <span>{isAr ? "نتائج محسوبة فعلياً" : "computed, not mocked"}</span>
      </div>

      <span className="sr-only">{script.lines.join(". ")}</span>
    </div>
  );
}

