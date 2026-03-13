"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  FolderOpen,
  GitBranch,
  Link2,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEditable } from "@/components/ui/inline-editable";
import { UserSelector, type UserOption } from "@/components/ui/user-selector";
import { CommentThread } from "@/components/shared/comment-thread";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { CustomFieldRenderer } from "@/components/shared/custom-field-renderer";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import {
  useUpdateTask,
  useDeleteTask,
  useCreateTask,
  useSubtasks,
} from "@/features/tasks/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import {
  useTaskAssignees,
  useAddAssignee,
  useRemoveAssignee,
} from "@/features/tasks/hooks/use-task-assignees";
import { useTaskActivity } from "@/hooks/use-activity";
import {
  useFieldDefinitions,
  useFieldValues,
  useUpsertFieldValue,
} from "@/features/configuracoes/hooks/use-custom-fields";
import { useAttachments } from "@/hooks/use-attachments";
import { useAuthStore } from "@/stores/auth-store";
import { InlineDatePicker } from "./inline-date-picker";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { useMentionProvider } from "@/features/tasks/hooks/use-mention-provider";
import type { Database, Json } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Helpers ────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Props ──────────────────────────────────────────────────────

interface TaskDetailProps {
  task: TaskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: UserOption[];
  projectId?: string;
  projectName?: string;
}

// ─── Component ──────────────────────────────────────────────────

