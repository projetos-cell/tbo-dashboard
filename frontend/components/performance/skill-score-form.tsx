"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SCORECARD_SKILLS } from "@/lib/performance-constants";
import { useSkillScores, useUpsertSkillScores, useGenerateSnapshot } from "@/hooks/use-performance";
import { currentPeriod } from "@/lib/performance-constants";
import { Save, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Skill Score Form — Dialog for evaluating skills
// ---------------------------------------------------------------------------

interface SkillScoreFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string;
  period?: string;
}

interface SkillFormData {
  skill_id: string;
  level_percentage: number;
  expected_level: number;
  notes: string;
}

export function SkillScoreForm({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  period,
}: SkillScoreFormProps) {
  const p = period ?? currentPeriod();
  const { toast } = useToast();

  const { data: existingScores } = useSkillScores(employeeId ?? undefined, p);
  const upsertMutation = useUpsertSkillScores();
  const snapshotMutation = useGenerateSnapshot();

  const [formData, setFormData] = useState<SkillFormData[]>([]);

  // Initialize form data from existing scores or defaults
  useEffect(() => {
    const scoreMap = new Map(
      (existingScores ?? []).map((s) => [s.skill_id, s])
    );

    const initial = SCORECARD_SKILLS.map((skill) => {
      const existing = scoreMap.get(skill.id);
      return {
        skill_id: skill.id,
        level_percentage: existing?.level_percentage ?? 50,
        expected_level: existing?.expected_level ?? 70,
        notes: existing?.notes ?? "",
      };
    });

    setFormData(initial);
  }, [existingScores]);

  function updateSkill(index: number, updates: Partial<SkillFormData>) {
    setFormData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  }

  async function handleSave() {
    if (!employeeId) return;

    try {
      await upsertMutation.mutateAsync({
        employeeId,
        scores: formData.map((s) => ({
          skill_id: s.skill_id,
          level_percentage: s.level_percentage,
          expected_level: s.expected_level,
          period: p,
          notes: s.notes || undefined,
        })),
      });

      // Generate updated snapshot
      await snapshotMutation.mutateAsync({ employeeId, period: p });

      toast({
        title: "Skills atualizadas",
        description: `Avaliacao de ${employeeName} salva com sucesso.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  }

  const isSaving = upsertMutation.isPending || snapshotMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Avaliar Skills — {employeeName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Periodo: {p}
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {formData.map((item, index) => {
            const skill = SCORECARD_SKILLS.find((s) => s.id === item.skill_id);
            if (!skill) return null;

            const gap = item.level_percentage - item.expected_level;

            return (
              <div
                key={item.skill_id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {skill.category === "technical" ? "Tecnica" : "Comportamental"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        gap >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      Gap: {gap > 0 ? "+" : ""}
                      {gap}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">
                      Nivel Atual: <span className="font-bold">{item.level_percentage}%</span>
                    </Label>
                  </div>
                  <Slider
                    value={[item.level_percentage]}
                    onValueChange={([val]) =>
                      updateSkill(index, { level_percentage: val })
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">
                      Nivel Esperado: <span className="font-bold">{item.expected_level}%</span>
                    </Label>
                  </div>
                  <Slider
                    value={[item.expected_level]}
                    onValueChange={([val]) =>
                      updateSkill(index, { expected_level: val })
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Textarea
                  placeholder="Observacoes (opcional)"
                  value={item.notes}
                  onChange={(e) => updateSkill(index, { notes: e.target.value })}
                  rows={2}
                  className="text-xs"
                />
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Salvar Avaliacao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
