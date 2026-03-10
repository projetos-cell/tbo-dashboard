"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
} from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreateContract,
  useUpdateContract,
} from "@/features/contratos/hooks/use-contracts";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

const contractSchema = z.object({
  title: z.string().min(1, "Titulo obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1),
  category: z.string().min(1),
  status: z.string().min(1),
  person_name: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  monthly_value: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractRow | null;
  defaultCategory?: string;
}

function getEmptyForm(category?: string) {
  return {
    title: "",
    description: "",
    type: category === "equipe" ? "freelancer" : "pj",
    category: category ?? "cliente",
    status: "active",
    person_name: "",
    start_date: "",
    end_date: "",
    monthly_value: "",
  };
}

export function ContractFormDialog({
  open,
  onOpenChange,
  contract,
  defaultCategory,
}: ContractFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMut = useCreateContract();
  const updateMut = useUpdateContract();
  const [form, setForm] = useState(getEmptyForm(defaultCategory));
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContractFormData, string>>
  >({});

  const isEditing = !!contract;

  useEffect(() => {
    if (contract) {
      setForm({
        title: contract.title ?? "",
        description: contract.description ?? "",
        type: contract.type ?? "pj",
        category: contract.category ?? "cliente",
        status: contract.status ?? "active",
        person_name: contract.person_name ?? "",
        start_date: contract.start_date ?? "",
        end_date: contract.end_date ?? "",
        monthly_value:
          contract.monthly_value != null
            ? String(contract.monthly_value)
            : "",
      });
    } else {
      setForm(getEmptyForm(defaultCategory));
    }
    setErrors({});
  }, [contract, open, defaultCategory]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contractSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContractFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContractFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      type: form.type,
      category: form.category,
      status: form.status,
      person_name: form.person_name || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
    };

    if (isEditing && contract) {
      await updateMut.mutateAsync({ id: contract.id, updates: payload });
    } else {
      await createMut.mutateAsync({
        ...payload,
        tenant_id: tenantId,
      });
    }

    onOpenChange(false);
  }

  const isPending = createMut.isPending || updateMut.isPending;
  const categoryLabel =
    CONTRACT_CATEGORY[form.category as keyof typeof CONTRACT_CATEGORY]?.label ??
    "Contrato";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contrato" : `Novo Contrato — ${categoryLabel}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome / Pessoa */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título / Objeto *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ex: Contrato Porto Batel"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="person_name">Responsável / PO</Label>
              <Input
                id="person_name"
                value={form.person_name}
                onChange={(e) => handleChange("person_name", e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          {/* Tipo, Categoria, Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_CATEGORY).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => handleChange("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TYPE).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_STATUS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor + Datas */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthly_value">Valor Mensal (R$)</Label>
              <Input
                id="monthly_value"
                type="number"
                step="0.01"
                value={form.monthly_value}
                onChange={(e) => handleChange("monthly_value", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Término</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              placeholder="Observações sobre o contrato..."
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
            <Button
              type="submit"
              className="bg-[#f97316] hover:bg-[#ea580c] text-white"
              disabled={isPending || !form.title.trim()}
            >
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
