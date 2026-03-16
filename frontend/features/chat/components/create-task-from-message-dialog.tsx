"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { createTask } from "@/features/tasks/services/tasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { MessageRow } from "@/features/chat/services/chat";

const PRIORITY_OPTIONS = [
  { value: "none", label: "Sem prioridade" },
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

interface CreateTaskFromMessageDialogProps {
  message: MessageRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskFromMessageDialog({
  message,
  open,
  onOpenChange,
}: CreateTaskFromMessageDialogProps) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form whenever dialog opens with a new message
  useEffect(() => {
    if (open && message) {
      const rawContent = message.content ?? "";
      // Strip HTML tags for title pre-fill
      const textContent = rawContent.replace(/<[^>]+>/g, "").trim();
      setTitle(textContent.slice(0, 100));
      setDescription(rawContent);
      setPriority("none");
    }
  }, [open, message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !userId || !tenantId) return;

    setIsSubmitting(true);
    try {
      await createTask(supabase, {
        title: title.trim(),
        description: description.trim() || undefined,
        created_by: userId,
        status: "todo",
        priority: priority === "none" ? null : priority,
        tenant_id: tenantId,
      } as never);

      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada!", {
        description: `"${title.trim().slice(0, 50)}" adicionada às suas tarefas.`,
      });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao criar tarefa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar tarefa a partir da mensagem</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctfm-title">Título *</Label>
            <Input
              id="ctfm-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctfm-desc">Descrição</Label>
            <Textarea
              id="ctfm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto adicional (opcional)"
              rows={4}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctfm-priority">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="ctfm-priority">
                <SelectValue placeholder="Selecionar prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Criando..." : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
