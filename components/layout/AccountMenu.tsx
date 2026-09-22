"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { LogIn, LogOut, ShieldCheck, UserRound, Download, Upload, Fingerprint } from "lucide-react";
import { useUser } from "@/lib/auth/useUser";
import { useTerminalStore } from "@/store/useTerminalStore";
import { downloadSession, pickSessionFile } from "@/lib/session";

export default function AccountMenu({ isAr }: { isAr: boolean }) {
  const { user, configured, loading } = useUser();
  const importSession = useTerminalStore((s) => s.importSession);
  const toast = useTerminalStore((s) => s.toast);
  const setPanel = useTerminalStore((s) => s.setPanel);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (loading) return <div className="w-8 h-8 rounded-full bg-ink-3 animate-pulse" aria-hidden="true" />;

  if (configured && !user) {
    return (
      <Link href="/login" className="h-8 flex items-center gap-1.5 px-2.5 rounded bg-emerald/15 border border-emerald/30 text-[11px] font-mono text-emerald-light hover:bg-emerald/25">
        <LogIn size={12} /> <span className="hidden sm:inline">{isAr ? "تسجيل الدخول" : "Sign in"}</span>
      </Link>
    );
  }

  const initials = (user?.name ?? user?.email ?? "G").split(/[\s@.]/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  const onImport = async () => {
    const file = await pickSessionFile();
    if (!file) return;
    const count = importSession(file, "merge");
    toast(count > 0 ? (isAr ? `تم استيراد ${count} تحليلاً` : `Imported ${count} analyses`) : (isAr ? "ملف جلسة غير صالح" : "Not a valid Mahwar session file"), count > 0 ? "ok" : "err");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full overflow-hidden border border-line-strong hover:border-emerald/50 bg-ink-1 flex items-center justify-center font-mono text-[11px] text-fg-2"
        aria-label={isAr ? "الحساب" : "Account"} aria-expanded={open}
      >
        {user?.image ? <Image src={user.image} alt="" width={32} height={32} className="w-8 h-8 object-cover" unoptimized /> : user ? initials : <UserRound size={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={`absolute top-10 ${isAr ? "left-0" : "right-0"} w-64 rounded-lg border border-line bg-ink-2/95 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.5)] p-1.5 z-50`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="px-2.5 py-2 border-b border-line mb-1">
              <div className="text-[13px] text-fg truncate">{user?.name ?? (isAr ? "وضع الضيف" : "Guest mode")}</div>
              <div className="text-[11px] text-fg-3 truncate">{user?.email ?? (isAr ? "الجلسة محفوظة في هذا المتصفح فقط" : "Session lives in this browser only")}</div>
              {user && <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-light"><ShieldCheck size={11} /> Google · JWT</div>}
            </div>
            <MenuItem icon={<Download size={13} />} onClick={() => { downloadSession(); setOpen(false); }}>{isAr ? "تنزيل الجلسة (JSON)" : "Download session (JSON)"}</MenuItem>
            <MenuItem icon={<Upload size={13} />} onClick={onImport}>{isAr ? "استيراد جلسة" : "Import session"}</MenuItem>
            <MenuItem icon={<Fingerprint size={13} />} onClick={() => { setPanel("privacy"); setOpen(false); }}>{isAr ? "الخصوصية والبيانات" : "Privacy & data"}</MenuItem>
            {user ? (
              <MenuItem icon={<LogOut size={13} />} onClick={() => void signOut({ callbackUrl: "/login" })} tone="neg">{isAr ? "تسجيل الخروج" : "Sign out"}</MenuItem>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-2.5 py-2 rounded text-[12px] text-fg-2 hover:text-fg hover:bg-ink-4"><LogIn size={13} /> {isAr ? "صفحة الدخول" : "Sign-in page"}</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, children, onClick, tone }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; tone?: "neg" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-[12px] text-start hover:bg-ink-4 ${tone === "neg" ? "text-neg" : "text-fg-2 hover:text-fg"}`}>
      {icon} {children}
    </button>
  );
}
