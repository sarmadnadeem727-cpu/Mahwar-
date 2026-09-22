"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { ArrowRight, ShieldCheck, Lock, Fingerprint } from "lucide-react";
import FlowField from "@/components/ui/FlowField";
import MahwarLogo from "@/components/ui/MahwarLogo";
import { useUser } from "@/lib/auth/useUser";
import { useTerminalStore } from "@/store/useTerminalStore";
import { APP, TOOLS } from "@/lib/registry";

const ERRORS: Record<string, { en: string; ar: string }> = {
  AccessDenied: { en: "That Google account isn't on the allow-list for this terminal.", ar: "هذا الحساب غير مدرج في قائمة السماح لهذه المحطة." },
  OAuthAccountNotLinked: { en: "This e-mail is already linked to another sign-in method.", ar: "هذا البريد مرتبط بطريقة تسجيل دخول أخرى." },
  Configuration: { en: "Google sign-in isn't configured on the server yet.", ar: "لم يتم إعداد تسجيل الدخول عبر Google على الخادم بعد." },
  Default: { en: "Sign-in didn't complete. Try again.", ar: "لم يكتمل تسجيل الدخول. حاول مرة أخرى." },
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.1 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const BOOT = [
  "auth ........... google oauth 2.0 / openid connect",
  "session ........ signed jwt · httpOnly · sameSite=lax",
  "transport ...... tls · hsts · csp strict",
  "state .......... analyses stay in your browser",
];

function LoginInner() {
  const { language, setLanguage } = useTerminalStore();
  const isAr = language === "ar";
  const params = useSearchParams();
  const next = params.get("next");
  const errorKey = params.get("error");
  const { loading, configured, user } = useUser();
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setLines(BOOT); return; }
    const ids = BOOT.map((l, i) => window.setTimeout(() => setLines((p) => [...p, l]), 500 + i * 260));
    return () => ids.forEach(clearTimeout);
  }, []);

  const callbackUrl = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const error = errorKey ? ERRORS[errorKey] ?? ERRORS.Default : null;

  return (
    <main className="relative min-h-[100svh] bg-ink-0 text-fg overflow-hidden grain flex items-center justify-center px-5 py-16" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 opacity-70"><FlowField density={0.7} fadeSide={isAr ? "right" : "left"} /></div>
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div className="aurora absolute -top-1/3 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px]"
      >
        <div className="glass-panel rounded-[var(--radius-modal)] overflow-hidden shadow-[var(--shadow-modal)]">
          <div className="h-10 px-4 flex items-center justify-between border-b border-line bg-ink-3/70 font-mono text-[10px] text-fg-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald" /><span className="w-2 h-2 rounded-full bg-gold/70" /><span className="w-2 h-2 rounded-full bg-ink-5" />
              <span className="ms-2 tracking-wider">mahwar://gate</span>
            </span>
            <button onClick={() => setLanguage(isAr ? "en" : "ar")} className="hover:text-fg transition-colors">{isAr ? "EN" : "العربية"}</button>
          </div>

          <div className="p-7 sm:p-8">
            <Link href="/" className="flex items-center gap-3">
              <MahwarLogo size={44} />
              <div className="leading-none">
                <div className="font-serif text-2xl text-fg">{APP.name}</div>
                <div className="font-mono text-[9.5px] tracking-[0.3em] text-emerald-light mt-1.5">{APP.nameAr} · TERMINAL</div>
              </div>
            </Link>

            <h1 className={`mt-7 font-serif text-[28px] leading-tight text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
              {isAr ? "ادخل إلى المحطة" : "Sign in to the terminal"}
            </h1>
            <p className="mt-2 text-[13px] text-fg-2 leading-relaxed">
              {isAr
                ? `حساب Google واحد يفتح ${TOOLS.length} محركاً للتمويل وسلاسل الإمداد. تحليلاتك تبقى في متصفحك.`
                : `One Google account unlocks ${TOOLS.length} finance and supply-chain engines. Your analyses never leave your browser.`}
            </p>

            <div className="mt-6 font-mono text-[11px] leading-relaxed text-fg-3 min-h-[88px]" dir="ltr">
              {lines.map((l, i) => (
                <div key={i} className={i === lines.length - 1 ? "text-fg-2" : ""}><span className="text-emerald-light me-2">{">"}</span>{l}</div>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded border border-neg/40 bg-neg/10 px-3 py-2 text-[12px] text-neg" role="alert">{isAr ? error.ar : error.en}</div>
            )}

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="h-12 rounded panel-data animate-pulse" />
              ) : configured ? (
                user ? (
                  <Link href={callbackUrl} className="btn-primary w-full h-12 text-[12px]">
                    {isAr ? `متابعة كـ ${user.name ?? user.email}` : `Continue as ${user.name ?? user.email}`} <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
                  </Link>
                ) : (
                  <button
                    onClick={async () => { setBusy(true); await signIn("google", { callbackUrl }); }}
                    disabled={busy}
                    className="w-full h-12 flex items-center justify-center gap-3 rounded bg-fg text-ink-0 font-sans text-[14px] font-semibold hover:bg-white transition-colors disabled:opacity-60"
                  >
                    <GoogleMark />
                    {busy ? (isAr ? "جارٍ التحويل إلى Google…" : "Redirecting to Google…") : (isAr ? "المتابعة باستخدام Google" : "Continue with Google")}
                  </button>
                )
              ) : (
                <>
                  <Link href={callbackUrl} className="btn-primary w-full h-12 text-[12px]">
                    {isAr ? "الدخول كضيف" : "Enter as guest"} <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
                  </Link>
                  <p className="text-[11px] text-fg-3 leading-relaxed">
                    {isAr
                      ? "لم تُضبط مفاتيح Google بعد. أضف AUTH_GOOGLE_ID و AUTH_GOOGLE_SECRET و AUTH_SECRET لتفعيل تسجيل الدخول وحماية المحطة."
                      : "Google keys aren't set yet, so the gate is open. Add AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and AUTH_SECRET to lock the terminal behind sign-in."}
                  </p>
                </>
              )}
            </div>

            <ul className="mt-7 grid grid-cols-3 gap-2 text-[10.5px] text-fg-3">
              {[
                { icon: Lock, en: "No passwords stored", ar: "لا كلمات مرور مخزنة" },
                { icon: ShieldCheck, en: "Strict CSP + HSTS", ar: "سياسة أمان صارمة" },
                { icon: Fingerprint, en: "7-day signed session", ar: "جلسة موقعة 7 أيام" },
              ].map((f) => (
                <li key={f.en} className="flex flex-col items-start gap-1.5 rounded border border-line bg-ink-2/60 p-2.5">
                  <f.icon size={13} className="text-emerald-light" />
                  <span className="leading-tight">{isAr ? f.ar : f.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-fg-4">
          <Link href="/terms" className="hover:text-fg-2">{isAr ? "الشروط" : "Terms"}</Link> · <Link href="/privacy" className="hover:text-fg-2">{isAr ? "الخصوصية" : "Privacy"}</Link> · © {APP.author}
        </p>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[100svh] bg-ink-0" />}>
      <LoginInner />
    </Suspense>
  );
}
