"use client";

import React from "react";
import LegalShell from "@/components/layout/LegalShell";
import { APP } from "@/lib/registry";

/**
 * /privacy — describes exactly what the software does, nothing more.
 * No accounts, no server-side storage, no analytics, no cookies of our own.
 */
export default function PrivacyPage() {
  const sections = [
    {
      en: "No account, no sign-in",
      ar: "بلا حساب وبلا تسجيل دخول",
      bodyEn: "Mahwar has no user accounts. You are never asked for a name, an e-mail address or a password, and there is no identity provider behind the terminal.",
      bodyAr: "لا توجد حسابات مستخدمين في محور. لن يُطلب منك اسم أو بريد إلكتروني أو كلمة مرور، ولا يوجد مزود هوية خلف المحطة.",
    },
    {
      en: "Your analyses stay in your browser",
      ar: "تحليلاتك تبقى في متصفحك",
      bodyEn: "Every input you type and every result an engine computes is stored in this browser's local storage on this device, and nowhere else. There is no server sync of any kind. Clearing your browser data, or using the Session menu's wipe action, deletes it permanently. Exporting a session produces a JSON file on your machine that only you hold.",
      bodyAr: "كل ما تدخله وكل نتيجة يحسبها محرك تُحفظ في التخزين المحلي لهذا المتصفح على هذا الجهاز فقط. لا توجد مزامنة مع أي خادم. مسح بيانات المتصفح أو استخدام زر المسح في قائمة الجلسة يحذفها نهائياً. تصدير الجلسة ينتج ملف JSON على جهازك لا يملكه غيرك.",
    },
    {
      en: "The engines run locally",
      ar: "المحركات تعمل محلياً",
      bodyEn: "All financial and supply-chain calculations run in your browser. Your numbers are not sent to a server to be computed, logged or stored.",
      bodyAr: "كل الحسابات المالية وحسابات سلاسل الإمداد تعمل في متصفحك. أرقامك لا تُرسل إلى خادم لحسابها أو تسجيلها أو تخزينها.",
    },
    {
      en: "The only network request: the market wire",
      ar: "طلب الشبكة الوحيد: الأخبار",
      bodyEn: "The wire panel asks our own /api/news endpoint for public headlines. That endpoint fetches from a news provider without forwarding cookies, a referrer or anything that identifies you, and it is rate-limited per client. If no provider key is configured it falls back to a public RSS feed. Nothing about your session travels with that request.",
      bodyAr: "لوحة الأخبار تطلب العناوين العامة من نقطة /api/news الخاصة بنا. هذه النقطة تجلب من مزود أخبار دون تمرير ملفات تعريف الارتباط أو المُحيل أو أي شيء يعرّفك، وهي محدودة المعدل لكل عميل. لا شيء من جلستك يُرسل مع هذا الطلب.",
    },
    {
      en: "No analytics, no tracking, no advertising",
      ar: "لا تحليلات ولا تتبع ولا إعلانات",
      bodyEn: "Mahwar does not load third-party analytics, tracking pixels or advertising scripts, and a strict Content-Security-Policy prevents any from being injected.",
      bodyAr: "لا يحمّل محور تحليلات طرف ثالث أو بكسلات تتبع أو نصوص إعلانية، وسياسة أمن محتوى صارمة تمنع حقن أي منها.",
    },
    {
      en: "Hosting",
      ar: "الاستضافة",
      bodyEn: "The site is served from Vercel, which keeps ordinary web-server access logs (IP address, user agent, requested path) for its own operation. We do not add anything to those logs and do not use them to identify visitors.",
      bodyAr: "يُقدَّم الموقع عبر Vercel التي تحتفظ بسجلات وصول خادم الويب المعتادة (عنوان IP، وكيل المستخدم، المسار المطلوب) لتشغيلها. لا نضيف شيئاً إلى تلك السجلات ولا نستخدمها لتحديد الزوار.",
    },
  ];

  return (
    <LegalShell title="Privacy" titleAr="الخصوصية" updated="2026-09">
      {(isAr) => (
        <>
          <p className="text-fg text-lg">
            {isAr
              ? "محور أداة محلية أولاً: لا حسابات، ولا تخزين على الخادم، ولا تتبع. هذه الصفحة تصف ما يفعله البرنامج فعلاً."
              : "Mahwar is a local-first tool: no accounts, no server-side storage, no tracking. This page describes what the software actually does."}
          </p>
          {sections.map((s) => (
            <section key={s.en}>
              <h2 className="font-serif text-2xl text-fg">{isAr ? s.ar : s.en}</h2>
              <p className="mt-3">{isAr ? s.bodyAr : s.bodyEn}</p>
            </section>
          ))}
          <section>
            <h2 className="font-serif text-2xl text-fg">{isAr ? "أسئلة" : "Questions"}</h2>
            <p className="mt-3">
              {APP.contact
                ? (isAr ? `تواصل عبر ${APP.contact}.` : `Write to ${APP.contact}.`)
                : (isAr ? "افتح مسألة على مستودع GitHub الخاص بالمشروع." : "Open an issue on the project's GitHub repository.")}{" "}
              <a href={APP.repo} target="_blank" rel="noreferrer" className="text-emerald-light hover:underline">{APP.repo.replace("https://", "")}</a>
            </p>
          </section>
        </>
      )}
    </LegalShell>
  );
}
