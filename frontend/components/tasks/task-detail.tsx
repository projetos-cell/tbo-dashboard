"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Flag,
  Trash2,
  CheckCircle2,
  Circle,
  ListTree,
  MessageSquare,
  History,
  Paperclip,
} from "lucide-react";
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
import { InlineEditable } from "@/components/ui/inline-editable";
import { UserSelector, type UserOption } from "@/components/ui/user-selector";
import { CommentThread } from "@/components/shared/comment-thread";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { CustomFieldRenderer } from "@/components/shared/custom-field-renderer";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import {
  useUpdateTask,
  useDeleteTask,
  useSubtasks,
} from "@/hooks/use-tasks";
import {
  useTaskAssignees,
  useAddAssignee,
  useRemoveAssignee,
} from "@/hooks/use-task-assignees";
import { useTaskActivity } from "@/hooks/use-activity";
import {
  useFieldDefinitions,
  useFieldValues,
  useUpsertFieldValue,
} from "@/hooks/use-custom-fields";
import { useAttachments } from "@/hooks/use-attachments";
import { useAuthStore } from "@/stores/auth-store";
import type { Database, Json } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskDetailProps {
  task: TaskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: UserOption[];
  projectId?: string;
}

export function TaskDetail({
  task,
  open,
  onOpenChange,
  users = [],
  projectId,
}: TaskDetailProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: subtasks } = useSubtasks(task?.id);
  const { data: assignees } = useTaskAssignees(task?.id || "");
  const addAssignee = useAddAssignee();
  const removeAssignee = useRemoveAssignee();
  const { data: activities } = useTaskActivity(task?.id || "");
  const { data: attachments } = useAttachments({ task_id: task?.id });
  const pId = projectId || task?.project_id || "";
  const { data: fieldDefs } = useFieldDefinitions(pId);
  const { data: fieldValues } = useFieldValues(task?.id || "");
  const upsertValue = useUpsertFieldValue();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bottomTab, setBottomTab] = useState<"comments" | "activity">(
    "comments"
  );

  if (!task) return null;

  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  const assigneeIds = (assignees || []).map((a) => a.user_id);

  const handleStatusChange = (status: string) => {
    updateTask.mutate({
      id: task.id,
      updates: {
        status,
        is_completed: status === "concluida",
        completed_at: status === "concluida" ? new Date().toISOString() : null,
      },
    });
  };

  const handleTitleSave = (title: string) => {
    updateTask.mutate({ id: task.id, updates: { title } });
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    if (description !== (task.description || "")) {
      updateTask.mutate({ id: task.id, updates: { description } });
    }
  };

  const handlePriorityChange = (priority: string) => {
    updateTask.mutate({ id: task.id, updates: { priority } });
  };

  const handleAssigneesChange = (selected: string[]) => {
    const current = new Set(assigneeIds);
    const next = new Set(selected);

    for (const uid of selected) {
      if (!current.has(uid)) {
        addAssignee.mutate({
          task_id: task.id,
          user_id: uid,
          tenant_id: tenantId!,
        });
      }
    }
    for (const uid of assigneeIds) {
      if (!next.has(uid)) {
        removeAssignee.mutate({ taskId: task.id, userId: uid });
      }
    }
  };

  const handleDateChange = (field: "start_date" | "due_date", value: string) => {
    updateTask.mutate({ id: task.id, updates: { [field]: value || null } });
  };

  const handleFieldChange = (definitionId: string, value: unknown) => {
    const def = fieldDefs?.find((d) => d.id === definitionId);
    if (!def) return;

    const payload: Database["public"]["Tables"]["custom_field_values"]["Insert"] =
      {
        definition_id: definitionId,
        task_id: task.id,
        tenant_id: tenantId!,
        value_text: null,
        value_number: null,
        value_date: null,
        value_json: null,
      };

    switch (def.field_type) {
      case "text":
      case "url":
        payload.value_text = value as string;
        break;
      case "number":
        payload.value_number = value as number;
        break;
      case "date":
        payload.value_date = value as string;
        break;
      case "checkbox":
        payload.value_json = { checked: value } as unknown as Json;
        break;
      case "select":
        payload.value_text = value as string;
        break;
      case "multi_select":
        payload.value_json = value as unknown as Json;
        break;
    }

    upsertValue.mutate(payload);
  };

  const toggleComplete = () => {
    handleStatusChange(task.is_completed ? "pendente" : "concluida");
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  const getFieldValue = (defId: string) => {
    return fieldValues?.find((v) => v.definition_id === defId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
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
            <SheetTitle className="flex-1">
              <InlineEditable
                value={task.title}
                onSave={handleTitleSave}
                variant="h2"
              />
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Detalhes da tarefa
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-0 min-h-[60vh]">
          {/* Left column — main content */}
          <div className="flex-1 px-6 py-4 space-y-5 border-r min-w-0">
            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Descricao
              </p>
              <textarea
                className="w-full min-h-[100px] text-sm bg-transparent border rounded-md p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={task.description || ""}
                placeholder="Adicionar descricao..."
                onBlur={handleDescriptionBlur}
              />
            </div>

            {/* Subtasks */}
            {subtasks && subtasks.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ListTree className="h-3.5 w-3.5" /> Subtarefas (
                  {subtasks.filter((s) => s.is_completed).length}/
                  {subtasks.length})
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
                              status: sub.is_completed
                                ? "pendente"
                                : "concluida",
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
            )}

            <Separator />

            {/* Comments / Activity tabs */}
            <div>
              <div className="flex gap-1 mb-3">
                <Button
                  size="sm"
                  variant={bottomTab === "comments" ? "secondary" : "ghost"}
                  className="h-7 text-xs"
                  onClick={() => setBottomTab("comments")}
                >
                  <MessageSquare className="size-3 mr-1" />
                  Comentarios
                </Button>
                <Button
                  size="sm"
                  variant={bottomTab === "activity" ? "secondary" : "ghost"}
                  className="h-7 text-xs"
                  onClick={() => setBottomTab("activity")}
                >
                  <History className="size-3 mr-1" />
                  Atividade
                </Button>
              </div>

              {bottomTab === "comments" ? (
                <CommentThread taskId={task.id} />
              ) : (
                <ActivityFeed
                  activities={activities || []}
                  isLoading={false}
                  emptyMessage="Nenhuma atividade"
                />
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-[220px] shrink-0 px-4 py-4 space-y-4 text-sm">
            {/* Status */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                  <Badge
                    key={key}
                    variant={task.status === key ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
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

            {/* Priority */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Flag className="h-3 w-3" /> Prioridade
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(TASK_PRIORITY).map(([key, cfg]) => (
                  <Badge
                    key={key}
                    variant={task.priority === key ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    style={
                      task.priority === key
                        ? { backgroundColor: cfg.color, color: "#fff" }
                        : undefined
                    }
                    onClick={() => handlePriorityChange(key)}
                  >
                    {cfg.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Responsaveis
              </p>
              <UserSelector
                mode="multi"
                selected={assigneeIds}
                onChange={handleAssigneesChange}
                users={users}
                className="w-full"
              />
            </div>

            {/* Dates */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Inicio
              </p>
              <input
                type="date"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent"
                value={task.start_date || ""}
                onChange={(e) =>
                  handleDateChange("start_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Prazo
              </p>
              <input
                type="date"
                className={`w-full text-xs border rounded px-2 py-1 bg-transparent ${
                  overdue ? "text-red-600 border-red-300" : ""
                }`}
                value={task.due_date || ""}
                onChange={(e) =>
                  handleDateChange("due_date", e.target.value)
                }
              />
            </div>

            {/* Custom fields */}
            {fieldDefs && fieldDefs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {fieldDefs.map((def) => {
                    const fv = getFieldValue(def.id);
                    return (
                      <CustomFieldRenderer
                        key={def.id}
                        definition={def}
                        value={fv || null}
                        onChange={(val) => handleFieldChange(def.id, val)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Attachments count */}
            {attachments && attachments.length > 0 && (
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Paperclip className="h-3 w-3" /> Anexos
                </p>
                <p className="text-xs">{attachments.length} arquivo(s)</p>
              </div>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <p>
                Criada{" "}
                {format(new Date(task.created_at ?? ""), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </p>
              {task.completed_at && (
                <p>
                  Concluida{" "}
                  {format(new Date(task.completed_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </div>

            {/* Delete */}
            <div>
              {confirmDelete ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-red-600">Excluir tarefa?</p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-xs"
                      onClick={handleDelete}
                      disabled={deleteTask.isPending}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
