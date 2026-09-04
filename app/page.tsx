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
      {/* GLOBAL TOP NAVIGATION */}
      <Navbar />

      {/* TICKER STRIP AT TOP */}
      <div className="pt-16">
        <LiveTickerStrip />
      </div>

      {/* MAIN HOMEPAGE SECTIONS */}
      <main className="flex-1">
        {/* 1. HERO WITH LIVE WORKBENCH PREVIEW & BOOT SEQUENCE */}
        <HeroSection />

        {/* 2. 10-ENGINE TOOL SHOWCASE WITH REAL VISUAL PREVIEWS */}
        <ToolShowcase />

        {/* 3. FLAT 2D REGIONAL GCC MAP COVERAGE */}
        <GCCMapSection />

        {/* 4. MAHWAR VS GENERIC TERMINAL COMPARISON MATRIX */}
        <ComparisonSection />

        {/* 5. LIVE GCC NEWS PREVIEW WIDGET */}
        <NewsPreviewWidget />

        {/* 6. INSTANT ACCESS TERMINAL CTA */}
        <CTASection />
      </main>

      {/* MINIMAL FOOTER */}
      <Footer />
    </div>
  );
}
