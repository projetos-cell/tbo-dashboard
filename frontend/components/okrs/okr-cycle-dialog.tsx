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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateCycle, useUpdateCycle } from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];

interface OkrCycleDialogProps {
  open: boolean;
  onClose: () => void;
  cycle?: CycleRow | null;
}

export function OkrCycleDialog({ open, onClose, cycle }: OkrCycleDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createCycle = useCreateCycle();
  const updateCycle = useUpdateCycle();
  const { toast } = useToast();

  const isEdit = !!cycle;

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      if (cycle) {
        setName(cycle.name ?? "");
        setStartDate(cycle.start_date ? cycle.start_date.slice(0, 10) : "");
        setEndDate(cycle.end_date ? cycle.end_date.slice(0, 10) : "");
        setIsActive(cycle.is_active ?? false);
      } else {
        setName("");
        setStartDate("");
        setEndDate("");
        setIsActive(false);
      }
      setNameError("");
    }
  }, [open, cycle]);

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError("Nome e obrigatorio");
      return;
    }
    setNameError("");

    if (!tenantId) return;

    try {
      if (isEdit && cycle) {
        await updateCycle.mutateAsync({
          id: cycle.id,
          updates: {
            name: name.trim(),
            start_date: startDate || undefined,
            end_date: endDate || null,
            is_active: isActive,
          } as never,
        });
        toast({ title: "Ciclo atualizado" });
      } else {
        await createCycle.mutateAsync({
          tenant_id: tenantId,
          name: name.trim(),
          start_date: startDate || new Date().toISOString().slice(0, 10),
          end_date: endDate || null,
          is_active: isActive,
        } as never);
        toast({ title: "Ciclo criado" });
      }
      onClose();
    } catch {
      toast({ title: "Erro ao salvar ciclo", variant: "destructive" });
    }
  }

  const isPending = createCycle.isPending || updateCycle.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Ciclo" : "Novo Ciclo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="cycle-name">Nome *</Label>
            <Input
              id="cycle-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Ex: Q1 2026"
            />
            {nameError && (
              <p className="text-xs text-red-600 mt-1">{nameError}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cycle-start">Data Inicio</Label>
              <Input
                id="cycle-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cycle-end">Data Fim</Label>
              <Input
                id="cycle-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="cycle-active"
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
            />
            <Label htmlFor="cycle-active" className="cursor-pointer">
              Ciclo ativo
            </Label>
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
