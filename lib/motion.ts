import { Variants } from "framer-motion";

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: EASE_PREMIUM 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -15, 
    transition: { duration: 0.25, ease: "easeIn" } 
  }
};

export const panelReveal: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.45, 
      ease: EASE_PREMIUM 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: 0.2 } 
  }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.04 
    } 
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const slideInFromRight: Variants = {
  initial: { x: 60, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const slideInFromLeft: Variants = {
  initial: { x: -60, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { 
    y: -5, 
    scale: 1.01,
    transition: { 
      type: "spring", 
      stiffness: 250, 
      damping: 20 
    } 
  }
};

export const numberSpring = {
  type: "spring",
  stiffness: 80,
  damping: 20
};

export const drawPath: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { 
      duration: 1.8, 
      ease: "easeInOut" 
    } 
  }
};
