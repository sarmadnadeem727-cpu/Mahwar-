"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTerminalStore } from "@/store/useTerminalStore";
import { APP } from "@/lib/registry";

/** Shared frame for /privacy and /terms: plain, factual, versioned from the single source. */
export default function LegalShell({ title, titleAr, updated, children }: { title: string; titleAr: string; updated: string; children: (isAr: boolean) => React.ReactNode }) {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  return (
    <div className={`min-h-screen bg-ink-1 text-fg flex flex-col ${isAr ? "font-arabic" : "font-sans"}`} dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full">
        <Link href="/" className="btn-ghost mb-8">
          <ArrowLeft size={13} className={isAr ? "rotate-180" : ""} />
          <span>{isAr ? "العودة للرئيسية" : "Back to home"}</span>
        </Link>
        <h1 className={`font-display text-display-lg text-fg ${isAr ? "font-semibold" : ""}`}>{isAr ? titleAr : title}</h1>
        <p className="mt-3 font-mono text-[11px] text-fg-3 tracking-wider">
          {APP.name} v{APP.version} · {isAr ? "آخر تحديث" : "last updated"} {updated}
        </p>
        <div className="mt-10 space-y-8 text-[15px] text-fg-2 leading-relaxed">{children(isAr)}</div>
      </main>
      <Footer />
    </div>
  );
}
