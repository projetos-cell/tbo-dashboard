"use client";

import { useState } from "react";
import { useAuditLogs } from "@/features/configuracoes/hooks/use-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconShieldCheck } from "@tabler/icons-react";
import {
  AuditSkeleton,
  AuditFilters,
  AuditLogItem,
  AuditPagination,
} from "./audit-log-parts";

function AuditCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <AuditSkeleton />
      </CardContent>
    </Card>
  );
}

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

  function resetPage() {
    setPage(0);
  }

  function clearFilters() {
    setAction("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  if (isLoading) return <AuditCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <IconShieldCheck size={16} className="text-muted-foreground" />
          Logs de Auditoria
          <span className="ml-1 text-muted-foreground font-normal">
            ({totalCount})
          </span>
        </CardTitle>
        <CardDescription>
          Registro de ações realizadas no sistema pelos membros da equipe
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AuditFilters
          action={action}
          entityType={entityType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          hasFilters={hasFilters}
          onActionChange={(v) => { setAction(v); resetPage(); }}
          onEntityTypeChange={(v) => { setEntityType(v); resetPage(); }}
          onDateFromChange={(v) => { setDateFrom(v); resetPage(); }}
          onDateToChange={(v) => { setDateTo(v); resetPage(); }}
          onClear={clearFilters}
        />

        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {hasFilters
              ? "Nenhum log encontrado para os filtros aplicados."
              : "Nenhum log de auditoria encontrado."}
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        )}

        <AuditPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      </CardContent>
    </Card>
  );
}
