"use client";

import { useState } from "react";
import { useCreativeBriefings } from "@/features/clientes/hooks/use-creative-briefings";
import { BriefingDetailDialog } from "@/features/clientes/components/briefing-detail-dialog";
import type { CreativeBriefingRow } from "@/features/clientes/services/creative-briefings";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState, EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconClipboardText,
  IconSearch,
  IconCopy,
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; dot: string }
> = {
  enviado: { label: "Enviado", variant: "default", dot: "bg-blue-500" },
  em_analise: { label: "Em Análise", variant: "outline", dot: "bg-yellow-500" },
  aprovado: { label: "Aprovado", variant: "default", dot: "bg-green-500" },
  rascunho: { label: "Rascunho", variant: "secondary", dot: "bg-zinc-500" },
};

export default function BriefingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<CreativeBriefingRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    data: briefings = [],
    isLoading,
    error,
    refetch,
  } = useCreativeBriefings({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  function handleSelect(b: CreativeBriefingRow) {
    setSelected(b);
    setDetailOpen(true);
  }

  function handleCopyLink(b: CreativeBriefingRow) {
    const base = window.location.origin;
    const url = `${base}/briefing/${b.slug}${b.project_slug ? `?projeto=${b.project_slug}&nome=${encodeURIComponent(b.client_name)}&projeto_nome=${encodeURIComponent(b.project_name || "")}` : `?nome=${encodeURIComponent(b.client_name)}`}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  if (error) {
    return (
      <RequireRole module="clientes">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  return (
    <RequireRole module="clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/clientes">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Briefings Criativos
              </h1>
              <p className="text-sm text-muted-foreground">
                Briefings preenchidos por clientes para projetos de
                empreendimentos.
              </p>
            </div>
          </div>
        </div>

        {/* KPIs rápidos */}
        {!isLoading && briefings.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Total"
              value={briefings.length}
              color="text-foreground"
            />
            <KpiCard
              label="Enviados"
              value={briefings.filter((b) => b.status === "enviado").length}
              color="text-blue-500"
            />
            <KpiCard
              label="Em Análise"
              value={briefings.filter((b) => b.status === "em_analise").length}
              color="text-yellow-500"
            />
            <KpiCard
              label="Aprovados"
              value={briefings.filter((b) => b.status === "aprovado").length}
              color="text-green-500"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : briefings.length === 0 ? (
          <EmptyState
            icon={IconClipboardText}
            title="Nenhum briefing recebido"
            description="Quando um cliente preencher o formulário de briefing, ele aparecerá aqui."
          />
        ) : (
          <div className="space-y-2">
            {briefings.map((b) => {
              const st = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.enviado;
              const fd = b.form_data as Record<string, unknown>;

              return (
                <div
                  key={b.id}
                  className="group flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                  onClick={() => handleSelect(b)}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                    <IconClipboardText className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.client_name}</span>
                      {b.project_name && (
                        <span className="text-sm text-muted-foreground">
                          — {b.project_name}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      {fd.padrao ? (
                        <span className="capitalize">
                          {String(fd.padrao)}
                        </span>
                      ) : null}
                      {fd.bairro_cidade ? (
                        <span>{String(fd.bairro_cidade)}</span>
                      ) : null}
                      {b.submitted_at && (
                        <span>
                          {new Date(b.submitted_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={st.variant}>
                      <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${st.dot}`}
                      />
                      {st.label}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(b);
                      }}
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Sheet */}
        <BriefingDetailDialog
          briefing={selected}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </RequireRole>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
