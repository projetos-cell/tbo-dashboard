"use client";

import {
  IconFileText,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";

const BRIEFING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  pending_approval: { label: "Aguardando Aprovacao", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  revision: { label: "Revisao", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

function BriefingContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Briefings de Campanha</h1>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie briefings de campanhas de marketing.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Briefing
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(BRIEFING_STATUS).map(([key, def]) => (
          <div key={key} className="rounded-lg border bg-card p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ backgroundColor: def.color }} />
              <p className="text-xs text-muted-foreground">{def.label}</p>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
        ))}
      </div>

      <EmptyState
        icon={IconFileText}
        title="Nenhum briefing ainda"
        description="Selecione uma campanha e crie o briefing com objetivo, publico-alvo e mensagens-chave."
      />
    </div>
  );
}

export default function BriefingPage() {
  return (
    <RequireRole module="marketing">
      <BriefingContent />
    </RequireRole>
  );
}
