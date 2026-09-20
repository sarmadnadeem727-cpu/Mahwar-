"use client";

import { motion } from "framer-motion";
import { cascadeGroup, inViewOnce, useMotionOff } from "../../lib/motion";
import { financialTools, operationsTools } from "../../lib/tools";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { SectionHeader } from "../ui/SectionHeader";
import { ToolCard } from "./ToolCard";

/**
 * Two suites, two treatments:
 *  Financial — white section; three flagship engines as featured cards, the
 *              remaining seven in a gapped four-column grid.
 *  Operations — off-white band; eleven tools packed into one hairline-divided
 *               panel (gap-px over a `line` background) with a left rail index.
 */
export function ToolShowcase() {
  const off = useMotionOff();
  const featured = financialTools.filter((t) => t.featured);
  const rest = financialTools.filter((t) => !t.featured);

  // Reduced motion: render everything in its finished state, no variants.
  const reveal = off
    ? {}
    : ({ variants: cascadeGroup, initial: "hidden", whileInView: "visible", viewport: inViewOnce } as const);

  return (
    <div id="engines">
      {/* ---------------- Financial Engine Suite ---------------- */}
      <section aria-labelledby="financial-suite" className="py-20 lg:py-24">
        <Container>
          <SectionHeader
            index="02"
            title={<span id="financial-suite">Financial Engine Suite</span>}
            lede="Ten engines that share one set of assumptions. Change WACC in the DCF and the LBO, the 3-statement model and the report all move with it."
            aside={
              <>
                10 engines
                <br />
                Saudi GAAP · IFRS · AAOIFI
              </>
            }
          />

          <motion.div {...reveal} className="mt-10 grid gap-4 lg:grid-cols-3">
            {featured.map((t) => (
              <ToolCard key={t.id} tool={t} treatment="featured" />
            ))}
          </motion.div>

          <motion.div
            {...reveal}
            className="mt-4 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
          >
            {rest.map((t) => (
              <ToolCard key={t.id} tool={t} treatment="compact" />
            ))}
            {/* Eighth cell closes the hairline grid and points at the models not shown here */}
            <div className="hidden flex-col justify-end bg-surface-1 p-5 font-mono text-mono-xs text-ink-500 sm:flex">
              <span className="text-ink-300">Also in the terminal</span>
              <span className="mt-1 text-ink-700">Dividend Discount Model</span>
              <span className="text-ink-700">NPV &amp; IRR Calculator</span>
              <span className="text-ink-700">Merger Accretion / Dilution</span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ---------------- Supply Chain & Operations Suite ---------------- */}
      <section aria-labelledby="operations-suite" className="border-y border-line bg-surface-1 py-20 lg:py-24">
        <Container>
          <SectionHeader
            index="03"
            title={<span id="operations-suite">Supply Chain &amp; Operations Suite</span>}
            lede="Working capital, inventory, planning, sourcing and network tools sized for Gulf import routes, priced in the same currency as the models above."
            aside={
              <>
                11 tools
                <br />
                SAR · AED · KWD · BHD · OMR · QAR
              </>
            }
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            {/* Rail: the five operational groups the eleven tools belong to */}
            <aside className="lg:col-span-2">
              <ol className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-mono-xs text-ink-500 lg:flex-col lg:gap-y-3">
                {[
                  ["Working capital", "2"],
                  ["Inventory & ordering", "3"],
                  ["Planning & forecasting", "2"],
                  ["Cost & sourcing", "3"],
                  ["Network logistics", "1"],
                ].map(([group, count]) => (
                  <li key={group} className="flex items-baseline gap-2">
                    <span className="text-ink-900">{group}</span>
                    <span className="text-ink-300">{count}</span>
                  </li>
                ))}
              </ol>
            </aside>

            <motion.div
              {...reveal}
              className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:col-span-10 lg:grid-cols-3"
            >
              {operationsTools.map((t) => (
                <ToolCard key={t.id} tool={t} treatment="compact" />
              ))}
              {/* Twelfth cell closes the 3×4 panel and links to the suite hub */}
              <div className="hidden flex-col justify-end bg-surface-1 p-5 sm:flex">
                <span className="font-mono text-mono-xs text-ink-300">All eleven tools, one currency</span>
                <Button href="#" variant="tertiary" className="mt-2">
                  Open Operations Suite Hub
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
}
