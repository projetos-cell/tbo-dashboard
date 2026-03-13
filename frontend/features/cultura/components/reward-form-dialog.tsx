"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/types";

type RewardRow = Database["public"]["Tables"]["recognition_rewards"]["Row"];

const REWARD_TYPES = [
  { value: "gift", label: "Gift / Presente" },
  { value: "experience", label: "Experiencia" },
  { value: "benefit", label: "Beneficio" },
  { value: "time_off", label: "Folga / Day off" },
  { value: "other", label: "Outro" },
];

const rewardSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().min(1, "Descricao e obrigatoria"),
  points_required: z
    .number()
    .int("Pontos deve ser um numero inteiro")
    .min(1, "Pontos deve ser maior que 0"),
  type: z.string().min(1, "Tipo e obrigatorio"),
  value_brl: z.number().nullable().optional(),
});

export type RewardFormData = {
  name: string;
  description: string;
  points_required: number;
  type: string;
  value_brl: number | null;
  active: boolean;
};

interface RewardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward?: RewardRow | null;
  onSave: (data: RewardFormData) => Promise<void>;
  isSaving?: boolean;
}

export function RewardFormDialog({
  open,
  onOpenChange,
  reward,
  onSave,
  isSaving = false,
}: RewardFormDialogProps) {
  const isEditing = !!reward;

  const [name, setName] = useState(reward?.name ?? "");
  const [description, setDescription] = useState(reward?.description ?? "");
  const [pointsRequired, setPointsRequired] = useState(
    reward?.points_required != null ? String(reward.points_required) : ""
  );
  const [type, setType] = useState(reward?.type ?? "gift");
  const [valueBrl, setValueBrl] = useState(
    reward?.value_brl != null ? String(reward.value_brl) : ""
  );
  const [active, setActive] = useState(reward?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName(reward?.name ?? "");
      setDescription(reward?.description ?? "");
      setPointsRequired(
        reward?.points_required != null ? String(reward.points_required) : ""
      );
      setType(reward?.type ?? "gift");
      setValueBrl(reward?.value_brl != null ? String(reward.value_brl) : "");
      setActive(reward?.active ?? true);
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    const parsed = rewardSchema.safeParse({
      name: name.trim(),
      description: description.trim(),
      points_required: pointsRequired ? parseInt(pointsRequired, 10) : undefined,
      type,
      value_brl: valueBrl ? parseFloat(valueBrl) : null,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSave({
      name: parsed.data.name,
      description: parsed.data.description,
      points_required: parsed.data.points_required,
      type: parsed.data.type,
      value_brl: parsed.data.value_brl ?? null,
      active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Recompensa" : "Nova Recompensa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da recompensa do catalogo."
              : "Adicione uma nova recompensa ao catalogo Supabase."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reward-name">Nome</Label>
            <Input
              id="reward-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="Ex: Day Off Remunerado"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="reward-description">Descricao</Label>
            <Textarea
              id="reward-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Descreva o que o colaborador recebe..."
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Points required */}
            <div className="space-y-1.5">
              <Label htmlFor="reward-points">Pontos necessarios</Label>
              <Input
                id="reward-points"
                type="number"
                min={1}
                value={pointsRequired}
                onChange={(e) => {
                  setPointsRequired(e.target.value);
                  setErrors((p) => ({ ...p, points_required: "" }));
                }}
                placeholder="Ex: 25"
              />
              {errors.points_required && (
                <p className="text-xs text-red-500">{errors.points_required}</p>
              )}
            </div>

            {/* Value BRL */}
            <div className="space-y-1.5">
              <Label htmlFor="reward-value">Valor (R$) — opcional</Label>
              <Input
                id="reward-value"
                type="number"
                min={0}
                step={0.01}
                value={valueBrl}
                onChange={(e) => setValueBrl(e.target.value)}
                placeholder="Ex: 150.00"
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                {REWARD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Recompensa ativa</p>
              <p className="text-xs text-muted-foreground">
                Colaboradores podem resgatar recompensas ativas.
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving
              ? "Salvando..."
              : isEditing
                ? "Salvar alteracoes"
                : "Criar recompensa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
