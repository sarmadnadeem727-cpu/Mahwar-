"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Newspaper, Globe, ExternalLink, RefreshCw, Search, 
  Calendar, Sparkles, Filter, AlertCircle, TrendingUp
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export default function NewsFeed() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const fetchNews = async (queryStr = "", categoryStr = "all") => {
    setLoading(true);
    try {
      let endpoint = "/api/news";
      const params = new URLSearchParams();
      
      if (categoryStr !== "all") {
        params.append("category", categoryStr);
      } else if (queryStr) {
        params.append("q", queryStr);
      } else {
        params.append("q", "Saudi OR GCC OR Tadawul OR Finance OR Business");
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const data = await res.json();
      
      if (data.articles) {
        setArticles(data.articles);
      }
      if (data.notice) {
        setNotice(data.notice);
      } else {
        setNotice(null);
      }
    } catch (err) {
      console.error("Failed to fetch NewsAPI feed:", err);
      setNotice(isAr ? "تعذر الاتصال بخادم الأخبار المباشرة" : "Unable to reach NewsAPI live stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(searchQuery, activeCategory);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(searchQuery, activeCategory);
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
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-terminal-surface p-6 rounded-sm border border-terminal-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono text-terminal-emerald bg-terminal-emerald/10 border border-terminal-emerald/20 rounded-sm font-bold uppercase tracking-wider">
              NEWSAPI.ORG // LIVE FINANCIAL WIRE
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-terminal-emerald animate-pulse" />
              <span>{isAr ? "بث مباشر" : "Live Stream"}</span>
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-terminal-text">
            {isAr ? "مركز الأخبار الاستثمارية العالمية والخليجية" : "Global & GCC Financial News Terminal"}
          </h2>
          <p className="text-xs text-terminal-text-secondary font-mono">
            {isAr 
              ? "موجز الأنباء المالية والاقتصادية الحية مدعومة عبر NewsAPI.org" 
              : "Real-time global market wire, macroeconomic intelligence, and bourse developments via NewsAPI.org"
            }
          </p>
        </div>

        <button
          onClick={() => fetchNews(searchQuery, activeCategory)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-emerald hover:bg-terminal-emerald-light text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>{isAr ? "تحديث الشريط" : "Refresh Wire"}</span>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-terminal-panel p-3.5 rounded-sm border border-terminal-border shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", labelEn: "All Markets", labelAr: "جميع الأسواق" },
            { id: "business", labelEn: "Business & Macro", labelAr: "أعمال واقتصاد" },
            { id: "technology", labelEn: "FinTech & Tech", labelAr: "تكنولوجيا مالية" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                activeCategory === cat.id
                  ? "bg-terminal-emerald text-white shadow-xs"
                  : "bg-terminal-surface text-terminal-text-secondary border border-terminal-border hover:bg-terminal-hover"
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث في الأخبار المالية..." : "Search ticker or query..."}
              className="w-full pl-8 pr-3 py-1.5 bg-terminal-surface border border-terminal-border rounded-sm text-xs font-mono text-terminal-text focus:outline-none focus:border-terminal-emerald"
            />
          </div>
          {searchQuery && (
            <button
              type="submit"
              className="px-3 py-1.5 bg-terminal-emerald text-white text-xs font-mono font-bold rounded-sm uppercase tracking-wider"
            >
              {isAr ? "بحث" : "Go"}
            </button>
          )}
        </form>
      </div>

      {/* NOTICE BANNER IF ANY */}
      {notice && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-sm flex items-center justify-between text-xs text-amber-900 font-mono">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600" />
            <span>{notice}</span>
          </span>
          <span className="text-[10px] text-amber-700 font-bold uppercase">Cached State</span>
        </div>
      )}

      {/* ARTICLES LIST */}
      <div className="bg-terminal-panel rounded-sm border border-terminal-border shadow-xs divide-y divide-terminal-border">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-2">
            <RefreshCw size={18} className="animate-spin text-terminal-emerald mx-auto" />
            <p>{isAr ? "جاري جلب الأخبار من NewsAPI.org..." : "Querying NewsAPI.org endpoint..."}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            {isAr ? "لا توجد أخبار مطابقة لاستعلامك." : "No articles found matching criteria."}
          </div>
        ) : (
          articles.map((item, idx) => (
            <article
              key={idx}
              className="p-4 hover:bg-terminal-surface transition-colors group flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span className="font-bold text-terminal-emerald px-1.5 py-0.5 bg-terminal-emerald/10 border border-terminal-emerald/20 rounded-sm">
                    {item.source.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{formatTimestamp(item.publishedAt)}</span>
                  </span>
                  {item.author && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400 truncate max-w-[150px]">By {item.author}</span>
                    </>
                  )}
                </div>

                <h3 className="font-mono text-xs sm:text-sm font-bold text-terminal-text group-hover:text-terminal-emerald transition-colors leading-snug uppercase">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-terminal-emerald shrink-0" />
                  </a>
                </h3>

                <p className="text-xs text-terminal-text-secondary font-sans line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 bg-terminal-surface hover:bg-terminal-emerald hover:text-white border border-terminal-border text-[10px] font-mono font-bold text-terminal-text rounded-sm transition-colors flex items-center gap-1 mt-1 sm:mt-0 uppercase tracking-wider"
              >
                <span>{isAr ? "المصدر" : "Read Full"}</span>
                <ExternalLink size={11} />
              </a>
            </article>
          ))
        )}
      </div>
    </motion.div>
  );
}
