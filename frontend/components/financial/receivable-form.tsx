"use client";

import { useState } from "react";
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
import { useCreateReceivable } from "@/hooks/use-financial";
import { useAuthStore } from "@/stores/auth-store";

const receivableSchema = z.object({
  description: z.string().min(1, "Descricao e obrigatoria"),
  amount: z.string().min(1, "Valor e obrigatorio").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Valor deve ser positivo"),
  due_date: z.string().min(1, "Vencimento e obrigatorio"),
  notes: z.string().optional(),
});

type ReceivableFormData = z.infer<typeof receivableSchema>;

interface ReceivableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceivableForm({ open, onOpenChange }: ReceivableFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const create = useCreateReceivable();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ReceivableFormData, string>>>({});

  function reset() {
    setDescription("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = receivableSchema.safeParse({
      description: description.trim(),
      amount,
      due_date: dueDate,
      notes: notes.trim(),
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ReceivableFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ReceivableFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    create.mutate(
      {
        tenant_id: tenantId,
        description: description.trim(),
        amount: parseFloat(amount),
        due_date: dueDate,
        status: "aberto",
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta a Receber</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rec-desc">Descricao *</Label>
            <Input
              id="rec-desc"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: undefined })); }}
              placeholder="Ex: Fatura projeto X"
              required
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rec-amount">Valor (R$) *</Label>
              <Input
                id="rec-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: undefined })); }}
                required
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-due">Vencimento *</Label>
              <Input
                id="rec-due"
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setErrors((prev) => ({ ...prev, due_date: undefined })); }}
                required
              />
              {errors.due_date && (
                <p className="text-xs text-destructive">{errors.due_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rec-notes">Observações</Label>
            <Input
              id="rec-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
