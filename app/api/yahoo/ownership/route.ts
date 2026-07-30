import { NextRequest, NextResponse } from 'next/server';
import { getOwnership } from '@/lib/market/yahoo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker') || '2222.SR';

  try {
    const data = await getOwnership(ticker);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch ownership' }, { status: 500 });
  }
}
