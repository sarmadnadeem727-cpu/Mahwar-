"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Globe, TrendingUp, TrendingDown, DollarSign, User as UserIcon, LogOut, CreditCard, ChevronDown } from "lucide-react";
import { useTerminalStore, Currency } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { useUserContext } from "@/components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const POPULAR_TICKERS = [
  { symbol: "2222.SR", name: "Saudi Aramco", price: "31.45", change: "+0.80%", positive: true },
  { symbol: "1120.SR", name: "Al Rajhi Bank", price: "88.90", change: "+1.40%", positive: true },
  { symbol: "1180.SR", name: "Saudi National Bank", price: "38.20", change: "-0.50%", positive: false },
  { symbol: "2010.SR", name: "SABIC", price: "74.30", change: "-1.20%", positive: false },
  { symbol: "7010.SR", name: "STC Group", price: "41.15", change: "+0.60%", positive: true },
  { symbol: "2082.SR", name: "ACWA Power", price: "345.00", change: "+3.40%", positive: true }
];

export default function TopBar() {
  const { 
    activeTicker, setTicker, activePanel, 
    language, setLanguage, currency, setCurrency 
  } = useTerminalStore();
  const isAr = language === 'ar';

  const { user, profile, subscription, isLoading } = useUserContext();
  const supabase = createClient();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredTickers = POPULAR_TICKERS.filter(
    (item) =>
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
  );

  const currentActiveQuote = POPULAR_TICKERS.find(t => t.symbol === activeTicker) || {
    symbol: activeTicker,
    name: "Selected Stock",
    price: "31.45",
    change: "+0.80%",
    positive: true
  };

  return (
    <header className="h-[64px] min-h-[64px] border-b border-white/10 bg-[#0F1113]/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20" dir={isAr ? "rtl" : "ltr"}>
      {/* LEFT: PANEL TITLE */}
      <div className="flex items-center gap-6">
        <h1 className="font-mono text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--emerald)]"></span>
          <span>{activePanel.toUpperCase()}</span>
        </h1>
      </div>

      {/* CENTER: SEARCH AUTOCOMPLETE */}
      <div className="relative max-w-md w-full mx-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder={t("search_placeholder", language)}
            className="w-full bg-[#0A0B0D] border border-white/10 text-xs font-mono text-white pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-[var(--emerald)] transition-all"
          />
        </div>

        {/* Dropdown Results */}
        {dropdownOpen && query.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#14171A] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {filteredTickers.length > 0 ? (
              filteredTickers.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => {
                    setTicker(item.symbol);
                    setQuery("");
                    setDropdownOpen(false);
                  }}
                  className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-white">{item.symbol}</span>
                    <span className="text-[10px] text-slate-400">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-200">SAR {item.price}</span>
                    <span className={item.positive ? "text-[var(--pos)]" : "text-[var(--neg)]"}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div 
                onClick={() => {
                  setTicker(query);
                  setQuery("");
                  setDropdownOpen(false);
                }}
                className="p-3 text-xs font-mono text-slate-400 hover:bg-white/5 cursor-pointer text-center"
              >
                Set Ticker to "{query.toUpperCase()}" &rarr;
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: MARKET CHIPS & CONTROLS */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Active Stock Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs">
          <span className="font-bold text-white">{currentActiveQuote.symbol}</span>
          <span className="text-slate-300">SAR {currentActiveQuote.price}</span>
          <span className={`flex items-center gap-0.5 font-bold ${currentActiveQuote.positive ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
            {currentActiveQuote.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {currentActiveQuote.change}
          </span>
        </div>

        {/* TASI Index Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/20 font-mono text-xs text-[var(--gold)]">
          <span className="font-bold">{t("tasi_index", language)}:</span>
          <span>11,842 ▲ 0.4%</span>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-1">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-[#0A0B0D] border border-white/10 text-xs font-mono font-bold text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] cursor-pointer"
          >
            {['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR', 'USD'].map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* EN / AR Language Toggle */}
        <button
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0B0D] border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Globe size={13} className="text-[var(--gold)]" />
          <span>{isAr ? "English" : "العربية"}</span>
        </button>

        {/* User Profile Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0B0D] border border-white/10 hover:bg-white/5 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[var(--emerald)] flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:inline font-bold font-mono text-[11px] max-w-[80px] truncate">
                {profile?.full_name || user.email}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className={`absolute top-full mt-1.5 ${isAr ? "left-0" : "right-0"} w-56 bg-[#14171A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 font-sans`}>
                {/* Header */}
                <div className="p-4 border-b border-white/5 space-y-1">
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.full_name || "Institutional User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  {/* Badge */}
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 font-mono">
                    {subscription?.plan || "free"} plan
                  </span>
                </div>

                {/* Body */}
                <div className="p-1.5 space-y-0.5">
                  {/* Manage billing */}
                  {subscription?.plan && subscription?.plan !== "free" ? (
                    <a
                      href="/api/billing/portal"
                      className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-colors"
                    >
                      <CreditCard size={14} className="text-[var(--gold)]" />
                      <span>{t("billing_portal_btn", language)}</span>
                    </a>
                  ) : (
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-colors"
                    >
                      <CreditCard size={14} className="text-[var(--gold)]" />
                      <span>{t("upgrade_cta", language)}</span>
                    </Link>
                  )}

                  {/* Sign out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-xs transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
