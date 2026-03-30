"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAuthStore } from "@/stores/auth-store";
import { useCreateHrEvent, useUpdateHrEvent } from "@/features/cultura/hooks/use-hr-calendar";
import { HR_CATEGORY_COLORS, type HrCalendarItem, type HrEventCategory } from "@/features/cultura/services/hr-calendar";

const hrEventSchema = z.object({
  title: z.string().min(1, "Titulo obrigatorio"),
  category: z.string().min(1, "Categoria obrigatoria"),
  start_date: z.string().min(1, "Data obrigatoria"),
  end_date: z.string().optional(),
  description: z.string().optional(),
  recurrence_rule: z.string().nullable(),
  visibility: z.string(),
});

type FormData = z.infer<typeof hrEventSchema>;

interface HrEventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent?: HrCalendarItem | null;
  defaultDate?: string;
}

const CATEGORIES: { value: HrEventCategory; label: string }[] = [
  { value: "feriado", label: "Feriado" },
  { value: "ciclo_gestao", label: "Ciclo de Gestao" },
  { value: "treinamento", label: "Treinamento" },
  { value: "evento", label: "Evento" },
  { value: "recesso", label: "Recesso" },
  { value: "data_comemorativa", label: "Data Comemorativa" },
];

export function HrEventForm({ open, onOpenChange, editingEvent, defaultDate }: HrEventFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const user = useAuthStore((s) => s.user);
  const createEvent = useCreateHrEvent();
  const updateEvent = useUpdateHrEvent();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("evento");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<string>("none");
  const [visibility, setVisibility] = useState<string>("all");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isEditing = !!editingEvent && !editingEvent.isComputed;

  useEffect(() => {
    if (editingEvent && !editingEvent.isComputed) {
      setTitle(editingEvent.title);
      setCategory(editingEvent.category);
      setStartDate(editingEvent.startDate);
      setEndDate(editingEvent.endDate ?? "");
      setDescription(editingEvent.description ?? "");
      setRecurrence(editingEvent.recurrenceRule === "FREQ=YEARLY" ? "yearly" : "none");
      setVisibility(editingEvent.visibility ?? "all");
    } else {
      setTitle("");
      setCategory("evento");
      setStartDate(defaultDate ?? "");
      setEndDate("");
      setDescription("");
      setRecurrence("none");
      setVisibility("all");
    }
    setErrors({});
  }, [editingEvent, defaultDate, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = hrEventSchema.safeParse({
      title: title.trim(),
      category,
      start_date: startDate,
      end_date: endDate || undefined,
      description: description.trim() || undefined,
      recurrence_rule: recurrence === "yearly" ? "FREQ=YEARLY" : null,
      visibility,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!tenantId) return;

    const payload = {
      tenant_id: tenantId,
      title: title.trim(),
      category,
      start_date: startDate,
      end_date: endDate || null,
      description: description.trim() || null,
      recurrence_rule: recurrence === "yearly" ? "FREQ=YEARLY" : null,
      visibility,
      is_all_day: true,
      created_by: user?.id ?? undefined,
    };

    const onSuccess = () => onOpenChange(false);

    if (isEditing) {
      const { tenant_id, created_by, ...updates } = payload;
      updateEvent.mutate(
        { id: editingEvent!.id, updates },
        { onSuccess },
      );
    } else {
      createEvent.mutate(payload, { onSuccess });
    }
  }

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento RH"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="hr-title">Titulo *</Label>
            <Input
              id="hr-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: undefined }));
              }}
              placeholder="Ex: Recesso de fim de ano"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: HR_CATEGORY_COLORS[c.value].text }}
                      />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hr-start">Data inicio *</Label>
              <Input
                id="hr-start"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((p) => ({ ...p, start_date: undefined }));
                }}
              />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr-end">Data fim</Label>
              <Input
                id="hr-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="hr-desc">Descricao</Label>
            <Textarea
              id="hr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
            />
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label>Recorrencia</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibilidade</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="leadership">Somente Lideranca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
