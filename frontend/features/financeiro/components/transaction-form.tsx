"use client";

import { useEffect, useCallback, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/features/financeiro/services/finance-schemas";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useFinanceCategories,
  useFinanceCostCenters,
} from "@/features/financeiro/hooks/use-finance";
import type { FinanceTransaction } from "@/features/financeiro/services/finance-types";
import { autoCategorize, type AutoCategorizeResult } from "@/features/financeiro/services/auto-categorize";

const BU_OPTIONS = [
  "Branding",
  "Digital 3D",
  "Marketing",
  "Audiovisual",
  "Interiores",
] as const;

const STATUS_OPTIONS = [
  { value: "previsto", label: "Previsto" },
  { value: "provisionado", label: "Provisionado" },
  { value: "pago", label: "Pago" },
  { value: "liquidado", label: "Liquidado" },
  { value: "parcial", label: "Parcial" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

const PAYMENT_METHODS = [
  "PIX",
  "Boleto",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
  "Dinheiro",
  "Cheque",
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction: FinanceTransaction | null;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function TransactionForm({
  open,
  onOpenChange,
  editingTransaction,
}: Props) {
  const { mutate: create, isPending: creating } = useCreateTransaction();
  const { mutate: update, isPending: updating } = useUpdateTransaction();
  const { data: categories = [] } = useFinanceCategories();
  const { data: costCenters = [] } = useFinanceCostCenters();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      type: "despesa",
      status: "previsto",
      description: "",
      amount: 0,
      paid_amount: 0,
      date: todayStr(),
      due_date: null,
      paid_date: null,
      category_id: null,
      cost_center_id: null,
      counterpart: null,
      payment_method: null,
      business_unit: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (open && editingTransaction) {
      reset({
        type: editingTransaction.type,
        status: editingTransaction.status,
        description: editingTransaction.description,
        amount: Number(editingTransaction.amount),
        paid_amount: Number(editingTransaction.paid_amount),
        date: editingTransaction.date,
        due_date: editingTransaction.due_date,
        paid_date: editingTransaction.paid_date,
        category_id: editingTransaction.category_id,
        cost_center_id: editingTransaction.cost_center_id,
        project_id: editingTransaction.project_id,
        counterpart: editingTransaction.counterpart,
        counterpart_doc: editingTransaction.counterpart_doc,
        payment_method: editingTransaction.payment_method,
        bank_account: editingTransaction.bank_account,
        business_unit: editingTransaction.business_unit as CreateTransactionInput["business_unit"],
        tags: editingTransaction.tags ?? [],
        notes: editingTransaction.notes,
        contract_id: editingTransaction.contract_id,
      });
    } else if (open) {
      reset({
        type: "despesa",
        status: "previsto",
        description: "",
        amount: 0,
        paid_amount: 0,
        date: todayStr(),
        due_date: null,
        paid_date: null,
        category_id: null,
        cost_center_id: null,
        counterpart: null,
        payment_method: null,
        business_unit: null,
        notes: null,
      });
    }
  }, [open, editingTransaction, reset]);

  const typeValue = watch("type");
  const statusValue = watch("status");
  const descriptionValue = watch("description");
  const counterpartValue = watch("counterpart");
  const buValue = watch("business_unit");
  const categoryValue = watch("category_id");
  const costCenterValue = watch("cost_center_id");

  const filteredCategories = categories.filter(
    (c) => c.type === typeValue || typeValue === "transferencia"
  );

  // ── Auto-categorization ─────────────────────────────────────────────────
  const [suggestion, setSuggestion] = useState<AutoCategorizeResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAutoCategorize = useCallback(() => {
    if (!descriptionValue?.trim() || editingTransaction) {
      setSuggestion(null);
      return;
    }

    const result = autoCategorize(
      descriptionValue,
      typeValue,
      counterpartValue ?? null,
      buValue ?? null,
      categories,
      costCenters
    );

    // Only show suggestion if there's something new to suggest
    if (result) {
      const hasCategorySuggestion = result.category_id && !categoryValue;
      const hasCCSuggestion = result.cost_center_id && !costCenterValue;
      if (hasCategorySuggestion || hasCCSuggestion) {
        setSuggestion(result);
        setDismissed(false);
        return;
      }
    }
    setSuggestion(null);
  }, [descriptionValue, typeValue, counterpartValue, buValue, categoryValue, costCenterValue, categories, costCenters, editingTransaction]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runAutoCategorize, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runAutoCategorize]);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    if (suggestion.category_id && !categoryValue) {
      setValue("category_id", suggestion.category_id);
    }
    if (suggestion.cost_center_id && !costCenterValue) {
      setValue("cost_center_id", suggestion.cost_center_id);
    }
    setSuggestion(null);
    toast.success("Categorização aplicada automaticamente.");
  }, [suggestion, categoryValue, costCenterValue, setValue]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null);
    setDismissed(true);
  }, []);

  function onSubmit(data: CreateTransactionInput) {
    if (editingTransaction) {
      update(
        { id: editingTransaction.id, updates: data },
        {
          onSuccess: () => {
            toast.success("Transação atualizada.");
            onOpenChange(false);
          },
          onError: (e) => toast.error(e.message),
        }
      );
    } else {
      create(data, {
        onSuccess: () => {
          toast.success("Transação criada.");
          onOpenChange(false);
        },
        onError: (e) => toast.error(e.message),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={typeValue}
                onValueChange={(v) =>
                  setValue(
                    "type",
                    v as "receita" | "despesa" | "transferencia"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(v) =>
                  setValue("status", v as CreateTransactionInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              {...register("description")}
              placeholder="Ex: Fatura Google Ads março"
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Auto-categorize suggestion */}
          {suggestion && !dismissed && (
            <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800 dark:bg-purple-950/30">
              <Sparkles className="h-4 w-4 shrink-0 text-purple-600" />
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  Sugestão automática
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  {suggestion.category_name && !categoryValue && (
                    <> &middot; Categoria: <strong>{suggestion.category_name}</strong></>
                  )}
                  {suggestion.cost_center_name && !costCenterValue && (
                    <> &middot; CC: <strong>{suggestion.cost_center_name}</strong></>
                  )}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px] border-purple-300 text-purple-600"
                      >
                        {suggestion.confidence === "high" ? "alta" : suggestion.confidence === "medium" ? "média" : "baixa"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Regra: {suggestion.matched_rule}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-purple-700 hover:bg-purple-100"
                onClick={acceptSuggestion}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Aplicar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-purple-400 hover:bg-purple-100"
                onClick={dismissSuggestion}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Amount + Paid Amount */}
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
              <Label>Valor Pago (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("paid_amount", { valueAsNumber: true })}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <div className="space-y-1.5">
              <Label>Data Pgto</Label>
              <Input type="date" {...register("paid_date")} />
            </div>
          </div>

          {/* Counterpart + Doc */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contraparte</Label>
              <Input
                {...register("counterpart")}
                placeholder="Nome da empresa/pessoa"
              />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ/CPF</Label>
              <Input
                {...register("counterpart_doc")}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          {/* Category + Cost Center */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={watch("category_id") ?? "none"}
                onValueChange={(v) =>
                  setValue("category_id", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {filteredCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Centro de Custo</Label>
              <Select
                value={watch("cost_center_id") ?? "none"}
                onValueChange={(v) =>
                  setValue("cost_center_id", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.code} - {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business Unit + Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unidade de Negócio</Label>
              <Select
                value={watch("business_unit") ?? "none"}
                onValueChange={(v) =>
                  setValue(
                    "business_unit",
                    v === "none"
                      ? null
                      : (v as CreateTransactionInput["business_unit"])
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {BU_OPTIONS.map((bu) => (
                    <SelectItem key={bu} value={bu}>
                      {bu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Forma de Pagamento</Label>
              <Select
                value={watch("payment_method") ?? "none"}
                onValueChange={(v) =>
                  setValue("payment_method", v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm} value={pm}>
                      {pm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea
              {...register("notes")}
              rows={2}
              placeholder="Observações (opcional)"
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando…"
                : editingTransaction
                  ? "Salvar"
                  : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
