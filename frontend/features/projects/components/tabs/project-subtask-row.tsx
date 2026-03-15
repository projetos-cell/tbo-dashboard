"use client";

import { IconCircleCheck, IconCircle, IconUser, IconCalendar, IconArrowUp, IconDotsVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectSubtaskRowProps {
  subtask: TaskRow;
  onSelect: (id: string) => void;
}

export function ProjectSubtaskRow({ subtask, onSelect }: ProjectSubtaskRowProps) {
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const done = !!subtask.is_completed;

  function toggleComplete() {
    updateTask.mutate({
      id: subtask.id,
      updates: {
        is_completed: !done,
        status: !done ? "concluida" : "pendente",
      },
    });
  }

  function promoteToTask() {
    updateTask.mutate(
      {
        id: subtask.id,
        updates: { parent_id: null },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
          queryClient.invalidateQueries({ queryKey: ["subtasks"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          toast({
            title: "Subtarefa promovida",
            description: `"${subtask.title}" agora é uma tarefa principal.`,
          });
        },
      },
    );
  }

  const overdue =
    !done && subtask.due_date && isPast(new Date(subtask.due_date)) && !isToday(new Date(subtask.due_date));

  return (
    <div
      className="group flex items-center gap-2 rounded-md py-1.5 pl-10 pr-3 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={() => onSelect(subtask.id)}
    >
      {/* Toggle */}
      <button
        type="button"
        className="shrink-0"
        onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
      >
        {done ? (
          <IconCircleCheck className="h-4 w-4 text-green-500" />
        ) : (
          <IconCircle className="text-muted-foreground/40 h-4 w-4" />
        )}
      </button>

      {/* Title */}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          done && "text-muted-foreground line-through",
        )}
      >
        {subtask.title}
      </span>

      {/* Assignee */}
      {subtask.assignee_name && (
        <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
          <IconUser className="h-3 w-3" />
          {subtask.assignee_name}
        </span>
      )}

      {/* Due date */}
      {subtask.due_date && (
        <span
          className={cn(
            "text-muted-foreground flex items-center gap-1 text-xs",
            overdue && "text-red-600",
          )}
        >
          <IconCalendar className="h-3 w-3" />
          {format(new Date(subtask.due_date), "dd MMM", { locale: ptBR })}
        </span>
      )}

      {/* T06 — Context menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded p-0.5 hover:bg-muted">
              <IconDotsVertical className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={promoteToTask} className="gap-2">
              <IconArrowUp className="size-3.5" />
              Tornar tarefa principal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
