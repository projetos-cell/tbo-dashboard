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
import { useCreateBalanceSnapshot } from "@/hooks/use-financial";
import { useAuthStore } from "@/stores/auth-store";

interface BalanceSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BalanceSetupDialog({ open, onOpenChange }: BalanceSetupDialogProps) {
  const [balance, setBalance] = useState("");
  const [note, setNote] = useState("");
  const createSnapshot = useCreateBalanceSnapshot();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(balance.replace(/\./g, "").replace(",", "."));
    if (isNaN(value) || !tenantId) return;

    createSnapshot.mutate(
      {
        tenant_id: tenantId,
        balance: value,
        note: note || null,
        recorded_by: userId ?? null,
      } as never,
      {
        onSuccess: () => {
          setBalance("");
          setNote("");
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Saldo Inicial</DialogTitle>
          <DialogDescription>
            Informe o saldo atual das contas bancarias para calibrar o fluxo de caixa
            e os indicadores executivos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Saldo (R$)</Label>
            <Input
              id="balance"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 150000,00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observacao (opcional)</Label>
            <Input
              id="note"
              type="text"
              placeholder="Ex: Saldo consolidado Itau + Bradesco"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createSnapshot.isPending}>
              {createSnapshot.isPending ? "Salvando..." : "Salvar Saldo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
