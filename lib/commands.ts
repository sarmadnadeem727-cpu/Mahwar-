/**
 * lib/commands.ts — the GO line grammar.
 *
 * `DCF`, `DCF GO`, `dcf`, `cash conversion` … open a module (registry lookup).
 * Everything else is a terminal verb listed in COMMANDS. One parser serves the
 * top-bar GO line and the full-screen console panel, so behaviour is identical.
 */
import { APP, TOOLS, resolveCommand, toolsBySuite, type ToolDef } from "@/lib/registry";
import type { Currency, Language, PanelType } from "@/store/useTerminalStore";

export interface CommandContext {
  language: Language;
  currency: Currency;
  savedCount: number;
  userName?: string | null;
  setPanel: (p: PanelType) => void;
  setLanguage: (l: Language) => void;
  setCurrency: (c: Currency) => void;
  clearSession: () => void;
  clearConsole: () => void;
  downloadSession: () => void;
  signOut: () => void;
  toast: (text: string, tone?: "ok" | "warn" | "err") => void;
}
export interface CommandResult { ok: boolean; out: string; tool?: ToolDef }

const CURRENCIES: Currency[] = ["SAR", "AED", "KWD", "BHD", "OMR", "QAR", "USD"];

export const COMMANDS: { verb: string; args?: string; en: string; ar: string }[] = [
  { verb: "<CODE>", args: "[GO]", en: "Open an engine — DCF, EOQ, CCC, SUK, MRP …", ar: "فتح محرك — DCF أو EOQ أو CCC…" },
  { verb: "HELP", en: "List every verb and engine code", ar: "عرض كل الأوامر والأكواد" },
  { verb: "HOME", en: "Session board", ar: "لوحة الجلسة" },
  { verb: "OPS", en: "Operations suite launcher", ar: "مشغّل مجموعة العمليات" },
  { verb: "FIN", en: "List the finance engines", ar: "قائمة محركات التمويل" },
  { verb: "CLI", en: "Full-screen console", ar: "وحدة التحكم بملء الشاشة" },
  { verb: "CUR", args: "<SAR|AED|USD…>", en: "Switch reporting currency (a bare code also works)", ar: "تغيير عملة التقرير" },
  { verb: "AR / EN", en: "Switch language", ar: "تبديل اللغة" },
  { verb: "SAVE", en: "Download the session as JSON", ar: "تنزيل الجلسة كملف JSON" },
  { verb: "RPT", en: "Build the consolidated report", ar: "إنشاء التقرير الموحد" },
  { verb: "RESET", args: "CONFIRM", en: "Clear every saved analysis", ar: "مسح كل التحليلات المحفوظة" },
  { verb: "CLEAR", en: "Clear the console transcript", ar: "مسح سجل وحدة التحكم" },
  { verb: "WHOAMI", en: "Show the signed-in account", ar: "عرض الحساب الحالي" },
  { verb: "VER", en: "Build and engine count", ar: "الإصدار وعدد المحركات" },
  { verb: "EXIT", en: "Sign out", ar: "تسجيل الخروج" },
];

