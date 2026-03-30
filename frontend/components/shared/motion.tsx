"use client";

import { motion, type Variants, AnimatePresence } from "framer-motion";
import React from "react";

// ── Motion tokens (from CLAUDE.md UX rules) ─────────────
const DURATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

const EASE = {
  out: [0.0, 0.0, 0.2, 1] as const,
  in: [0.4, 0.0, 1, 1] as const,
  spring: { type: "spring" as const, stiffness: 300, damping: 24 },
};

// ── Fade In ─────────────────────────────────────────────
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: DURATION.normal, ease: EASE.out, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Page Transition ─────────────────────────────────────
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger List ────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
};

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ── Scale on Tap (interactive elements) ─────────────────
export function ScaleOnTap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={EASE.spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Slide In from side ──────────────────────────────────
export function SlideIn({
  children,
  className,
  direction = "left",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
}) {
  const offset = { left: { x: -20 }, right: { x: 20 }, up: { y: -20 }, down: { y: 20 } };
  return (
    <motion.div
      initial={{ opacity: 0, ...offset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offset[direction] }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animate Presence wrapper ────────────────────────────
export function PresenceGroup({
  children,
  mode = "wait",
}: {
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
}) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

// ── Collapse (for accordion / expandable sections) ──────
export function Collapse({
  children,
  className,
  isOpen,
}: {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
          className={className}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Re-export motion tokens for custom use
export { DURATION, EASE };
