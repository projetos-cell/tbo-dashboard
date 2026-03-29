"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useProjectTasks, useProjectSections, useProjectTaskStats } from "@/features/projects/hooks/use-project-tasks";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useReviewProjectsByProject } from "@/features/review/hooks/use-review-projects";
import { OverviewLeftColumn } from "./overview-left-column";
import { OverviewRightColumn } from "./overview-right-column";
import { OverviewKpiRow } from "./overview-kpi-row";
import type { MemberInfo } from "@/features/projects/components/member-avatar-stack";

interface ProjectOverviewProps {
  projectId: string;
  members?: MemberInfo[];
  onOpenMembers?: () => void;
}

export function ProjectOverview({ projectId, members = [], onOpenMembers }: ProjectOverviewProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: stats, isLoading: statsLoading } = useProjectTaskStats(projectId);
  const { allTasks, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const { data: profiles } = useProfiles();
  const { data: reviewProjects } = useReviewProjectsByProject(projectId);

  const isLoading = projectLoading || statsLoading || tasksLoading;

  const progressPercent = useMemo(() => {
    if (!stats || stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }, [stats]);

  const keyTasks = useMemo(() => {
    if (!allTasks) return { overdue: [], upcoming: [], inProgress: [] };
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekStr = weekAhead.toISOString().split("T")[0];

    const overdue = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date < nowStr
    );
    const upcoming = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date >= nowStr && t.due_date <= weekStr
    );
    const inProgress = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && (t.status === "em_andamento" || t.status === "revisao")
    );

    return { overdue, upcoming, inProgress };
  }, [allTasks]);

  const sectionProgress = useMemo(() => {
    if (!sections || !allTasks) return [];
    return sections.map((section) => {
      const sectionTasks = allTasks.filter((t) => t.section_id === section.id && !t.parent_id);
      const completed = sectionTasks.filter((t) => t.is_completed).length;
      const total = sectionTasks.length;
      return {
        ...section,
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [sections, allTasks]);

  const enrichedMembers = useMemo(() => {
    if (!profiles) return members.map((m) => ({ ...m, cargo: null as string | null }));
    return members.map((m) => {
      const profile = profiles.find((p) => p.id === m.id);
      return { ...m, cargo: (profile as Record<string, unknown>)?.cargo as string | null ?? null };
    });
  }, [members, profiles]);

  const recentActivity = useMemo(() => {
    const seen = new Set<string>();
    const all: Array<typeof keyTasks.overdue[number] & { _variant: "overdue" | "progress" | "upcoming" }> = [];
    for (const t of keyTasks.overdue) {
      if (!seen.has(t.id)) { seen.add(t.id); all.push({ ...t, _variant: "overdue" }); }
    }
    for (const t of keyTasks.inProgress) {
      if (!seen.has(t.id)) { seen.add(t.id); all.push({ ...t, _variant: "progress" }); }
    }
    for (const t of keyTasks.upcoming) {
      if (!seen.has(t.id)) { seen.add(t.id); all.push({ ...t, _variant: "upcoming" }); }
    }
    return all.slice(0, 8);
  }, [keyTasks]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewKpiRow stats={stats ?? null} progressPercent={progressPercent} />
      <div className="grid gap-6 md:grid-cols-2">
        <OverviewLeftColumn
          projectId={projectId}
          projectNotes={project?.notes ?? null}
          enrichedMembers={enrichedMembers}
          onOpenMembers={onOpenMembers}
        />
        <OverviewRightColumn
          projectId={projectId}
          project={project ? {
            status: project.status,
            notes: project.notes ?? null,
            due_date_start: project.due_date_start ?? null,
            due_date_end: project.due_date_end ?? null,
            name: project.name,
          } : null}
          stats={stats ?? null}
          progressPercent={progressPercent}
          sectionProgress={sectionProgress}
          recentActivity={recentActivity}
          reviewProjects={reviewProjects as Array<{ id: string; name: string; workflow_stage: string }> | undefined}
          allTasks={allTasks ?? null}
        />
      </div>
    </div>
  );
}
