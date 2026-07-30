import { NextRequest, NextResponse } from 'next/server';

const GCC_STOCK_UNIVERSE = [
  { ticker: "2222.SR", name: "Saudi Aramco", nameAr: "أرامكو السعودية", sector: "Energy", price: 31.45, changePct: 0.8, marketCap: 7600000, pe: 16.2, divYield: 4.8, high52: 36.5, low52: 27.2, above200DMA: true },
  { ticker: "1120.SR", name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", sector: "Banking", price: 88.90, changePct: 1.4, marketCap: 355000, pe: 19.8, divYield: 3.2, high52: 95.0, low52: 68.4, above200DMA: true },
  { ticker: "1180.SR", name: "Saudi National Bank (SNB)", nameAr: "البنك الأهلي السعودي", sector: "Banking", price: 38.20, changePct: -0.5, marketCap: 229000, pe: 12.4, divYield: 5.1, high52: 43.8, low52: 32.1, above200DMA: false },
  { ticker: "2010.SR", name: "SABIC", nameAr: "سابك", sector: "Materials", price: 74.30, changePct: -1.2, marketCap: 222000, pe: 24.5, divYield: 4.0, high52: 89.2, low52: 69.0, above200DMA: false },
  { ticker: "7010.SR", name: "STC", nameAr: "إس تي سي", sector: "Telecom", price: 41.15, changePct: 0.6, marketCap: 205000, pe: 15.1, divYield: 5.8, high52: 44.0, low52: 36.2, above200DMA: true },
  { ticker: "2280.SR", name: "Almarai", nameAr: "المراعي", sector: "Consumer Staples", price: 56.40, changePct: 0.3, marketCap: 56400, pe: 22.1, divYield: 2.1, high52: 62.0, low52: 49.8, above200DMA: true },
  { ticker: "5110.SR", name: "Saudi Electricity", nameAr: "الكهرباء السعودية", sector: "Utilities", price: 18.12, changePct: -0.2, marketCap: 75500, pe: 18.6, divYield: 3.9, high52: 21.4, low52: 16.5, above200DMA: false },
  { ticker: "1211.SR", name: "Ma'aden", nameAr: "معادن", sector: "Materials", price: 47.80, changePct: 2.1, marketCap: 176000, pe: 31.0, divYield: 0.0, high52: 54.2, low52: 38.0, above200DMA: true },
  { ticker: "2082.SR", name: "ACWA Power", nameAr: "أكوا باور", sector: "Utilities", price: 345.00, changePct: 3.4, marketCap: 252000, pe: 68.0, divYield: 0.8, high52: 390.0, low52: 210.0, above200DMA: true },
  { ticker: "4001.SR", name: "Athman Capital", nameAr: "عثمان كابيتال", sector: "Financials", price: 12.40, changePct: 0.0, marketCap: 4500, pe: 11.2, divYield: 6.2, high52: 15.0, low52: 10.8, above200DMA: false },
  { ticker: "4200.SR", name: "Aldrees Petroleum", nameAr: "الدريس", sector: "Energy", price: 132.80, changePct: 1.1, marketCap: 9960, pe: 25.4, divYield: 2.5, high52: 154.0, low52: 110.0, above200DMA: true },
  { ticker: "1830.SR", name: "Fitness Time", nameAr: "وقت اللياقة", sector: "Consumer Discretionary", price: 188.00, changePct: -0.8, marketCap: 9800, pe: 26.1, divYield: 2.4, high52: 212.0, low52: 150.0, above200DMA: true }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const minMarketCap = Number(searchParams.get('minMarketCap') || 0);
  const maxPE = Number(searchParams.get('maxPE') || 100);
  const minYield = Number(searchParams.get('minYield') || 0);
  const aboveDMA = searchParams.get('aboveDMA');

  let filtered = GCC_STOCK_UNIVERSE.filter(item => {
    if (sector && sector !== 'ALL' && item.sector !== sector) return false;
    if (item.marketCap < minMarketCap) return false;
    if (item.pe > maxPE) return false;
    if (item.divYield < minYield) return false;
    if (aboveDMA === 'true' && !item.above200DMA) return false;
    return true;
  });

  return NextResponse.json({
    total: filtered.length,
    stocks: filtered
  });
}
