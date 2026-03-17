"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionMarqueeProps {
  /** CSS selector for elements that can be selected (must have data-select-id) */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Called with IDs of elements that intersect the marquee */
  onSelect: (ids: string[]) => void;
  /** Whether marquee selection is enabled */
  enabled?: boolean;
}

function rectsIntersect(a: DOMRect, b: MarqueeRect): boolean {
  return !(
    a.right < b.x ||
    a.left > b.x + b.width ||
    a.bottom < b.y ||
    a.top > b.y + b.height
  );
}

export function SelectionMarquee({
  containerRef,
  onSelect,
  enabled = true,
}: SelectionMarqueeProps) {
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState<MarqueeRect | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      // Only start marquee on left-click on the container background (not on interactive elements)
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      // Don't start marquee if clicking on interactive elements
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("[role='dialog']") ||
        target.closest("[data-drag-handle]") ||
        target.closest("[data-no-marquee]")
      ) {
        return;
      }

      startPos.current = { x: e.clientX, y: e.clientY };
    },
    [enabled],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!startPos.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      // Only start marquee after minimum drag distance (5px)
      if (!dragging && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

      if (!dragging) setDragging(true);

      const x = Math.min(e.clientX, startPos.current.x);
      const y = Math.min(e.clientY, startPos.current.y);
      const width = Math.abs(dx);
      const height = Math.abs(dy);

      setRect({ x, y, width, height });

      // Throttle intersection checks with rAF
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const selectables = containerRef.current.querySelectorAll<HTMLElement>("[data-select-id]");
        const marqueeRect = { x, y, width, height };
        const intersected: string[] = [];

        selectables.forEach((el) => {
          const elRect = el.getBoundingClientRect();
          if (rectsIntersect(elRect, marqueeRect)) {
            const id = el.getAttribute("data-select-id");
            if (id) intersected.push(id);
          }
        });

        onSelect(intersected);
      });
    },
    [dragging, containerRef, onSelect],
  );

  const handleMouseUp = useCallback(() => {
    startPos.current = null;
    setDragging(false);
    setRect(null);
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef, enabled, handleMouseDown, handleMouseMove, handleMouseUp]);

  if (!dragging || !rect) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 border border-primary/50 bg-primary/10 rounded-sm"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
}
