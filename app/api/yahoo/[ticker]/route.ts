import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getHistoricalData, getFundamentals, getDividends, getOwnership, getChartData } from '@/lib/market/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'quote': {
        const symbols = ticker.includes(',') ? ticker.split(',') : ticker;
        const quote = await getQuote(symbols);
        return NextResponse.json(quote);
      }
      
      case 'history': {
        const period1 = new Date();
        period1.setFullYear(period1.getFullYear() - 1); // defaulting to 1 year ago for now
        
        const history = await getHistoricalData(ticker, period1, '1d');
        return NextResponse.json(history);
      }
      
      case 'fundamentals': {
        const fundamentals = await getFundamentals(ticker);
        return NextResponse.json(fundamentals);
      }

      case 'dividends': {
        const dividendsHistory = await getDividends(ticker);
        const fundamentals = await getFundamentals(ticker).catch(() => null);
        return NextResponse.json({
          history: dividendsHistory,
          summaryDetail: fundamentals?.summaryDetail || null,
          defaultKeyStatistics: fundamentals?.keyStatistics || null,
        });
      }

      case 'ownership': {
        const ownership = await getOwnership(ticker);
        return NextResponse.json(ownership);
      }

      case 'technical': {
        const interval = searchParams.get('interval') || '1d';
        const range = searchParams.get('range') || '1y';
        const chartData = await getChartData(ticker, interval, range);
        return NextResponse.json(chartData);
      }
      
      default: {
        return NextResponse.json(
          { error: 'Invalid type parameter. Use ?type=quote, ?type=history, ?type=fundamentals, ?type=dividends, ?type=ownership, or ?type=technical.' },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error(`Error in /api/yahoo/${ticker}?type=${type}:`, error);
    return NextResponse.json(
      { error: 'Data not found or failed to fetch' },
      { status: 404 }
    );
  }
}

