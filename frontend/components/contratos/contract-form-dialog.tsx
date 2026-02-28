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
import { Switch } from "@/components/ui/switch";
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
  client_name: "",
  project_name: "",
  description: "",
  status: "ativo",
  start_date: "",
  end_date: "",
  value: "",
  payment_terms: "",
  auto_renew: false,
  notes: "",
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
        client_name: contract.client_name ?? "",
        project_name: contract.project_name ?? "",
        description: contract.description ?? "",
        status: contract.status ?? "ativo",
        start_date: contract.start_date ?? "",
        end_date: contract.end_date ?? "",
        value: contract.value != null ? String(contract.value) : "",
        payment_terms: contract.payment_terms ?? "",
        auto_renew: contract.auto_renew ?? false,
        notes: contract.notes ?? "",
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
      client_name: form.client_name || null,
      project_name: form.project_name || null,
      description: form.description || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      value: form.value ? Number(form.value) : null,
      payment_terms: form.payment_terms || null,
      auto_renew: form.auto_renew,
      notes: form.notes || null,
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
              <Label htmlFor="client_name">Cliente</Label>
              <Input
                id="client_name"
                value={form.client_name}
                onChange={(e) => handleChange("client_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_name">Projeto</Label>
              <Input
                id="project_name"
                value={form.project_name}
                onChange={(e) => handleChange("project_name", e.target.value)}
              />
            </div>
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
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => handleChange("value", e.target.value)}
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
            <Label htmlFor="payment_terms">Condições de Pagamento</Label>
            <Input
              id="payment_terms"
              value={form.payment_terms}
              onChange={(e) => handleChange("payment_terms", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="auto_renew"
              checked={form.auto_renew}
              onCheckedChange={(v) => handleChange("auto_renew", v)}
            />
            <Label htmlFor="auto_renew">Auto-renovação</Label>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
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
