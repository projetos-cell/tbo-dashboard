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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateKeyResult, useUpdateKeyResult } from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];

const METRIC_TYPES = [
  { value: "number", label: "Numero" },
  { value: "percentage", label: "Porcentagem" },
  { value: "currency", label: "Moeda" },
  { value: "boolean", label: "Sim/Nao" },
] as const;

interface OkrKeyResultDialogProps {
  open: boolean;
  onClose: () => void;
  objectiveId: string;
  keyResult?: KeyResultRow | null;
}

export function OkrKeyResultDialog({
  open,
  onClose,
  objectiveId,
  keyResult,
}: OkrKeyResultDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createKeyResult = useCreateKeyResult();
  const updateKeyResult = useUpdateKeyResult();
  const { toast } = useToast();

  const isEdit = !!keyResult;

  const [title, setTitle] = useState("");
  const [metricType, setMetricType] = useState("number");
  const [startValue, setStartValue] = useState("0");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("0");
  const [unit, setUnit] = useState("");
  const [weight, setWeight] = useState("1");
  const [titleError, setTitleError] = useState("");
  const [targetError, setTargetError] = useState("");

  useEffect(() => {
    if (open) {
      if (keyResult) {
        setTitle(keyResult.title ?? "");
        setMetricType(keyResult.metric_type ?? "number");
        setStartValue(String(keyResult.start_value ?? 0));
        setTargetValue(String(keyResult.target_value ?? ""));
        setCurrentValue(String(keyResult.current_value ?? 0));
        setUnit(keyResult.unit ?? "");
        // weight may not be in the Row type — read via any
        setWeight(String((keyResult as Record<string, unknown>).weight ?? 1));
      } else {
        setTitle("");
        setMetricType("number");
        setStartValue("0");
        setTargetValue("");
        setCurrentValue("0");
        setUnit("");
        setWeight("1");
      }
      setTitleError("");
      setTargetError("");
    }
  }, [open, keyResult]);

  async function handleSubmit() {
    let hasError = false;

    if (!title.trim()) {
      setTitleError("Titulo e obrigatorio");
      hasError = true;
    } else {
      setTitleError("");
    }

    const numTarget = parseFloat(targetValue);
    if (!targetValue.trim() || isNaN(numTarget)) {
      setTargetError("Meta e obrigatoria");
      hasError = true;
    } else {
      setTargetError("");
    }

    if (hasError || !tenantId) return;

    const numStart = parseFloat(startValue) || 0;
    const numCurrent = parseFloat(currentValue) || 0;
    const numWeight = Math.max(1, Math.min(10, parseInt(weight) || 1));

    try {
      if (isEdit && keyResult) {
        await updateKeyResult.mutateAsync({
          id: keyResult.id,
          updates: {
            title: title.trim(),
            metric_type: metricType,
            start_value: numStart,
            target_value: numTarget,
            current_value: numCurrent,
            unit: unit.trim() || null,
            weight: numWeight,
          } as never,
        });
        toast({ title: "Key Result atualizado" });
      } else {
        await createKeyResult.mutateAsync({
          tenant_id: tenantId,
          objective_id: objectiveId,
          title: title.trim(),
          metric_type: metricType,
          start_value: numStart,
          target_value: numTarget,
          current_value: numStart,
          unit: unit.trim() || null,
          weight: numWeight,
        } as never);
        toast({ title: "Key Result criado" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar Key Result", variant: "destructive" });
    }
  }

  const isPending = createKeyResult.isPending || updateKeyResult.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Key Result" : "Novo Key Result"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="kr-title">Titulo *</Label>
            <Input
              id="kr-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="Ex: Atingir 100 novos clientes"
            />
            {titleError && (
              <p className="text-xs text-red-600 mt-1">{titleError}</p>
            )}
          </div>

          {/* Metric Type */}
          <div>
            <Label htmlFor="kr-metric">Tipo de Metrica</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger id="kr-metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_TYPES.map((mt) => (
                  <SelectItem key={mt.value} value={mt.value}>
                    {mt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start / Target values */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="kr-start">Valor Inicial</Label>
              <Input
                id="kr-start"
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="kr-target">Meta *</Label>
              <Input
                id="kr-target"
                type="number"
                value={targetValue}
                onChange={(e) => {
                  setTargetValue(e.target.value);
                  if (targetError) setTargetError("");
                }}
                placeholder="100"
              />
              {targetError && (
                <p className="text-xs text-red-600 mt-1">{targetError}</p>
              )}
            </div>
          </div>

          {/* Current value — edit mode only */}
          {isEdit && (
            <div>
              <Label htmlFor="kr-current">Valor Atual</Label>
              <Input
                id="kr-current"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
              />
            </div>
          )}

          {/* Unit */}
          <div>
            <Label htmlFor="kr-unit">Unidade</Label>
            <Input
              id="kr-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ex: %, R$, pontos"
            />
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="kr-weight">Peso (1-10)</Label>
            <Input
              id="kr-weight"
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
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
