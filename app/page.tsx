"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import SolutionSection from "@/components/sections/SolutionSection";
import TechnologySection from "@/components/sections/TechnologySection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text flex flex-col selection:bg-[var(--emerald)] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TechnologySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
