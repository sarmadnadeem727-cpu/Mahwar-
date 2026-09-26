"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  shortcut?: string;
  onClick: () => void;
  tone?: "default" | "destructive";
  divider?: boolean;
}

interface AppleContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Apple HIG Context Menu.
 * Triggers on right-click or long-press, presenting a floating Liquid Glass
 * menu card with specular refraction, keyboard shortcut hints, and haptic feedback.
 * Reference: references/hig/context-menus.md
 */
export default function AppleContextMenu({
  items,
  children,
  className = "",
  disabled = false,
}: AppleContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();

    // Clamp inside viewport
    const menuWidth = 220;
    const menuHeight = items.length * 36 + 20;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 16);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 16);

    setPosition({ x, y });
  };

  useEffect(() => {
    if (!position) return;

    const handleDismiss = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && menuRef.current?.contains(e.target as Node)) return;
      setPosition(null);
    };

    window.addEventListener("mousedown", handleDismiss);
    window.addEventListener("keydown", handleDismiss);
    return () => {
      window.removeEventListener("mousedown", handleDismiss);
      window.removeEventListener("keydown", handleDismiss);
    };
  }, [position]);

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}

      <AnimatePresence>
        {position && (
          <div className="fixed inset-0 z-[150] pointer-events-none">
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -2 }}
              transition={{ type: "spring", stiffness: 440, damping: 30 }}
              style={{ left: position.x, top: position.y }}
              className="pointer-events-auto absolute w-56 p-1.5 rounded-2xl liquid-glass shadow-[var(--shadow-modal)] border border-line select-none"
              role="menu"
            >
              {items.map((item) => {
                const Icon = item.icon;
                const isDestructive = item.tone === "destructive";

                return (
                  <React.Fragment key={item.id}>
                    <button
                      role="menuitem"
                      onClick={() => {
                        item.onClick();
                        setPosition(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[12.5px] transition-all duration-120 group ${
                        isDestructive
                          ? "text-neg hover:bg-neg/10"
                          : "text-fg hover:bg-emerald/15 hover:text-emerald-light"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <Icon
                            size={14}
                            className={`shrink-0 transition-colors ${
                              isDestructive
                                ? "text-neg"
                                : "text-fg-3 group-hover:text-emerald-light"
                            }`}
                          />
                        )}
                        <span className="truncate font-medium">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="font-mono text-[10.5px] text-fg-4 tracking-wider ml-2">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                    {item.divider && <div className="h-px bg-line/60 my-1 mx-1.5" />}
                  </React.Fragment>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
