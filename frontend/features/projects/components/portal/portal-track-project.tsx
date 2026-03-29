"use client";

import { useMemo } from "react";
import { useProjectTasks, useProjectSections } from "@/features/projects/hooks/use-project-tasks";
import { useD3DFlowByProject } from "@/features/projects/d3d-pipeline/use-d3d-pipeline";
import { D3D_STAGE_CONFIGS } from "@/features/projects/d3d-pipeline/constants";
import { useProjectActivity } from "@/hooks/use-activity";
import {
  computeProjectHealth,
  PROJECT_HEALTH,
  BU_COLORS,
  BU_DEFAULT_PHASES,
  ACTIVITY_ACTIONS,
} from "@/lib/constants";
import { isPast, isToday, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PortalTrackStepper, type TrackPhase, type PhaseDetail } from "./portal-track-stepper";
import { PortalTrackTasks } from "./portal-track-tasks";
import { PortalTrackChecklist } from "./portal-track-checklist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconCheck, IconClock, IconFile, IconActivity } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { D3DStageState } from "@/features/projects/d3d-pipeline/types";

interface PortalTrackProjectProps {
  projectId: string;
  dueDate: string | null;
  bus?: string[] | null;
}

/** Generic phase derivation based on task progress */
function deriveGenericPhases(
  tasks: { is_completed: boolean | null; status: string }[],
): TrackPhase[] {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.is_completed).length;
  const pct = total > 0 ? completed / total : 0;

  return [
    { key: "briefing", label: "Briefing", status: pct > 0 ? "completed" : "in_progress" },
    { key: "producao", label: "Producao", status: pct >= 0.3 ? (pct >= 0.7 ? "completed" : "in_progress") : "pending" },
    { key: "revisao", label: "Revisao", status: pct >= 0.7 ? (pct >= 0.95 ? "completed" : "in_progress") : "pending" },
    { key: "entrega", label: "Entrega", status: pct >= 1 ? "completed" : "pending" },
  ];
}

/** Derive phase status from section tasks */
function deriveSectionPhases(
  sectionPhases: { key: string; label: string }[],
  sections: { id: string; title: string }[],
  tasks: { section_id: string | null; parent_id: string | null; is_completed: boolean | null; status: string }[],
): TrackPhase[] {
  return sectionPhases.map((phase, idx) => {
    const matchingSection = sections.find(
      (s) => s.title.toLowerCase().includes(phase.label.toLowerCase()) ||
             phase.label.toLowerCase().includes(s.title.toLowerCase()),
    );

    if (matchingSection) {
      const sectionTasks = tasks.filter(
        (t) => t.section_id === matchingSection.id && !t.parent_id,
      );
      const total = sectionTasks.length;
      const completed = sectionTasks.filter((t) => t.is_completed).length;
      const hasInProgress = sectionTasks.some((t) => t.status === "em_andamento");

      let status: TrackPhase["status"] = "pending";
      if (total > 0 && completed === total) status = "completed";
      else if (hasInProgress || completed > 0) status = "in_progress";

      return { key: phase.key, label: phase.label, status };
    }

    const parentTasks = tasks.filter((t) => !t.parent_id);
    const total = parentTasks.length;
    const completed = parentTasks.filter((t) => t.is_completed).length;
    const pct = total > 0 ? completed / total : 0;
    const phasePosition = sectionPhases.length > 1 ? idx / (sectionPhases.length - 1) : 0;

    let status: TrackPhase["status"] = "pending";
    if (pct > phasePosition + 0.1) status = "completed";
    else if (pct >= phasePosition - 0.1) status = "in_progress";

    return { key: phase.key, label: phase.label, status };
  });
}

