"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Newspaper, Globe, ExternalLink, RefreshCw, Filter, Search, 
  TrendingUp, Building2, Tag, Calendar, AlertTriangle, Sparkles, CheckCircle
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

interface MarketauxArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  source: string;
  published_at: string;
  entities?: Array<{
    symbol?: string;
    name?: string;
    sentiment_score?: number;
    industry?: string;
  }>;
}

interface FinlightArabicArticle {
  id: string | number;
  title: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  category?: string;
  tickers?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

const GCC_COUNTRIES = [
  { code: "all", labelEn: "All GCC", labelAr: "عموم الخليج" },
  { code: "sa", labelEn: "Saudi Arabia (TASI)", labelAr: "المملكة العربية السعودية" },
  { code: "ae", labelEn: "UAE (DFM/ADX)", labelAr: "دولة الإمارات العربية المتحدة" },
  { code: "qa", labelEn: "Qatar (QSE)", labelAr: "دولة قطر" },
  { code: "kw", labelEn: "Kuwait (BK)", labelAr: "دولة الكويت" },
  { code: "bh", labelEn: "Bahrain (BHB)", labelAr: "مملكة البحرين" },
  { code: "om", labelEn: "Oman (MSX)", labelAr: "سلطنة عمان" },
];

export default function MarketIntelligence() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  // Default active tab based on user's active language: 'arabic' if Arabic, 'gcc' if English
  const [activeTab, setActiveTab] = useState<'gcc' | 'arabic'>(isAr ? 'arabic' : 'gcc');
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Marketaux data state
  const [gccNews, setGccNews] = useState<MarketauxArticle[]>([]);
  const [gccLoading, setGccLoading] = useState<boolean>(false);
  const [gccNotice, setGccNotice] = useState<string | null>(null);

  // Finlight Arabic data state
  const [arabicNews, setArabicNews] = useState<FinlightArabicArticle[]>([]);
  const [arabicLoading, setArabicLoading] = useState<boolean>(false);
  const [arabicNotice, setArabicNotice] = useState<string | null>(null);

