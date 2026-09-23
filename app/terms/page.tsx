"use client";

import React from "react";
import LegalShell from "@/components/layout/LegalShell";

/** /terms — short, plain, and true. */
export default function TermsPage() {
  const sections = [
    {
      en: "What Mahwar is",
      ar: "ما هو محور",
      bodyEn: "Mahwar is a browser-based set of financial and supply-chain calculators. It computes from the numbers you enter. It does not provide live market data, and it is not connected to any exchange, broker or bank.",
      bodyAr: "محور مجموعة حاسبات مالية وحاسبات لسلاسل الإمداد تعمل في المتصفح. يحسب من الأرقام التي تدخلها. لا يوفر بيانات سوق حية وليس متصلاً بأي بورصة أو وسيط أو بنك.",
    },
    {
      en: "Not investment, legal or accounting advice",
      ar: "ليس نصيحة استثمارية أو قانونية أو محاسبية",
      bodyEn: "Every output is a model result, not a recommendation. Formulas are documented in each engine's audit trail so you can check them; you remain responsible for the inputs you choose and the decisions you make.",
      bodyAr: "كل مخرج هو نتيجة نموذج وليس توصية. الصيغ موثقة في سجل التدقيق لكل محرك كي تتحقق منها؛ وتبقى مسؤولاً عن المدخلات التي تختارها والقرارات التي تتخذها.",
    },
    {
      en: "GCC accounting conventions",
      ar: "الأعراف المحاسبية الخليجية",
      bodyEn: "Zakat, IFRS / Saudi GAAP toggles, AAOIFI screening ratios and GCC tariff assumptions are implemented as published. They are simplifications for analysis and do not replace a qualified adviser or the applicable regulation.",
      bodyAr: "الزكاة، وتبديل IFRS / المعايير السعودية، ونسب فحص أيوفي، وافتراضات التعرفة الخليجية مطبّقة كما نُشرت. وهي تبسيطات للتحليل ولا تحل محل مستشار مؤهل أو اللائحة المعمول بها.",
    },
    {
      en: "Your data",
      ar: "بياناتك",
      bodyEn: "Everything you enter stays in your own browser (see Privacy). You are responsible for backing up sessions you want to keep, by exporting them.",
      bodyAr: "كل ما تدخله يبقى في متصفحك (انظر الخصوصية). أنت مسؤول عن نسخ الجلسات التي تريد الاحتفاظ بها عبر تصديرها.",
    },
    {
      en: "Availability and warranty",
      ar: "التوفر والضمان",
      bodyEn: "The software is provided as is, without warranty of any kind. It may change or become unavailable at any time.",
      bodyAr: "يُقدَّم البرنامج كما هو دون أي ضمان من أي نوع. وقد يتغير أو يصبح غير متاح في أي وقت.",
    },
    {
      en: "Third-party content",
      ar: "محتوى الأطراف الثالثة",
      bodyEn: "Headlines in the wire link to their original publishers, who own that content. Mahwar does not endorse or verify it.",
      bodyAr: "عناوين الأخبار تربط بناشريها الأصليين الذين يملكون ذلك المحتوى. لا يؤيده محور ولا يتحقق منه.",
    },
  ];

  return (
    <LegalShell title="Terms of use" titleAr="شروط الاستخدام" updated="2026-09">
      {(isAr) => (
        <>
          <p className="text-fg text-lg">
            {isAr ? "باستخدام محور فأنت توافق على ما يلي." : "By using Mahwar you agree to the following."}
          </p>
          {sections.map((s) => (
            <section key={s.en}>
              <h2 className="font-serif text-2xl text-fg">{isAr ? s.ar : s.en}</h2>
              <p className="mt-3">{isAr ? s.bodyAr : s.bodyEn}</p>
            </section>
          ))}
        </>
      )}
    </LegalShell>
  );
}
