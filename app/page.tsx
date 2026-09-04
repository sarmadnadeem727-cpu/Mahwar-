"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import LiveTickerStrip from "@/components/sections/LiveTickerStrip";
import HeroSection from "@/components/sections/HeroSection";
import ToolShowcase from "@/components/sections/ToolShowcase";
import GCCMapSection from "@/components/sections/GCCMapSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import NewsPreviewWidget from "@/components/sections/NewsPreviewWidget";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-heading flex flex-col font-sans selection:bg-emerald selection:text-white">
      <Navbar />
      <div className="pt-16">
        <LiveTickerStrip />
      </div>
      <main className="flex-1">
        <HeroSection />
        <ToolShowcase />
        <GCCMapSection />
        <ComparisonSection />
        <NewsPreviewWidget />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