export function PortalTrackProject({
  projectId,
  dueDate,
  bus,
}: PortalTrackProjectProps) {
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: sections = [] } = useProjectSections(projectId);
  const { data: d3dData } = useD3DFlowByProject(projectId);
  const { data: activities = [] } = useProjectActivity(projectId, 5);

  const projectBus = bus ?? [];

  // D3D phases
  const d3dPhases = useMemo<TrackPhase[]>(() => {
    if (!d3dData?.stages || d3dData.stages.length === 0) return [];
    return d3dData.stages
      .filter((s: D3DStageState) => s.stage_type === "phase")
      .sort((a: D3DStageState, b: D3DStageState) => a.sort_order - b.sort_order)
      .map((s: D3DStageState) => {
        const config = D3D_STAGE_CONFIGS.find((c) => c.key === s.stage_key);
        let status: TrackPhase["status"] = "pending";
        if (s.status === "completed" || s.status === "approved") status = "completed";
        else if (s.status === "in_progress") status = "in_progress";
        return { key: s.stage_key, label: config?.label ?? s.stage_key, status };
      });
  }, [d3dData]);

  // D3D phase details for popovers
  const d3dPhaseDetails = useMemo<Record<string, PhaseDetail>>(() => {
    if (!d3dData?.stages) return {};
    const details: Record<string, PhaseDetail> = {};
    for (const stage of d3dData.stages as D3DStageState[]) {
      if (stage.stage_type !== "phase") continue;
      const config = D3D_STAGE_CONFIGS.find((c) => c.key === stage.stage_key);
      // Count tasks in this phase's section (match by section title)
      const matchSection = sections.find(
        (s) => s.title.toLowerCase().includes(config?.label?.toLowerCase() ?? ""),
      );
      const phaseTasks = matchSection
        ? tasks.filter((t) => t.section_id === matchSection.id && !t.parent_id)
        : [];

      details[stage.stage_key] = {
        taskCount: phaseTasks.length,
        completedCount: phaseTasks.filter((t) => t.is_completed).length,
        estimatedDays: stage.estimated_days ?? config?.estimatedDaysNum ?? null,
        actualDays: stage.actual_days,
        owner: config?.owner ?? null,
      };
    }
    return details;
  }, [d3dData, sections, tasks]);

  // Section-based phase details for popovers
  const sectionPhaseDetails = useMemo<Record<string, PhaseDetail>>(() => {
    const details: Record<string, PhaseDetail> = {};
    for (const section of sections) {
      const sectionTasks = tasks.filter(
        (t) => t.section_id === section.id && !t.parent_id,
      );
      details[section.id] = {
        taskCount: sectionTasks.length,
        completedCount: sectionTasks.filter((t) => t.is_completed).length,
      };
    }
    return details;
  }, [sections, tasks]);

  // Build tracks
  const tracks = useMemo(() => {
    const parentTasks = tasks.filter((t) => !t.parent_id);

    if (projectBus.length > 1) {
      return projectBus.map((bu) => {
        if (bu === "Digital 3D" && d3dPhases.length > 0) {
          return { bu, phases: d3dPhases, details: d3dPhaseDetails };
        }
        const defaultPhases = BU_DEFAULT_PHASES[bu];
        if (defaultPhases) {
          return {
            bu,
            phases: deriveSectionPhases(defaultPhases, sections, tasks),
            details: sectionPhaseDetails,
          };
        }
        return { bu, phases: deriveGenericPhases(parentTasks), details: {} as Record<string, PhaseDetail> };
      });
    }

    if (projectBus.length === 1) {
      const bu = projectBus[0];
      if (bu === "Digital 3D" && d3dPhases.length > 0) {
        return [{ bu, phases: d3dPhases, details: d3dPhaseDetails }];
      }
      const defaultPhases = BU_DEFAULT_PHASES[bu];
      if (defaultPhases) {
        return [{ bu, phases: deriveSectionPhases(defaultPhases, sections, tasks), details: sectionPhaseDetails }];
      }
    }

    if (sections.length > 0) {
      const phases = sections.map((s) => {
        const sectionTasks = tasks.filter((t) => t.section_id === s.id && !t.parent_id);
        const total = sectionTasks.length;
        const completed = sectionTasks.filter((t) => t.is_completed).length;
        const hasInProgress = sectionTasks.some((t) => t.status === "em_andamento");
        let status: TrackPhase["status"] = "pending";
        if (total > 0 && completed === total) status = "completed";
        else if (hasInProgress || completed > 0) status = "in_progress";
        return { key: s.id, label: s.title, status };
      });
      return [{ bu: null, phases, details: sectionPhaseDetails }];
    }

    return [{ bu: null, phases: deriveGenericPhases(parentTasks), details: {} as Record<string, PhaseDetail> }];
  }, [projectBus, d3dPhases, d3dPhaseDetails, sectionPhaseDetails, sections, tasks]);

  // Stats
  const stats = useMemo(() => {
    const parentTasks = tasks.filter((t) => !t.parent_id);
    const total = parentTasks.length;
    const completed = parentTasks.filter((t) => t.is_completed).length;
    const overdue = parentTasks.filter(
      (t) =>
        !t.is_completed &&
        t.due_date &&
        isPast(new Date(t.due_date + "T23:59:59")) &&
        !isToday(new Date(t.due_date + "T00:00:00")),
    ).length;
    const inProgress = parentTasks.filter((t) => t.status === "em_andamento").length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const health = computeProjectHealth({ total, overdue });
    return { total, completed, overdue, inProgress, progressPct, health };
  }, [tasks]);

  const healthConf = PROJECT_HEALTH[stats.health];

  if (tasksLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Track steppers */}
      {tracks.map((track, i) => {
        const buColor = track.bu ? BU_COLORS[track.bu] : null;
        return (
          <div key={track.bu ?? `track-${i}`} className="space-y-1">
            {track.bu && tracks.length > 1 && (
              <div className="flex items-center gap-2 px-1">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={
                    buColor
                      ? { borderColor: buColor.color, color: buColor.color, backgroundColor: buColor.bg }
                      : undefined
                  }
                >
                  {track.bu}
                </Badge>
              </div>
            )}
            <PortalTrackStepper
              phases={track.phases}
              phaseDetails={track.details}
              healthLabel={healthConf.label}
              healthColor={healthConf.color}
              healthBg={healthConf.bg}
              dueDate={tracks.length <= 1 ? dueDate : null}
            />
          </div>
        );
      })}

      {/* Shared countdown when multiple BUs */}
      {tracks.length > 1 && dueDate && (
        <div className="flex justify-end">
          <Badge variant="outline" className="text-xs">
            {(() => {
              const days = Math.ceil(
                (new Date(dueDate + "T23:59:59").getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              );
              if (days < 0) return `${Math.abs(days)} dias atrasado`;
              if (days === 0) return "Entrega hoje";
              return `${days} dias para entrega`;
            })()}
          </Badge>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <MiniStat label="Total" value={stats.total} icon={IconFile} />
        <MiniStat label="Concluidas" value={stats.completed} icon={IconCheck} color="#22c55e" />
        <MiniStat label="Em Andamento" value={stats.inProgress} icon={IconClock} color="#3b82f6" />
        <MiniStat label="Atrasadas" value={stats.overdue} icon={IconClock} color="#ef4444" />
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-3">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.completed} de {stats.total} tarefas concluidas
            </span>
            <span className="font-semibold">{stats.progressPct}%</span>
          </div>
          <Progress value={stats.progressPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Grid: Tasks + Checklist + Timeline */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PortalTrackTasks
            tasks={tasks}
            sections={sections.map((s) => ({ id: s.id, title: s.title, color: s.color }))}
          />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <PortalTrackChecklist
            tasks={tasks}
            sections={sections.map((s) => ({ id: s.id, title: s.title }))}
          />
          {/* Recent Activity Timeline */}
          {activities.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconActivity className="size-4" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {activities.map((activity, idx) => {
                    const actionLabel =
                      ACTIVITY_ACTIONS[activity.action as keyof typeof ACTIVITY_ACTIONS] ??
                      activity.action;
                    const actorName =
                      (activity as Record<string, unknown>).actor &&
                      typeof (activity as Record<string, unknown>).actor === "object"
                        ? ((activity as Record<string, unknown>).actor as { full_name?: string })
                            ?.full_name
                        : null;

                    return (
                      <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {/* Timeline line */}
                        {idx < activities.length - 1 && (
                          <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
                        )}
                        {/* Dot */}
                        <div
                          className={cn(
                            "mt-1 size-[15px] shrink-0 rounded-full border-2",
                            activity.action === "completed"
                              ? "border-green-500 bg-green-500"
                              : activity.action === "created"
                                ? "border-blue-500 bg-blue-500"
                                : "border-muted-foreground/40 bg-muted-foreground/40",
                          )}
                        />
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            {actorName && (
                              <span className="font-medium">{actorName} </span>
                            )}
                            <span className="text-muted-foreground">{actionLabel}</span>
                            {activity.field_name && (
                              <span className="text-muted-foreground">
                                {" "}
                                {activity.field_name}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
      <Icon className="mx-auto mb-1 size-4 text-muted-foreground" />
      <p className="text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
