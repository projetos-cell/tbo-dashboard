"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRsmIdea, useUpdateRsmIdea } from "@/hooks/use-rsm";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type RsmIdeaRow = Database["public"]["Tables"]["rsm_ideas"]["Row"];

const IDEA_CATEGORIES = [
  { value: "institucional", label: "Institucional" },
  { value: "produto", label: "Produto" },
  { value: "educativo", label: "Educativo" },
  { value: "engajamento", label: "Engajamento" },
  { value: "promocional", label: "Promocional" },
  { value: "bastidores", label: "Bastidores" },
  { value: "outro", label: "Outro" },
];

const IDEA_STATUSES = [
  { value: "nova", label: "Nova" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
  { value: "em_producao", label: "Em Produção" },
  { value: "publicada", label: "Publicada" },
];

interface RsmIdeaFormDialogProps {
  open: boolean;
  onClose: () => void;
  idea?: RsmIdeaRow | null;
}

export function RsmIdeaFormDialog({ open, onClose, idea }: RsmIdeaFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createIdea = useCreateRsmIdea();
  const updateIdea = useUpdateRsmIdea();
  const { toast } = useToast();

  const isEdit = !!idea;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("institucional");
  const [status, setStatus] = useState("nova");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (idea) {
        setTitle(idea.title ?? "");
        setDescription(idea.description ?? "");
        setCategory(idea.category ?? "institucional");
        setStatus(idea.status ?? "nova");
      } else {
        setTitle("");
        setDescription("");
        setCategory("institucional");
        setStatus("nova");
      }
      setErrors({});
    }
  }, [open, idea]);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Título é obrigatório";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (!tenantId) return;

    try {
      if (isEdit && idea) {
        await updateIdea.mutateAsync({
          id: idea.id,
          updates: {
            title: title.trim(),
            description: description.trim() || null,
            category,
            status,
          } as never,
        });
        toast({ title: "Ideia atualizada" });
      } else {
        await createIdea.mutateAsync({
          tenant_id: tenantId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          status,
        } as never);
        toast({ title: "Ideia criada" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar ideia", variant: "destructive" });
    }
  }

  const isPending = createIdea.isPending || updateIdea.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Ideia" : "Nova Ideia"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="idea-title">Título *</Label>
            <Input
              id="idea-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Ex: Post sobre processo criativo"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="idea-desc">Descrição</Label>
            <Textarea
              id="idea-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a ideia de conteúdo..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
