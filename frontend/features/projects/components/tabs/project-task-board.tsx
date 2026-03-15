"use client";

import { useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import { TaskBoard } from "@/features/tasks/components/task-board";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectTaskBoardProps {
  projectId: string;
  onSelectTask: (taskId: string) => void;
}

export function ProjectTaskBoard({ projectId, onSelectTask }: ProjectTaskBoardProps) {
  const { parents, isLoading } = useProjectTasks(projectId);

  const handleSelect = useCallback(
    (task: TaskRow) => onSelectTask(task.id),
    [onSelectTask],
  );

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-[280px] shrink-0" />
        ))}
      </div>
    );
  }

  return <TaskBoard tasks={parents} onSelect={handleSelect} />;
}
