"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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
    <div className="border-t bg-muted/20 px-5 py-2.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Criado {relativeDate(task.created_at)}</span>
          <span className="text-border">|</span>
          <span>Atualizado {relativeDate(task.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}
