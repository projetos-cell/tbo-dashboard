"use client";

import { useState } from "react";
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
import { useAuthStore } from "@/stores/auth-store";
import { useCreatePdiGoal, useUpdatePdiGoal } from "@/features/pdi/hooks/use-pdi";
import { useToast } from "@/hooks/use-toast";
import { GOAL_STATUS_KEYS, GOAL_STATUS } from "@/features/pdi/utils/pdi-utils";
import type { PdiGoalRow } from "@/features/pdi/services/pdi";

interface PersonSkill {
  id: string;
  skill_name: string;
  proficiency_level: number | null;
}

interface PdiGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdiId: string;
  editData?: PdiGoalRow | null;
  /** Available skills for the person (scorecard link) */
  personSkills?: PersonSkill[];
}

export function PdiGoalForm({ open, onOpenChange, pdiId, editData, personSkills = [] }: PdiGoalFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMutation = useCreatePdiGoal();
  const updateMutation = useUpdatePdiGoal();
  const { toast } = useToast();

  const [title, setTitle] = useState(editData?.title ?? "");
  const [description, setDescription] = useState(editData?.description ?? "");
  const [targetDate, setTargetDate] = useState(editData?.target_date ?? "");
  const [status, setStatus] = useState(editData?.status ?? "pending");
  const [skillId, setSkillId] = useState(editData?.skill_id ?? "");
  const [targetLevelPercent, setTargetLevelPercent] = useState<string>(
    editData?.target_level_percent?.toString() ?? ""
  );

  const isEdit = !!editData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleOpenChange(v: boolean) {
    if (!v) {
      setTitle(editData?.title ?? "");
      setDescription(editData?.description ?? "");
      setTargetDate(editData?.target_date ?? "");
      setStatus(editData?.status ?? "pending");
      setSkillId(editData?.skill_id ?? "");
      setTargetLevelPercent(editData?.target_level_percent?.toString() ?? "");
    }
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !tenantId) return;

    const parsedPercent = targetLevelPercent ? parseInt(targetLevelPercent, 10) : null;

    if (isEdit) {
      updateMutation.mutate(
        {
          id: editData.id,
          pdiId,
          updates: {
            title,
            description: description || null,
            target_date: targetDate || null,
            status,
            skill_id: skillId || null,
            target_level_percent: parsedPercent,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Meta atualizada" });
            handleOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        {
          tenant_id: tenantId,
          pdi_id: pdiId,
          title,
          description: description || null,
          target_date: targetDate || null,
          skill_id: skillId || null,
          target_level_percent: parsedPercent,
        },
        {
          onSuccess: () => {
            toast({ title: "Meta criada" });
            handleOpenChange(false);
          },
          onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Título</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Melhorar comunicação verbal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-description">Descrição (opcional)</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhe a meta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-target-date">Data alvo</Label>
              <Input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="goal-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="goal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_STATUS_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {GOAL_STATUS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Scorecard link */}
          {personSkills.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="goal-skill">Vincular a competência (Scorecard)</Label>
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger id="goal-skill">
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {personSkills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.skill_name}
                      {s.proficiency_level ? ` (Nível ${s.proficiency_level})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {skillId && (
            <div className="space-y-2">
              <Label htmlFor="goal-target-level">Meta de nível (%) (opcional)</Label>
              <Input
                id="goal-target-level"
                type="number"
                min={0}
                max={100}
                value={targetLevelPercent}
                onChange={(e) => setTargetLevelPercent(e.target.value)}
                placeholder="Ex: 80"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
