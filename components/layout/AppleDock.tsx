"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore, type PanelType } from "@/store/useTerminalStore";
import SFSymbol, { type SFSymbolName } from "@/components/ui/SFSymbol";
import { Sparkles, TerminalSquare, Compass, Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";

interface DockItemDef {
  id: PanelType | "cmd" | "theme" | "hud";
  en: string;
  ar: string;
  symbol?: SFSymbolName;
  customIcon?: React.ComponentType<{ size?: number; className?: string }>;
  isSystem?: boolean;
}

const DOCK_ITEMS: DockItemDef[] = [
  { id: "hub", en: "Hub", ar: "الرئيسية", symbol: "square.grid.2x2" as any },
  { id: "screener", en: "Screener", ar: "فاحص الأسهم", symbol: "filter" },
  { id: "DCF", en: "DCF Model", ar: "تقييم التدفقات", symbol: "chart.bar.xaxis" },
  { id: "zscore", en: "Z-Score", ar: "مقياس التعثر", symbol: "bookmark" },
  { id: "ccc", en: "Cash Cycle", ar: "دورة النقد", symbol: "arrow.clockwise" },
  { id: "network_map", en: "Corridors", ar: "الممرات", customIcon: Compass },
  { id: "console", en: "Terminal", ar: "الطرفية", symbol: "terminal" },
  { id: "news", en: "Intelligence Wire", ar: "الأخبار", symbol: "bell" },
  // System divider items
  { id: "cmd", en: "Spotlight (⌘K)", ar: "البحث (⌘K)", symbol: "command", isSystem: true },
  { id: "hud", en: "Hotkeys (?)", ar: "الاختصارات (?)", customIcon: HelpCircle, isSystem: true },
  { id: "theme", en: "Appearance", ar: "المظهر", isSystem: true },
];

function DockIcon({
  mouseX,
  item,
  active,
  onClick,
  isAr,
}: {
  mouseX: MotionValue;
  item: DockItemDef;
  active: boolean;
  onClick: () => void;
  isAr: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();

  // Proximity calculation: Distance between icon center and mouse position
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Authentic macOS smooth Gaussian bell curve magnification (42px -> 66px)
  const widthSync = useTransform(distance, [-140, 0, 140], [42, 66, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 260, damping: 18 });

  const iconScale = useTransform(distance, [-140, 0, 140], [1, 1.45, 1]);
  const iconScaleSpring = useSpring(iconScale, { mass: 0.1, stiffness: 260, damping: 18 });

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* macOS Hover Tooltip Pill */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.92 }}
          transition={{ duration: 0.14 }}
          className="absolute -top-7 pointer-events-none whitespace-nowrap z-50 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium text-fg-1 bg-ink-2/90 border border-white/20 shadow-lg backdrop-blur-xl"
        >
          {isAr ? item.ar : item.en}
        </motion.div>
      )}

      <motion.button
        style={{ width, height: width }}
        onClick={onClick}
        whileTap={{ scale: 0.9, y: 2 }}
        className={`relative rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
          active
            ? "bg-white/[0.18] border border-white/25 shadow-[0_2px_12px_rgba(28,139,108,0.35)]"
            : "bg-white/[0.06] hover:bg-white/[0.12] border border-white/10"
        }`}
        aria-label={isAr ? item.ar : item.en}
      >
        <motion.div style={{ scale: iconScaleSpring }} className="flex items-center justify-center">
          {item.id === "theme" ? (
            theme === "dark" ? (
              <Sun size={18} className="text-gold" />
            ) : (
              <Moon size={18} className="text-emerald-light" />
            )
          ) : item.symbol ? (
            <SFSymbol
              name={item.symbol}
              size={18}
              className={active ? "text-emerald-light" : "text-fg-2"}
            />
          ) : item.customIcon ? (
            <item.customIcon
              size={18}
              className={active ? "text-emerald-light" : "text-fg-2"}
            />
          ) : (
            <Sparkles size={18} className={active ? "text-emerald-light" : "text-fg-2"} />
          )}
        </motion.div>
      </motion.button>

      {/* macOS Active App Indicator Dot */}
      <div className="h-1.5 flex items-center justify-center mt-1">
        {active && (
          <motion.span
            layoutId="apple-dock-active-dot"
            className="w-1.5 h-1.5 rounded-full bg-emerald-light shadow-[0_0_6px_var(--emerald-light)]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Apple macOS Magnified Dock Component.
 * Floating liquid glass dock at bottom center on desktop viewports with cursor proximity scaling.
 */
export default function AppleDock() {
  const { activePanel, setPanel, language } = useTerminalStore(
    useShallow((s) => ({
      activePanel: s.activePanel,
      setPanel: s.setPanel,
      language: s.language,
    }))
  );
  const { theme, setTheme } = useTheme();
  const isAr = language === "ar";
  const mouseX = useMotionValue(Infinity);

  const handleClick = (item: DockItemDef) => {
    if (item.id === "cmd") {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
    } else if (item.id === "hud") {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }));
    } else if (item.id === "theme") {
      setTheme(theme === "dark" ? "light" : "dark");
    } else {
      setPanel(item.id as PanelType);
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-0 pointer-events-none z-40 hidden md:flex justify-center no-print">
      <motion.nav
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto h-16 px-3 py-1.5 rounded-[24px] border border-white/20 bg-ink-2/80 backdrop-blur-2xl shadow-[0_24px_50px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] flex items-end gap-2"
        dir="ltr"
        aria-label="macOS Application Dock"
      >
        {DOCK_ITEMS.filter((i) => !i.isSystem).map((item) => (
          <DockIcon
            key={item.id}
            mouseX={mouseX}
            item={item}
            active={activePanel === item.id}
            onClick={() => handleClick(item)}
            isAr={isAr}
          />
        ))}

        {/* macOS Dock Separator */}
        <div className="w-px h-8 bg-white/15 my-auto mx-1 rounded-full shrink-0" />

        {DOCK_ITEMS.filter((i) => i.isSystem).map((item) => (
          <DockIcon
            key={item.id}
            mouseX={mouseX}
            item={item}
            active={false}
            onClick={() => handleClick(item)}
            isAr={isAr}
          />
        ))}
      </motion.nav>
    </div>
  );
}
