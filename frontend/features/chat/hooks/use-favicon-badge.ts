"use client";

import { useEffect, useRef } from "react";

const SIZE = 32;
const BADGE_R = 8;

function drawBadge(ctx: CanvasRenderingContext2D, count: number): void {
  const x = SIZE - BADGE_R - 1;
  const y = BADGE_R + 1;

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, BADGE_R, 0, Math.PI * 2);
  ctx.fill();

  const label = count > 99 ? "99+" : String(count);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${label.length > 2 ? 6 : label.length > 1 ? 7 : 9}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

/**
 * Feature #9 — Favicon badge with unread message count.
 * Uses Canvas API to overlay a red badge circle on the page favicon.
 */
export function useFaviconBadge(totalUnread: number): void {
  const originalHrefRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    if (!originalHrefRef.current) {
      originalHrefRef.current = link.href || "/favicon.ico";
    }

    if (totalUnread === 0) {
      link.href = originalHrefRef.current;
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const capturedLink = link;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      drawBadge(ctx, totalUnread);
      capturedLink.href = canvas.toDataURL("image/png");
    };

    img.onerror = () => {
      // No base favicon — draw minimal dark square with badge
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, SIZE, SIZE);
      drawBadge(ctx, totalUnread);
      capturedLink.href = canvas.toDataURL("image/png");
    };

    img.src = originalHrefRef.current;
  }, [totalUnread]);

  // Reset to original favicon on unmount
  useEffect(
    () => () => {
      if (typeof document === "undefined") return;
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link && originalHrefRef.current) link.href = originalHrefRef.current;
    },
    [],
  );
}
