"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";
import { useUserContext } from "@/components/providers/UserProvider";

export default function LiveMarket() {
  const { setTicker, language } = useTerminalStore();
  const isAr = language === 'ar';
  const { subscription } = useUserContext();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshIntervalSeconds = subscription?.plan === "free" ? 300 : 30;
  const [countdown, setCountdown] = useState<number>(refreshIntervalSeconds);

  const fetchLiveQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/market/live");
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setCountdown(refreshIntervalSeconds);
    }
  };

  useEffect(() => {
    setCountdown(refreshIntervalSeconds);
  }, [refreshIntervalSeconds]);

  useEffect(() => {
    fetchLiveQuotes();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveQuotes();
          return refreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshIntervalSeconds]);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* HEADER BAR WITH REFRESH RING COUNTDOWN */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="text-[var(--emerald)] shrink-0 animate-pulse" size={26} />
          <div>
            <h2 className="font-garamond text-2xl font-bold text-white">
              {t("panel_live_market", language)}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Tadawul Real-Time Equities Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-400">{t("auto_refresh_sec", language)}</span>
            <span className="font-bold text-[var(--emerald)] w-6 text-center">{countdown}s</span>
          </div>

          <button
            onClick={fetchLiveQuotes}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[var(--emerald)]" : ""} />
            <span>{t("manual_refresh", language)}</span>
          </button>
        </div>
      </div>

      {/* LIVE MARKET TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company Name</th>
              <th>Price (SAR)</th>
              <th>Change</th>
              <th>% Change</th>
              <th>Volume</th>
              <th>52W High</th>
              <th>52W Low</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const isPos = (q.regularMarketChangePercent || 0) >= 0;
              return (
                <tr
                  key={q.symbol}
                  onClick={() => setTicker(q.symbol)}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <td className="font-bold text-[var(--gold)]">{q.symbol}</td>
                  <td className="text-slate-200">{q.shortName || q.symbol}</td>
                  <td className="font-bold text-white">SAR {q.regularMarketPrice?.toFixed(2) || "31.45"}</td>
                  <td className={isPos ? "text-[var(--pos)]" : "text-[var(--neg)]"}>
                    {q.regularMarketChange?.toFixed(2) || "0.00"}
                  </td>
                  <td>
                    <span className={`flex items-center gap-0.5 font-bold px-2 py-0.5 rounded text-xs ${
                      isPos ? "text-[var(--pos)] bg-[var(--pos-bg)]" : "text-[var(--neg)] bg-[var(--neg-bg)]"
                    }`}>
                      {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {q.regularMarketChangePercent?.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-slate-300">{(q.regularMarketVolume || 1000000).toLocaleString()}</td>
                  <td className="text-slate-400">{q.fiftyTwoWeekHigh || "--"}</td>
                  <td className="text-slate-400">{q.fiftyTwoWeekLow || "--"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
