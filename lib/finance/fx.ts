// FX exposure and hedging: covered-interest-parity forward, money-market hedge, and open-position scenarios.
export interface FxInputs {
  pair: string;               // e.g. "USD/SAR" — price of 1 foreign (base) unit in domestic (quote)
  spot: number;
  domesticRatePct: number;    // quote-currency annual rate
  foreignRatePct: number;     // base-currency annual rate
  tenorDays: number;
  exposure: number;           // foreign-currency amount
  direction: "payable" | "receivable";
  forwardQuote?: number;      // bank quote, if any; else CIP fair value is used
  shockPct: number;           // ± scenario width
}
export interface FxScenario { label: string; spot: number; unhedged: number; forwardHedged: number; mmHedged: number; deltaVsForward: number }
export interface FxOutputs {
  fairForward: number; forwardPoints: number; annualisedCarryPct: number; usedForward: number;
  forwardHedged: number; unhedgedAtSpot: number; mmHedged: number; mmSteps: { label: string; value: number }[];
  breakevenSpot: number; scenarios: FxScenario[]; hedgeCostPct: number;
}

export function computeFx(i: FxInputs): FxOutputs {
  const t = i.tenorDays / 365;
  const rd = i.domesticRatePct / 100, rf = i.foreignRatePct / 100;
  const fairForward = i.spot * (1 + rd * t) / (1 + rf * t);
  const usedForward = i.forwardQuote && i.forwardQuote > 0 ? i.forwardQuote : fairForward;
  const forwardPoints = (usedForward - i.spot) * 10_000;
  const annualisedCarryPct = t > 0 ? ((usedForward / i.spot - 1) / t) * 100 : 0;
  const sign = i.direction === "payable" ? 1 : -1; // payable: domestic cost; receivable: domestic proceeds
  const forwardHedged = i.exposure * usedForward;
  const unhedgedAtSpot = i.exposure * i.spot;
  // Money-market hedge
  let mmHedged: number; let mmSteps: FxOutputs["mmSteps"];
  if (i.direction === "payable") {
    const pvForeign = i.exposure / (1 + rf * t);
    const domesticToday = pvForeign * i.spot;
    mmHedged = domesticToday * (1 + rd * t);
    mmSteps = [
      { label: "Deposit foreign today (PV of payable)", value: pvForeign },
      { label: "Domestic needed today at spot", value: domesticToday },
      { label: "Domestic cost at maturity (borrowed at rd)", value: mmHedged },
    ];
  } else {
    const borrowForeign = i.exposure / (1 + rf * t);
    const domesticToday = borrowForeign * i.spot;
    mmHedged = domesticToday * (1 + rd * t);
    mmSteps = [
      { label: "Borrow foreign today (PV of receivable)", value: borrowForeign },
      { label: "Convert to domestic at spot", value: domesticToday },
      { label: "Domestic proceeds at maturity (invested at rd)", value: mmHedged },
    ];
  }
  const breakevenSpot = usedForward;
  const steps = [-i.shockPct, -i.shockPct / 2, 0, i.shockPct / 2, i.shockPct];
  const scenarios: FxScenario[] = steps.map((s) => {
    const spot = i.spot * (1 + s / 100);
    const unhedged = i.exposure * spot;
    return { label: `${s > 0 ? "+" : ""}${s}%`, spot, unhedged, forwardHedged, mmHedged, deltaVsForward: sign * (forwardHedged - unhedged) };
  });
  const hedgeCostPct = i.spot > 0 ? sign * (usedForward / i.spot - 1) * 100 : 0;
  return { fairForward, forwardPoints, annualisedCarryPct, usedForward, forwardHedged, unhedgedAtSpot, mmHedged, mmSteps, breakevenSpot, scenarios, hedgeCostPct };
}
