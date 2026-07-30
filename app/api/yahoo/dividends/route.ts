import { NextRequest, NextResponse } from 'next/server';
import { getDividends } from '@/lib/market/yahoo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker') || '2222.SR';

  try {
    const data = await getDividends(ticker);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dividends' }, { status: 500 });
  }
}