export function TaskDetail({
  task,
  open,
  onOpenChange,
  users = [],
  projectId,
  projectName,
}: TaskDetailProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const { toast } = useToast();
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

  const mentionProvider = useMentionProvider();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  const assigneeIds = (assignees || []).map((a) => a.user_id);

  // ─── Handlers ───────────────────────────────────────────

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

  const handleDescriptionChange = (html: string) => {
    const clean = html === "<p></p>" ? "" : html;
    if (clean !== (task.description || "")) {
      updateTask.mutate({ id: task.id, updates: { description: clean } });
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
        toast({ title: "Tarefa excluída" });
      },
      onError: () => {
        toast({
          title: "Erro ao excluir tarefa",
          description: "Tente novamente.",
          variant: "destructive",
        });
        setConfirmDelete(false);
      },
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?task=${task.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copiado!" });
    });
  };

  const handleAddSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (!title) {
      setAddingSubtask(false);
      return;
    }
    createTask.mutate(
      {
        title,
        parent_id: task.id,
        tenant_id: tenantId!,
        status: "pendente",
        priority: "media",
        project_id: task.project_id,
      } as never,
      {
        onSuccess: () => {
          setNewSubtaskTitle("");
          setAddingSubtask(false);
        },
        onError: () => {
          toast({
            title: "Erro ao criar subtarefa",
            description: "Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteTask.mutate(subtaskId, {
      onError: () => {
        toast({
          title: "Erro ao excluir subtarefa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  const getFieldValue = (defId: string) => {
    return fieldValues?.find((v) => v.definition_id === defId);
  };

  // Assignee name for display
  const assigneeName = task.assignee_name
    || users.find((u) => assigneeIds.includes(u.id))?.full_name
    || null;

  // Resolve project display name
  const resolvedProjectName = projectName || (task.project_id ? "Projeto vinculado" : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col"
      >
        {/* ── Top bar: Mark complete + actions ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <Button
            size="sm"
            variant={task.is_completed ? "default" : "outline"}
            className={`h-7 gap-1.5 text-xs font-medium ${
              task.is_completed
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }`}
            onClick={toggleComplete}
          >
            <Check className="h-3.5 w-3.5" />
            {task.is_completed ? "Concluída" : "Marcar como concluída"}
          </Button>

          <div className="flex items-center gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Copiar link"
              onClick={handleCopyLink}
            >
              <Link2 className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Mais opções">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copiar link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir tarefa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes da tarefa</SheetTitle>
          <SheetDescription>Painel lateral com detalhes da tarefa</SheetDescription>
        </SheetHeader>

        {/* ── Main scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6 space-y-0">
            {/* 1. Title */}
            <div className="py-3">
              <InlineEditable
                value={task.title}
                onSave={handleTitleSave}
                variant="h2"
                placeholder="Nome da tarefa..."
              />
            </div>

            {/* ── Property rows (Asana grid) ── */}
            <div className="divide-y divide-border/50">
              {/* 2. Assignee / Responsável */}
              <PropertyRow label="Responsável" icon={<Users className="h-3.5 w-3.5" />}>
                {assigneeName ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                        {getInitials(assigneeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assigneeName}</span>
                  </div>
                ) : (
                  <UserSelector
                    mode="multi"
                    selected={assigneeIds}
                    onChange={handleAssigneesChange}
                    users={users}
                    className="w-full"
                  />
                )}
              </PropertyRow>

              {/* 3. Status */}
              <PropertyRow label="Status">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleStatusChange(key)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        task.status === key
                          ? "text-white shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                      style={
                        task.status === key
                          ? { backgroundColor: cfg.color }
                          : undefined
                      }
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </PropertyRow>

              {/* 4. Priority / Prioridade */}
              <PropertyRow label="Prioridade">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(TASK_PRIORITY).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePriorityChange(key)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        task.priority === key
                          ? "text-white shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                      style={
                        task.priority === key
                          ? { backgroundColor: cfg.color }
                          : undefined
                      }
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </PropertyRow>

              {/* 5. Due date / Prazo */}
              <PropertyRow label="Prazo" icon={<Calendar className="h-3.5 w-3.5" />}>
                <InlineDatePicker
                  value={task.due_date ?? undefined}
                  overdue={!!overdue}
                  placeholder="Sem prazo"
                  onChange={(date) =>
                    handleDateChange(
                      "due_date",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </PropertyRow>

              {/* 6. Start date / Início */}
              <PropertyRow label="Início" icon={<Calendar className="h-3.5 w-3.5" />}>
                <InlineDatePicker
                  value={task.start_date ?? undefined}
                  placeholder="Sem data"
                  onChange={(date) =>
                    handleDateChange(
                      "start_date",
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </PropertyRow>

              {/* 7. Completed at / Concluída em */}
              {task.is_completed && task.completed_at && (
                <PropertyRow label="Concluída em" icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}>
                  <span className="text-sm text-green-700">
                    {format(new Date(task.completed_at), "dd MMM yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </PropertyRow>
              )}

              {/* 7. Project / Projeto */}
              <PropertyRow label="Projeto" icon={<FolderOpen className="h-3.5 w-3.5" />}>
                <span className={`text-sm ${resolvedProjectName ? "" : "text-muted-foreground"}`}>
                  {resolvedProjectName || "Adicionar a projetos"}
                </span>
              </PropertyRow>

              {/* 8. Dependencies / Dependências */}
              <PropertyRow label="Dependências" icon={<GitBranch className="h-3.5 w-3.5" />}>
                <span className="text-sm text-muted-foreground">
                  Adicionar dependências
                </span>
              </PropertyRow>

              {/* Custom fields */}
              {fieldDefs && fieldDefs.length > 0 && (
                <>
                  {fieldDefs.map((def) => {
                    const fv = getFieldValue(def.id);
                    return (
                      <div key={def.id} className="py-2.5">
                        <CustomFieldRenderer
                          definition={def}
                          value={fv || null}
                          onChange={(val) => handleFieldChange(def.id, val)}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* 9. Description / Descrição */}
            <div className="pt-4 pb-2">
              <RichTextEditor
                content={task.description || ""}
                onBlur={handleDescriptionChange}
                placeholder="Adicionar mais detalhes a esta tarefa..."
                mentionProvider={mentionProvider}
              />
            </div>

            {/* 10. Subtasks */}
            <div className="space-y-1">
              {subtasks && subtasks.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="group flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 shrink-0"
                        aria-label="Alternar subtarefa"
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
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <span
                        className={`flex-1 ${sub.is_completed ? "line-through opacity-60" : ""}`}
                      >
                        {sub.title}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                        aria-label="Excluir subtarefa"
                        onClick={() => handleDeleteSubtask(sub.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {addingSubtask ? (
                <div className="flex items-center gap-2 px-1 py-1">
                  <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    ref={subtaskInputRef}
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Nome da subtarefa..."
                    className="h-6 text-sm border-0 border-b rounded-none px-0 focus-visible:ring-0 shadow-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubtask();
                      if (e.key === "Escape") {
                        setAddingSubtask(false);
                        setNewSubtaskTitle("");
                      }
                    }}
                    onBlur={handleAddSubtask}
                    disabled={createTask.isPending}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                  onClick={() => {
                    setAddingSubtask(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar subtarefa
                </button>
              )}
            </div>

            <Separator className="my-4" />

            {/* 11. Activity feed / Histórico */}
            <div className="space-y-3">
              <ActivityFeed
                activities={activities || []}
                isLoading={false}
                emptyMessage="Nenhuma atividade"
              />
            </div>

            {/* 12. Comment input */}
            <div className="pt-4">
              <CommentThread taskId={task.id} />
            </div>
          </div>
        </div>

        {/* ── Footer: Collaborators + actions ── */}
        <div className="border-t px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Colaboradores</span>
            {(assignees || []).slice(0, 3).map((a) => {
              const u = users.find((usr) => usr.id === a.user_id);
              const name = u?.full_name || task.assignee_name || "?";
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
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Attachments count */}
            {attachments && attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {attachments.length}
              </span>
            )}

            {/* Timestamps */}
            <span className="text-[11px] text-muted-foreground">
              {task.created_at &&
                format(new Date(task.created_at), "dd MMM yyyy", { locale: ptBR })}
            </span>

            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 text-[10px] px-2"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setConfirmDelete(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-red-400 hover:text-red-600"
                onClick={() => setConfirmDelete(true)}
                aria-label="Excluir tarefa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Property Row (Asana-style key-value row) ──────────────────

function PropertyRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 min-h-[36px]">
      <div className="flex items-center gap-1.5 w-[120px] shrink-0">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
