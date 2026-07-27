import { useQuery } from '@tanstack/react-query';

export interface MarketData {
  quote: any;
  history: any;
  fundamentals: any;
}

const fetchMarketData = async (ticker: string): Promise<MarketData> => {
  if (!ticker) throw new Error('Ticker is required');

  const [quoteRes, historyRes, fundamentalsRes] = await Promise.all([
    fetch(`/api/yahoo/${ticker}?type=quote`),
    fetch(`/api/yahoo/${ticker}?type=history`),
    fetch(`/api/yahoo/${ticker}?type=fundamentals`),
  ]);

  if (!quoteRes.ok || !historyRes.ok || !fundamentalsRes.ok) {
    throw new Error('Failed to fetch market data');
  }

  const quote = await quoteRes.json();
  const history = await historyRes.json();
  const fundamentals = await fundamentalsRes.json();

  return {
    quote,
    history,
    fundamentals,
  };
};

export const useMarketData = (ticker: string | null) => {
  return useQuery({
    queryKey: ['marketData', ticker],
    queryFn: () => fetchMarketData(ticker!),
    enabled: !!ticker,
    staleTime: 60 * 1000 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useDividends = (ticker: string | null) => {
  return useQuery({
    queryKey: ['dividends', ticker],
    queryFn: async () => {
      if (!ticker) return null;
      const res = await fetch(`/api/yahoo/${ticker}?type=dividends`);
      if (!res.ok) throw new Error('Failed to fetch dividend data');
      return res.json();
    },
    enabled: !!ticker,
    staleTime: 60 * 1000 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useOwnership = (ticker: string | null) => {
  return useQuery({
    queryKey: ['ownership', ticker],
    queryFn: async () => {
      if (!ticker) return null;
      const res = await fetch(`/api/yahoo/${ticker}?type=ownership`);
      if (!res.ok) throw new Error('Failed to fetch ownership data');
      return res.json();
    },
    enabled: !!ticker,
    staleTime: 60 * 1000 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useTechnicalData = (ticker: string | null, interval: string, range: string) => {
  return useQuery({
    queryKey: ['technicalData', ticker, interval, range],
    queryFn: async () => {
      if (!ticker) return null;
      const res = await fetch(`/api/yahoo/${ticker}?type=technical&interval=${interval}&range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch technical data');
      return res.json();
    },
    enabled: !!ticker,
    staleTime: 60 * 1000 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
