"use client";

import {
  IconTrendingUp,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconCalendar,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  pendingApprovals: number;
}

interface PortalReportsTabProps {
  taskSummary: TaskSummary;
  progressPercent: number;
  dueDate: string | null;
  projectStatus: string | null;
  latestUpdate: {
    status: string;
    summary: string | null;
    created_at: string;
    author_name: string | null;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: "No prazo", color: "text-green-600" },
  at_risk: { label: "Em risco", color: "text-amber-600" },
  off_track: { label: "Atrasado", color: "text-red-600" },
  on_hold: { label: "Pausado", color: "text-zinc-500" },
  complete: { label: "Concluido", color: "text-blue-600" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PortalReportsTab({
  taskSummary,
  progressPercent,
  dueDate,
  projectStatus,
  latestUpdate,
}: PortalReportsTabProps) {
  const statusInfo = STATUS_LABELS[latestUpdate?.status ?? ""] ?? { label: projectStatus ?? "Em andamento", color: "text-zinc-600" };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <IconTrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{progressPercent}%</p>
              <p className="text-xs text-zinc-500">Progresso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <IconCircleCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {taskSummary.completed}/{taskSummary.total}
              </p>
              <p className="text-xs text-zinc-500">Tarefas concluidas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <IconClock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{taskSummary.inProgress}</p>
              <p className="text-xs text-zinc-500">Em andamento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{taskSummary.overdue}</p>
              <p className="text-xs text-zinc-500">Atrasadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress + Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visao Geral do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Progresso geral</span>
              <span className="font-medium text-zinc-900">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Status</p>
              <p className={cn("mt-1 text-sm font-medium", statusInfo.color)}>
                {statusInfo.label}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Prazo</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                <IconCalendar className="h-3.5 w-3.5 text-zinc-400" />
                {formatDate(dueDate)}
              </p>
            </div>
          </div>

          {taskSummary.pendingApprovals > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">
                {taskSummary.pendingApprovals} aprovacao{taskSummary.pendingApprovals !== 1 ? "oes" : ""} pendente{taskSummary.pendingApprovals !== 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                Itens aguardando sua revisao e aprovacao
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Update */}
      {latestUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ultima Atualizacao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="text-sm text-zinc-700">
                  {latestUpdate.summary ?? "Projeto atualizado"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {latestUpdate.author_name && `${latestUpdate.author_name} · `}
                  {formatDate(latestUpdate.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
