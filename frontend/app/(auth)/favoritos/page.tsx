"use client";

import { IconBookmark } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectFavoritesList } from "@/features/bookmarks/components/project-favorites-list";
import { TaskBookmarksList } from "@/features/bookmarks/components/task-bookmarks-list";
import { useProjectFavorites } from "@/features/projects/hooks/use-project-favorites";
import { useTaskBookmarkIds } from "@/features/bookmarks/hooks/use-task-bookmarks";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground tabular-nums">
      {count}
    </span>
  );
}

export default function FavoritosPage() {
  const { data: projectIds } = useProjectFavorites();
  const { data: taskIds } = useTaskBookmarkIds();

  const projectCount = projectIds?.length ?? 0;
  const taskCount = taskIds?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
          <IconBookmark className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            Seus projetos e tarefas salvos para acesso rápido
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projetos">
        <TabsList>
          <TabsTrigger value="projetos">
            Projetos
            <CountBadge count={projectCount} />
          </TabsTrigger>
          <TabsTrigger value="tarefas">
            Tarefas
            <CountBadge count={taskCount} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projetos">
          <ProjectFavoritesList />
        </TabsContent>

        <TabsContent value="tarefas">
          <TaskBookmarksList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
