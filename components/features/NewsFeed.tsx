"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Radio } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { NewsArticle } from "@/app/api/news/route";

export default function NewsFeed() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "GCC" | "SAUDI" | "ISLAMIC_FINANCE">("ALL");

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setProvider(data.provider || "");
      }
    } catch (err) {
      console.error("Failed to load news wire:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredArticles = articles.filter(
    (a) => activeTab === "ALL" || a.category === activeTab
  );

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 text-slate-800 font-sans"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* NEWS WIRE HEADER */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
            <Newspaper size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                {isAr ? "موجز الأخبار المالية لأسواق الخليج" : "GCC Financial Market Wire"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald bg-emerald-dim border border-emerald-border">
                <Radio size={10} className="animate-pulse" />
                <span>{provider || "LIVE WIRE"}</span>
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              {isAr ? "بث حي ومباشر عبر Marketaux GCC & Finlight Arabic" : "Real-time market intelligence powered by Marketaux & Finlight APIs"}
            </p>
          </div>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>{isAr ? "تحديث البث" : "Refresh Wire"}</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-[#E2E8F0] font-mono text-xs gap-2">
        {[
          { id: "ALL", label: isAr ? "جميع الأخبار" : "All GCC Wire" },
          { id: "SAUDI", label: isAr ? "السوق السعودي" : "Tadawul & KSA" },
          { id: "GCC", label: isAr ? "أسواق الخليج" : "GCC Bourses" },
          { id: "ISLAMIC_FINANCE", label: isAr ? "التمويل الإسلامي" : "Sukuk & Islamic Fin" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-bold rounded-t-lg transition-all cursor-pointer ${
                active
                  ? "bg-emerald text-white border-t border-x border-[#E2E8F0] font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ARTICLES GRID */}
      {loading ? (
        <div className="py-16 text-center font-mono text-xs text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw size={20} className="animate-spin text-emerald" />
          <span>{isAr ? "جاري تحميل البث المباشر..." : "CONNECTING TO GCC NEWS WIRE..."}</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-lg font-mono text-xs text-slate-500">
          {isAr ? "لا توجد أخبار متاحة في هذا التصنيف حاليًا." : "No news items in selected category."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-emerald transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">
                    {article.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-slate-900 group-hover:text-emerald transition-colors leading-snug mb-2">
                  {isAr && article.titleAr ? article.titleAr : article.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500 font-medium">{article.source}</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald hover:underline font-bold"
                >
                  <span>{isAr ? "قراءة التقرير" : "Full Story"}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
