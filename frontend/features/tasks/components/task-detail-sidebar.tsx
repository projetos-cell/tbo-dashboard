"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface Assignee {
  user_id: string;
  full_name?: string;
}

interface TaskDetailSidebarProps {
  task: TaskRow;
  assignees: Assignee[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function TaskDetailSidebar({ task, assignees }: TaskDetailSidebarProps) {
  return (
    <div className="border-t px-5 py-3 space-y-3">
      {/* Collaborators */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Colaboradores</span>
        <div className="flex items-center gap-1">
          {assignees.slice(0, 5).map((a) => {
            const name = a.full_name || "?";
            return (
              <Avatar key={a.user_id} className="h-5 w-5">
                <AvatarFallback className="text-[8px] font-semibold bg-gray-200 text-gray-600">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            );
          })}
          <button
            type="button"
            className="h-5 w-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            aria-label="Adicionar colaborador"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
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
