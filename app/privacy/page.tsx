"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Server, Globe, Timer, UserRoundCheck, Mail, ScrollText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DataControls from "@/components/privacy/DataControls";
import { useTerminalStore } from "@/store/useTerminalStore";
import { APP } from "@/lib/registry";

/**
 * /privacy — the privacy centre.
 *
 * Every sentence here describes something the code does. The live inventory
 * at the top is read from the visitor's own browser, so the page can never
 * promise more than the app delivers.
 */

const UPDATED = "2026-09-22";

export default function PrivacyPage() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const sections: { icon: React.ReactNode; en: string; ar: string; bodyEn: string[]; bodyAr: string[] }[] = [
    {
      icon: <Lock size={15} />, en: "1. What is stored, and where", ar: "1. ما يُخزَّن وأين",
      bodyEn: [
        "Everything you type into an engine — DCF inputs, LBO assumptions, EOQ parameters, the lot — is computed in your browser and saved in your browser. The server never receives an analysis.",
        "The saved session is sealed with AES-GCM-256 before it touches storage. The key is generated on your device, marked non-extractable, and kept in IndexedDB: this site can use it, but its bytes cannot be read, exported or synced. Encryption requires a secure context (HTTPS); on plain HTTP the inventory above will say \"plaintext\" instead of pretending.",
        "You choose persistence. Persistent mode keeps the sealed session across restarts; ephemeral mode discards it when the tab closes.",
      ],
      bodyAr: [
        "كل ما تُدخله في أي محرك — مدخلات DCF وافتراضات LBO ومعاملات EOQ وغيرها — يُحسب في متصفحك ويُحفظ في متصفحك. لا يتلقى الخادم أي تحليل.",
        "تُختم الجلسة المحفوظة بـ AES-GCM-256 قبل تخزينها. يُولَّد المفتاح على جهازك، ويُعلَّم بأنه غير قابل للاستخراج، ويُحفظ في IndexedDB: يمكن لهذا الموقع استخدامه، لكن لا يمكن قراءته أو تصديره أو مزامنته. يتطلب التشفير سياقاً آمناً (HTTPS)؛ على HTTP العادي سيُظهر الجرد أعلاه \"نص صريح\" بدلاً من الادعاء.",
        "أنت تختار الحفظ. الوضع الدائم يُبقي الجلسة المختومة بعد إعادة التشغيل؛ الوضع المؤقت يمسحها عند إغلاق التبويب.",
      ],
    },
    {
      icon: <Server size={15} />, en: "2. What the server sees", ar: "2. ما يراه الخادم",
      bodyEn: [
        "The application server holds no database and no user table. It answers three kinds of request: pages, /api/news (headlines) and /api/dcf (a stateless valuation calculation whose inputs are validated, computed and returned, not stored).",
        "Like any web server, the hosting platform (for example Vercel) keeps short-lived access logs containing IP addresses and user agents for security and abuse prevention. Those are subject to the host's own retention policy; the application does not read or enrich them.",
        "Rate limiting on /api/news and /api/dcf is done in memory per server instance using the client IP and is discarded within minutes.",
      ],
      bodyAr: [
        "لا يحتفظ خادم التطبيق بقاعدة بيانات ولا بجدول مستخدمين. يجيب على ثلاثة أنواع من الطلبات: الصفحات، و/api/news (العناوين)، و/api/dcf (حساب تقييم عديم الحالة تُتحقق مدخلاته وتُحسب وتُعاد، ولا تُخزَّن).",
        "كأي خادم ويب، تحتفظ منصة الاستضافة (مثل Vercel) بسجلات وصول قصيرة الأمد تحوي عناوين IP ووكلاء المستخدم لأغراض الأمن ومنع الإساءة. تخضع هذه لسياسة الاحتفاظ الخاصة بالمستضيف؛ ولا يقرؤها التطبيق أو يُثريها.",
        "يُنفَّذ الحد من المعدل على /api/news و/api/dcf في الذاكرة لكل نسخة خادم باستخدام عنوان IP، ويُمسح خلال دقائق.",
      ],
    },
    {
      icon: <UserRoundCheck size={15} />, en: "3. Google sign-in (optional)", ar: "3. تسجيل الدخول عبر Google (اختياري)",
      bodyEn: [
        "When the operator enables it, /dashboard is gated behind Google OAuth 2.0 / OpenID Connect with the openid, email and profile scopes only. Google's own privacy policy governs what Google records about the sign-in.",
        "This app receives your name, e-mail address and avatar URL and places them in a signed, httpOnly, SameSite=Lax cookie valid for seven days. That cookie is the only cookie this app sets, and it does not exist until you sign in. No account record is written anywhere.",
        "Signing out deletes the cookie. \"Wipe this device\" signs you out and removes every local record in the same action.",
      ],
      bodyAr: [
        "عند تفعيله من المشغّل، تُحمى /dashboard بـ Google OAuth 2.0 / OpenID Connect بنطاقات openid وemail وprofile فقط. تحكم سياسة خصوصية Google ما تسجله Google عن عملية الدخول.",
        "يتلقى التطبيق اسمك وبريدك ورابط صورتك ويضعها في ملف تعريف ارتباط موقّع httpOnly بخاصية SameSite=Lax صالح لسبعة أيام. هذا هو ملف تعريف الارتباط الوحيد الذي يضعه التطبيق، ولا يوجد قبل تسجيل الدخول. لا يُكتب سجل حساب في أي مكان.",
        "تسجيل الخروج يحذف ملف تعريف الارتباط. \"مسح هذا الجهاز\" يسجّل خروجك ويزيل كل سجل محلي في الإجراء نفسه.",
      ],
    },
    {
      icon: <Globe size={15} />, en: "4. Third parties", ar: "4. الأطراف الثالثة",
      bodyEn: [
        "Google (sign-in, and the avatar image served from googleusercontent.com once signed in). Google News RSS and, if the operator configured a key, Marketaux — both contacted by the server, not by your browser, and without your IP or identity attached.",
        "No analytics provider, no advertising network, no session-replay tool, no error-reporting beacon and no third-party script is loaded. Fonts are bundled at build time and served from this origin. The Content-Security-Policy header enforces this list in the browser; you can verify it in devtools.",
        "Global Privacy Control and Do-Not-Track are honoured in the simplest possible way: there is no sale or sharing of personal data to opt out of.",
      ],
      bodyAr: [
        "Google (تسجيل الدخول، وصورة الحساب من googleusercontent.com بعد الدخول). Google News RSS، وMarketaux إن ضبط المشغّل مفتاحاً — يتصل بهما الخادم لا متصفحك، ودون إرفاق عنوان IP أو هويتك.",
        "لا مزوّد تحليلات ولا شبكة إعلانات ولا أداة إعادة تشغيل الجلسة ولا إشارات تقارير أخطاء ولا أي سكربت طرف ثالث. الخطوط مضمّنة وقت البناء وتُقدَّم من هذا النطاق. ترويسة Content-Security-Policy تفرض هذه القائمة في المتصفح ويمكنك التحقق منها في أدوات المطور.",
        "تُحترم إشارتا Global Privacy Control وDo-Not-Track بأبسط طريقة ممكنة: لا يوجد بيع أو مشاركة لبيانات شخصية للانسحاب منها.",
      ],
    },
    {
      icon: <Timer size={15} />, en: "5. Retention", ar: "5. الاحتفاظ",
      bodyEn: [
        "Local session: until you wipe it (persistent) or close the tab (ephemeral). Sign-in cookie: seven days or until sign-out. Rate-limit counters: minutes. Host access logs: per the host's policy.",
      ],
      bodyAr: [
        "الجلسة المحلية: حتى تمسحها (دائم) أو تغلق التبويب (مؤقت). ملف تعريف ارتباط الدخول: سبعة أيام أو حتى الخروج. عدادات الحد من المعدل: دقائق. سجلات وصول المستضيف: حسب سياسته.",
      ],
    },
    {
      icon: <ScrollText size={15} />, en: "6. Your rights and how to exercise them", ar: "6. حقوقك وكيفية ممارستها",
      bodyEn: [
        "Because the data lives on your device, you exercise most rights yourself, instantly: Export gives you a complete JSON copy; Wipe erases it. For the sign-in cookie, sign out. If you believe the operator holds anything else about you, write to the address below and it will be answered within 30 days.",
        "This page is written to be accurate under the Saudi Personal Data Protection Law (PDPL), the UAE PDPL and the GDPR for visitors from the EEA. It does not claim certification against any framework — it describes what the software does.",
      ],
      bodyAr: [
        "لأن البيانات على جهازك، تمارس معظم حقوقك بنفسك وفوراً: التصدير يمنحك نسخة JSON كاملة؛ والمسح يحذفها. لملف تعريف ارتباط الدخول، سجّل الخروج. إذا كنت تعتقد أن المشغّل يحتفظ بأي شيء آخر عنك، راسل العنوان أدناه وسيُرد عليك خلال 30 يوماً.",
        "كُتبت هذه الصفحة لتكون دقيقة بموجب نظام حماية البيانات الشخصية السعودي (PDPL) ونظيره الإماراتي واللائحة الأوروبية GDPR لزوار المنطقة الاقتصادية الأوروبية. لا تدّعي اعتماداً وفق أي إطار — بل تصف ما يفعله البرنامج.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-ink-1 text-fg flex flex-col font-sans" dir={isAr ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-32 pb-24">
        <Link href="/" className="btn-ghost text-[11px] mb-8">
          <ArrowLeft size={13} className="rtl:rotate-180" /> {isAr ? "العودة للرئيسية" : "Back to home"}
        </Link>

        <header className="border-b border-line pb-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "مركز الخصوصية" : "Privacy centre"}</p>
          <h1 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "بياناتك تبقى معك. هذه الصفحة تُثبت ذلك." : "Your data stays with you. This page proves it."}
          </h1>
          <p className="mt-5 max-w-2xl text-fg-2 leading-relaxed">
            {isAr
              ? "الجرد أدناه ليس وعداً، بل قراءة مباشرة لما يحتفظ به متصفحك الآن. ما يلي يصف بالضبط ما يفعله البرنامج ولا شيء أكثر."
              : "The inventory below is not a promise; it is a live read of what your browser holds at this moment. The text after it describes exactly what the software does and nothing more."}
          </p>
          <p className="mt-3 font-mono text-[11px] text-fg-3">{isAr ? "آخر تحديث" : "Last updated"} {UPDATED} · v{APP.version}</p>
        </header>

        <section className="mt-10">
          <DataControls isAr={isAr} />
        </section>

        <div className="mt-14 space-y-10">
          {sections.map((s) => (
            <section key={s.en} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 md:gap-10">
              <h2 className="flex items-start gap-2.5 font-mono text-[12px] tracking-[0.12em] uppercase text-emerald-light leading-snug">
                <span className="mt-0.5 shrink-0">{s.icon}</span>{isAr ? s.ar : s.en}
              </h2>
              <div className="space-y-3 text-[14px] text-fg-2 leading-relaxed">
                {(isAr ? s.bodyAr : s.bodyEn).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}

          <section className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 md:gap-10">
            <h2 className="flex items-start gap-2.5 font-mono text-[12px] tracking-[0.12em] uppercase text-emerald-light"><Mail size={15} className="mt-0.5 shrink-0" />{isAr ? "7. جهة الاتصال" : "7. Contact"}</h2>
            <div className="text-[14px] text-fg-2 leading-relaxed">
              <p>{isAr ? "مشغّل هذه المنصة:" : "The operator of this deployment:"} <span className="text-fg">{APP.author}</span>.</p>
              {APP.contact ? (
                <p className="mt-2"><a href={`mailto:${APP.contact}`} className="text-emerald-light hover:underline">{APP.contact}</a></p>
              ) : (
                <p className="mt-2 font-mono text-[12px] text-warn">{isAr ? "لم يُضبط عنوان الاتصال بعد — عيّن NEXT_PUBLIC_PRIVACY_CONTACT قبل النشر." : "No contact address configured yet — set NEXT_PUBLIC_PRIVACY_CONTACT before going live."}</p>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
