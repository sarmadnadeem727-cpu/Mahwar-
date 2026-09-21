"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";
import FooterModal from "@/components/ui/FooterModal";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { APP, SUITES, toolsBySuite } from "@/lib/registry";

const COMPANY = [
  { en: "About", ar: "من نحن", modal: "about" },
  { en: "Contact", ar: "اتصل بنا", modal: "contact" },
  { en: "Privacy", ar: "سياسة الخصوصية", href: "/privacy" },
  { en: "Terms", ar: "شروط الخدمة", href: "/terms" },
  { en: "Licensing", ar: "التراخيص", modal: "licensing" },
];

export default function Footer() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [modal, setModal] = useState<string | null>(null);

  return (
    <footer className="bg-ink-1 border-t border-line pt-16 pb-8" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <MahwarLogo size={34} animate={false} />
              <div>
                <div className="font-serif text-xl text-fg">{APP.name} <span className="text-fg-3">{APP.nameAr}</span></div>
                <div className="font-mono text-[10px] text-fg-3 tracking-wider">v{APP.version}</div>
              </div>
            </div>
            <p className="mt-5 text-[13px] text-fg-3 leading-relaxed max-w-xs">
              {isAr ? APP.taglineAr : APP.tagline}. {isAr ? "طُوِّر بواسطة" : "Built by"} {isAr ? APP.authorAr : APP.author}.
            </p>
          </div>

          {SUITES.filter((s) => s.id !== "platform").map((s) => (
            <div key={s.id}>
              <h4 className="text-[12px] font-medium text-fg mb-3">{isAr ? s.shortAr : s.short}</h4>
              <ul className="space-y-2">
                {toolsBySuite(s.id).slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <Link href={`/dashboard?panel=${t.id}`} className="text-[12px] text-fg-3 hover:text-emerald-light transition-colors">
                      {isAr ? t.ar : t.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[12px] font-medium text-fg mb-3">{isAr ? "الشركة" : "Company"}</h4>
            <ul className="space-y-2">
              {COMPANY.map((c) =>
                c.href ? (
                  <li key={c.en}>
                    <Link href={c.href} className="text-[12px] text-fg-3 hover:text-emerald-light transition-colors">
                      {isAr ? c.ar : c.en}
                    </Link>
                  </li>
                ) : (
                  <li key={c.en}>
                    <button onClick={() => setModal(c.modal!)} className="text-[12px] text-fg-3 hover:text-emerald-light transition-colors">
                      {isAr ? c.ar : c.en}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10.5px] text-fg-4">
          <span>© {new Date().getFullYear()} {APP.name}. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
          <span>{isAr ? "أدوات تحليل، وليست نصيحة استثمارية." : "Analytical tooling, not investment advice."}</span>
        </div>
      </div>

      <FooterModal isOpen={!!modal} onClose={() => setModal(null)} type={modal ?? ""} />
    </footer>
  );
}

