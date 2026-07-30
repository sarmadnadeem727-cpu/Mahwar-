"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Star, TrendingUp, TrendingDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { useUserContext } from "@/components/providers/UserProvider";

interface WatchlistTicker {
  symbol: string;
  price?: number;
  change?: string;
  positive?: boolean;
}

export default function Watchlist() {
  const { language, activeTicker, setTicker } = useTerminalStore();
  const { user } = useUserContext();
  const isAr = language === 'ar';
  
  const [tickers, setTickers] = useState<string[]>([]);
  const [tickerData, setTickerData] = useState<Record<string, WatchlistTicker>>({});
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const supabase = createClient();

  const fetchWatchlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select("tickers")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setTickers(data.tickers || []);
        // Fetch quotes for all tickers
        fetchQuotes(data.tickers || []);
      }
    } catch (err) {
      console.error("Watchlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async (symbols: string[]) => {
    const dataMap: Record<string, WatchlistTicker> = {};
    for (const symbol of symbols) {
      try {
        const res = await fetch(`/api/market/quote?ticker=${symbol}`);
        if (res.ok) {
          const q = await res.json();
          dataMap[symbol] = {
            symbol,
            price: q.price || q.regularMarketPrice || 31.45,
            change: q.changePercent !== undefined ? `${q.changePercent > 0 ? "+" : ""}${q.changePercent.toFixed(2)}%` : "+0.00%",
            positive: q.changePercent !== undefined ? q.changePercent >= 0 : true
          };
        } else {
          dataMap[symbol] = { symbol };
        }
      } catch (err) {
        dataMap[symbol] = { symbol };
      }
    }
    setTickerData(dataMap);
  };

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim() || !user) return;
    setAdding(true);

    let formatted = newTicker.toUpperCase().trim();
    // Add SR suffix if it's a 4-digit number
    if (/^\d{4}$/.test(formatted)) {
      formatted = `${formatted}.SR`;
    }

    if (tickers.includes(formatted)) {
      setNewTicker("");
      setAdding(false);
      return;
    }

    const updated = [...tickers, formatted];
    try {
      const { error } = await supabase
        .from("watchlists")
        .upsert({
          user_id: user.id,
          tickers: updated
        });

      if (!error) {
        setTickers(updated);
        setNewTicker("");
        fetchQuotes([formatted]);
      }
    } catch (err) {
      console.error("Watchlist add error:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (symbolToRemove: string) => {
    if (!user) return;
    const updated = tickers.filter(t => t !== symbolToRemove);
    try {
      const { error } = await supabase
        .from("watchlists")
        .update({ tickers: updated })
        .eq("user_id", user.id);

      if (!error) {
        setTickers(updated);
        const copy = { ...tickerData };
        delete copy[symbolToRemove];
        setTickerData(copy);
      }
    } catch (err) {
      console.error("Watchlist remove error:", err);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full font-mono text-xs" dir={isAr ? "rtl" : "ltr"}>
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Star size={14} className="text-[var(--gold)] fill-[var(--gold)]/20" />
            <span>{t("watchlist_title", language)}</span>
          </h3>
          <button 
            onClick={() => fetchQuotes(tickers)}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Add Ticker Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder={isAr ? "رمز السهم (مثال: 1120)" : "Stock symbol (e.g. 1120.SR)"}
            className="flex-1 bg-[#0A0B0D] border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] placeholder:text-slate-600 font-mono"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-3 py-1.5 bg-[var(--emerald)] hover:bg-[var(--emerald)]/90 disabled:brightness-75 text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </form>

        {/* List of Watchlist Stocks */}
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <RefreshCw size={16} className="animate-spin" />
          </div>
        ) : tickers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-sans">
            {t("no_watchlist_tickers", language)}
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {tickers.map((symbol) => {
              const data = tickerData[symbol];
              const isSelected = activeTicker === symbol;
              return (
                <div
                  key={symbol}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? "border-[var(--emerald)] bg-[var(--emerald)]/10" 
                      : "border-white/5 bg-[#14171A]/30 hover:border-white/10 hover:bg-[#14171A]/60"
                  }`}
                  onClick={() => setTicker(symbol)}
                >
                  <div>
                    <span className="font-bold text-white block text-[11px]">{symbol}</span>
                    <span className="text-[9px] text-slate-400">Tadawul KSA</span>
                  </div>
                  
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {data?.price !== undefined ? (
                      <div className="text-right">
                        <span className="text-white font-bold block">SAR {data.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${data.positive ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
                          {data.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {data.change}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">Loading...</span>
                    )}

                    <button
                      onClick={() => handleRemove(symbol)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
