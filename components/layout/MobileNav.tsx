"use client";
import React from "react";
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

/** Thumb-reachable bottom tab bar, shown below `lg`. Finance opens the drawer. */
export default function MobileNav() {
  const { activePanel, setPanel, language, setMobileMenuOpen } = useTerminalStore(
    useShallow((s) => ({ activePanel: s.activePanel, setPanel: s.setPanel, language: s.language, setMobileMenuOpen: s.setMobileMenuOpen }))
  );
  const isAr = language === "ar";
  const activeSuite = getTool(activePanel)?.suite;

  return (
    <nav className="lg:hidden mobile-nav no-print" aria-label="Quick navigation" dir={isAr ? "rtl" : "ltr"}>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.id === "menu" ? activeSuite === "finance" : item.id === activePanel || (item.suite && activeSuite === item.suite && activePanel !== "hub");
        return (
          <button
            key={item.id}
            onClick={() => (item.id === "menu" ? setMobileMenuOpen(true) : setPanel(item.id))}
            className={`mobile-nav__item ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} />
            <span>{isAr ? item.ar : item.en}</span>
          </button>
        );
      })}
    </nav>
  );
}
