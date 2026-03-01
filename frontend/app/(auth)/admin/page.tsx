"use client";

import { useState, useMemo, Fragment } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Shield,
  ChevronDown,
  ChevronRight,
  Activity,
  Users,
  CalendarDays,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequireRole } from "@/components/auth/require-role";
import { useAuditLogs } from "@/hooks/use-admin";
import { computeAdminKPIs } from "@/services/admin";

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "project", label: "Projeto" },
  { value: "demand", label: "Tarefa" },
  { value: "client", label: "Cliente" },
  { value: "contract", label: "Contrato" },
  { value: "financial", label: "Financeiro" },
  { value: "profile", label: "Perfil" },
  { value: "team", label: "Time" },
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  create: { bg: "#dcfce7", color: "#15803d" },
  insert: { bg: "#dcfce7", color: "#15803d" },
  update: { bg: "#dbeafe", color: "#1d4ed8" },
  delete: { bg: "#fee2e2", color: "#b91c1c" },
  remove: { bg: "#fee2e2", color: "#b91c1c" },
  status_change: { bg: "#fef9c3", color: "#a16207" },
  login: { bg: "#f3e8ff", color: "#7c3aed" },
  logout: { bg: "#f1f5f9", color: "#475569" },
};

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build filters
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

  const { data: logs = [], isLoading, error } = useAuditLogs(filters);

  // KPIs from unfiltered logs
  const { data: allLogs = [] } = useAuditLogs();
  const kpis = useMemo(() => computeAdminKPIs(allLogs), [allLogs]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Erro ao carregar logs de auditoria
        </p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <RequireRole allowed={["founder"]} module="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">
            Visualize logs de auditoria e atividades do sistema.
          </p>
        </div>

        {/* KPIs */}
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
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Usuários únicos"
              value={kpis.uniqueUsers}
              color="#3b82f6"
              icon={<Users className="h-4 w-4 text-blue-500" />}
            />
            <KpiCard
              label="Ações hoje"
              value={kpis.todayActions}
              color="#22c55e"
              icon={<CalendarDays className="h-4 w-4 text-green-500" />}
            />
            <KpiCard
              label="Tipo mais frequente"
              value={kpis.topEntityType}
              isText
              icon={<Tag className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ação, entidade, usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[260px]"
            />
          </div>

          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de entidade" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[160px]"
            placeholder="De"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[160px]"
            placeholder="Até"
          />

          {(search || entityType !== "all" || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setEntityType("all");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Shield className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">Nenhum registro encontrado</p>
            <p className="text-xs text-muted-foreground">
              Ajuste os filtros ou aguarde novas ações no sistema.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]" />
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Transição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const actionStyle = ACTION_COLORS[log.action] ?? {
                    bg: "#f1f5f9",
                    color: "#475569",
                  };

                  return (
                    <Fragment key={log.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => toggleExpand(log.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {log.created_at
                            ? format(
                                new Date(log.created_at),
                                "dd MMM yyyy, HH:mm",
                                { locale: ptBR }
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.user_name || "Sistema"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: actionStyle.bg,
                              color: actionStyle.color,
                            }}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.entity_type}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.entity_name || log.entity_id}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.from_state || log.to_state ? (
                            <span>
                              {log.from_state && (
                                <Badge
                                  variant="secondary"
                                  className="mr-1 text-xs"
                                >
                                  {log.from_state}
                                </Badge>
                              )}
                              {log.from_state && log.to_state && (
                                <span className="mx-1">→</span>
                              )}
                              {log.to_state && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {log.to_state}
                                </Badge>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded details */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              {log.reason && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Motivo
                                  </p>
                                  <p className="text-sm">{log.reason}</p>
                                </div>
                              )}
                              {log.details && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Detalhes
                                  </p>
                                  <pre className="text-xs bg-muted rounded p-3 overflow-x-auto max-h-48">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.metadata && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Metadata
                                  </p>
                                  <pre className="text-xs bg-muted rounded p-3 overflow-x-auto max-h-48">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {!log.reason &&
                                !log.details &&
                                !log.metadata && (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum detalhe adicional disponível.
                                  </p>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </RequireRole>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  label,
  value,
  color,
  isText,
  icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  isText?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p
        className={`mt-1 font-bold ${isText ? "text-base" : "text-2xl"}`}
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
