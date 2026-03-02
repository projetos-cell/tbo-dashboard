"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, type SpringOptions } from "framer-motion";

interface AnimatedNumberProps {
  /** Target numeric value */
  value: number;
  /** Formatter to display the number (e.g. formatBRL) */
  format?: (n: number) => string;
  /** Spring physics config */
  springOptions?: SpringOptions;
  /** Extra className on the wrapping span */
  className?: string;
}

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 100,
  damping: 30,
  mass: 1,
};

/**
 * Animates a numeric value from 0 (or previous value) to the target.
 * Uses framer-motion springs for smooth interpolation.
 */
export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString("pt-BR"),
  springOptions = DEFAULT_SPRING,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, springOptions);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Kick off animation when element enters viewport
  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  // Update DOM text on every spring frame
  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
    return unsubscribe;
  }, [spring, format]);

  return <span ref={ref} className={className} />;
}
