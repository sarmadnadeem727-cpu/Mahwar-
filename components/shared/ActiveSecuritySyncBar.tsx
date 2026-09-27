"use client";

import React, { useState } from "react";
import { Zap, Link2, Unlink, TrendingUp, TrendingDown, Search, BarChart2, X, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { UNIVERSE, EXCHANGE_MAP } from "@/lib/market/universe";
import { buildLinkedSecurity, type LinkedSecurity } from "@/lib/market/engineBridge";
import TradingViewChart from "@/components/ui/TradingViewChart";
import { haptics } from "@/lib/audio/haptics";

interface ActiveSecuritySyncBarProps {
  onSync?: (sec: LinkedSecurity) => void;
  engineName?: string;
  className?: string;
}

export default function ActiveSecuritySyncBar({
  onSync,
  engineName,
  className = "",
}: ActiveSecuritySyncBarProps) {
  const { language, activeSecurity, setActiveSecurity, isLiveSyncEnabled, setLiveSyncEnabled, toast } = useTerminalStore();
  const isAr = language === "ar";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [syncedRecently, setSyncedRecently] = useState(false);

  const filteredSecurities = UNIVERSE.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.nameAr.includes(q) ||
      s.exchange.toLowerCase().includes(q)
    );
  }).slice(0, 12);

  const handleSelectSecurity = (secId: string) => {
    const sec = UNIVERSE.find((s) => s.id === secId);
    if (!sec) return;
    const linked = buildLinkedSecurity(sec);
    setActiveSecurity(linked);
    setPickerOpen(false);
    setSearch("");
    haptics.playTap();
    toast(
      isAr
        ? `تم ربط ${sec.nameAr} (${sec.code}) بالمحرك`
        : `Linked ${sec.name} (${sec.code}) to engine`,
      "ok"
    );
    if (onSync) {
      onSync(linked);
      triggerSyncFlash();
    }
  };

  const triggerSyncFlash = () => {
    setSyncedRecently(true);
    setTimeout(() => setSyncedRecently(false), 2000);
  };

  const handleManualSync = () => {
    if (!activeSecurity) return;
    haptics.playSuccess();
    if (onSync) onSync(activeSecurity);
    triggerSyncFlash();
    toast(
      isAr
        ? `تمت مزامنة مدخلات ${engineName || "المحرك"} مع بيانات ${activeSecurity.name}`
        : `Synced ${engineName || "engine"} inputs with live data from ${activeSecurity.name}`,
      "ok"
    );
  };

  const handleUnlink = () => {
    setActiveSecurity(null);
    haptics.playTap();
    toast(isAr ? "تم إلغاء ربط السهم المباشر" : "Unlinked active market security", "ok");
  };

  if (!activeSecurity) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-line liquid-glass-subtle p-3.5 flex flex-wrap items-center justify-between gap-3 text-[12px] font-sans ${className}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-2.5 text-fg-3">
          <Link2 size={15} className="text-emerald-light shrink-0" />
          <span>
            {isAr
              ? "المحرك غير مرتبط برمز سوقي مباشر. اختر سهماً لتطبيق بياناته فورياً:"
              : "No active security linked. Select a market stock to auto-populate live values:"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick select popular GCC stocks */}
          <div className="hidden sm:flex items-center gap-1.5">
            {[
              { id: "TADAWUL:2222", name: isAr ? "أرامكو" : "Aramco" },
              { id: "TADAWUL:1120", name: isAr ? "الراجحي" : "Al Rajhi" },
              { id: "TADAWUL:2010", name: isAr ? "سابك" : "SABIC" },
              { id: "DFM:EMAAR", name: isAr ? "إعمار" : "Emaar" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectSecurity(st.id)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono border border-line hover:border-emerald-border hover:bg-emerald/10 text-fg-2 hover:text-emerald-light transition-all apple-touch-target"
              >
                {st.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald/15 border border-emerald/30 text-emerald-light hover:bg-emerald/25 font-sans text-[11.5px] font-medium transition-all"
          >
            <Search size={12} />
            <span>{isAr ? "اختيار سهم / رمز" : "Browse Symbols"}</span>
          </button>
        </div>

        {/* Symbol picker dialog */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="absolute inset-0 z-30 bg-ink-1/95 backdrop-blur-md p-3 rounded-2xl flex flex-col justify-between border border-emerald/30 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-line gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={14} className="text-fg-3" />
                  <input
                    type="text"
                    placeholder={isAr ? "ابحث بالاسم أو الرمز (مثال: 2222 أو أرامكو)..." : "Search by symbol or name (e.g. 2222, Aramco, Emaar)..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-[12px] text-fg placeholder:text-fg-4 outline-none font-sans"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-fg-3 hover:text-fg"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 my-2 max-h-36 overflow-y-auto">
                {filteredSecurities.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSecurity(s.id)}
                    className="text-left p-2 rounded-xl border border-line hover:border-emerald-border hover:bg-emerald/10 transition-all flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-fg">{s.code}</span>
                      <span className="text-[9.5px] font-mono text-fg-4">{s.exchange}</span>
                    </div>
                    <span className="text-[11px] text-fg-2 truncate font-sans">{isAr ? s.nameAr : s.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const isPositive = activeSecurity.changePct >= 0;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-emerald/30 liquid-glass-subtle p-3.5 flex flex-wrap items-center justify-between gap-3 text-[12px] font-sans shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${className}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Left Side: Linked Security Identity & Metrics */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald/20 border border-emerald/40 text-emerald-light shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-light animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-light" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[12.5px] font-bold text-fg">
                {activeSecurity.tradingViewSymbol}
              </span>
              <span className="text-[12px] text-fg-2 truncate font-sans">
                {isAr ? activeSecurity.nameAr : activeSecurity.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-ink-3/60 text-fg-3 border border-line">
                {activeSecurity.exchange}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-0.5 font-mono text-[11px] text-fg-3 flex-wrap">
              <span className="text-fg font-semibold">
                {activeSecurity.price.toFixed(2)} {activeSecurity.currency}
              </span>
              <span className={`flex items-center gap-0.5 ${isPositive ? "text-pos" : "text-neg"}`}>
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isPositive ? "+" : ""}
                {activeSecurity.changePct.toFixed(2)}%
              </span>
              <span className="hidden sm:inline">
                MCap: <strong className="text-fg font-medium">{activeSecurity.marketCapB}B</strong>
              </span>
              {activeSecurity.pe > 0 && (
                <span className="hidden md:inline">
                  P/E: <strong className="text-fg font-medium">{activeSecurity.pe}x</strong>
                </span>
              )}
              {activeSecurity.divYield > 0 && (
                <span className="hidden lg:inline">
                  Yield: <strong className="text-fg font-medium">{activeSecurity.divYield}%</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions (Sync, Chart, Switch, Unlink) */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSync && (
            <button
              type="button"
              onClick={handleManualSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[11.5px] font-medium transition-all shadow-sm ${
                syncedRecently
                  ? "bg-emerald text-ink-0 border border-emerald"
                  : "bg-emerald/15 hover:bg-emerald/25 text-emerald-light border border-emerald/40"
              }`}
            >
              {syncedRecently ? <Check size={13} /> : <Zap size={13} className="fill-emerald-light" />}
              <span>
                {syncedRecently
                  ? isAr ? "تمت المزامنة بنجاح" : "Values Synced"
                  : isAr ? "مزامنة المدخلات" : "Sync Live Values"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setChartModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-line hover:border-emerald-border hover:bg-ink-3 text-fg-2 hover:text-fg font-sans text-[11.5px] transition-all"
            title={isAr ? "عرض الرسم البياني في TradingView" : "Open TradingView Candlestick Chart"}
          >
            <BarChart2 size={13} />
            <span className="hidden sm:inline">{isAr ? "الرسم البياني" : "TV Chart"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-line hover:border-emerald-border hover:bg-ink-3 text-fg-3 hover:text-fg font-sans text-[11.5px] transition-all"
            title={isAr ? "تغيير السهم المربوط" : "Switch security"}
          >
            <Search size={12} />
            <ChevronDown size={11} />
          </button>

          <button
            type="button"
            onClick={handleUnlink}
            className="p-1.5 rounded-xl border border-line hover:border-neg/40 text-fg-4 hover:text-neg hover:bg-neg/10 transition-all"
            title={isAr ? "فصل السهم والعودة للوضع اليدوي" : "Disconnect live link (manual mode)"}
          >
            <Unlink size={13} />
          </button>
        </div>

        {/* Change Security Search Overlay */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="absolute inset-0 z-30 bg-ink-1/95 backdrop-blur-md p-3 rounded-2xl flex flex-col justify-between border border-emerald/30 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-line gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={14} className="text-fg-3" />
                  <input
                    type="text"
                    placeholder={isAr ? "ابحث بالاسم أو الرمز (مثال: 2222 أو أرامكو)..." : "Search GCC symbol or company name..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-[12px] text-fg placeholder:text-fg-4 outline-none font-sans"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-fg-3 hover:text-fg"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 my-2 max-h-36 overflow-y-auto">
                {filteredSecurities.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSecurity(s.id)}
                    className={`text-left p-2 rounded-xl border transition-all flex flex-col gap-0.5 ${
                      s.id === activeSecurity.id
                        ? "border-emerald bg-emerald/15"
                        : "border-line hover:border-emerald-border hover:bg-emerald/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-fg">{s.code}</span>
                      <span className="text-[9.5px] font-mono text-fg-4">{s.exchange}</span>
                    </div>
                    <span className="text-[11px] text-fg-2 truncate font-sans">{isAr ? s.nameAr : s.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TradingView Interactive Chart Modal */}
      <AnimatePresence>
        {chartModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-4xl bg-ink-1 rounded-3xl border border-line shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-ink-2/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-light animate-pulse" />
                  <span className="font-mono text-[13px] font-bold text-fg">
                    {activeSecurity.tradingViewSymbol}
                  </span>
                  <span className="text-fg-3 text-[12px] font-sans">
                    — {isAr ? activeSecurity.nameAr : activeSecurity.name} ({activeSecurity.price} {activeSecurity.currency})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setChartModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-fg-3 hover:text-fg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                <TradingViewChart
                  symbol={activeSecurity.tradingViewSymbol}
                  height={480}
                  className="w-full"
                />
              </div>

              <div className="px-5 py-3 border-t border-line bg-ink-2/40 flex items-center justify-between text-[11px] text-fg-3 font-sans">
                <span>
                  {isAr
                    ? "الرسم البياني المباشر من محرك TradingView. استخدم الأدوات لتحليل الشموع والمؤشرات الفنية."
                    : "Real-time TradingView charting engine. Inspect technicals, indicators, and price action."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setChartModalOpen(false);
                    handleManualSync();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald/20 text-emerald-light border border-emerald/40 hover:bg-emerald/30 font-medium transition-all"
                >
                  {isAr ? "مزامنة هذا السعر مع المحرك" : "Sync Current Price to Engine"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
