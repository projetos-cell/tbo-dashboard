"use client";

// Feature #68 — Notificações in-app para aprovações pendentes (badge no hub + toast)

import { useEffect, useRef } from "react";
import Link from "next/link";
import { IconCheckbox } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContentApprovals } from "../hooks/use-marketing-content";

interface Props {
  /** Se true, exibe apenas o badge numérico sem o link/card */
  compact?: boolean;
}

export function MarketingApprovalsBadge({ compact = false }: Props) {
  const { data: approvals } = useContentApprovals();
  const pending = (approvals ?? []).filter((a) => a.status === "pending").length;

  // Notifica via toast quando chega nova aprovação pendente (mudança de 0 → N ou N aumenta)
  const prevRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = pending;
      return;
    }
    if (pending > prevRef.current) {
      toast.info(`${pending} aprovação${pending > 1 ? "ões" : ""} pendente${pending > 1 ? "s" : ""}`, {
        description: "Acesse Conteúdo → Aprovações para revisar.",
        action: {
          label: "Ver",
          onClick: () => window.location.assign("/marketing/conteudo/aprovacoes"),
        },
      });
    }
    prevRef.current = pending;
  }, [pending]);

  if (compact) {
    if (pending === 0) return null;
    return (
      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] tabular-nums">
        {pending > 99 ? "99+" : pending}
      </Badge>
    );
  }

  if (pending === 0) return null;

  return (
    <Link
      href="/marketing/conteudo/aprovacoes"
      className="flex items-center gap-2 rounded-lg border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors"
    >
      <IconCheckbox className="size-4 shrink-0" />
      <span className="font-medium">
        {pending} aprovação{pending > 1 ? "ões" : ""} pendente{pending > 1 ? "s" : ""}
      </span>
      <Badge variant="secondary" className="ml-auto bg-amber-500 text-white text-[10px] h-5 px-1.5">
        {pending}
      </Badge>
    </Link>
  );
}
