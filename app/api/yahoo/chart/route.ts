import { NextRequest, NextResponse } from 'next/server';
import { getChartData } from '@/lib/market/yahoo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker') || '2222.SR';
  const interval = searchParams.get('interval') || '1d';
  const range = searchParams.get('range') || '1y';

  try {
    const data = await getChartData(ticker, interval, range);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch chart data' }, { status: 500 });
  }
}
