"use client";

import { Switch } from "@/components/ui/switch";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export function TaskMilestoneToggle({ task }: { task: TaskRow }) {
  const updateTask = useUpdateTask();
  const isMilestone = !!(task as Record<string, unknown>).is_milestone;

  function handleToggle(checked: boolean) {
    updateTask.mutate({
      id: task.id,
      updates: { is_milestone: checked } as never,
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isMilestone}
        onCheckedChange={handleToggle}
        className="h-4 w-7"
      />
      <span className="text-xs text-muted-foreground">
        {isMilestone ? "Marco ativo" : "Não é marco"}
      </span>
    </div>
  );
}
