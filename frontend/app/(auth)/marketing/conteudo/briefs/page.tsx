"use client";

import { useState } from "react";
import {
  IconFileText,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentBriefs } from "@/features/marketing/hooks/use-marketing-content";

const BRIEF_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  revision: { label: "Revisao", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cancelled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

function BriefsContent() {
  const [search, setSearch] = useState("");
  const { data: briefs, isLoading, error, refetch } = useContentBriefs();

  const filtered = (briefs ?? []).filter((b) => {
    if (!search) return true;
    return b.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Briefs de Conteudo</h1>
          <p className="text-sm text-muted-foreground">Briefings para producao de conteudo.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Brief
        </Button>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar briefs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar briefs." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={IconFileText} title={search ? "Nenhum brief encontrado" : "Nenhum brief ainda"} description={search ? "Tente ajustar a busca." : "Crie o primeiro brief de conteudo."} />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Titulo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Deadline</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((brief) => {
                const st = BRIEF_STATUS[brief.status];
                return (
                  <tr key={brief.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{brief.title}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {brief.deadline ? new Date(brief.deadline).toLocaleDateString("pt-BR") : "--"}
                    </td>
                    <td className="px-4 py-3">
                      {st ? <Badge variant="secondary" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</Badge> : brief.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function BriefsPage() {
  return (
    <RequireRole module="marketing">
      <BriefsContent />
    </RequireRole>
  );
}
