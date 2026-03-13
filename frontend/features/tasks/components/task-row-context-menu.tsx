"use client";

import { useCallback, useState } from "react";
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
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask, useDeleteTask } from "@/features/tasks/hooks/use-tasks";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import {
  IconPencil,
  IconCopy,
  IconTrash,
  IconCircleCheck,
  IconRefresh,
  IconCalendar,
  IconCircle,
} from "@tabler/icons-react";
import { InlineDatePicker } from "./inline-date-picker";

interface TaskRowContextMenuProps {
  task: MyTaskWithSection;
  onOpenDetail?: () => void;
  children: React.ReactNode;
}

export function TaskRowContextMenu({
  task,
  onOpenDetail,
  children,
}: TaskRowContextMenuProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleStatusChange = useCallback(
    (status: string) => {
      updateTask.mutate({
        id: task.id,
        updates: { status, is_completed: status === "concluida" },
      });
    },
    [updateTask, task.id]
  );

  const handlePriorityChange = useCallback(
    (priority: string) => {
      updateTask.mutate({
        id: task.id,
        updates: { priority },
      });
    },
    [updateTask, task.id]
  );

  const handleToggleComplete = useCallback(() => {
    updateTask.mutate({
      id: task.id,
      updates: {
        status: task.is_completed ? "pendente" : "concluida",
        is_completed: !task.is_completed,
        completed_at: task.is_completed ? null : new Date().toISOString(),
      },
    });
  }, [updateTask, task.id, task.is_completed]);

  const handleDelete = useCallback(() => {
    deleteTask.mutate(task.id);
  }, [deleteTask, task.id]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      updateTask.mutate({
        id: task.id,
        updates: {
          due_date: date ? date.toISOString().split("T")[0] : null,
        },
      });
      setDatePickerOpen(false);
    },
    [updateTask, task.id]
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={onOpenDetail}>
            <IconPencil className="mr-2 h-4 w-4" />
            Abrir detalhes
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Status submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconCircle className="mr-2 h-4 w-4" />
              Status
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                <ContextMenuItem
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className="gap-2"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                  {task.status === key && (
                    <IconCircleCheck className="ml-auto h-3.5 w-3.5 text-primary" />
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Priority submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconCircle className="mr-2 h-4 w-4" />
              Prioridade
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {Object.entries(TASK_PRIORITY).map(([key, cfg]) => (
                <ContextMenuItem
                  key={key}
                  onClick={() => handlePriorityChange(key)}
                  className="gap-2"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                  {task.priority === key && (
                    <IconCircleCheck className="ml-auto h-3.5 w-3.5 text-primary" />
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Date picker trigger */}
          <ContextMenuItem onClick={() => setDatePickerOpen(true)}>
            <IconCalendar className="mr-2 h-4 w-4" />
            Definir prazo
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleToggleComplete}>
            {task.is_completed ? (
              <>
                <IconRefresh className="mr-2 h-4 w-4" />
                Reabrir tarefa
              </>
            ) : (
              <>
                <IconCircleCheck className="mr-2 h-4 w-4" />
                Marcar como concluída
              </>
            )}
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onOpenDetail?.()}>
            <IconCopy className="mr-2 h-4 w-4" />
            Duplicar
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Excluir
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Standalone date picker (opened from context menu) */}
      <InlineDatePicker
        value={task.due_date ?? undefined}
        onChange={handleDateSelect}
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        triggerless
      />
    </>
  );
}
