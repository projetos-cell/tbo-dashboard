"use client";

import { useRouter } from "next/navigation";
import {
  IconCalendar,
  IconExternalLink,
  IconGripVertical,
  IconAlertTriangle,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PROJECT_STATUS,
  BU_COLORS,
  PROJECT_HEALTH,
  computeProjectHealth,
  type ProjectStatusKey,
} from "@/lib/constants";
import { useProjectTaskStats } from "@/features/projects/hooks/use-project-tasks";
import { useProjectFavorites, useToggleFavorite } from "@/features/projects/hooks/use-project-favorites";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { InlineText, StatusBadgeSelect, BuEditor } from "./project-card-editors";
import { ConstrutoraCardSelect } from "./project-card-construtora";
import type { Database } from "@/lib/supabase/types";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
  editable?: boolean;
  dragListeners?: SyntheticListenerMap;
}

const DONE_STATUSES: string[] = ["concluido"];

export function ProjectCard({ project, editable = false, dragListeners }: ProjectCardProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  // V05 — Favorites
  const { data: favoriteIds } = useProjectFavorites();
  const toggleFavorite = useToggleFavorite();
  const isFavorite = (favoriteIds || []).includes(project.id);

  // A07 — Health badge from task stats
  const isDone = project.status === "concluido";
  const { data: taskStats } = useProjectTaskStats(isDone ? undefined : project.id);
  const healthKey = taskStats
    ? computeProjectHealth({ total: taskStats.totalTasks, overdue: taskStats.overdueTasks })
    : null;
  const healthConfig = healthKey && healthKey !== "on_track" ? PROJECT_HEALTH[healthKey] : null;

  // F10 — Badge overdue automatico (nivel projeto)
  const projectOverdue =
    project.due_date_end &&
    !DONE_STATUSES.includes(project.status ?? "") &&
    isPast(new Date(project.due_date_end)) &&
    !isToday(new Date(project.due_date_end));

  function save(updates: Record<string, unknown>) {
    updateProject.mutate({ id: project.id, updates: updates as never });
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md group/card"
      onClick={() => router.push(`/projetos/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-start gap-1.5">
            {/* Drag handle */}
            {dragListeners && (
              <button
                type="button"
                className="text-muted-foreground/30 hover:text-muted-foreground mt-0.5 shrink-0 cursor-grab opacity-0 group-hover/card:opacity-100 transition-opacity active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                {...dragListeners}
              >
                <IconGripVertical className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              {project.code && (
                <span className="text-muted-foreground mb-0.5 block text-[10px] font-mono uppercase tracking-wider">
                  {project.code}
                </span>
              )}
              {editable ? (
                <InlineText
                  value={project.name}
                  onSave={(v) => save({ name: v })}
                  className="line-clamp-2 text-sm font-medium leading-tight"
                />
              ) : (
                <CardTitle className="line-clamp-2 text-sm font-medium leading-tight">
                  {project.name}
                </CardTitle>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate({ projectId: project.id, isFavorite });
              }}
              className={cn(
                "opacity-0 group-hover/card:opacity-100 transition-opacity focus:outline-none",
                isFavorite && "opacity-100",
              )}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              {isFavorite ? (
                <IconStarFilled className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <IconStar className="h-3.5 w-3.5 text-muted-foreground hover:text-amber-500" />
              )}
            </button>
            {project.notion_url && (
              <a
                href={project.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Status */}
        {editable ? (
          <StatusBadgeSelect
            value={project.status ?? "em_andamento"}
            onSave={(v) => save({ status: v })}
          />
        ) : (
          status && (
            <Badge
              variant="secondary"
              className="text-xs gap-1"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </Badge>
          )
        )}

        {/* A07 — Health badge */}
        {healthConfig && (
          <Badge
            variant="secondary"
            className="text-[10px] gap-1"
            style={{ backgroundColor: healthConfig.bg, color: healthConfig.color }}
          >
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: healthConfig.color }}
            />
            {healthConfig.label}
          </Badge>
        )}

        {/* BU tags */}
        {editable ? (
          <BuEditor
            value={busList}
            onSave={(v) => save({ bus: JSON.stringify(v) })}
          />
        ) : (
          busList.length > 0 && (
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
                        ? {
                            backgroundColor: buColor.bg,
                            color: buColor.color,
                            borderColor: "transparent",
                          }
                        : undefined
                    }
                  >
                    {bu}
                  </Badge>
                );
              })}
            </div>
          )
        )}

        {/* Construtora + date footer */}
        <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
          {editable ? (
            <ConstrutoraCardSelect
              value={project.construtora && !/^[0-9a-f]{8}-/i.test(project.construtora) ? project.construtora : ""}
              onSave={(v) => save({ construtora: v })}
            />
          ) : (
            project.construtora && (
              <span className="truncate">{project.construtora}</span>
            )
          )}
          {project.due_date_end && (
            <div className={cn("flex shrink-0 items-center gap-1", projectOverdue && "text-red-600")}>
              <IconCalendar className="h-3 w-3" />
              <span>
                {format(new Date(project.due_date_end), "dd MMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
          {projectOverdue && (
            <Badge
              variant="secondary"
              className="h-4 shrink-0 px-1 text-[10px] font-medium bg-red-50 text-red-600 border-red-200 gap-0.5"
            >
              <IconAlertTriangle className="size-2.5" />
              Atrasado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
