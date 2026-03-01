"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useCreateTask } from "@/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  description: z.string().optional(),
  status: z.string().min(1),
  priority: z.string().min(1),
  assignee_name: z.string().optional(),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function TaskForm({ open, onOpenChange, projectId }: TaskFormProps) {
  const createTask = useCreateTask();
  const tenantId = useAuthStore((s) => s.tenantId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");
  const [priority, setPriority] = useState("media");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const reset = () => {
    setTitle("");
    setDescription("");
    setStatus("pendente");
    setPriority("media");
    setAssigneeName("");
    setDueDate("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = taskSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee_name: assigneeName.trim(),
      due_date: dueDate,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TaskFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TaskFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    createTask.mutate(
      {
        tenant_id: tenantId,
        title: result.data.title,
        description: result.data.description || null,
        status: result.data.status,
        priority: result.data.priority,
        assignee_name: result.data.assignee_name || null,
        due_date: result.data.due_date || null,
        project_id: projectId ?? "",
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os campos para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titulo *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
              placeholder="Ex: Revisar documentacao"
              required
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Descrição</Label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(TASK_STATUS).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridade</Label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(TASK_PRIORITY).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Responsável</Label>
              <Input
                id="task-assignee"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Prazo</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createTask.isPending || !title.trim()}>
              {createTask.isPending ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
