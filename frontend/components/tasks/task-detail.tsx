"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask, useDeleteTask, useSubtasks } from "@/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  User,
  Flag,
  Trash2,
  CheckCircle2,
  Circle,
  ListTree,
} from "lucide-react";
import { useState } from "react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailProps {
  task: TaskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetail({ task, open, onOpenChange }: TaskDetailProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: subtasks } = useSubtasks(task?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  const handleStatusChange = (status: string) => {
    updateTask.mutate({ id: task.id, updates: { status } });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  const toggleComplete = () => {
    updateTask.mutate({
      id: task.id,
      updates: {
        status: task.is_completed ? "pendente" : "concluida",
        is_completed: !task.is_completed,
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="mt-0.5 h-6 w-6 shrink-0"
              onClick={toggleComplete}
            >
              {task.is_completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <SheetTitle
              className={task.is_completed ? "line-through opacity-60" : ""}
            >
              {task.title}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Detalhes da tarefa
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {/* Status */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                <Badge
                  key={key}
                  variant={task.status === key ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  style={
                    task.status === key
                      ? { backgroundColor: cfg.color, color: "#fff" }
                      : undefined
                  }
                  onClick={() => handleStatusChange(key)}
                >
                  {cfg.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Flag className="h-3.5 w-3.5" /> Prioridade
              </p>
              {priCfg ? (
                <span className="font-medium" style={{ color: priCfg.color }}>
                  {priCfg.label}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" /> Responsável
              </p>
              <span>{task.assignee_name ?? "—"}</span>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Início
              </p>
              <span>
                {task.start_date
                  ? format(new Date(task.start_date + "T12:00:00"), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "—"}
              </span>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Prazo
              </p>
              <span
                className={overdue ? "font-medium text-red-600" : ""}
              >
                {task.due_date
                  ? format(new Date(task.due_date + "T12:00:00"), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "—"}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Descrição
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {task.description}
                </p>
              </div>
            </>
          )}

          {/* Subtasks */}
          {subtasks && subtasks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ListTree className="h-3.5 w-3.5" /> Subtarefas (
                  {subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
                </p>
                <div className="space-y-1">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 shrink-0"
                        onClick={() =>
                          updateTask.mutate({
                            id: sub.id,
                            updates: {
                              status: sub.is_completed ? "pendente" : "concluida",
                              is_completed: !sub.is_completed,
                            },
                          })
                        }
                      >
                        {sub.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <span
                        className={
                          sub.is_completed ? "line-through opacity-60" : ""
                        }
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>
              Criada em{" "}
              {format(new Date(task.created_at), "dd MMM yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
            {task.completed_at && (
              <p>
                Concluída em{" "}
                {format(new Date(task.completed_at), "dd MMM yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            )}
          </div>

          {/* Delete */}
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-red-600">Excluir esta tarefa?</p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Excluir tarefa
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
