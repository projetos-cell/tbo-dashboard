"use client";

import { Badge } from "@/components/ui/badge";
import type { WebsiteProjectStatus } from "../types";

const config: Record<WebsiteProjectStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  publicado: { label: "Publicado", variant: "default" },
  arquivado: { label: "Arquivado", variant: "outline" },
};

export function ProjectStatusBadge({ status }: { status: WebsiteProjectStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
