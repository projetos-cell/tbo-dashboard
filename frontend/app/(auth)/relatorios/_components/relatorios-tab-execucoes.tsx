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
import {
  IconDots,
  IconEye,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconFileAnalytics,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReportSchedules, useReportRuns } from "@/hooks/use-reports";
import { EmptyState } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";

const RUN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function RelatoriosTabExecucoes() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: runs = [], isLoading } = useReportRuns(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const { data: schedules = [] } = useReportSchedules();

  const scheduleMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schedules) m.set(s.id, s.name);
    return m;
  }, [schedules]);

  function handleVerConteudo() {
    toast({ title: "Em breve", description: "Visualização de conteúdo de execução em desenvolvimento." });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <EmptyState
          icon={IconFileAnalytics}
          title="Nenhuma execução encontrada"
          description="Ainda não há execuções de relatórios registradas."
        />
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
                  <TableCell className="text-sm text-gray-500">
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
                      {run.status}
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
                        <DropdownMenuItem onClick={handleVerConteudo}>
                          <IconEye className="mr-2 h-4 w-4" />
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
    </div>
  );
}
