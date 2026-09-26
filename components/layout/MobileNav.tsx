"use client";

import React from "react";
import { motion } from "framer-motion";
import { Columns, LayoutGrid, Boxes, Newspaper, TerminalSquare } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";
import { getTool } from "@/lib/registry";

const ITEMS: { id: PanelType | "menu"; icon: typeof Columns; en: string; ar: string; suite?: "finance" | "operations" }[] = [
  { id: "hub", icon: Columns, en: "Hub", ar: "الرئيسية" },
  { id: "menu", icon: LayoutGrid, en: "Engines", ar: "المحركات", suite: "finance" },
  { id: "operations_hub", icon: Boxes, en: "Ops", ar: "العمليات", suite: "operations" },
  { id: "news", icon: Newspaper, en: "Wire", ar: "الأخبار" },
  { id: "console", icon: TerminalSquare, en: "CLI", ar: "الطرفية" },
];

/**
 * Apple HIG Mobile Bottom Tab Dock.
 * Floating liquid glass pill dock with 48pt thumb targets and spring pill indicator.
 */
export default function MobileNav() {
  const { activePanel, setPanel, language, setMobileMenuOpen } = useTerminalStore(
    useShallow((s) => ({ activePanel: s.activePanel, setPanel: s.setPanel, language: s.language, setMobileMenuOpen: s.setMobileMenuOpen }))
  );
  const isAr = language === "ar";
  const activeSuite = getTool(activePanel)?.suite;

  return (
    <nav
      className="lg:hidden fixed bottom-3 inset-x-3 max-w-lg mx-auto z-40 apple-dock px-2 py-1.5 flex items-center justify-around no-print"
      aria-label="Quick navigation"
      dir={isAr ? "rtl" : "ltr"}
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.id === "menu"
            ? activeSuite === "finance"
            : item.id === activePanel || (item.suite && activeSuite === item.suite && activePanel !== "hub");

        return (
          <button
            key={item.id}
            onClick={() => (item.id === "menu" ? setMobileMenuOpen(true) : setPanel(item.id))}
            className="apple-touch-target flex-1 flex flex-col items-center justify-center relative py-1 rounded-xl transition-colors"
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <motion.span
                layoutId="apple-mobile-dock-active"
                className="absolute inset-0 bg-emerald/15 rounded-xl border border-emerald/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              size={18}
              className={`relative z-10 transition-colors ${
                active ? "text-emerald-light drop-shadow-[0_0_8px_var(--emerald-border)]" : "text-fg-3 hover:text-fg-2"
              }`}
            />
            <span
              className={`relative z-10 font-mono text-[9px] tracking-wider mt-0.5 transition-colors ${
                active ? "text-emerald-light font-medium" : "text-fg-3"
              }`}
            >
              {isAr ? item.ar : item.en}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

