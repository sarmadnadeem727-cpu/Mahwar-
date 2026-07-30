"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Menu, X, ArrowRight, Shield } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage } = useTerminalStore();
  const isAr = language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0F1113]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3" 
          : "bg-transparent py-5"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <MahwarLogo size={36} animate={true} />
          <div className="flex flex-col">
            <span className="font-mono text-lg font-extrabold tracking-[0.2em] text-white group-hover:text-[var(--emerald)] transition-colors">
              MAHWAR
            </span>
            <span className="text-[9px] font-bold text-[var(--gold)] tracking-widest uppercase -mt-1">
              محور · GCC Intelligence
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-slate-300">
          <a href="#problem" className="hover:text-[var(--emerald)] transition-colors">
            {isAr ? "التحدي" : "Market Gap"}
          </a>
          <a href="#solution" className="hover:text-[var(--emerald)] transition-colors">
            {isAr ? "القدرات" : "Platform Suite"}
          </a>
          <a href="#gcc" className="hover:text-[var(--emerald)] transition-colors">
            {isAr ? "رؤية 2030" : "GCC Intelligence"}
          </a>
          <a href="#tech" className="hover:text-[var(--emerald)] transition-colors">
            {isAr ? "التقنيات" : "Core Stack"}
          </a>
          <a href="#testimonials" className="hover:text-[var(--emerald)] transition-colors">
            {isAr ? "آراء الخبراء" : "Institutional Users"}
          </a>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            <Globe size={13} className="text-[var(--gold)]" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#0E7C69] to-[#12A189] hover:from-[#12A189] hover:to-[#16C5A8] text-white text-xs font-bold shadow-lg shadow-[#0E7C69]/25 hover:shadow-[#0E7C69]/40 transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة" : "Enter Terminal"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0F1113] border-b border-white/10 px-6 py-6 space-y-4 text-xs font-bold text-slate-200">
          <a href="#problem" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "التحدي" : "Market Gap"}
          </a>
          <a href="#solution" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "القدرات" : "Platform Suite"}
          </a>
          <a href="#gcc" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "رؤية 2030" : "GCC Intelligence"}
          </a>
          <a href="#tech" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "التقنيات" : "Core Stack"}
          </a>
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => { setLanguage(isAr ? 'en' : 'ar'); setMobileOpen(false); }}
              className="flex items-center justify-center gap-2 py-2 rounded border border-white/10 bg-white/5"
            >
              <Globe size={14} className="text-[var(--gold)]" />
              <span>{isAr ? "Switch to English" : "التحويل للعربية"}</span>
            </button>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded bg-[var(--emerald)] text-white font-bold"
            >
              <span>{isAr ? "تشغيل المنصة" : "Enter Terminal"}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
