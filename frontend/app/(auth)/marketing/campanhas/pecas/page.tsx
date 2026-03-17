"use client";

import {
  IconPuzzle,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";

const PIECE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: "Pendente", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  em_producao: { label: "Em Producao", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  revisao: { label: "Revisao", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  aprovado: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  publicado: { label: "Publicado", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

function PecasContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pecas & Entregas</h1>
          <p className="text-sm text-muted-foreground">
            Pecas vinculadas as campanhas de marketing.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Nova Peca
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(PIECE_STATUS).map(([key, def]) => (
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
        icon={IconPuzzle}
        title="Nenhuma peca cadastrada"
        description="Vincule pecas e entregas as campanhas para acompanhar o progresso de producao."
      />
    </div>
  );
}

export default function PecasPage() {
  return (
    <RequireRole module="marketing">
      <PecasContent />
    </RequireRole>
  );
}
