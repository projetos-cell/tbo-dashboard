"use client";

import type { ReactNode } from "react";

interface KpiGridProps {
  children: ReactNode;
  /** Override default column layout. Default: responsive 1→2→3→4 */
  columns?: 3 | 4;
}

export function KpiGrid({ children, columns }: KpiGridProps) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return <div className={gridClass}>{children}</div>;
}
