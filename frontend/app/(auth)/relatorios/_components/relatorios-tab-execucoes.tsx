"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconDots,
  IconEye,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconFileAnalytics,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconDownload,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReportSchedules, useReportRuns, useRetryRun } from "@/hooks/use-reports";
import { EmptyState } from "@/components/shared";
import { RunContentDialog } from "./run-content-dialog";
import { useToast } from "@/hooks/use-toast";

const RUN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  running: "Executando",
  completed: "Concluido",
  failed: "Falhou",
};

const PAGE_SIZE = 10;

export function RelatoriosTabExecucoes() {
  const { toast } = useToast();
  const retryMutation = useRetryRun();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewRunId, setViewRunId] = useState<string | null>(null);
  const [viewRunScheduleName, setViewRunScheduleName] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: runs = [], isLoading } = useReportRuns(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const { data: schedules = [] } = useReportSchedules();

  const scheduleMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schedules) m.set(s.id, s.name);
    return m;
  }, [schedules]);

  const filteredRuns = useMemo(() => {
    let result = runs;
    if (dateFrom) {
      result = result.filter((r) => r.generated_at && r.generated_at >= dateFrom);
    }
    if (dateTo) {
      const endDate = dateTo + "T23:59:59";
      result = result.filter((r) => r.generated_at && r.generated_at <= endDate);
    }
    return result;
  }, [runs, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRuns.length / PAGE_SIZE));
  const paginatedRuns = useMemo(
    () => filteredRuns.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredRuns, page]
  );

  function handleVerConteudo(runId: string, scheduleId: string | null) {
    setViewRunId(runId);
    setViewRunScheduleName(scheduleId ? scheduleMap.get(scheduleId) : undefined);
  }

  function handleExportCsv() {
    const headers = ["Agendamento", "Tipo", "Gerado em", "Status"];
    const rows = filteredRuns.map((r) => [
      r.schedule_id ? scheduleMap.get(r.schedule_id) ?? r.schedule_id : "-",
      r.type,
      r.generated_at ?? "-",
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execucoes-relatorios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
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
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="w-[150px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Ate</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="w-[150px]"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 self-end">
          {filteredRuns.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">
                {filteredRuns.length} execuc{filteredRuns.length === 1 ? "ao" : "oes"}
              </span>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <IconDownload className="mr-1.5 h-3.5 w-3.5" />
                CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
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
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredRuns.length === 0 ? (
        <EmptyState
          icon={IconFileAnalytics}
          title="Nenhuma execucao encontrada"
          description="Ainda nao ha execucoes de relatorios registradas."
        />
      ) : (
        <>
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
                {paginatedRuns.map((run) => (
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
                        ? format(new Date(run.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={RUN_STATUS_COLORS[run.status] ?? "bg-gray-100 text-gray-800"}
                      >
                        {run.status === "completed" && (
                          <IconCircleCheck className="mr-1 h-3 w-3" />
                        )}
                        {run.status === "failed" && (
                          <IconAlertTriangle className="mr-1 h-3 w-3" />
                        )}
                        {run.status === "running" && (
                          <IconClock className="mr-1 h-3 w-3" />
                        )}
                        {STATUS_LABELS[run.status] ?? run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerConteudo(run.id, run.schedule_id)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Ver Conteudo
                          </DropdownMenuItem>
                          {run.status === "failed" && (
                            <DropdownMenuItem
                              onClick={() => {
                                retryMutation.mutate(
                                  { schedule_id: run.schedule_id, type: run.type, tenant_id: run.tenant_id },
                                  {
                                    onSuccess: () => toast({ title: "Re-execucao agendada" }),
                                    onError: () => toast({ title: "Erro ao re-executar", variant: "destructive" }),
                                  }
                                );
                              }}
                            >
                              <IconRefresh className="mr-2 h-4 w-4" />
                              Re-executar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Pagina {page + 1} de {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <RunContentDialog
        open={viewRunId !== null}
        onOpenChange={(open) => { if (!open) setViewRunId(null); }}
        runId={viewRunId}
        scheduleName={viewRunScheduleName}
      />
    </div>
  );
}
