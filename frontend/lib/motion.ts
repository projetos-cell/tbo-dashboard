/**
 * Framer Motion tokens for consistent animations across TBO OS.
 * Usage: <motion.div {...fadeIn}> or <motion.div transition={motionTokens.fast}>
 */

export const motionTokens = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
  spring: { type: "spring" as const, stiffness: 300, damping: 24 },
  stagger: { staggerChildren: 0.05 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: motionTokens.normal,
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: motionTokens.normal,
};

export const slideDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: motionTokens.fast,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: motionTokens.fast,
};

export const staggerContainer = {
  animate: {
    transition: motionTokens.stagger,
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: motionTokens.normal,
};
