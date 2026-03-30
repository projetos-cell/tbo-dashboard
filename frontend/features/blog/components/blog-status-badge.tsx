"use client";

import { Badge } from "@/components/ui/badge";
import type { BlogPostStatus } from "../types";

const STATUS_MAP: Record<BlogPostStatus | "agendado", { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  revisao: { label: "Revisao", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  publicado: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  agendado: { label: "Agendado", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  arquivado: { label: "Arquivado", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

/** Derives the visual status: "agendado" when status is publicado but published_at is in the future */
export function deriveVisualStatus(status: BlogPostStatus, publishedAt: string | null): BlogPostStatus | "agendado" {
  if (status === "publicado" && publishedAt && new Date(publishedAt) > new Date()) {
    return "agendado";
  }
  return status;
}

interface BlogStatusBadgeProps {
  status: BlogPostStatus;
  publishedAt?: string | null;
}

export function BlogStatusBadge({ status, publishedAt }: BlogStatusBadgeProps) {
  const visual = deriveVisualStatus(status, publishedAt ?? null);
  const cfg = STATUS_MAP[visual] ?? STATUS_MAP.rascunho;
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
