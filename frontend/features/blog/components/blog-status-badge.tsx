"use client";

import { Badge } from "@/components/ui/badge";
import type { BlogPostStatus } from "../types";

const STATUS_MAP: Record<BlogPostStatus, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  revisao: { label: "Revisao", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  publicado: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  arquivado: { label: "Arquivado", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

export function BlogStatusBadge({ status }: { status: BlogPostStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.rascunho;
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium border-0"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </Badge>
  );
}
