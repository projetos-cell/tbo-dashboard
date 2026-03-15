"use client";

import { type ReactNode, useState, useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  IconCircleCheck,
  IconCircle,
  IconArrowRight,
  IconCalendarEvent,
  IconFlag,
  IconUserCircle,
  IconTrash,
  IconCopy,
  IconExternalLink,
  IconClipboard,
} from "@tabler/icons-react";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import { useUpdateTask, useDeleteTask } from "@/features/tasks/hooks/use-tasks";
import { useTeamMembers } from "@/hooks/use-team";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskContextMenuProps {
  task: TaskRow;
  children: ReactNode;
  onSelect?: (id: string) => void;
}

export function TaskContextMenu({ task, children, onSelect }: TaskContextMenuProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const { data: members } = useTeamMembers({ is_active: true });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const done = !!task.is_completed;

  function handleToggleComplete() {
    updateTask.mutate({
      id: task.id,
      updates: {
        is_completed: !done,
        status: !done ? "concluida" : "pendente",
      },
    });
  }

  function handleSetStatus(status: string) {
    updateTask.mutate({
      id: task.id,
      updates: { status, is_completed: status === "concluida" },
    });
  }

  function handleSetPriority(priority: string | null) {
    updateTask.mutate({
      id: task.id,
      updates: { priority },
    });
  }

  function handleSetAssignee(id: string | null, name: string | null) {
    updateTask.mutate({
      id: task.id,
      updates: { assignee_id: id, assignee_name: name },
    });
  }

  function handleSetDueDate(offset: "today" | "tomorrow" | "next_week" | "clear") {
    let date: string | null = null;
    const d = new Date();
    switch (offset) {
      case "today":
        date = d.toISOString().split("T")[0];
        break;
      case "tomorrow":
        d.setDate(d.getDate() + 1);
        date = d.toISOString().split("T")[0];
        break;
      case "next_week":
        d.setDate(d.getDate() + 7);
        date = d.toISOString().split("T")[0];
        break;
      case "clear":
        date = null;
        break;
    }
    updateTask.mutate({
      id: task.id,
      updates: { due_date: date },
    });
  }

  function handleCopyTitle() {
    navigator.clipboard.writeText(task.title ?? "");
    toast({ title: "Título copiado" });
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/projetos/${task.project_id}?task=${task.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado" });
  }

  function handleDeleteConfirm() {
    deleteTask.mutate(task.id);
  }

  const sortedMembers = useMemo(() => {
    return (members ?? []).slice(0, 10);
  }, [members]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {/* Open detail */}
          {onSelect && (
            <>
              <ContextMenuItem onClick={() => onSelect(task.id)} className="gap-2">
                <IconExternalLink className="size-4" />
                Abrir detalhes
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}

          {/* Toggle complete */}
          <ContextMenuItem onClick={handleToggleComplete} className="gap-2">
            {done ? (
              <>
                <IconCircle className="size-4" />
                Marcar como pendente
              </>
            ) : (
              <>
                <IconCircleCheck className="size-4 text-green-500" />
                Marcar como concluída
              </>
            )}
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Status submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2">
              <IconArrowRight className="size-4" />
              Alterar status
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-44">
              {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
                ([key, config]) => (
                  <ContextMenuItem
                    key={key}
                    onClick={() => handleSetStatus(key)}
                    className="gap-2"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                    {key === task.status && (
                      <span className="ml-auto text-xs text-muted-foreground">atual</span>
                    )}
                  </ContextMenuItem>
                ),
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Priority submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2">
              <IconFlag className="size-4" />
              Prioridade
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-40">
              <ContextMenuItem onClick={() => handleSetPriority(null)} className="gap-2 text-muted-foreground">
                Nenhuma
              </ContextMenuItem>
              {(Object.entries(TASK_PRIORITY) as [TaskPriorityKey, (typeof TASK_PRIORITY)[TaskPriorityKey]][]).map(
                ([key, config]) => (
                  <ContextMenuItem
                    key={key}
                    onClick={() => handleSetPriority(key)}
                    className="gap-2"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                    {key === task.priority && (
                      <span className="ml-auto text-xs text-muted-foreground">atual</span>
                    )}
                  </ContextMenuItem>
                ),
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Assignee submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2">
              <IconUserCircle className="size-4" />
              Responsável
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 max-h-60 overflow-y-auto">
              <ContextMenuItem
                onClick={() => handleSetAssignee(null, null)}
                className="gap-2 text-muted-foreground"
              >
                Remover responsável
              </ContextMenuItem>
              {sortedMembers.map((m) => (
                <ContextMenuItem
                  key={m.id}
                  onClick={() => handleSetAssignee(m.id, m.full_name)}
                  className="gap-2"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                    {m.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="truncate">{m.full_name}</span>
                  {m.id === task.assignee_id && (
                    <span className="ml-auto text-xs text-muted-foreground">atual</span>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Due date submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="gap-2">
              <IconCalendarEvent className="size-4" />
              Prazo
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-40">
              <ContextMenuItem onClick={() => handleSetDueDate("today")} className="gap-2">
                Hoje
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleSetDueDate("tomorrow")} className="gap-2">
                Amanhã
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleSetDueDate("next_week")} className="gap-2">
                Próxima semana
              </ContextMenuItem>
              {task.due_date && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleSetDueDate("clear")}
                    className="gap-2 text-muted-foreground"
                  >
                    Remover prazo
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          {/* Copy actions */}
          <ContextMenuItem onClick={handleCopyTitle} className="gap-2">
            <IconClipboard className="size-4" />
            Copiar título
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyLink} className="gap-2">
            <IconCopy className="size-4" />
            Copiar link
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Delete */}
          <ContextMenuItem
            onClick={() => setDeleteOpen(true)}
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <IconTrash className="size-4" />
            Excluir tarefa
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir tarefa"
        description={`Excluir "${task.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
