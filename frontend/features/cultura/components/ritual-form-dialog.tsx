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
import { FREQUENCY_LABELS } from "@/features/cultura/services/ritual-types";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

const ritualSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio").max(100),
  description: z.string().max(500).optional(),
  frequency: z.string().min(1),
  duration_minutes: z.number().min(5, "Minimo 5 minutos").max(480, "Maximo 8 horas"),
  default_agenda: z.string().max(2000).optional(),
});

export type RitualFormData = z.infer<typeof ritualSchema>;

type RitualFormErrors = Partial<Record<keyof RitualFormData, string>>;

const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS);

interface RitualFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: RitualTypeRow | null;
  onSave: (data: RitualFormData) => Promise<void>;
  isSaving: boolean;
}

export function RitualFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  isSaving,
}: RitualFormDialogProps) {
  const [formData, setFormData] = useState<RitualFormData>({
    name: "",
    description: "",
    frequency: "weekly",
    duration_minutes: 60,
    default_agenda: "",
  });
  const [errors, setErrors] = useState<RitualFormErrors>({});

  useEffect(() => {
    if (open) {
      if (editing) {
        setFormData({
          name: editing.name ?? "",
          description: editing.description ?? "",
          frequency: editing.frequency ?? "weekly",
          duration_minutes: editing.duration_minutes ?? 60,
          default_agenda: editing.default_agenda ?? "",
        });
      } else {
        setFormData({ name: "", description: "", frequency: "weekly", duration_minutes: 60, default_agenda: "" });
      }
      setErrors({});
    }
  }, [open, editing]);

  const handleSubmit = async () => {
    const result = ritualSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: RitualFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RitualFormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSave(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Ritual" : "Novo Ritual"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Ex: Daily Standup"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Descricao</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Para que serve este ritual?"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Frequencia</Label>
              <Select
                value={formData.frequency}
                onValueChange={(v) => setFormData((p) => ({ ...p, frequency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duracao (min)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, duration_minutes: parseInt(e.target.value) || 0 }));
                  setErrors((p) => ({ ...p, duration_minutes: undefined }));
                }}
                min={5}
                max={480}
                className={errors.duration_minutes ? "border-red-500" : ""}
              />
              {errors.duration_minutes && (
                <p className="text-xs text-red-500">{errors.duration_minutes}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Agenda padrao</Label>
            <Textarea
              value={formData.default_agenda}
              onChange={(e) => setFormData((p) => ({ ...p, default_agenda: e.target.value }))}
              placeholder="1. Check-in&#10;2. Atualizacoes&#10;3. Bloqueios&#10;4. Proximos passos"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
