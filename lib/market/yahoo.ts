import YahooFinanceClass from 'yahoo-finance2';

// Safe instantiation to handle different loader environments
let yahooFinance: any;
try {
  yahooFinance = new (YahooFinanceClass as any)();
} catch {
  yahooFinance = YahooFinanceClass;
}

// Ensure Tadawul (Saudi) tickers have the correct .SR suffix if they don't already
export const formatTicker = (ticker: string) => {
  if (/^\d{4}$/.test(ticker)) {
    return `${ticker}.SR`;
  }
  return ticker;
};

export async function getQuote(ticker: string | string[]) {
  try {
    if (Array.isArray(ticker)) {
      const symbols = ticker.map(formatTicker);
      const quotes = await yahooFinance.quote(symbols);
      return quotes;
    } else {
      const symbol = formatTicker(ticker);
      const quote = await yahooFinance.quote(symbol);
      return quote;
    }
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    throw new Error('Failed to fetch quote data');
  }
}

export async function getHistoricalData(ticker: string, period1: string | Date = '2023-01-01', interval: '1d' | '1wk' | '1mo' = '1d') {
  try {
    const symbol = formatTicker(ticker);
    const result = await yahooFinance.historical(symbol, {
      period1,
      interval,
    });
    return result;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    throw new Error('Failed to fetch historical data');
  }
}

export async function getFundamentals(ticker: string) {
  try {
    const symbol = formatTicker(ticker);
    const result = (await yahooFinance.quoteSummary(symbol, {
      modules: [
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'financialData',
        'defaultKeyStatistics',
        'summaryDetail'
      ],
    })) as any;

    return {
      incomeStatement: result.incomeStatementHistory?.incomeStatementHistory || [],
      balanceSheet: result.balanceSheetHistory?.balanceSheetStatements || [],
      cashFlow: result.cashflowStatementHistory?.cashflowStatements || [],
      financialData: result.financialData || null,
      keyStatistics: result.defaultKeyStatistics || null,
      summaryDetail: result.summaryDetail || null,
    };
  } catch (error) {
    console.error(`Error fetching fundamentals for ${ticker}:`, error);
    throw new Error('Failed to fetch fundamentals data');
  }
}

export async function getDividends(ticker: string, period1: string | Date = '2020-01-01') {
  try {
    const symbol = formatTicker(ticker);
    const result = await yahooFinance.chart(symbol, {
      period1,
      events: 'div',
    });
    
    const dividends: Array<{ date: string; amount: number }> = [];
    if (result.events && result.events.dividends) {
      for (const key of Object.keys(result.events.dividends)) {
        const div = result.events.dividends[key] as any;
        dividends.push({
          date: new Date(div.date * 1000).toISOString().split('T')[0],
          amount: div.amount,
        });
      }
    }
    // Sort dividends by date descending
    dividends.sort((a, b) => b.date.localeCompare(a.date));
    return dividends;
  } catch (error) {
    console.error(`Error fetching dividends for ${ticker}:`, error);
    return [];
  }
}

export async function getOwnership(ticker: string) {
  try {
    const symbol = formatTicker(ticker);
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['institutionOwnership', 'fundOwnership'],
    });
    return {
      institutionOwnership: result.institutionOwnership || null,
      fundOwnership: result.fundOwnership || null,
    };
  } catch (error) {
    console.error(`Error fetching ownership for ${ticker}:`, error);
    return { institutionOwnership: null, fundOwnership: null };
  }
}

export async function getChartData(ticker: string, interval: string = '1d', range: string = '1y') {
  try {
    const symbol = formatTicker(ticker);
    // Calculate period1 based on range
    const period1 = new Date();
    switch (range) {
      case '1d': period1.setDate(period1.getDate() - 1); break;
      case '5d': period1.setDate(period1.getDate() - 5); break;
      case '1mo': period1.setMonth(period1.getMonth() - 1); break;
      case '3mo': period1.setMonth(period1.getMonth() - 3); break;
      case '1y': period1.setFullYear(period1.getFullYear() - 1); break;
      case '2y': period1.setFullYear(period1.getFullYear() - 2); break;
      default: period1.setFullYear(period1.getFullYear() - 1); break;
    }

    const result = await yahooFinance.chart(symbol, {
      interval: interval as any,
      period1,
    });
    
    const quotes = result.quotes || [];
    return quotes.map((q: any) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    })).filter((q: any) => q.open != null && q.close != null);
  } catch (error) {
    console.error(`Error fetching chart data for ${ticker}:`, error);
    return [];
  }
}

