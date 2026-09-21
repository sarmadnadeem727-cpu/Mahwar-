import type { Variants, Transition } from "framer-motion";

/** Shared motion vocabulary. One easing, a few durations, used everywhere. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_INSTITUTIONAL = EASE_OUT;
export const EASE_PREMIUM = EASE_OUT;

export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 380, damping: 28, mass: 0.6 };
export const SPRING_GENTLE: Transition = { type: "spring", stiffness: 240, damping: 24, mass: 0.8 };

/** Terminal panel swap — quick, slightly scaled, no bounce. */
export const panelReveal: Variants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.16, ease: "easeIn" } },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

/** Scroll-triggered reveal for landing sections (use with whileInView). */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const interactiveHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: SPRING_SNAPPY },
  tap: { scale: 0.99, y: 0, transition: { duration: 0.05 } },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
