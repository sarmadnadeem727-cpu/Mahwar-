import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientKey, tooMany } from "@/lib/security/rateLimit";

const pct = z.coerce.number().finite().min(-100).max(1000);
const DcfBody = z.object({
  revGrowth: pct,
  ebitdaMargin: pct,
  capexRev: pct,
  taxZakat: z.coerce.number().finite().min(0).max(100),
  costEquity: pct,
  costDebt: pct,
  debtWeight: z.coerce.number().finite().min(0).max(100),
  terminalGrowth: z.coerce.number().finite().min(-20).max(20),
  currentPrice: z.coerce.number().finite().min(0).default(0),
  baseRevenue: z.coerce.number().finite().positive(),
  sharesOutstanding: z.coerce.number().finite().positive(),
  netDebt: z.coerce.number().finite().default(0),
});

const EMPTY = {
  wacc: 0, fcfProjections: [], terminalValue: 0, pvTerminalValue: 0, enterpriseValue: 0,
  equityValue: 0, intrinsicValuePerShare: 0, upsidePct: 0, currentPrice: 0, sensitivityMatrix: [],
};

export async function POST(req: NextRequest) {
  const rl = rateLimit(`dcf:${clientKey(req)}`, 60, 60_000);
  if (!rl.ok) return tooMany(rl);

  try {
    const raw = await req.json().catch(() => null);
    const parsed = DcfBody.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { ...EMPTY, error: first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid input" },
        { status: 400 }
      );
    }
    const {
      revGrowth, ebitdaMargin, capexRev, taxZakat, costEquity, costDebt, debtWeight,
      terminalGrowth, currentPrice, baseRevenue, sharesOutstanding, netDebt,
    } = parsed.data;

    if (costEquity / 100 * (100 - debtWeight) / 100 + (costDebt * (1 - taxZakat / 100)) / 100 * debtWeight / 100 <= terminalGrowth / 100) {
      return NextResponse.json({ ...EMPTY, currentPrice, error: "Terminal growth must be below WACC for a Gordon-growth terminal value" }, { status: 400 });
    }

    // WACC computation
    const equityWeight = 100 - debtWeight;
    const afterTaxCostDebt = costDebt * (1 - taxZakat / 100);
    const wacc = (costEquity / 100) * (equityWeight / 100) + (afterTaxCostDebt / 100) * (debtWeight / 100);

    // 5 Year FCF Projections
    const fcfProjections = [];
    let prevRev = baseRevenue;
    let totalPVFCF = 0;

    for (let year = 1; year <= 5; year++) {
      const revenue = prevRev * (1 + revGrowth / 100);
      const ebitda = revenue * (ebitdaMargin / 100);
      const ebit = ebitda * 0.82; // D&A ~18% of EBITDA
      const nopat = ebit * (1 - taxZakat / 100);
      const capex = revenue * (capexRev / 100);
      const fcf = nopat - capex + (ebitda - ebit); // add back D&A
      
      const discountFactor = Math.pow(1 + wacc, year);
      const pvFCF = fcf / discountFactor;
      totalPVFCF += pvFCF;

      fcfProjections.push({
        year: `Year ${year}`,
        revenue: Math.round(revenue),
        ebitda: Math.round(ebitda),
        ebit: Math.round(ebit),
        nopat: Math.round(nopat),
        capex: Math.round(capex),
        fcf: Math.round(fcf),
        pvFCF: Math.round(pvFCF)
      });
      prevRev = revenue;
    }

    // Terminal Value Gordon Growth Model
    const lastFCF = fcfProjections[4].fcf;
    const terminalValue = (lastFCF * (1 + terminalGrowth / 100)) / (wacc - terminalGrowth / 100);
    const pvTerminalValue = terminalValue / Math.pow(1 + wacc, 5);

    const enterpriseValue = totalPVFCF + pvTerminalValue;
    const equityValue = enterpriseValue - netDebt;
    const intrinsicValuePerShare = equityValue / sharesOutstanding;
    const upsidePct = currentPrice > 0 ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100 : 0;

    // 5x5 Sensitivity Matrix: WACC vs Terminal Growth
    const waccSteps = [wacc - 0.01, wacc - 0.005, wacc, wacc + 0.005, wacc + 0.01];
    const growthSteps = [terminalGrowth - 1, terminalGrowth - 0.5, terminalGrowth, terminalGrowth + 0.5, terminalGrowth + 1];

    const sensitivityMatrix = waccSteps.map(w => {
      return growthSteps.map(g => {
        const tv = (lastFCF * (1 + g / 100)) / (w - g / 100);
        const pvTv = tv / Math.pow(1 + w, 5);
        const ev = totalPVFCF + pvTv;
        const eqVal = ev - netDebt;
        const valPerShare = eqVal / sharesOutstanding;
        return {
          wacc: Number((w * 100).toFixed(2)),
          growth: g,
          intrinsicValue: Number(valPerShare.toFixed(2))
        };
      });
    });

    return NextResponse.json({
      wacc: Number((wacc * 100).toFixed(2)),
      fcfProjections,
      terminalValue: Math.round(terminalValue),
      pvTerminalValue: Math.round(pvTerminalValue),
      enterpriseValue: Math.round(enterpriseValue),
      equityValue: Math.round(equityValue),
      intrinsicValuePerShare: Number(intrinsicValuePerShare.toFixed(2)),
      upsidePct: Number(upsidePct.toFixed(2)),
      currentPrice,
      sensitivityMatrix
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DCF calculation failed";
    return NextResponse.json({ ...EMPTY, error: message }, { status: 500 });
  }
}

