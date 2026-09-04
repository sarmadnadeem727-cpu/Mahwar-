"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ToolShowcase from "@/components/sections/ToolShowcase";
import GCCMapSection from "@/components/sections/GCCMapSection";
import CapabilitiesBento from "@/components/sections/CapabilitiesBento";
import NewsPreviewWidget from "@/components/sections/NewsPreviewWidget";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-heading flex flex-col font-sans selection:bg-emerald selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <GCCMapSection />
        <ToolShowcase />
        <CapabilitiesBento />
        <NewsPreviewWidget />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
