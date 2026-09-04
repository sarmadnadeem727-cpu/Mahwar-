"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Newspaper, ExternalLink, Radio, ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { NewsArticle } from "@/app/api/news/route";

export default function NewsPreviewWidget() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [provider, setProvider] = useState<string>("GCC Financial Wire");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles?.slice(0, 3) || []);
          setProvider(data.provider || "GCC Wire");
        }
      } catch (err) {
        console.error("News widget error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <section className="py-16 bg-white border-b border-surface-border font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* WIDGET HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
              <Newspaper size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-slate-heading">
                  {isAr ? "أبرز الأخبار المالية المباشرة" : "GCC Financial Market Wire Preview"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald bg-emerald-dim border border-emerald-border">
                  <Radio size={9} className="animate-pulse" />
                  <span>{provider}</span>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-muted">
                {isAr ? "بث مباشر عبر الإفصاحات الرسمية والمصادر المالية" : "Real-time updates from Tadawul, Bloomberg GCC, & Marketaux"}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard?panel=news"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-subtle border border-surface-border hover:border-emerald text-emerald font-mono font-bold text-mono-caption rounded-lg transition-colors cursor-pointer"
          >
            <span>{isAr ? "عرض جميع الأخبار" : "View Full Wire"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse font-mono text-xs">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-surface-subtle border border-surface-border rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-5 rounded-xl border border-surface-border hover:border-emerald transition-all shadow-terminal-card flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-subtle border border-surface-border text-slate-muted uppercase">
                      {article.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-muted">
                      {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm font-bold text-slate-heading group-hover:text-emerald transition-colors leading-snug mb-2 line-clamp-2">
                    {isAr && article.titleAr ? article.titleAr : article.title}
                  </h4>

                  <p className="text-xs text-slate-body leading-relaxed line-clamp-2 font-sans">
                    {article.summary}
                  </p>
                </div>

                <div className="border-t border-surface-border pt-2.5 mt-4 flex justify-between items-center text-mono-caption font-mono">
                  <span className="text-slate-muted">{article.source}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald hover:underline font-bold"
                  >
                    <span>{isAr ? "المصدر" : "Read"}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
