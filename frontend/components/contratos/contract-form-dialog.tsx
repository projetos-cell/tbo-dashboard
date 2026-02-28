"use client";

import { useState, useEffect } from "react";
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
import { CONTRACT_STATUS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateContract, useUpdateContract } from "@/hooks/use-contracts";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractRow | null;
}

const emptyForm = {
  title: "",
  description: "",
  type: "servico",
  status: "ativo",
  start_date: "",
  end_date: "",
  monthly_value: "",
};

export function ContractFormDialog({
  open,
  onOpenChange,
  contract,
}: ContractFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const [form, setForm] = useState(emptyForm);

  const isEditing = !!contract;

  useEffect(() => {
    if (contract) {
      setForm({
        title: contract.title ?? "",
        description: contract.description ?? "",
        type: contract.type ?? "servico",
        status: contract.status ?? "ativo",
        start_date: contract.start_date ?? "",
        end_date: contract.end_date ?? "",
        monthly_value: contract.monthly_value != null ? String(contract.monthly_value) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [contract, open]);

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      type: form.type,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
    };

    if (isEditing && contract) {
      await updateContract.mutateAsync({ id: contract.id, updates: payload });
    } else {
      await createContract.mutateAsync({ ...payload, tenant_id: tenantId });
    }

    onOpenChange(false);
  }

  const isPending = createContract.isPending || updateContract.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
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
            <Button type="submit" disabled={isPending || !form.title.trim()}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
