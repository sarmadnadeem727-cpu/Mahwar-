"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Globe, Menu, X, ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { APP } from "@/lib/registry";
import { CHAPTERS, chapterHref } from "@/components/sections/chapters";

/** Top-level anchors — a subset of the chapters, the ones a first-time visitor would jump to. */
const NAV_CHAPTERS = ["engines", "flagship", "network", "wire"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const language = useTerminalStore((s) => s.language);
  const setLanguage = useTerminalStore((s) => s.setLanguage);
  const isAr = language === "ar";
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const links = CHAPTERS.filter((c) => NAV_CHAPTERS.includes(c.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-scrolled backdrop-blur-xl border-b border-line py-2.5" : "bg-transparent py-5"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <motion.div style={{ scaleX: progress }} className="absolute bottom-0 inset-x-0 h-px bg-emerald-light origin-[0_0] rtl:origin-[100%_0]" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <MahwarLogo size={34} animate={false} />
          <div className="leading-none">
            <div className="font-serif text-xl font-semibold tracking-wide text-fg group-hover:text-emerald-light transition-colors">
              {APP.name}
            </div>
            <div className="font-mono text-[9.5px] tracking-[0.25em] text-fg-3 mt-1">{APP.nameAr} · v{APP.version}</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[13px] text-fg-2">
          {links.map((c) => (
            <a key={c.id} href={chapterHref(c.id)} className="hover:text-fg transition-colors">
              {isAr ? c.ar : c.en}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => setLanguage(isAr ? "en" : "ar")} className="btn-secondary py-2">
            <Globe size={12} />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
          <Link href="/dashboard" className="btn-primary py-2">
            <span>{isAr ? "ادخل إلى المحطة" : "Enter the terminal"}</span>
            <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-fg-2 hover:text-fg"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-ink-2 border-y border-line px-6 py-5 space-y-1 text-sm"
          >
            {links.map((c) => (
              <a key={c.id} href={chapterHref(c.id)} onClick={() => setOpen(false)} className="block py-2.5 text-fg-2">
                {isAr ? c.ar : c.en}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={() => {
                  setLanguage(isAr ? "en" : "ar");
                  setOpen(false);
                }}
                className="btn-secondary w-full"
              >
                <Globe size={13} />
                <span>{isAr ? "English" : "العربية"}</span>
              </button>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-primary w-full">
                {isAr ? "ادخل إلى المحطة" : "Enter the terminal"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
