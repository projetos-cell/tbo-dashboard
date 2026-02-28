"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectTopbar } from "@/components/projects/project-topbar";
import { ProjectOverview } from "@/components/projects/tabs/project-overview";
import { ProjectGantt } from "@/components/projects/tabs/project-gantt";
import { ProjectFiles } from "@/components/projects/tabs/project-files";
import { ProjectActivityTab } from "@/components/projects/tabs/project-activity";
import { TaskList } from "@/components/tasks/task-list";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskDetail } from "@/components/tasks/task-detail";
import { useProject, useProjectStats } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useProfiles } from "@/hooks/use-people";
import { useUser } from "@/hooks/use-user";
import type { UserOption } from "@/components/ui/user-selector";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  useUser();
  const { data: project, isLoading, error } = useProject(id);
  const { data: stats, isLoading: statsLoading } = useProjectStats(id);
  const { data: profiles } = useProfiles();
  const { data: tasks } = useTasks({ project_id: id });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);

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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Projeto nao encontrado
        </p>
        <Link href="/projetos">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectTopbar project={project} users={users} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview
            projectId={id}
            stats={stats}
            statsLoading={statsLoading}
          />
        </TabsContent>

        <TabsContent value="list">
          {tasks && tasks.length > 0 ? (
            <TaskList tasks={tasks} onSelect={(t) => setSelectedTask(t)} />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhuma tarefa neste projeto.
            </div>
          )}
        </TabsContent>

        <TabsContent value="board">
          {tasks && tasks.length > 0 ? (
            <TaskBoard tasks={tasks} onSelect={(t) => setSelectedTask(t)} />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhuma tarefa neste projeto.
            </div>
          )}
        </TabsContent>

        <TabsContent value="gantt">
          <ProjectGantt projectId={id} />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFiles projectId={id} />
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityTab projectId={id} />
        </TabsContent>
      </Tabs>

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
        users={users}
        projectId={id}
      />
    </div>
  );
}
