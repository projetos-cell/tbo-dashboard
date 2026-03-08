"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateDreSettings } from "@/hooks/use-finance";

interface DreSettingsModalProps {
  open: boolean;
  onClose: () => void;
  currentTaxRate: number;
}

export function DreSettingsModal({
  open,
  onClose,
  currentTaxRate,
}: DreSettingsModalProps) {
  const [taxRate, setTaxRate] = useState<string>(String(currentTaxRate));
  const { mutate, isPending } = useUpdateDreSettings();

  const handleSave = () => {
    const parsed = parseFloat(taxRate.replace(",", "."));
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
    mutate(parsed, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Configurar Alíquota de Impostos</DialogTitle>
          <DialogDescription>
            Define o percentual de impostos (ISS, COFINS, etc.) aplicado à Receita Bruta no DRE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tax-rate">Alíquota (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tax-rate"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Padrão: 15% (ISS + COFINS + PIS para serviços)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
