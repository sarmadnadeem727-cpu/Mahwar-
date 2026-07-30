import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      revGrowth = 12,
      ebitdaMargin = 28,
      capexRev = 8,
      taxZakat = 2.5,
      costEquity = 11,
      costDebt = 5,
      debtWeight = 40,
      terminalGrowth = 3,
      currentPrice = 31.45,
      baseRevenue = 45000, // SAR M
      sharesOutstanding = 242000, // M
      netDebt = 65000 // SAR M
    } = body;

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
    const upsidePct = ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100;

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'DCF calculation failed' }, { status: 500 });
  }
}
