"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { useTerminalStore, selectLanguage } from "@/store/useTerminalStore";
import { usePrivacyStore } from "@/lib/privacy/inventory";
import { primeVault } from "@/lib/privacy/vault";
import { animate, prefersReducedMotion, DURATION } from "@/lib/anime";

/**
 * PrivacyNotice — shown once, on the first visit.
 *
 * There is no consent banner because there is nothing to consent to: no
 * analytics, no advertising, no third-party scripts. The notice simply says
 * where data lives and links to the privacy centre. Dismissal is stored in
 * localStorage (that is the only thing it writes).
 */
export default function PrivacyNotice() {
  const language = useTerminalStore(selectLanguage);
  const isAr = language === "ar";
  const pathname = usePathname();
  const hydrated = usePrivacyStore((s) => s.hydrated);
  const dismissedAt = usePrivacyStore((s) => s.noticeDismissedAt);
  const dismiss = usePrivacyStore((s) => s.dismissNotice);
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { primeVault(); }, []);

  const visible = hydrated && !dismissedAt && pathname !== "/privacy";

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return;
    if (prefersReducedMotion()) { el.style.opacity = "1"; el.style.transform = "none"; return; }
    const a = animate(el, { opacity: [0, 1], translateY: [24, 0], duration: DURATION.base, ease: "outExpo", delay: 1200 });
    return () => { a.cancel(); };
  }, [visible]);

  if (!visible) return null;

  const close = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) { dismiss(); return; }
    setLeaving(true);
    animate(el, { opacity: 0, translateY: 16, duration: DURATION.fast, ease: "inQuad" }).then(() => dismiss());
  };

  return (
    <div
      ref={ref}
      role="status"
      dir={isAr ? "rtl" : "ltr"}
      className="fixed z-40 bottom-4 inset-x-4 sm:inset-x-auto sm:end-5 sm:bottom-5 sm:max-w-[420px] opacity-0 glass-panel rounded-[var(--radius-element)] shadow-[var(--shadow-modal)] p-4 pe-10 text-[12.5px] leading-relaxed text-fg-2"
      style={{ pointerEvents: leaving ? "none" : "auto" }}
    >
      <div className="flex gap-3">
        <ShieldCheck size={16} className="text-emerald-light shrink-0 mt-0.5" />
        <div>
          <p className="text-fg">
            {isAr
              ? "لا تتبّع ولا تحليلات ولا ملفات تعريف ارتباط قبل تسجيل الدخول."
              : "No tracking, no analytics, no cookies until you sign in."}
          </p>
          <p className="mt-1">
            {isAr
              ? "تحليلاتك تُحفظ مختومة داخل هذا المتصفح فقط. يمكنك تصديرها أو مسحها في أي وقت."
              : "Your analyses are sealed inside this browser and nowhere else. Export or wipe them whenever you like."}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <button onClick={close} className="btn-primary px-3.5 py-2 text-[10.5px]">{isAr ? "فهمت" : "Understood"}</button>
            <Link href="/privacy" className="btn-ghost text-[10.5px]" onClick={close}>{isAr ? "مركز الخصوصية" : "Privacy centre"}</Link>
          </div>
        </div>
      </div>
      <button onClick={close} aria-label={isAr ? "إغلاق" : "Dismiss"} className="absolute top-2.5 end-2.5 p-1.5 rounded text-fg-3 hover:text-fg hover:bg-ink-4">
        <X size={14} />
      </button>
    </div>
  );
}
