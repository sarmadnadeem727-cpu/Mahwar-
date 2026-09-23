"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, X, ChevronDown, History } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { APP, CLUSTERS, CLUSTER_ORDER, SUITES, TOOLS, getTool, type ToolDef } from "@/lib/registry";

const EXPANDED = 272;
const COLLAPSED = 64;
const RECENT_MAX = 5;

/**
 * Sidebar — Recent (last panels opened, Zustand only) pinned on top, then each
 * suite. Suites with clusters (finance, operations) render every cluster as a
 * collapsible sub-group; only the group holding the open panel starts open.
 */
export default function Sidebar() {
  const { activePanel, setPanel, language, isMobileMenuOpen, setMobileMenuOpen, savedKeys, recentPanels } = useTerminalStore(
    useShallow((s) => ({
      activePanel: s.activePanel, setPanel: s.setPanel, language: s.language, isMobileMenuOpen: s.isMobileMenuOpen,
      setMobileMenuOpen: s.setMobileMenuOpen, savedKeys: Object.keys(s.sessionAnalyses).join(","), recentPanels: s.recentPanels,
    }))
  );
  const savedSet = useMemo(() => new Set(savedKeys.split(",").filter(Boolean)), [savedKeys]);
  const isAr = language === "ar";
  const [collapsed, setCollapsed] = useState(false);
  const expanded = !collapsed;

  const activeCluster = getTool(activePanel)?.cluster ?? null;
  const [open, setOpen] = useState<Record<string, boolean>>(() => (activeCluster ? { [activeCluster]: true } : {}));
  // Opening a panel from the palette / GO line must reveal its group too.
  useEffect(() => {
    if (activeCluster) setOpen((o) => (o[activeCluster] ? o : { ...o, [activeCluster]: true }));
  }, [activeCluster]);

  const groups = useMemo(
    () =>
      SUITES.map((suite) => {
        const items = TOOLS.filter((t) => t.suite === suite.id);
        const clustered = suite.id === "finance" || suite.id === "operations";
        const clusters = clustered
          ? CLUSTER_ORDER.map((id) => ({ cluster: CLUSTERS[id], tools: items.filter((t) => t.cluster === id) })).filter((c) => c.tools.length > 0)
          : [];
        return { suite, items, clustered, clusters };
      }),
    []
  );

  const recent = useMemo(
    () => recentPanels.filter((p) => p !== activePanel).map((p) => getTool(p)).filter((t): t is ToolDef => !!t).slice(0, RECENT_MAX),
    [recentPanels, activePanel]
  );

  const hasData = (tool: ToolDef) => !!(tool.sessionKey && savedSet.has(tool.sessionKey));
  const pick = (id: PanelType) => { setPanel(id); setMobileMenuOpen(false); };

  const renderItem = (tool: ToolDef, indent = false) => {
    const Icon = tool.icon;
    const active = activePanel === tool.id;
    return (
      <button
        key={tool.id}
        onClick={() => pick(tool.id)}
        title={!expanded ? (isAr ? tool.ar : tool.en) : undefined}
        aria-current={active ? "page" : undefined}
        className={`relative w-full flex items-center gap-3 py-[7px] text-start transition-colors group ${
          expanded ? (indent ? "ps-7 pe-3" : "px-3") : "justify-center px-3"
        } ${active ? "text-fg" : "text-fg-2 hover:text-fg hover:bg-ink-3/70"}`}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-y-1 start-0 w-[3px] rounded-full bg-emerald-light shadow-[0_0_12px_var(--emerald-light)]"
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
    );
  };

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
        {/* Recent — Zustand state only, no backend */}
        {expanded && recent.length > 0 && (
          <div className="mb-4">
            <div className="px-4 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-fg-4 uppercase flex items-center gap-1.5">
              <History size={10} /> {isAr ? "الأخيرة" : "Recent"}
            </div>
            {recent.map((tool) => (
              <button
                key={`recent-${tool.id}`}
                onClick={() => pick(tool.id)}
                className="w-full flex items-center gap-3 px-3 py-[6px] text-start text-fg-2 hover:text-fg hover:bg-ink-3/70 transition-colors"
              >
                <span className="font-mono text-[10px] tracking-wider text-emerald-light w-12 shrink-0">{tool.code}</span>
                <span className="text-[12.5px] truncate">{isAr ? tool.ar : tool.en}</span>
              </button>
            ))}
          </div>
        )}

        {groups.map(({ suite, items, clustered, clusters }) => (
          <div key={suite.id} className="mb-4">
            {expanded ? (
              <div className="px-4 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-fg-4 uppercase">
                {isAr ? suite.shortAr : suite.short}
              </div>
            ) : (
              <div className="mx-auto my-2 w-5 h-px bg-line" />
            )}

            {!expanded || !clustered
              ? items.map((tool) => renderItem(tool))
              : clusters.map(({ cluster, tools }) => {
                  const isOpen = !!open[cluster.id];
                  const holdsActive = tools.some((t) => t.id === activePanel);
                  const savedCount = tools.filter(hasData).length;
                  return (
                    <div key={cluster.id}>
                      <button
                        onClick={() => setOpen((o) => ({ ...o, [cluster.id]: !isOpen }))}
                        aria-expanded={isOpen}
                        className={`w-full flex items-center gap-2 px-3 py-[6px] text-start transition-colors ${holdsActive ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}
                      >
                        <ChevronDown size={12} className={`shrink-0 transition-transform ${isOpen ? "" : isAr ? "rotate-90" : "-rotate-90"}`} />
                        <span className="flex-1 text-[11.5px] truncate">{isAr ? cluster.ar : cluster.en}</span>
                        <span className="flex items-center gap-1.5 shrink-0 font-mono text-[9.5px] text-fg-4">
                          {savedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-light" />}
                          {tools.length}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            {tools.map((tool) => renderItem(tool, true))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3 font-mono text-[10px] text-fg-3">
        {expanded ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" />
              {isAr ? "المحركات تعمل محلياً" : "engines run locally"}
            </span>
            <span>{savedSet.size} {isAr ? "محفوظ" : "saved"}</span>
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
