"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Globe, Menu, X, ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { APP } from "@/lib/registry";

const LINKS = [
  { href: "/features/finance", en: "Finance", ar: "المالية" },
  { href: "/features/supply-chain", en: "Supply chain", ar: "سلاسل الإمداد" },
  { href: "/dashboard?panel=screener", en: "Screener", ar: "فاحص الأسهم" },
  { href: "/#network", en: "GCC network", ar: "شبكة الخليج" },
  { href: "/#wire", en: "Wire", ar: "الأخبار" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const language = useTerminalStore((s) => s.language);
  const setLanguage = useTerminalStore((s) => s.setLanguage);
  const isAr = language === "ar";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none px-3 sm:px-6 pt-2.5 sm:pt-4"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        {/* Apple Floating Island Capsule */}
        <nav
          className={`pointer-events-auto mx-auto transition-all duration-300 flex items-center justify-between relative overflow-hidden ${
            scrolled
              ? "apple-island px-4 sm:px-6 py-2 shadow-[var(--glass-dock-shadow)]"
              : "liquid-glass rounded-2xl sm:rounded-full px-5 sm:px-7 py-3"
          }`}
          aria-label="Main navigation"
        >
          {/* Scroll progress hairline */}
          <motion.div
            style={{ scaleX: progress }}
            className="absolute bottom-0 inset-x-0 h-[2px] bg-emerald-light origin-[0_0] rtl:origin-[100%_0] opacity-80"
            aria-hidden="true"
          />

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group apple-touch-target">
            <MahwarLogo size={32} animate={false} />
            <div className="leading-none">
              <div className="font-display text-lg sm:text-xl font-semibold tracking-wide text-fg group-hover:text-emerald-light transition-colors">
                {APP.name}
              </div>
              <div className="font-mono text-[9px] sm:text-[9.5px] tracking-[0.25em] text-fg-3 mt-1">
                {APP.nameAr} · v{APP.version}
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (macOS / iOS style) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] font-medium text-fg-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-fg transition-colors py-1 relative group"
              >
                <span>{isAr ? l.ar : l.en}</span>
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-light rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-200" />
              </Link>
            ))}
          </div>

          {/* Actions & Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle isAr={isAr} />
            <button
              onClick={() => setLanguage(isAr ? "en" : "ar")}
              className="btn-secondary py-1.5 px-3 text-[12px] apple-touch-target"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe size={13} />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>
            <Link
              href="/dashboard"
              className="btn-primary py-1.5 px-3.5 text-[12px] font-medium apple-touch-target rounded-full shadow-[0_2px_10px_rgba(28,139,108,0.25)]"
            >
              <span>{isAr ? "ادخل إلى المحطة" : "Enter Terminal"}</span>
              <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
            </Link>
          </div>

          {/* Mobile hamburger trigger (44x44pt hit target) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden apple-touch-target text-fg-2 hover:text-fg rounded-full transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Dropdown Sheet with Apple Liquid Glass */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden mt-2 pointer-events-auto liquid-glass rounded-2xl p-5 space-y-2 text-sm shadow-[var(--glass-dock-shadow)]"
            >
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-fg-2 hover:text-fg hover:bg-ink-3/50 transition-colors font-medium"
                >
                  {isAr ? l.ar : l.en}
                </Link>
              ))}
              <div className="pt-3 border-t border-line/50 flex flex-col gap-2.5">
                <ThemeToggle
                  isAr={isAr}
                  variant="menu"
                  className="w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:py-2"
                />
                <button
                  onClick={() => {
                    setLanguage(isAr ? "en" : "ar");
                    setOpen(false);
                  }}
                  className="btn-secondary w-full py-2.5 apple-touch-target justify-center"
                >
                  <Globe size={14} />
                  <span>{isAr ? "English" : "العربية"}</span>
                </button>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full py-2.5 apple-touch-target justify-center rounded-xl font-medium"
                >
                  {isAr ? "ادخل إلى المحطة" : "Enter Terminal"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

