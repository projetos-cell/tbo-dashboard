"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskCollaboratorsList } from "./task-collaborators-list";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailSidebarProps {
  task: TaskRow;
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function TaskDetailSidebar({ task }: TaskDetailSidebarProps) {
  return (
    <div className="border-t px-5 py-3 space-y-3">
      {/* Collaborators */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">
          Colaboradores
        </span>
        <TaskCollaboratorsList taskId={task.id} />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span>Criado {relativeDate(task.created_at)}</span>
        <span>Atualizado {relativeDate(task.updated_at)}</span>
        {task.created_by && (
          <span className="truncate max-w-[120px]">
            por {task.created_by.slice(0, 8)}…
          </span>
        )}
      </div>
    </div>
  );
}
