"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import {
  recurringRuleSchema,
  type RecurringRuleInput,
} from "@/features/financeiro/services/finance-schemas";
import {
  useCreateRecurringRule,
  useUpdateRecurringRule,
} from "@/features/financeiro/hooks/use-recurring-rules";
import type { RecurringRule } from "@/features/financeiro/services/finance-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: RecurringRule | null;
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function RecurringRuleForm({ open, onOpenChange, editingRule }: Props) {
  const { mutate: create, isPending: creating } = useCreateRecurringRule();
  const { mutate: update, isPending: updating } = useUpdateRecurringRule();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<RecurringRuleInput>({
    resolver: zodResolver(recurringRuleSchema) as any,
    defaultValues: {
      type: "despesa",
      description: "",
      amount: 0,
      day_of_month: 1,
      start_month: getCurrentMonth(),
      end_month: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (open && editingRule) {
      reset({
        type: editingRule.type,
        description: editingRule.description,
        amount: Number(editingRule.amount),
        category_id: editingRule.category_id,
        cost_center_id: editingRule.cost_center_id,
        counterpart: editingRule.counterpart,
        counterpart_doc: editingRule.counterpart_doc,
        payment_method: editingRule.payment_method,
        bank_account: editingRule.bank_account,
        business_unit: editingRule.business_unit as RecurringRuleInput["business_unit"],
        day_of_month: editingRule.day_of_month,
        start_month: editingRule.start_month,
        end_month: editingRule.end_month,
        notes: editingRule.notes,
      });
    } else if (open) {
      reset({
        type: "despesa",
        description: "",
        amount: 0,
        day_of_month: 1,
        start_month: getCurrentMonth(),
        end_month: null,
        notes: null,
      });
    }
  }, [open, editingRule, reset]);

  const typeValue = watch("type");

  function onSubmit(data: RecurringRuleInput) {
    if (editingRule) {
      update(
        { id: editingRule.id, updates: data },
        {
          onSuccess: () => { toast.success("Regra atualizada."); onOpenChange(false); },
          onError: (e) => toast.error(e.message),
        },
      );
    } else {
      create(data, {
        onSuccess: () => { toast.success("Regra criada."); onOpenChange(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingRule ? "Editar Regra" : "Nova Regra Recorrente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              value={typeValue}
              onValueChange={(v) => setValue("type", v as "receita" | "despesa")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input {...register("description")} placeholder="Ex: Google Workspace x17" />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Amount + Day */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0,00"
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Dia do mês</Label>
              <Input
                type="number"
                min={1}
                max={28}
                {...register("day_of_month", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Counterpart */}
          <div className="space-y-1.5">
            <Label>Fornecedor / Contraparte</Label>
            <Input {...register("counterpart")} placeholder="Nome do fornecedor (opcional)" />
          </div>

          {/* Start + End month */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início (YYYY-MM)</Label>
              <Input {...register("start_month")} placeholder="2026-01" />
              {errors.start_month && (
                <p className="text-xs text-red-500">{errors.start_month.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Fim (opcional)</Label>
              <Input {...register("end_month")} placeholder="Indefinido" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea {...register("notes")} rows={2} placeholder="Observações (opcional)" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : editingRule ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
