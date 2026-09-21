"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { APP, CLUSTERS, SUITES, TOOLS, type ToolDef } from "@/lib/registry";

const EXPANDED = 272;
const COLLAPSED = 64;

export default function Sidebar() {
  const { activePanel, setPanel, language, isMobileMenuOpen, setMobileMenuOpen, sessionAnalyses } = useTerminalStore();
  const isAr = language === "ar";
  const [collapsed, setCollapsed] = useState(false);
  const expanded = !collapsed;

  const groups = useMemo(
    () =>
      SUITES.map((suite) => ({
        suite,
        items: TOOLS.filter((t) => t.suite === suite.id),
      })),
    []
  );

  const hasData = (tool: ToolDef) => !!(tool.sessionKey && sessionAnalyses[tool.sessionKey]);

  const nav = (
    <>
      <div className="h-14 min-h-14 px-3 flex items-center justify-between border-b border-line">
        <Link href="/" className="flex items-center gap-3 min-w-0" title={isAr ? "الصفحة الرئيسية" : "Home"}>
          <MahwarLogo size={30} animate={false} />
          {expanded && (
            <div className="leading-none whitespace-nowrap">
              <div className="font-serif text-lg text-fg">{APP.name}</div>
              <div className="font-mono text-[9px] tracking-[0.25em] text-fg-3 mt-1">{APP.nameAr} · v{APP.version}</div>
            </div>
          )}
        </Link>
        <button
          onClick={() => (isMobileMenuOpen ? setMobileMenuOpen(false) : setCollapsed((c) => !c))}
          className="p-1.5 rounded text-fg-3 hover:text-fg hover:bg-ink-4 transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMobileMenuOpen ? <X size={16} /> : collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin" aria-label="Terminal modules">
        {groups.map(({ suite, items }) => {
          let lastCluster: string | undefined;
          return (
            <div key={suite.id} className="mb-4">
              {expanded ? (
                <div className="px-4 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-fg-4 uppercase">
                  {isAr ? suite.shortAr : suite.short}
                </div>
              ) : (
                <div className="mx-auto my-2 w-5 h-px bg-line" />
              )}
              {items.map((tool) => {
                const Icon = tool.icon;
                const active = activePanel === tool.id;
                const showCluster = expanded && tool.cluster && tool.cluster !== lastCluster && suite.id !== "platform";
                lastCluster = tool.cluster;
                return (
                  <React.Fragment key={tool.id}>
                    {showCluster && (
                      <div className="px-4 pt-3 pb-1 text-[10px] text-fg-4">{isAr ? CLUSTERS[tool.cluster!].ar : CLUSTERS[tool.cluster!].en}</div>
                    )}
                    <button
                      onClick={() => {
                        setPanel(tool.id);
                        setMobileMenuOpen(false);
                      }}
                      title={!expanded ? (isAr ? tool.ar : tool.en) : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`relative w-full flex items-center gap-3 px-3 mx-0 py-[7px] text-start transition-colors group ${
                        expanded ? "" : "justify-center"
                      } ${active ? "text-fg" : "text-fg-2 hover:text-fg hover:bg-ink-3/70"}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className={`absolute inset-y-1 ${isAr ? "right-0" : "left-0"} w-[3px] rounded-full bg-emerald-light shadow-[0_0_12px_var(--emerald-light)]`}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      {active && <span className="absolute inset-0 bg-emerald/10" />}
                      <Icon size={16} className={`relative shrink-0 ${active ? "text-emerald-light" : "text-fg-3 group-hover:text-fg-2"}`} />
                      {expanded && (
                        <span className="relative flex-1 flex items-center justify-between min-w-0 gap-2">
                          <span className="text-[13px] truncate">{isAr ? tool.ar : tool.en}</span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {hasData(tool) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-light" title={isAr ? "محفوظ في الجلسة" : "Saved in session"} />}
                            <span className={`font-mono text-[9.5px] tracking-wider ${active ? "text-emerald-light" : "text-fg-4"}`}>{tool.code}</span>
                          </span>
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-3 font-mono text-[10px] text-fg-3">
        {expanded ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" />
              {isAr ? "المحرك يعمل محلياً" : "engines run locally"}
            </span>
            <span>{Object.keys(sessionAnalyses).length} {isAr ? "محفوظ" : "saved"}</span>
          </div>
        ) : (
          <span className="block mx-auto w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" />
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? EXPANDED : COLLAPSED }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="hidden lg:flex flex-col h-full bg-ink-2 border-e border-line shrink-0 no-print"
        dir={isAr ? "rtl" : "ltr"}
      >
        {nav}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink-0/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isAr ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className={`fixed top-0 bottom-0 ${isAr ? "right-0" : "left-0"} w-[280px] flex flex-col bg-ink-2 border-e border-line z-50 lg:hidden`}
              dir={isAr ? "rtl" : "ltr"}
            >
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