  // Fetch GCC Marketaux news
  const fetchGccNews = async () => {
    setGccLoading(true);
    try {
      let url = `/api/news/gcc?country=${selectedCountry}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data) {
        setGccNews(data.data);
      }
      setGccNotice(data.notice || null);
    } catch (err) {
      console.error("Failed to fetch GCC news:", err);
      setGccNotice(isAr ? "تعذر تحديث البيانات المباشرة حالياً" : "Unable to fetch live stream at this moment");
    } finally {
      setGccLoading(false);
    }
  };

  // Fetch Arabic Finlight news
  const fetchArabicNews = async () => {
    setArabicLoading(true);
    try {
      let url = `/api/news/arabic`;
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data) {
        setArabicNews(data.data);
      }
      setArabicNotice(data.notice || null);
    } catch (err) {
      console.error("Failed to fetch Arabic news:", err);
      setArabicNotice(isAr ? "تعذر تحديث الأخبار العربية حالياً" : "Unable to fetch Arabic stream");
    } finally {
      setArabicLoading(false);
    }
  };

  // Initial load & when country/tab changes
  useEffect(() => {
    if (activeTab === 'gcc') {
      fetchGccNews();
    } else {
      fetchArabicNews();
    }
  }, [activeTab, selectedCountry]);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'gcc') fetchGccNews();
    else fetchArabicNews();
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMins < 60) {
        return isAr ? `منذ ${Math.max(diffMins, 1)} دقيقة` : `${Math.max(diffMins, 1)}m ago`;
      }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      }
      return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F7F7F5] p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono text-[var(--emerald)] bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 rounded font-bold uppercase tracking-wider">
              {isAr ? "استخبارات الأسواق الخليجية" : "GCC Financial Wire"}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
              <span>{isAr ? "بث مباشر" : "Live Streaming"}</span>
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#171717]">
            {isAr ? "مركز استخبارات الأسواق والأخبار المؤسسية" : "Sovereign Market Intelligence"}
          </h2>
          <p className="text-xs text-slate-600 font-sans">
            {isAr 
              ? "موجز الأنباء والبيانات المؤسسية لأسواق المال الخليجية مدعومة بمصادر Marketaux و Finlight." 
              : "Institutional news feed, sovereign wealth announcements, and regulatory filings across GCC bourses."
            }
          </p>
        </div>

        {/* TABS SELECTOR (Marketaux GCC vs Finlight Arabic) */}
        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('gcc')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'gcc'
                ? "bg-[var(--emerald)] text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe size={13} />
            <span>{isAr ? "موجز الخليج (Marketaux)" : "GCC Wire (Marketaux)"}</span>
          </button>
          <button
            onClick={() => setActiveTab('arabic')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'arabic'
                ? "bg-[var(--emerald)] text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Newspaper size={13} />
            <span>{isAr ? "الأخبار المالية العربية (Finlight)" : "Arabic Intelligence (Finlight)"}</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Country Filter (For Marketaux Wire) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'gcc' && (
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[var(--emerald)] cursor-pointer"
              >
                {GCC_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {isAr ? c.labelAr : c.labelEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => activeTab === 'gcc' ? fetchGccNews() : fetchArabicNews()}
            disabled={gccLoading || arabicLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={(gccLoading || arabicLoading) ? "animate-spin text-[var(--emerald)]" : ""} />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </button>
        </div>

        {/* Search within News */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث في الأخبار..." : "Filter headline or ticker..."}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 focus:outline-none focus:border-[var(--emerald)]"
            />
          </div>
          {searchQuery && (
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-[var(--emerald)] text-white text-xs font-mono rounded-lg cursor-pointer"
            >
              {isAr ? "تصفية" : "Apply"}
            </button>
          )}
        </form>
      </div>

      {/* NOTICE / STATUS BANNER */}
      {(gccNotice || arabicNotice) && (
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900 font-mono">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600" />
            <span>{activeTab === 'gcc' ? gccNotice : arabicNotice}</span>
          </span>
          <span className="text-[10px] text-amber-700 font-bold uppercase">{isAr ? "وضع الاستقرار" : "Institutional Cache"}</span>
        </div>
      )}

      {/* DENSE TERMINAL NEWS FEED */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* TAB 1: GCC MARKETAUX FEED */}
        {activeTab === 'gcc' && (
          <>
            {gccLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-2">
                <RefreshCw size={18} className="animate-spin text-[var(--emerald)] mx-auto" />
                <p>{isAr ? "جاري تحميل شريط الأنباء الخليجية..." : "Querying Marketaux GCC financial wire..."}</p>
              </div>
            ) : gccNews.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400">
                {isAr ? "لا توجد أخبار مطابقة للتصفية الحالية." : "No news articles matching selected GCC criteria."}
              </div>
            ) : (
              gccNews.map((item) => (
                <article
                  key={item.uuid}
                  className="p-4 hover:bg-slate-50/70 transition-colors group flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Meta tags & Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="font-bold text-[var(--emerald)] px-1.5 py-0.5 bg-[var(--emerald)]/10 rounded">
                        {item.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatTimestamp(item.published_at)}</span>
                      </span>

                      {item.entities && item.entities.length > 0 && (
                        <>
                          <span>•</span>
                          {item.entities.slice(0, 2).map((entity, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                              {entity.symbol || entity.name}
                            </span>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="font-sans text-sm font-bold text-[#171717] group-hover:text-[var(--emerald)] transition-colors leading-snug">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        <span>{item.title}</span>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--emerald)] shrink-0" />
                      </a>
                    </h3>

                    {/* Snippet */}
                    <p className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed">
                      {item.snippet || item.description}
                    </p>
                  </div>

                  {/* Action Link Button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-[var(--emerald)] hover:text-white border border-slate-200 hover:border-[var(--emerald)] text-[10px] font-mono font-bold text-slate-700 rounded transition-colors flex items-center gap-1 mt-1 sm:mt-0"
                  >
                    <span>{isAr ? "المصدر" : "Source"}</span>
                    <ExternalLink size={11} />
                  </a>
                </article>
              ))
            )}
          </>
        )}

        {/* TAB 2: FINLIGHT ARABIC FEED */}
        {activeTab === 'arabic' && (
          <>
            {arabicLoading ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-2">
                <RefreshCw size={18} className="animate-spin text-[var(--emerald)] mx-auto" />
                <p>{isAr ? "جاري تحميل الأخبار المالية العربية من Finlight..." : "Loading Arabic financial intelligence from Finlight..."}</p>
              </div>
            ) : arabicNews.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-slate-400">
                {isAr ? "لا توجد أخبار مالية متاحة حالياً." : "No Arabic news items available."}
              </div>
            ) : (
              arabicNews.map((item) => (
                <article
                  key={item.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors group flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Meta Header */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="font-bold text-[var(--emerald)] px-1.5 py-0.5 bg-[var(--emerald)]/10 rounded">
                        {item.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatTimestamp(item.published_at)}</span>
                      </span>

                      {item.category && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                            {item.category}
                          </span>
                        </>
                      )}

                      {item.tickers && item.tickers.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-emerald-50 text-[var(--emerald)] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Arabic Headline */}
                    <h3 className="font-sans text-sm font-bold text-[#171717] group-hover:text-[var(--emerald)] transition-colors leading-snug">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        <span>{item.title}</span>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--emerald)] shrink-0" />
                      </a>
                    </h3>

                    {/* Arabic Summary */}
                    <p className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Read Source Button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-[var(--emerald)] hover:text-white border border-slate-200 hover:border-[var(--emerald)] text-[10px] font-mono font-bold text-slate-700 rounded transition-colors flex items-center gap-1 mt-1 sm:mt-0"
                  >
                    <span>{isAr ? "عرض المقال" : "Read Article"}</span>
                    <ExternalLink size={11} />
                  </a>
                </article>
              ))
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
