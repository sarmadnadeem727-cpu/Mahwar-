"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";
import { getTool } from "@/lib/registry";
import { haptics } from "@/lib/audio/haptics";
import SFSymbol from "@/components/ui/SFSymbol";
import { Plus, X } from "lucide-react";

export default function AppleWindowTabs() {
  const { activePanel, setPanel, recentPanels, language } = useTerminalStore(
    useShallow((s) => ({
      activePanel: s.activePanel,
      setPanel: s.setPanel,
      recentPanels: s.recentPanels,
      language: s.language,
    }))
  );
  const isAr = language === "ar";

  // Display up to 6 open tabs, ensuring activePanel is included
  const openPanels: PanelType[] = React.useMemo(() => {
    const list = Array.from(new Set([activePanel, ...recentPanels])).slice(0, 6);
    return list;
  }, [activePanel, recentPanels]);

  const handleSelectTab = (p: PanelType) => {
    if (p !== activePanel) {
      haptics.playTap();
      setPanel(p);
    }
  };

  const handleOpenNew = () => {
    haptics.playTap();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  };

  return (
    <nav
      className="hidden md:flex items-center gap-1 px-4 py-1.5 border-b border-white/10 bg-ink-2/60 backdrop-blur-xl overflow-x-auto no-scrollbar no-print"
      dir={isAr ? "rtl" : "ltr"}
      aria-label="Open Workspace Tabs"
    >
      <div className="flex items-center gap-1 min-w-0">
        <AnimatePresence initial={false}>
          {openPanels.map((p) => {
            const tool = getTool(p);
            const active = p === activePanel;
            const code = tool?.code ?? (p === "hub" ? "HUB" : p.toUpperCase());
            const label = tool ? (isAr ? tool.ar : tool.en) : p;

            return (
              <motion.div
                key={p}
                layout
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => handleSelectTab(p)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-sans transition-all duration-200 apple-touch-target select-none ${
                    active
                      ? "bg-white/[0.14] text-fg shadow-[0_1px_6px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/20 font-medium"
                      : "text-fg-3 hover:text-fg hover:bg-white/[0.05] border border-transparent"
                  }`}
                  aria-selected={active}
                >
                  {/* Active tab spring highlight */}
                  {active && (
                    <motion.div
                      layoutId="apple-window-tab-active"
                      className="absolute inset-0 rounded-xl bg-white/[0.04]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  <span className={`font-mono text-[10px] tracking-wider shrink-0 ${active ? "text-emerald-light font-semibold" : "text-fg-4"}`}>
                    {code}
                  </span>
                  <span className="truncate max-w-[140px] text-[11.5px]">{label}</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Plus New Tab Button */}
      <button
        type="button"
        onClick={handleOpenNew}
        className="h-7 w-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-fg-4 hover:text-fg transition-colors shrink-0 ms-1"
        title={isAr ? "فتح محرك جديد (⌘K)" : "Open new tab (⌘K)"}
        aria-label="New Tab"
      >
        <Plus size={13} />
      </button>
    </nav>
  );
}
