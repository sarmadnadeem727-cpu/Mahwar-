"use client";

import { motion } from "framer-motion";
import { rise, risePanel, stage, useMotionOff } from "../../lib/motion";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { StatusDot } from "../ui/Tag";
import { WorkbenchPreview } from "./WorkbenchPreview";

export function Hero() {
  const off = useMotionOff();
  const initial = off ? false : "hidden";

  return (
    <section aria-labelledby="hero-title" className="relative">
      <Container className="grid gap-12 pb-16 pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-20">
        {/* ---------------- Copy column ---------------- */}
        <div className="lg:col-span-6 lg:pe-8">
          <motion.p
            variants={rise}
            custom={stage.heroEyebrow}
            initial={initial}
            animate="visible"
            className="flex items-center gap-3 font-mono text-mono-sm text-ink-500"
          >
            <StatusDot pulse />
            <span lang="ar" dir="rtl" className="text-ink-900">
              محور
            </span>
            <span aria-hidden="true">/</span>
            <span>Sovereign intelligence terminal</span>
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={rise}
            custom={stage.heroHeadline}
            initial={initial}
            animate="visible"
            className="mt-6 text-balance font-serif text-display-lg text-ink-900 lg:text-display-xl"
          >
            Quantitative financial engine for GCC capital markets.
          </motion.h1>

          <motion.p
            variants={rise}
            custom={stage.heroSubhead}
            initial={initial}
            animate="visible"
            className="mt-6 max-w-prose text-body text-ink-700"
          >
            Five-year DCF and LBO models, IFRS and Saudi GAAP three-statement forecasts, AAOIFI Shariah screening and live data
            from seven Gulf exchanges — with a full supply chain and operations toolkit in the same workbench. Arabic-native,
            right to left.
          </motion.p>

          <motion.div
            variants={rise}
            custom={stage.heroActions}
            initial={initial}
            animate="visible"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button href="#" variant="primary" size="lg">
              Enter Terminal
            </Button>
            <Button href="#" variant="secondary" size="lg">
              Explore GCC Wire
            </Button>
          </motion.div>

          <motion.dl
            variants={rise}
            custom={stage.heroMeta}
            initial={initial}
            animate="visible"
            className="mt-10 grid max-w-prose grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5 font-mono text-mono-xs text-ink-500 sm:grid-cols-4"
          >
            <Meta k="Engines" v="21" />
            <Meta k="Exchanges" v="7" />
            <Meta k="Standards" v="IFRS · GAAP · AAOIFI" />
            <Meta k="Languages" v="AR · EN" />
          </motion.dl>
        </div>

        {/* ---------------- Visual column ---------------- */}
        <div className="relative lg:col-span-6">
          <motion.div
            variants={risePanel}
            custom={stage.heroVisual}
            initial={initial}
            animate="visible"
            className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-hero-visual"
          >
            {/*
             * SPLINE_HERO_VISUAL_PLACEHOLDER
             * ------------------------------------------------------------
             * The 3D centrepiece is built separately in Spline. Mount it in
             * this container (`#spline-hero-visual`). It should fill the box
             * (absolute inset-0) and stay non-interactive on touch so it does
             * not trap scroll. Remove the axis-grid <svg> and the mono label
             * below once the scene is in place. See INTEGRATION.md §4.
             */}
            <div
              id="spline-hero-visual"
              data-slot="SPLINE_HERO_VISUAL_PLACEHOLDER"
              className="absolute inset-0 overflow-hidden rounded-panel border border-line bg-surface-1"
            >
              <AxisGrid />
              <span className="absolute bottom-3 start-3 font-mono text-mono-xs text-ink-300">3D visual mounts here</span>
            </div>
          </motion.div>

          {/* Workbench preview overlaps the visual's bottom-start corner on desktop */}
          <WorkbenchPreview className="relative mt-6 w-full lg:absolute lg:-bottom-10 lg:-start-12 lg:mt-0 lg:w-workbench" />
        </div>
      </Container>
    </section>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink-300">{k}</dt>
      <dd className="mt-0.5 text-ink-900">{v}</dd>
    </div>
  );
}

/** Hairline instrument grid — the "axis" — shown only until the Spline scene is mounted. */
function AxisGrid() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-line" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mw-axis-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mw-axis-grid)" />
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-line-strong" />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-line-strong" />
    </svg>
  );
}
