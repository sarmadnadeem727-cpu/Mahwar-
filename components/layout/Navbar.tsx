"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Menu, X, ArrowRight } from "lucide-react";
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
          ? "bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs py-3" 
          : "bg-transparent py-5"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <MahwarLogo size={36} animate={true} />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-slate-900 group-hover:text-emerald transition-colors">
              MAHWAR
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald tracking-widest uppercase -mt-0.5">
              محور · SOVEREIGN TERMINAL
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold text-slate-600">
          <a href="#problem" className="hover:text-emerald transition-colors">
            {isAr ? "التحدي" : "Market Gap"}
          </a>
          <a href="#solution" className="hover:text-emerald transition-colors">
            {isAr ? "القدرات" : "Engine Suite"}
          </a>
          <a href="#tech" className="hover:text-emerald transition-colors">
            {isAr ? "التقنيات" : "Core Architecture"}
          </a>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 text-xs font-mono font-bold text-slate-700 transition-all cursor-pointer"
          >
            <Globe size={13} className="text-emerald" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald hover:bg-emerald-light text-white text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer group"
          >
            <span>{isAr ? "تشغيل المنصة" : "ENTER TERMINAL"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-700 hover:text-slate-900 p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] px-6 py-6 space-y-4 text-xs font-mono font-bold text-slate-700">
          <a href="#problem" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "التحدي" : "Market Gap"}
          </a>
          <a href="#solution" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "القدرات" : "Platform Suite"}
          </a>
          <a href="#tech" onClick={() => setMobileOpen(false)} className="block py-2">
            {isAr ? "التقنيات" : "Core Architecture"}
          </a>

          
          <hr className="border-[#E2E8F0]" />
          
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                setLanguage(isAr ? 'en' : 'ar');
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#E2E8F0] bg-slate-50 text-slate-800 font-mono text-xs font-bold"
            >
              <Globe size={14} className="text-emerald" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>

            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-emerald hover:bg-emerald-light text-white font-mono text-xs font-bold uppercase tracking-wider block"
            >
              <span>{isAr ? "تشغيل المنصة" : "ENTER TERMINAL"}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
