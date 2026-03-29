"use client";

import {
  IconPlayerPlay,
  IconAlertTriangle,
  IconCalendar,
  IconProgress,
  IconSparkles,
  IconLoader,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SectionProgress {
  id: string;
  title: string;
  color: string | null;
  total: number;
  completed: number;
  percent: number;
}

/* ── Status + Progress Card ──────────────────────────────────────── */

interface ProjectPeriodData {
  due_date_start: string | null;
  due_date_end: string | null;
}

export function StatusProgressCard({
  statusCfg,
  projectStatus,
  onStatusChange,
  progressPercent,
  stats,
  sectionProgress,
  project,
  daysLeft,
}: {
  statusCfg: (typeof PROJECT_STATUS)[ProjectStatusKey] | undefined;
  projectStatus: string | null;
  onStatusChange: (s: string) => void;
  progressPercent: number;
  stats: { totalTasks: number; completedTasks: number; overdueTasks: number; inProgressTasks: number } | null;
  sectionProgress: SectionProgress[];
  project?: ProjectPeriodData | null;
  daysLeft?: number | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconProgress className="size-4 text-muted-foreground" /> Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none">
                {statusCfg ? (
                  <Badge className="text-xs gap-1.5 cursor-pointer" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                    {statusCfg.label}
                  </Badge>
                ) : (<Badge variant="outline" className="text-xs cursor-pointer">Sem status</Badge>)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(([key, cfg]) => (
                <DropdownMenuItem key={key} onClick={() => onStatusChange(key)} className="gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label}</span>
                  {key === projectStatus && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xl font-bold tabular-nums text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{stats?.completedTasks ?? 0} de {stats?.totalTasks ?? 0} tarefas concluidas</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><IconPlayerPlay className="size-3 text-blue-500" />{stats?.inProgressTasks ?? 0}</span>
            <span className="flex items-center gap-1"><IconAlertTriangle className="size-3 text-red-500" />{stats?.overdueTasks ?? 0}</span>
          </div>
        </div>

        {/* Periodo inline */}
        {project && (
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconCalendar className="size-3.5" />
              {project.due_date_start && project.due_date_end ? (
                <span className="font-medium text-foreground">
                  {format(new Date(project.due_date_start), "dd MMM", { locale: ptBR })} {"\u2192"} {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
                </span>
              ) : project.due_date_end ? (
                <span className="font-medium text-foreground">Entrega: {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}</span>
              ) : (
                <span>Sem prazo definido</span>
              )}
            </div>
            {daysLeft !== null && daysLeft !== undefined && (
              <span className={cn("text-xs font-medium", daysLeft < 0 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-green-600")}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasado` : daysLeft === 0 ? "Hoje" : `${daysLeft}d restantes`}
              </span>
            )}
          </div>
        )}

        {sectionProgress.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">Por Secao</p>
            {sectionProgress.map((section) => (
              <div key={section.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.color && <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: section.color }} />}
                    <span className="text-xs">{section.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{section.completed}/{section.total}</span>
                </div>
                <Progress value={section.percent} className="h-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Period Card ──────────────────────────────────────────────────── */

interface ProjectData {
  due_date_start: string | null;
  due_date_end: string | null;
}

export function PeriodCard({ project, daysLeft }: { project: ProjectData | null; daysLeft: number | null }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" /> Periodo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {project?.due_date_start && project?.due_date_end ? (
            <p className="text-sm font-medium">
              {format(new Date(project.due_date_start), "dd MMM", { locale: ptBR })} {"\u2192"} {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
            </p>
          ) : project?.due_date_end ? (
            <p className="text-sm font-medium">Entrega: {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}</p>
          ) : (<p className="text-sm text-muted-foreground">Sem prazo definido</p>)}
          {daysLeft !== null && (
            <p className={cn("text-xs font-medium", daysLeft < 0 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-green-600")}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} dias atrasado` : daysLeft === 0 ? "Prazo e hoje" : `${daysLeft} dias restantes`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── AI Summary Card ─────────────────────────────────────────────── */

export function AiSummaryCard({ aiSummary, aiSummaryLoading, onGenerate }: { aiSummary: string | null; aiSummaryLoading: boolean; onGenerate: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconSparkles className="size-4 text-amber-500" /> Resumo do Projeto por IA
          </CardTitle>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onGenerate} disabled={aiSummaryLoading}>
            {aiSummaryLoading ? <IconLoader className="size-3 animate-spin" /> : <IconSparkles className="size-3" />}
            {aiSummaryLoading ? "Gerando..." : aiSummary ? "Regenerar" : "Gerar com IA"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {aiSummary ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={() => { window.dispatchEvent(new CustomEvent("use-ai-summary-as-update", { detail: { summary: aiSummary } })); }}>
              <IconArrowRight className="size-3" /> Usar como Status Update
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Clique em &quot;Gerar com IA&quot; para criar um resumo estrategico com base no progresso e atividades do projeto.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
