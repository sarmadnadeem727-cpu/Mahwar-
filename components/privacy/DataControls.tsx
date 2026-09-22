"use client";

import React, { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Download, Trash2, Lock, Unlock, HardDrive, Timer, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useUser } from "@/lib/auth/useUser";
import { downloadSession } from "@/lib/session";
import { readInventory, purgeLocal, gpcSignal, usePrivacyStore, type InventoryRow } from "@/lib/privacy/inventory";
import { vaultStatus, type VaultMode } from "@/lib/privacy/vault";

/**
 * DataControls — the working half of the privacy layer. Rendered inside the
 * dashboard (PRIV panel) and on /privacy. Everything on screen is read from
 * the browser at render time; nothing is a static promise.
 */
export default function DataControls({ isAr, compact = false }: { isAr: boolean; compact?: boolean }) {
  const { user, configured } = useUser();
  const toast = useTerminalStore((s) => s.toast);
  const savedCount = useTerminalStore((s) => Object.keys(s.sessionAnalyses).length);
  const mode = usePrivacyStore((s) => s.mode);
  const setMode = usePrivacyStore((s) => s.setMode);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [status, setStatus] = useState(vaultStatus());
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setRows(readInventory({ signedIn: !!user }));
    setStatus(vaultStatus());
  }, [user]);

  // The browser's storage is an external system: poll it (first tick immediately, then every 2.5 s).
  useEffect(() => {
    const first = window.setTimeout(refresh, 0);
    const t = window.setInterval(refresh, 2500);
    return () => { window.clearTimeout(first); window.clearInterval(t); };
  }, [refresh, savedCount, mode]);

  const gpc = gpcSignal();
  const totalBytes = rows.reduce((a, r) => a + r.bytes, 0);
  const present = rows.filter((r) => r.present);

  const onMode = async (m: VaultMode) => {
    if (m === mode) return;
    await setMode(m);
    toast(m === "ephemeral" ? (isAr ? "الوضع المؤقت: تُنسى الجلسة عند إغلاق التبويب" : "Ephemeral mode: the session is forgotten when the tab closes") : (isAr ? "الوضع الدائم: تبقى الجلسة بعد إعادة التشغيل" : "Persistent mode: the session survives a restart"));
    refresh();
  };

  const onPurge = async () => {
    setBusy(true);
    const n = await purgeLocal();
    useTerminalStore.persist.clearStorage();
    if (configured && user) {
      await signOut({ callbackUrl: "/?wiped=1" });
      return;
    }
    toast(isAr ? `تم مسح ${n} سجلاً من هذا الجهاز` : `Removed ${n} records from this device`, "warn");
    window.location.href = "/?wiped=1";
  };

  const fmtBytes = (b: number) => (b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`);

  return (
    <div className="space-y-5">
      {/* Status strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={status.encrypted ? <Lock size={14} className="text-emerald-light" /> : <Unlock size={14} className="text-warn" />}
          label={isAr ? "الحفظ المحلي" : "At rest"}
          value={status.encrypted ? "AES-GCM-256" : (isAr ? "نص صريح" : "plaintext")}
          note={status.encrypted
            ? (isAr ? "مفتاح جهاز غير قابل للاستخراج" : "non-extractable device key")
            : status.reason === "no-webcrypto" ? (isAr ? "يتطلب HTTPS لتفعيل WebCrypto" : "needs HTTPS for WebCrypto") : (isAr ? "التشفير غير متاح هنا" : "encryption unavailable here")}
        />
        <Stat
          icon={<HardDrive size={14} className="text-fg-2" />}
          label={isAr ? "الحجم على الجهاز" : "On this device"}
          value={fmtBytes(totalBytes)}
          note={`${present.length} ${isAr ? "سجلات" : "records"} · ${savedCount} ${isAr ? "تحليلات" : "analyses"}`}
        />
        <Stat
          icon={<ShieldCheck size={14} className="text-emerald-light" />}
          label={isAr ? "الخادم" : "Server"}
          value={isAr ? "لا يخزّن شيئاً" : "stores nothing"}
          note={user ? (isAr ? "جلسة موقّعة في ملف تعريف ارتباط httpOnly" : "signed session in an httpOnly cookie") : (isAr ? "لا ملفات تعريف ارتباط" : "no cookies set")}
        />
        <Stat
          icon={gpc ? <ShieldCheck size={14} className="text-emerald-light" /> : <ShieldAlert size={14} className="text-fg-3" />}
          label="Global Privacy Control"
          value={gpc === null ? (isAr ? "غير مرسَل" : "not sent") : gpc ? (isAr ? "مفعّل" : "on") : (isAr ? "معطّل" : "off")}
          note={isAr ? "لا بيع ولا مشاركة، مع أو بدون الإشارة" : "nothing is sold or shared either way"}
        />
      </div>

      {/* Persistence mode */}
      <div className="panel-data p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-3">{isAr ? "وضع الحفظ" : "Persistence"}</div>
            <p className="mt-1 text-[12.5px] text-fg-2">
              {mode === "ephemeral"
                ? (isAr ? "مؤقت — تُمسح الجلسة المختومة عند إغلاق التبويب." : "Ephemeral — the sealed session is discarded when this tab closes.")
                : (isAr ? "دائم — تبقى الجلسة المختومة في هذا المتصفح حتى تمسحها." : "Persistent — the sealed session stays in this browser until you wipe it.")}
            </p>
          </div>
          <div className="flex rounded border border-line-strong overflow-hidden font-mono text-[10.5px] uppercase tracking-wider">
            <button onClick={() => onMode("persistent")} className={`px-3 py-2 flex items-center gap-1.5 ${mode === "persistent" ? "bg-emerald text-ink-0" : "text-fg-2 hover:bg-ink-4"}`}><HardDrive size={12} /> {isAr ? "دائم" : "persistent"}</button>
            <button onClick={() => onMode("ephemeral")} className={`px-3 py-2 flex items-center gap-1.5 border-s border-line-strong ${mode === "ephemeral" ? "bg-emerald text-ink-0" : "text-fg-2 hover:bg-ink-4"}`}><Timer size={12} /> {isAr ? "مؤقت" : "ephemeral"}</button>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="panel-data overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
          <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-3">{isAr ? "جرد البيانات — مقروء من المتصفح الآن" : "Data inventory — read from the browser right now"}</div>
          <button onClick={refresh} className="text-fg-3 hover:text-fg" aria-label="refresh"><RefreshCw size={12} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>{isAr ? "المفتاح" : "key"}</th>
                <th>{isAr ? "المكان" : "where"}</th>
                <th>{isAr ? "الحالة" : "state"}</th>
                <th className="text-end">{isAr ? "الحجم" : "size"}</th>
                {!compact && <th>{isAr ? "ما هو" : "what it is"}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.where}-${r.key}`} className={r.present ? "" : "opacity-45"}>
                  <td className="whitespace-nowrap text-[11px]">{r.key}</td>
                  <td className="whitespace-nowrap text-[11px] text-fg-2">{r.where}</td>
                  <td className="whitespace-nowrap text-[11px]">
                    {!r.present ? <span className="text-fg-3">{isAr ? "غير موجود" : "absent"}</span>
                      : r.encrypted === true ? <span className="text-emerald-light">{isAr ? "مختوم" : "sealed"}</span>
                      : r.encrypted === false ? <span className={r.sensitive ? "text-warn" : "text-fg-2"}>{isAr ? "نص صريح" : "plaintext"}</span>
                      : <span className="text-fg-2">{isAr ? "موجود" : "present"}</span>}
                  </td>
                  <td className="text-end text-[11px] num">{r.bytes ? fmtBytes(r.bytes) : "—"}</td>
                  {!compact && <td className="text-[11.5px] text-fg-2 font-sans min-w-[260px]">{isAr ? r.ar : r.en}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => { downloadSession(); toast(isAr ? "تم تنزيل الجلسة" : "Session downloaded"); }} className="btn-secondary text-[11px]">
          <Download size={13} /> {isAr ? "تصدير كل شيء (JSON)" : "Export everything (JSON)"}
        </button>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="btn-secondary text-[11px] border-neg/40 text-neg hover:border-neg hover:bg-neg/10">
            <Trash2 size={13} /> {isAr ? "مسح هذا الجهاز" : "Wipe this device"}
          </button>
        ) : (
          <span className="flex flex-wrap items-center gap-2 text-[11.5px] text-fg-2">
            {isAr ? `سيُمسح ${savedCount} تحليلاً ومفتاح الجهاز${user ? " وستُسجَّل خروجك" : ""}. لا رجعة.` : `Removes ${savedCount} analyses and the device key${user ? " and signs you out" : ""}. This cannot be undone.`}
            <button onClick={onPurge} disabled={busy} className="btn-primary bg-neg hover:bg-neg text-[10.5px] px-3 py-1.5">{busy ? "…" : (isAr ? "تأكيد المسح" : "Confirm wipe")}</button>
            <button onClick={() => setConfirm(false)} className="btn-ghost text-[10.5px]">{isAr ? "إلغاء" : "Cancel"}</button>
          </span>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="panel-data p-3.5">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-3">{icon}{label}</div>
      <div className="mt-2 font-mono text-[15px] text-fg">{value}</div>
      <div className="mt-0.5 text-[11px] text-fg-3 leading-snug">{note}</div>
    </div>
  );
}
