"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";
import { ProjectTopbar } from "@/features/projects/components/project-topbar";
import { ProjectOverview } from "@/features/projects/components/tabs/project-overview";
import { ProjectTaskList } from "@/features/projects/components/tabs/project-task-list";
import { ProjectFiles } from "@/features/projects/components/tabs/project-files";
import { ProjectActivityTab } from "@/features/projects/components/tabs/project-activity";
import { TaskDetailSheet } from "@/features/tasks/components/task-detail-sheet";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useUser } from "@/hooks/use-user";
import type { UserOption } from "@/components/ui/user-selector";

// Heavy: frappe-gantt library — lazy load with SSR disabled
const ProjectGantt = dynamic(
  () =>
    import("@/features/projects/components/tabs/project-gantt").then((m) => ({
      default: m.ProjectGantt,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    ),
  },
);

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  useUser();
  const { data: project, isLoading, error, refetch } = useProject(id);
  const { data: profiles } = useProfiles();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Deep-link: ?task=<id> or ?demanda=<id> (backward compat)
  useEffect(() => {
    const taskId = searchParams.get("task") ?? searchParams.get("demanda");
    if (taskId) {
      setSelectedTaskId(taskId);
      if (activeTab === "overview") setActiveTab("list");
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleCloseTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const users: UserOption[] = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    email: p.email,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error?.message || "Projeto não encontrado"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProjectTopbar project={project} users={users} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview projectId={id} />
        </TabsContent>

        <TabsContent value="list">
          <ProjectTaskList
            projectId={id}
            onSelectTask={handleSelectTask}
            onAddTask={() => handleSelectTask("new")}
          />
        </TabsContent>

        <TabsContent value="gantt">
          <ProjectGantt projectId={id} onSelectTask={handleSelectTask} />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFiles projectId={id} />
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityTab projectId={id} />
        </TabsContent>
      </Tabs>

      {/* Task detail sheet */}
      <TaskDetailSheet
        taskId={selectedTaskId === "new" ? undefined : (selectedTaskId ?? undefined)}
        open={!!selectedTaskId && selectedTaskId !== "new"}
        onClose={handleCloseTask}
        projectName={project.name}
      />
    </div>
  );
}
