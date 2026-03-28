"use client";

import { useState, useMemo } from "react";
import {
  IconActivity,
  IconUsers,
  IconCalendar,
  IconTag,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useAuditLogs } from "@/features/auth/hooks/use-admin";
import { computeAdminKPIs } from "@/features/auth/services/admin";
import { KpiCard } from "@/features/admin/components/kpi-card";
import { AuditFilters } from "@/features/admin/components/audit-filters";
import { AuditTable } from "@/features/admin/components/audit-table";

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo(() => {
    const f: {
      search?: string;
      entity_type?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {};
    if (search) f.search = search;
    if (entityType !== "all") f.entity_type = entityType;
    if (dateFrom) f.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      f.dateTo = d.toISOString();
    }
    return Object.keys(f).length > 0 ? f : undefined;
  }, [search, entityType, dateFrom, dateTo]);

  const { data: logs = [], isLoading, error, refetch } = useAuditLogs(filters);
  const { data: allLogs = [] } = useAuditLogs();
  const kpis = useMemo(() => computeAdminKPIs(allLogs), [allLogs]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <RequireRole minRole="admin" module="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-gray-500">
            Visualize logs de auditoria e atividades do sistema.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total ações"
              value={kpis.totalActions}
              icon={<IconActivity className="h-4 w-4 text-gray-500" />}
            />
            <KpiCard
              label="Usuários únicos"
              value={kpis.uniqueUsers}
              color="#3b82f6"
              icon={<IconUsers className="h-4 w-4 text-blue-500" />}
            />
            <KpiCard
              label="Ações hoje"
              value={kpis.todayActions}
              color="#22c55e"
              icon={<IconCalendar className="h-4 w-4 text-green-500" />}
            />
            <KpiCard
              label="Tipo mais frequente"
              value={kpis.topEntityType}
              isText
              icon={<IconTag className="h-4 w-4 text-gray-500" />}
            />
          </div>
        )}

        <AuditFilters
          search={search}
          entityType={entityType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSearchChange={setSearch}
          onEntityTypeChange={setEntityType}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onClear={() => { setSearch(""); setEntityType("all"); setDateFrom(""); setDateTo(""); }}
        />

        <AuditTable logs={logs} isLoading={isLoading} />
      </div>
    </RequireRole>
  );
}
