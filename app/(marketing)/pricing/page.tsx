"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Globe } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { useUserContext } from "@/components/providers/UserProvider";
import { PLAN_LIMITS } from "@/lib/billing/plan-limits";

export default function PricingPage() {
  const { language, setLanguage } = useTerminalStore();
  const { user, subscription } = useUserContext();
  const isAr = language === 'ar';

  const plans = [
    {
      id: "free",
      name: t("free_plan_name", language),
      price: "0",
      description: isAr
        ? "أدوات أساسية لمحللي التجزئة والمستثمرين الجدد"
        : "Basic tools for retail analysts and starting investors",
      features: PLAN_LIMITS.free.features,
      cta: isAr ? "ابدأ مجاناً" : "Get Started Free",
      href: "/dashboard",
      priceId: undefined,
    },
    {
      id: "pro",
      name: t("pro_plan_name", language),
      price: "49",
      description: isAr
        ? "أبحاث متقدمة بالذكاء الاصطناعي وتدفقات بيانات السوق المباشرة"
        : "Advanced AI research reports and streaming real-time market data",
      features: PLAN_LIMITS.pro.features,
      cta: isAr ? "ترقية الاشتراك" : "Upgrade to Pro",
      href: `/api/billing/checkout?priceId=${process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO}`,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
      popular: true,
    },
    {
      id: "institutional",
      name: t("inst_plan_name", language),
      price: "199",
      description: isAr
        ? "كامل القدرات للشركات الاستثمارية والمكاتب العائلية الكبرى"
        : "Full capability for investment firms and family offices",
      features: PLAN_LIMITS.institutional.features,
      cta: isAr ? "اتصل بالمبيعات" : "Go Institutional",
      href: `/api/billing/checkout?priceId=${process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INSTITUTIONAL}`,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INSTITUTIONAL,
    },
  ];

  return (
    <div className={`min-h-screen bg-[#0A0B0D] text-slate-100 font-mono text-xs flex flex-col selection:bg-[var(--emerald)] selection:text-white ${isAr ? "font-cairo" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      {/* HEADER CONTROLS */}
      <header className="h-[64px] border-b border-white/5 flex items-center justify-between px-8 bg-[#0F1113]/50 backdrop-blur-xl">
        <Link href="/" className="font-garamond text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-2 cursor-pointer">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--emerald)]"></span>
          <span>{t("app_name", language)}</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#14171A] border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-[var(--gold)]" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--emerald)] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            <span>{t("launch_terminal", language)}</span>
          </Link>
        </div>
      </header>

      {/* PRICING SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-garamond text-4xl md:text-5xl font-extrabold text-white tracking-wide">
            {t("pricing_title", language)}
          </h1>
          <p className="text-slate-400 font-sans text-sm leading-relaxed">
            {t("pricing_subtitle", language)}
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const hasHigherTier =
              (subscription?.plan === "pro" && plan.id === "free") ||
              (subscription?.plan === "institutional" && (plan.id === "free" || plan.id === "pro"));

            return (
              <div
                key={plan.id}
                className={`glass-panel p-8 rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden ${
                  plan.popular
                    ? "border-[var(--emerald)] bg-[var(--emerald)]/5 shadow-2xl shadow-[var(--emerald)]/5"
                    : "border-white/10 hover:border-white/20 bg-[#0F1113]/30"
                }`}
              >
                {/* Background glows */}
                {plan.popular && (
                  <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[var(--emerald)]/10 blur-3xl"></div>
                )}
                {plan.id === "institutional" && (
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[var(--gold)]/10 blur-3xl"></div>
                )}

                {plan.popular && (
                  <span className="absolute top-4 right-4 bg-[var(--emerald)] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <h3 className="font-garamond text-2xl font-bold text-white uppercase tracking-wider">
                      {plan.name}
                    </h3>
                    <p className="text-slate-400 font-sans text-xs min-h-[32px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-4xl font-extrabold font-mono">${plan.price}</span>
                    <span className="text-slate-400 font-sans text-xs">/month</span>
                  </div>

                  <hr className="border-white/5" />

                  {/* Features list */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                        <Check size={14} className="text-[var(--emerald)] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 relative z-10">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default"
                    >
                      <span>{t("current_plan", language)}</span>
                    </button>
                  ) : hasHigherTier ? (
                    <a
                      href="/api/billing/portal"
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    >
                      <span>{t("billing_portal_btn", language)}</span>
                    </a>
                  ) : (
                    <Link
                      href={user ? plan.href : `/login?redirect=/pricing`}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#0E7C69] to-[#12A189] hover:brightness-110 text-white shadow-lg shadow-[#0E7C69]/20"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200"
                      }`}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