export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const isAr = ctx.language === "ar";
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return { ok: false, out: "" };
  const parts = text.split(" ");
  const verb = parts[0].toUpperCase();
  const arg = parts.slice(1).join(" ").toUpperCase().replace(/ GO$/, "").trim();
  const withoutGo = text.replace(/\s+GO$/i, "");

  switch (verb) {
    case "HELP":
    case "?": {
      const verbs = COMMANDS.map((c) => `  ${(c.verb + (c.args ? " " + c.args : "")).padEnd(22)} ${isAr ? c.ar : c.en}`).join("\n");
      const codes = TOOLS.map((t) => `  ${t.code.padEnd(8)} ${isAr ? t.ar : t.en}`).join("\n");
      return { ok: true, out: `${isAr ? "الأوامر" : "verbs"}\n${verbs}\n\n${isAr ? "الأكواد" : "engine codes"}\n${codes}` };
    }
    case "HOME": case "HUB": ctx.setPanel("hub"); return { ok: true, out: isAr ? "لوحة الجلسة" : "session board" };
    case "OPS": ctx.setPanel("operations_hub"); return { ok: true, out: isAr ? "مجموعة العمليات" : "operations suite" };
    case "CLI": case "CONSOLE": ctx.setPanel("console"); return { ok: true, out: "console" };
    case "FIN": return { ok: true, out: toolsBySuite("finance").map((t) => `  ${t.code.padEnd(8)} ${isAr ? t.ar : t.en}`).join("\n") };
    case "AR": ctx.setLanguage("ar"); return { ok: true, out: "العربية" };
    case "EN": ctx.setLanguage("en"); return { ok: true, out: "english" };
    case "CUR": case "CCY": {
      const c = arg as Currency;
      if (CURRENCIES.includes(c)) { ctx.setCurrency(c); return { ok: true, out: `${isAr ? "العملة" : "currency"} → ${c}` }; }
      return { ok: false, out: `${isAr ? "عملة غير معروفة" : "unknown currency"}. ${CURRENCIES.join(" ")}` };
    }
    case "SAVE": case "EXPORT": ctx.downloadSession(); return { ok: true, out: isAr ? `تم تنزيل ${ctx.savedCount} تحليلاً` : `downloaded ${ctx.savedCount} saved analyses` };
    case "RPT": case "REPORT": ctx.setPanel("bi_report"); return { ok: true, out: isAr ? "محرك التقارير" : "report engine" };
    case "RESET": case "WIPE":
      if (arg === "CONFIRM") { ctx.clearSession(); return { ok: true, out: isAr ? "تم مسح الجلسة" : "session cleared" }; }
      return { ok: false, out: isAr ? "اكتب RESET CONFIRM لمسح كل التحليلات" : `type RESET CONFIRM to clear ${ctx.savedCount} analyses` };
    case "CLEAR": case "CLS": ctx.clearConsole(); return { ok: true, out: "" };
    case "WHOAMI": return { ok: true, out: ctx.userName ? ctx.userName : (isAr ? "ضيف — لم يتم تسجيل الدخول" : "guest — not signed in") };
    case "VER": case "VERSION": return { ok: true, out: `mahwar v${APP.version} · ${TOOLS.length} engines (${toolsBySuite("finance").length} finance / ${toolsBySuite("operations").length} operations)` };
    case "EXIT": case "LOGOUT": case "QUIT": ctx.signOut(); return { ok: true, out: isAr ? "تسجيل الخروج…" : "signing out…" };
    case "GO": return { ok: false, out: isAr ? "اكتب كوداً قبل GO" : "type a code before GO" };
  }

  if (CURRENCIES.includes(verb as Currency) && parts.length === 1) { ctx.setCurrency(verb as Currency); return { ok: true, out: `${isAr ? "العملة" : "currency"} → ${verb}` }; }

  const hit = resolveCommand(withoutGo);
  if (hit) { ctx.setPanel(hit.id); return { ok: true, out: `${hit.code} · ${isAr ? hit.ar : hit.en}`, tool: hit }; }
  return { ok: false, out: isAr ? `لا يوجد محرك أو أمر باسم "${text}". اكتب HELP.` : `no engine or verb called "${text}". Type HELP.` };
}

/** Suggestions for the GO line: verbs first, then engines. */
export function suggest(input: string, limit = 6): { code: string; label: string; kind: "verb" | "engine" }[] {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  const verbs = COMMANDS.filter((c) => !c.verb.startsWith("<") && c.verb.toLowerCase().startsWith(q)).map((c) => ({ code: c.verb.split(" ")[0], label: c.en, kind: "verb" as const }));
  const engines = TOOLS.filter((t) => t.code.toLowerCase().startsWith(q) || t.en.toLowerCase().includes(q) || t.keywords.some((k) => k.startsWith(q)))
    .sort((a, b) => Number(b.code.toLowerCase().startsWith(q)) - Number(a.code.toLowerCase().startsWith(q)))
    .map((t) => ({ code: t.code, label: t.en, kind: "engine" as const }));
  return [...verbs, ...engines].slice(0, limit);
}
