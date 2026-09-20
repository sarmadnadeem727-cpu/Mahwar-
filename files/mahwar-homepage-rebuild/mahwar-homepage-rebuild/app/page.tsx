import { ComparisonStrip } from "../components/homepage/ComparisonStrip";
import { Footer } from "../components/homepage/Footer";
import { Hero } from "../components/homepage/Hero";
import { NewsPreview } from "../components/homepage/NewsPreview";
import { TickerStrip } from "../components/homepage/TickerStrip";
import { ToolShowcase } from "../components/homepage/ToolShowcase";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";

/**
 * Mahwar homepage. Server component; every child that animates is a client
 * component. Sections are a top-to-bottom sequence:
 *   01 hero + workbench → ticker → 02 financial suite → 03 operations suite
 *   → 04 coverage comparison + wire preview → footer
 */
export default function HomePage() {
  return (
    <main className="bg-surface-0 font-sans text-ink-900 antialiased">
      <Hero />
      <TickerStrip />
      <ToolShowcase />

      <section aria-labelledby="coverage-title" className="py-20 lg:py-24">
        <Container>
          <SectionHeader
            index="04"
            title={<span id="coverage-title">Built for the Gulf, not localised for it.</span>}
            lede="Regulatory, accounting and language requirements that a global terminal treats as edge cases are the default here."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <ComparisonStrip className="lg:col-span-7" />
            <NewsPreview className="lg:col-span-5" />
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
