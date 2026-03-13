"use client";

import { Link2, MoreHorizontal, Paperclip, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TASK_STATUS } from "@/lib/constants";
import { TaskStatusToggle } from "./task-status-toggle";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailHeaderProps {
  task: TaskRow;
}

export function TaskDetailHeader({ task }: TaskDetailHeaderProps) {
  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <TaskStatusToggle task={task} />

        {statusCfg && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Curtir">
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Anexar">
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Copiar link">
          <Link2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Mais opções">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
