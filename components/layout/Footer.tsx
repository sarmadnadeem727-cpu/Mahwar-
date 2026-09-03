"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTerminalStore, PanelType } from "@/store/useTerminalStore";
import FooterModal from "@/components/ui/FooterModal";
import MahwarLogo from "@/components/ui/MahwarLogo";

interface FooterLinkItem {
  label: string;
  panel?: PanelType;
  href?: string;
  modal?: string;
}

const Footer = () => {
  const { language, setPanel } = useTerminalStore();
  const router = useRouter();
  const isAr = language === "ar";
  const [modalType, setModalType] = useState<string | null>(null);

  const columnsEn: { title: string; links: FooterLinkItem[] }[] = [
    {
      title: "Platform",
      links: [
        { label: "Intelligence Hub", panel: "hub" },
        { label: "Financial News Wire", panel: "news" },
        { label: "Company Comparator", panel: "screener" },
        { label: "BI Report Engine", panel: "bi_report" },
      ],
    },
    {
      title: "Models",
      links: [
        { label: "DCF Valuation Engine", panel: "DCF" },
        { label: "LBO Deal Builder", panel: "LBO" },
        { label: "3-Statement Model", panel: "FS" },
      ],
    },
    {
      title: "Research & Analytics",
      links: [
        { label: "AI Research Memos", panel: "research" },
        { label: "Shariah Screening (AAOIFI)", panel: "shariah" },
        { label: "Security & Compliance", href: "/#solution" },
        { label: "Documentation", modal: "documentation" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/#problem" },
        { label: "Contact", href: "/#problem" },
        { label: "Privacy Policy", modal: "privacy policy" },
        { label: "Terms of Service", modal: "terms of service" },
        { label: "Licensing", modal: "licensing" },
      ],
    },
  ];

  const columnsAr: { title: string; links: FooterLinkItem[] }[] = [
    {
      title: "المنصة",
      links: [
        { label: "مركز الاستخبارات", panel: "hub" },
        { label: "الأخبار المالية المباشرة", panel: "news" },
        { label: "مقارنة الشركات", panel: "screener" },
        { label: "محرك تقارير ذكاء الأعمال", panel: "bi_report" },
      ],
    },
    {
      title: "النماذج",
      links: [
        { label: "محرك تقييم التدفقات (DCF)", panel: "DCF" },
        { label: "باني صفقات الاستحواذ (LBO)", panel: "LBO" },
        { label: "القوائم المالية الثلاث", panel: "FS" },
      ],
    },
    {
      title: "الأبحاث والتحليلات",
      links: [
        { label: "مذكرات أبحاث الذكاء الاصطناعي", panel: "research" },
        { label: "الفحص الشرعي (AAOIFI)", panel: "shariah" },
        { label: "الأمان والامتثال", href: "/#solution" },
        { label: "الوثائق", modal: "الوثائق" },
      ],
    },
    {
      title: "الشركة",
      links: [
        { label: "من نحن", href: "/#problem" },
        { label: "اتصل بنا", href: "/#problem" },
        { label: "سياسة الخصوصية", modal: "سياسة الخصوصية" },
        { label: "شروط الخدمة", modal: "شروط الخدمة" },
        { label: "التراخيص", modal: "التراخيص" },
      ],
    },
  ];

  const columns = isAr ? columnsAr : columnsEn;

  const handleLinkClick = (e: React.MouseEvent, item: FooterLinkItem) => {
    if (item.modal) {
      e.preventDefault();
      setModalType(item.modal);
    } else if (item.panel) {
      e.preventDefault();
      setPanel(item.panel);
      router.push(`/dashboard?panel=${item.panel}`);
    }
  };

  return (
    <footer className="relative bg-white border-t border-[#E2E8F0] pt-16 pb-10 px-6 lg:px-24 text-slate-600 font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <MahwarLogo size={32} animate={false} />

              <div className="flex flex-col leading-tight">
                <span className="font-serif text-xl font-bold text-slate-900">
                  Mahwar
                </span>
                <span className="font-mono text-xs text-emerald -mt-0.5 font-bold">
                  محور · SOVEREIGN TERMINAL
                </span>
              </div>
            </div>
            <p className={`text-xs text-slate-600 max-w-[260px] leading-relaxed font-sans ${isAr ? 'font-arabic' : ''}`}>
              {isAr 
                ? "منصة استخبارات ونمذجة أسواق المال الخليجية. هندسة دقيقة للمحللين وصناع القرار."
                : "The premium Saudi & GCC capital markets intelligence terminal. Precision-engineered for quantitative deal modeling."}
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-5">
              <h4 className={`font-mono text-xs uppercase tracking-wider text-emerald ${isAr ? 'font-arabic' : ''} font-bold`}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((linkItem, j) => {
                  const href = linkItem.href || (linkItem.panel ? `/dashboard?panel=${linkItem.panel}` : "#");
                  return (
                    <li key={j}>
                      <Link
                        href={href}
                        onClick={(e) => handleLinkClick(e, linkItem)}
                        className={`font-sans text-xs text-slate-600 hover:text-emerald transition-colors ${isAr ? 'font-arabic' : ''}`}
                      >
                        {linkItem.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`font-mono text-xs text-slate-500 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "© ٢٠٢٥ محور · جميع الحقوق محفوظة" : "© 2025 Mahwar · All Rights Reserved"}
          </div>
          <div className={`font-mono text-xs text-slate-500 hidden lg:block ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "محور · نبض أسواق المال السعودية" : "محور · The Axis of Saudi & GCC Capital Markets"}
          </div>
          <div className={`font-mono text-xs text-slate-600 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "تطوير" : "Developed by"} <span className="text-emerald font-bold">Muhammad Sarmad Nadeem</span>
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

