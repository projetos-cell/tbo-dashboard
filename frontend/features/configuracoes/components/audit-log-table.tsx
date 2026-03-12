"use client";

import { useState } from "react";
import { useAuditLogs } from "@/features/configuracoes/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconShieldCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconFilterOff,
} from "@tabler/icons-react";

// ── Constants ──────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: "Criação", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  update: { label: "Atualização", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  delete: { label: "Exclusão", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  login: { label: "Login", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  logout: { label: "Logout", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
};

const ENTITY_LABELS: Record<string, string> = {
  profiles: "Perfil",
  projects: "Projeto",
  tasks: "Tarefa",
  crm_deals: "Deal CRM",
  meetings: "Reunião",
  clients: "Cliente",
  contracts: "Contrato",
  finance_transactions: "Transação",
  okrs: "OKR",
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);
const ALL_ENTITIES = Object.keys(ENTITY_LABELS);

// ── Skeleton ───────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function AuditLogTable() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasFilters = !!(action || entityType || dateFrom || dateTo);

  const { data, isLoading } = useAuditLogs({
    page,
    action: action || undefined,
    entityType: entityType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const logs = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 25);

  function clearFilters() {
    setAction("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  if (isLoading) return <AuditSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <IconShieldCheck size={16} className="text-muted-foreground" />
          Logs de Auditoria
          <span className="ml-1 text-muted-foreground font-normal">({totalCount})</span>
        </CardTitle>
        <CardDescription>Registro de ações realizadas no sistema pelos membros da equipe</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={action || "all"}
            onValueChange={(v) => handleFilterChange(() => setAction(v === "all" ? "" : v))}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <IconFilter size={12} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {ALL_ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {ACTION_LABELS[a]?.label ?? a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={entityType || "all"}
            onValueChange={(v) => handleFilterChange(() => setEntityType(v === "all" ? "" : v))}
          >
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas entidades</SelectItem>
              {ALL_ENTITIES.map((e) => (
                <SelectItem key={e} value={e}>
                  {ENTITY_LABELS[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(() => setDateFrom(e.target.value))}
            className="w-[140px] h-8 text-xs"
            placeholder="De"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(() => setDateTo(e.target.value))}
            className="w-[140px] h-8 text-xs"
            placeholder="Até"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs text-muted-foreground gap-1"
            >
              <IconFilterOff size={12} />
              Limpar
            </Button>
          )}
        </div>

        {/* Log list */}
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {hasFilters ? "Nenhum log encontrado para os filtros aplicados." : "Nenhum log de auditoria encontrado."}
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] ?? {
                label: log.action,
                color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
              };
              const entityLabel =
                ENTITY_LABELS[log.entity_type ?? ""] ?? log.entity_type ?? "—";
              const meta = log.metadata as Record<string, unknown> | null;
              const date = new Date(log.created_at ?? "");
              const user = log.profiles;
              const initials = (user?.full_name ?? "?")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={log.id}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* User avatar */}
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarImage src={user?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px] font-semibold bg-tbo-orange/10 text-tbo-orange">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>
                        <span className="text-sm font-medium">{entityLabel}</span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground font-mono">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {user?.full_name && (
                          <span className="text-xs text-muted-foreground">
                            por <span className="font-medium text-foreground">{user.full_name}</span>
                          </span>
                        )}
                        {meta &&
                          typeof meta === "object" &&
                          "changed_fields" in meta && (
                            <span className="text-xs text-muted-foreground">
                              · campos:{" "}
                              {Object.keys(
                                meta.changed_fields as Record<string, unknown>,
                              ).join(", ")}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages} · {totalCount} registros
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Página anterior"
              >
                <IconChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Próxima página"
              >
                <IconChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
