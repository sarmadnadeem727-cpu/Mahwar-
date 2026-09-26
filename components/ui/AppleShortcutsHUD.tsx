"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  descriptionEn: string;
  descriptionAr: string;
}

const SHORTCUT_GROUPS: { groupEn: string; groupAr: string; items: ShortcutItem[] }[] = [
  {
    groupEn: "Navigation & Command",
    groupAr: "التنقل والأوامر",
    items: [
      { keys: ["⌘", "K"], descriptionEn: "Open Spotlight Command Palette", descriptionAr: "فتح لوحة الأوامر" },
      { keys: ["/"], descriptionEn: "Focus Terminal GO line", descriptionAr: "التركيز على سطر الأوامر" },
      { keys: ["esc"], descriptionEn: "Close dialogs & clear inputs", descriptionAr: "إغلاق النوافذ ومسح المدخلات" },
      { keys: ["?"], descriptionEn: "Open Keyboard Shortcuts HUD", descriptionAr: "عرض اختصارات لوحة المفاتيح" },
    ],
  },
  {
    groupEn: "Terminal & History",
    groupAr: "الطرفية والسجل",
    items: [
      { keys: ["tab"], descriptionEn: "Autocomplete command suggestion", descriptionAr: "إكمال تلقائي للأمر" },
      { keys: ["↑", "↓"], descriptionEn: "Walk through command history", descriptionAr: "التنقل في سجل الأوامر" },
      { keys: ["return"], descriptionEn: "Execute command (GO)", descriptionAr: "تنفيذ الأمر" },
    ],
  },
  {
    groupEn: "Tools & Viewports",
    groupAr: "الأدوات والعرض",
    items: [
      { keys: ["alt", "T"], descriptionEn: "Toggle Dark / Light theme", descriptionAr: "تبديل المظهر داكن / فاتح" },
      { keys: ["alt", "L"], descriptionEn: "Switch English / Arabic (RTL)", descriptionAr: "التبديل بين العربية والإنجليزية" },
    ],
  },
];

export default function AppleShortcutsHUD({ isAr = false }: { isAr?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 no-print"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* macOS Shortcuts Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
            className="relative z-10 w-full max-w-xl liquid-glass rounded-2xl shadow-[var(--shadow-modal)] border border-line p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-line/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald-light">
                  <Command size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-fg">
                    {isAr ? "اختصارات لوحة المفاتيح" : "macOS Keyboard Shortcuts"}
                  </h3>
                  <p className="text-[11px] text-fg-3">
                    {isAr ? "تحكم بالطرفية بسرعة عبر المفاتيح" : "Navigate Mahwar terminal with keyboard speed"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="apple-touch-target p-1.5 rounded-full text-fg-3 hover:text-fg hover:bg-ink-3/50 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.groupEn} className="space-y-2.5">
                  <h4 className="font-mono text-[10.5px] uppercase tracking-wider text-emerald-light font-semibold">
                    {isAr ? group.groupAr : group.groupEn}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-ink-3/40 transition-colors"
                      >
                        <span className="text-[12.5px] text-fg-2">
                          {isAr ? item.descriptionAr : item.descriptionEn}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((k) => (
                            <kbd
                              key={k}
                              className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 rounded-md bg-ink-2/90 dark:bg-ink-1 border border-line-strong shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)] font-mono text-[11px] text-fg font-medium"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-fg-4">
              <span>{isAr ? "اضغط ? في أي وقت للإظهار" : "Press ? anytime to toggle"}</span>
              <span>esc {isAr ? "للإغلاق" : "to dismiss"}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
