"use client";

import { useState } from "react";
import {
  IconPlus,
  IconCalendarEvent,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useRsmPosts } from "@/features/marketing/hooks/use-marketing-social";

const POST_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  agendado: { label: "Agendado", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  publicado: { label: "Publicado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  erro: { label: "Erro", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

function AgendamentoContent() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: posts, isLoading, error, refetch } = useRsmPosts();

  const filtered = (posts ?? []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (!search) return true;
    return p.content?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamento</h1>
          <p className="text-sm text-muted-foreground">Agende e publique posts nas redes sociais.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Post
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(POST_STATUS).map(([key, def]) => (
              <TabsTrigger key={key} value={key}>{def.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar posts." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={IconCalendarEvent} title={search || statusFilter !== "all" ? "Nenhum post encontrado" : "Nenhum post ainda"} description={search || statusFilter !== "all" ? "Ajuste os filtros." : "Crie seu primeiro post para as redes sociais."} />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conteudo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Plataforma</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((post) => {
                const st = POST_STATUS[post.status];
                return (
                  <tr key={post.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-xs">{post.content ?? "--"}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{post.type ?? "--"}</td>
                    <td className="px-4 py-3">
                      {st ? <Badge variant="secondary" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</Badge> : post.status}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString("pt-BR") : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgendamentoPage() {
  return (
    <RequireRole module="marketing">
      <AgendamentoContent />
    </RequireRole>
  );
}
