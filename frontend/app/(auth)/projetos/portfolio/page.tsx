"use client";

import { useMemo, useState } from "react";
import {
  IconTarget,
  IconCircleCheck,
  IconAlertTriangle,
  IconCalendar,
  IconUser,
  IconFilter,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProjectTaskStats } from "@/features/projects/hooks/use-project-tasks";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import {
  PROJECT_STATUS,
  PROJECT_HEALTH,
  BU_COLORS,
  computeProjectHealth,
  type ProjectStatusKey,
} from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function PortfolioPage() {
  useUser();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const [buFilter, setBuFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (buFilter !== "all") {
        const bus = parseBus(p.bus);
        if (!bus.includes(buFilter)) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, buFilter, statusFilter]);

  // Get unique BUs
  const allBus = useMemo(() => {
    if (!projects) return [];
    const set = new Set<string>();
    for (const p of projects) {
      for (const bu of parseBus(p.bus)) set.add(bu);
    }
    return Array.from(set).sort();
  }, [projects]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Visão consolidada de todos os projetos com saúde e progresso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={buFilter} onValueChange={setBuFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Todas BUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas BUs</SelectItem>
              {allBus.map((bu) => (
                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Todos status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {Object.entries(PROJECT_STATUS).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_100px_100px_120px_100px] gap-2 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Projeto</span>
            <span>BU</span>
            <span>Status</span>
            <span>Saúde</span>
            <span>Prazo</span>
            <span>Progresso</span>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum projeto encontrado.
            </div>
          ) : (
            filtered.map((project) => (
              <PortfolioRow key={project.id} project={project} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PortfolioRow({ project }: { project: Project }) {
  const router = useRouter();
  const isDone = project.status === "finalizado";
  const { data: taskStats } = useProjectTaskStats(isDone ? undefined : project.id);
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  const healthKey = taskStats
    ? computeProjectHealth({ total: taskStats.totalTasks, overdue: taskStats.overdueTasks })
    : null;
  const healthConfig = healthKey ? PROJECT_HEALTH[healthKey] : null;

  const progressPct = taskStats && taskStats.totalTasks > 0
    ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={() => router.push(`/projetos/${project.id}`)}
      className="grid w-full grid-cols-[1fr_120px_100px_100px_120px_100px] items-center gap-2 border-b px-4 py-3 text-left text-sm transition-colors hover:bg-muted/30 last:border-b-0"
    >
      {/* Project name + owner */}
      <div className="min-w-0">
        <div className="truncate font-medium">{project.name}</div>
        {project.owner_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <IconUser className="size-3" />
            <span className="truncate">{project.owner_name}</span>
          </div>
        )}
      </div>

      {/* BU */}
      <div className="flex flex-wrap gap-1">
        {busList.map((bu) => {
          const buColor = BU_COLORS[bu];
          return (
            <Badge
              key={bu}
              variant="outline"
              className="px-1.5 py-0 text-[10px]"
              style={
                buColor
                  ? { backgroundColor: buColor.bg, color: buColor.color, borderColor: "transparent" }
                  : undefined
              }
            >
              {bu}
            </Badge>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <Badge
          variant="secondary"
          className="text-[10px] gap-1 w-fit"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          <span className="size-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          {status.label}
        </Badge>
      )}

      {/* Health */}
      <div>
        {healthConfig ? (
          <Badge
            variant="secondary"
            className="text-[10px] gap-1"
            style={{ backgroundColor: healthConfig.bg, color: healthConfig.color }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: healthConfig.color }} />
            {healthConfig.label}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Due date */}
      <div className="text-xs text-muted-foreground">
        {project.due_date_end ? (
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3" />
            {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
          </span>
        ) : (
          "—"
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progressPct === 100 ? "bg-green-500" : "bg-blue-500",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] font-medium tabular-nums w-8 text-right">
          {progressPct}%
        </span>
      </div>
    </button>
  );
}
