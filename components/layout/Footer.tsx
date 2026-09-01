"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";
import FooterModal from "@/components/ui/FooterModal";
import MahwarLogo from "@/components/ui/MahwarLogo";

const Footer = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [modalType, setModalType] = useState<string | null>(null);

  const columnsEn = [
    {
      title: "Platform",
      links: ["Features", "AI Research", "Security", "Documentation"],
    },
    {
      title: "Models",
      links: ["DCF Engine", "LBO Builder", "Three-Statement Model", "Company Comparator"],
    },
    {
      title: "Company",
      links: ["About Us", "Contact", "Privacy Policy", "Terms of Service", "Licensing"],
    },
  ];

  const columnsAr = [
    {
      title: "المنصة",
      links: ["المميزات", "أبحاث الذكاء الاصطناعي", "الأمان", "الوثائق"],
    },
    {
      title: "النماذج",
      links: ["نموذج DCF", "باني LBO", "القوائم الثلاث", "مقارنة الشركات"],
    },
    {
      title: "الشركة",
      links: ["من نحن", "اتصل بنا", "سياسة الخصوصية", "شروط الخدمة", "التراخيص"],
    },
  ];

  const columns = isAr ? columnsAr : columnsEn;

  // Set of links that should trigger a modal
  const modalLinks = [
    "documentation", "الوثائق",
    "privacy policy", "سياسة الخصوصية",
    "terms of service", "شروط الخدمة",
    "licensing", "التراخيص"
  ];

  const handleLinkClick = (e: React.MouseEvent, link: string) => {
    const l = link.toLowerCase();
    if (modalLinks.includes(l)) {
      e.preventDefault();
      setModalType(link);
    }
  };

  const getHref = (link: string) => {
    const l = link.toLowerCase();
    if (l.includes("feature") || l.includes("مميزات")) return "/#solutions";
    if (l.includes("research") || l.includes("أبحاث")) return "/#ai-research";
    if (l.includes("security") || l.includes("أمان")) return "/#security";
    if (l.includes("about") || l.includes("contact") || l.includes("من نحن") || l.includes("اتصل بنا")) return "/#company";
    return "/dashboard"; // default to dashboard for tool pages
  };

  return (
    <footer className="relative bg-[var(--bg1)] border-t border-[var(--border)] pt-16 pb-10 px-6 lg:px-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <MahwarLogo size={32} animate={false} />

              <div className="flex flex-col leading-tight">
                <span className="font-serif text-xl font-semibold text-[var(--text1)]">
                  Mahwar
                </span>
                <span className="font-cairo text-[11px] text-[var(--emerald)] -mt-1 font-bold">
                  محور
                </span>
              </div>
            </div>
            <p className={`font-sans text-xs text-slate-500 max-w-[260px] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
              {isAr 
                ? "منصة استخبارات ونمذجة أسواق المال الخليجية. هندسة دقيقة للمحللين وصناع القرار."
                : "The premium Saudi & GCC capital markets intelligence platform. Precision-engineered for institutional analysts and decision makers."}
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h4 className={`font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--emerald)] ${isAr ? 'font-arabic' : ''} font-bold`}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={getHref(link)}
                      onClick={(e) => handleLinkClick(e, link)}
                      className={`font-sans text-[13px] text-slate-550 hover:text-[var(--emerald)] transition-colors ${isAr ? 'font-arabic' : ''}`}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`font-mono text-[11px] text-slate-500 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "© ٢٠٢٥ محور · جميع الحقوق محفوظة" : "© 2025 Mahwar · All Rights Reserved"}
          </div>
          <div className={`font-mono text-[10px] text-slate-400 hidden lg:block ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "محور · نبض أسواق المال السعودية" : "محور · The Axis of Saudi & GCC Capital Markets"}
          </div>
          <div className={`font-mono text-[11px] text-slate-500 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "تطوير" : "Developed by"} <span className="text-[var(--emerald)] font-bold">Muhammad Sarmad Nadeem</span>
          </div>
        </div>
      </div>

      <FooterModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType || ""} 
      />
    </footer>
  );
};

export default Footer;
