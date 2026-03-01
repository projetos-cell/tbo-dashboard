"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  CalendarClock,
  Play,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RequireRole } from "@/components/auth/require-role";
import {
  useReportSchedules,
  useReportRuns,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/hooks/use-reports";
import { computeReportsKPIs } from "@/services/reports";
import type { Json } from "@/lib/supabase/types";

const RUN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

function recipientCount(recipients: Json | null): number {
  if (!recipients) return 0;
  if (Array.isArray(recipients)) return recipients.length;
  return 0;
}

export default function RelatoriosPage() {
  const [tab, setTab] = useState("agendamentos");
  const [runStatusFilter, setRunStatusFilter] = useState("all");

  // Queries
  const { data: schedules = [], isLoading: loadingSchedules } =
    useReportSchedules();
  const { data: runs = [], isLoading: loadingRuns } = useReportRuns(
    runStatusFilter !== "all" ? { status: runStatusFilter } : undefined
  );
  const { data: allRuns = [] } = useReportRuns();

  // Mutations
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();

  // KPIs
  const kpis = useMemo(
    () => computeReportsKPIs(schedules, allRuns),
    [schedules, allRuns]
  );

  // Build schedule name lookup for runs table
  const scheduleMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schedules) {
      m.set(s.id, s.name);
    }
    return m;
  }, [schedules]);

  function handleToggleEnabled(id: string, current: boolean | null) {
    updateScheduleMutation.mutate({
      id,
      updates: { enabled: !(current ?? true) },
    });
  }

  return (
    <RequireRole minRole="diretoria" module="relatorios">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatorios</h1>
          <p className="text-sm text-muted-foreground">
            Agendamentos de relatorios e historico de execucoes.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Agendamentos
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.activeSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Execucoes este Mes
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.thisMonthRuns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {kpis.failedRuns}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="execucoes">Execucoes</TabsTrigger>
          </TabsList>

          {/* ── Tab: Agendamentos ──────────────────────────── */}
          <TabsContent value="agendamentos" className="space-y-4">
            <div className="flex items-center justify-end">
              <Button className="shrink-0">
                <Plus className="mr-1.5 h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>

            {loadingSchedules ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum agendamento cadastrado.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cron</TableHead>
                      <TableHead>Destinatarios</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {schedule.cron}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {recipientCount(schedule.recipients)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={schedule.enabled ?? true}
                            onCheckedChange={() =>
                              handleToggleEnabled(schedule.id, schedule.enabled)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  deleteScheduleMutation.mutate(schedule.id)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Execucoes ─────────────────────────────── */}
          <TabsContent value="execucoes" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select
                value={runStatusFilter}
                onValueChange={setRunStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="running">Executando</SelectItem>
                  <SelectItem value="completed">Concluido</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingRuns ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma execucao encontrada.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agendamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Gerado em</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">
                          {run.schedule_id
                            ? scheduleMap.get(run.schedule_id) ?? run.schedule_id
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{run.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.generated_at
                            ? format(
                                new Date(run.generated_at),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              RUN_STATUS_COLORS[run.status] ??
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {run.status === "completed" && (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            {run.status === "failed" && (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {run.status === "running" && (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Conteudo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
}
