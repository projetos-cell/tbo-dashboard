"use client";

import { useState, useMemo } from "react";
import {
  IconSearch,
  IconShield,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, EmptyState, RBACGuard } from "@/components/shared";
import { AuditLogTimeline } from "@/features/audit-log/components/audit-log-timeline";
import {
  useAuditLogs,
  useAuditLogActions,
  useAuditLogEntityTypes,
} from "@/features/audit-log/hooks/use-audit-log";
import type { AuditLogFilters } from "@/features/audit-log/services/audit-log";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);

  const filters: AuditLogFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      action: actionFilter || undefined,
      entity_type: entityTypeFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [search, actionFilter, entityTypeFilter, dateFrom, dateTo]
  );

  const { data, isLoading, error, refetch } = useAuditLogs(filters, page);
  const { data: actions = [] } = useAuditLogActions();
  const { data: entityTypes = [] } = useAuditLogEntityTypes();

  const entries = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 50);
  const hasFilters = !!(search || actionFilter || entityTypeFilter || dateFrom || dateTo);

  function clearFilters() {
    setSearch("");
    setActionFilter("");
    setEntityTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <RBACGuard minRole="founder">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
            <p className="text-sm text-muted-foreground">
              Registro de todas as acoes realizadas na plataforma.
            </p>
          </div>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount.toLocaleString("pt-BR")} eventos
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar por acao, entidade..."
              className="pl-9"
            />
          </div>

          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as acoes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as acoes</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={entityTypeFilter}
            onValueChange={(v) => {
              setEntityTypeFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as entidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as entidades</SelectItem>
              {entityTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="w-[150px]"
              placeholder="De"
            />
            <span className="text-muted-foreground text-sm">ate</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="w-[150px]"
              placeholder="Ate"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Content */}
        {!isLoading && entries.length === 0 ? (
          <EmptyState
            icon={IconShield}
            title={hasFilters ? "Nenhum evento encontrado" : "Nenhum evento registrado"}
            description={
              hasFilters
                ? "Tente ajustar os filtros para encontrar o que procura."
                : "As acoes realizadas na plataforma aparecerão aqui."
            }
            cta={hasFilters ? { label: "Limpar filtros", onClick: clearFilters } : undefined}
          />
        ) : (
          <AuditLogTimeline entries={entries} isLoading={isLoading} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Pagina {page + 1} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <IconChevronLeft className="size-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Proximo
                <IconChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </RBACGuard>
  );
}
