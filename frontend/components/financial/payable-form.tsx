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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePayable,
  useVendors,
  useFinCategories,
  useCostCenters,
} from "@/hooks/use-financial";
import { useAuthStore } from "@/stores/auth-store";

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cartao_credito", label: "Cartao de Credito" },
  { value: "cartao_debito", label: "Cartao de Debito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cheque", label: "Cheque" },
] as const;

const payableSchema = z.object({
  description: z.string().min(1, "Descricao e obrigatoria"),
  amount: z
    .string()
    .min(1, "Valor e obrigatorio")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Valor deve ser positivo"
    ),
  due_date: z.string().min(1, "Vencimento e obrigatorio"),
  notes: z.string().optional(),
});

type PayableFormData = z.infer<typeof payableSchema>;

interface PayableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayableForm({ open, onOpenChange }: PayableFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const create = useCreatePayable();

  const { data: vendors = [] } = useVendors();
  const { data: categories = [] } = useFinCategories("despesa");
  const { data: costCenters = [] } = useCostCenters();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof PayableFormData, string>>
  >({});

  function reset() {
    setDescription("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setVendorId("");
    setCategoryId("");
    setCostCenterId("");
    setPaymentMethod("");
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = payableSchema.safeParse({
      description: description.trim(),
      amount,
      due_date: dueDate,
      notes: notes.trim(),
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PayableFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PayableFormData;
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
        vendor_id: vendorId || null,
        category_id: categoryId || null,
        cost_center_id: costCenterId || null,
        payment_method: paymentMethod || null,
      } as never,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pay-desc">Descricao *</Label>
            <Input
              id="pay-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Ex: Nota fiscal fornecedor"
              required
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Valor (R$) *</Label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                required
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-due">Vencimento *</Label>
              <Input
                id="pay-due"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setErrors((prev) => ({ ...prev, due_date: undefined }));
                }}
                required
              />
              {errors.due_date && (
                <p className="text-xs text-destructive">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Lookup selects */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select value={costCenterId} onValueChange={setCostCenterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-notes">Observacoes</Label>
            <Input
              id="pay-notes"
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
