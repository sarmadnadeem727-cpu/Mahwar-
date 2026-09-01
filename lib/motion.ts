import { Variants } from "framer-motion";

// Crisp institutional spring physics (fast, snappy, slightly overshooting)
export const SPRING_SNAPPY = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.6,
} as const;

export const SPRING_GENTLE = {
  type: "spring",
  stiffness: 240,
  damping: 24,
  mass: 0.8,
} as const;

export const EASE_INSTITUTIONAL = [0.16, 1, 0.3, 1] as const;
export const EASE_PREMIUM = EASE_INSTITUTIONAL;

// Snappy panel reveal capped at ~280ms
export const panelReveal: Variants = {
  initial: { opacity: 0, scale: 0.985, y: 6 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.28, 
      ease: EASE_INSTITUTIONAL 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.985,
    transition: { duration: 0.15, ease: "easeIn" } 
  }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3, 
      ease: EASE_INSTITUTIONAL 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: 0.15, ease: "easeIn" } 
  }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.04, 
      delayChildren: 0.02 
    } 
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.25, 
      ease: EASE_INSTITUTIONAL 
    } 
  }
};

export const interactiveHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.01, 
    y: -2,
    transition: SPRING_SNAPPY
  },
  tap: {
    scale: 0.99,
    y: 0,
    transition: { duration: 0.05 }
  }
};
