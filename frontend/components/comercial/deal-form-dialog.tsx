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
import { DEAL_STAGES, DEAL_SOURCES } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateDeal, useUpdateDeal } from "@/hooks/use-commercial";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: DealRow | null;
}

const emptyForm = {
  name: "",
  company: "",
  contact: "",
  contact_email: "",
  stage: "lead",
  value: "",
  probability: "",
  expected_close: "",
  owner_name: "",
  source: "",
  priority: "media",
  notes: "",
};

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
}: DealFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const [form, setForm] = useState(emptyForm);

  const isEditing = !!deal;

  useEffect(() => {
    if (deal) {
      setForm({
        name: deal.name ?? "",
        company: deal.company ?? "",
        contact: deal.contact ?? "",
        contact_email: deal.contact_email ?? "",
        stage: deal.stage ?? "lead",
        value: deal.value != null ? String(deal.value) : "",
        probability: deal.probability != null ? String(deal.probability) : "",
        expected_close: deal.expected_close ?? "",
        owner_name: deal.owner_name ?? "",
        source: deal.source ?? "",
        priority: deal.priority ?? "media",
        notes: deal.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [deal, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      company: form.company || null,
      contact: form.contact || null,
      contact_email: form.contact_email || null,
      stage: form.stage,
      value: form.value ? Number(form.value) : null,
      probability: form.probability ? Number(form.probability) : null,
      expected_close: form.expected_close || null,
      owner_name: form.owner_name || null,
      source: form.source || null,
      priority: form.priority || null,
      notes: form.notes || null,
    };

    if (isEditing && deal) {
      await updateDeal.mutateAsync({ id: deal.id, updates: payload });
    } else {
      await createDeal.mutateAsync({ ...payload, tenant_id: tenantId });
    }

    onOpenChange(false);
  }

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Deal" : "Novo Deal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Deal *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email Contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => handleChange("stage", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_STAGES).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={form.source}
                onValueChange={(v) => handleChange("source", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_SOURCES.map((src) => (
                    <SelectItem key={src} value={src} className="capitalize">
                      {src.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={(e) => handleChange("probability", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close">Previsão Fechamento</Label>
              <Input
                id="expected_close"
                type="date"
                value={form.expected_close}
                onChange={(e) =>
                  handleChange("expected_close", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Responsável</Label>
              <Input
                id="owner_name"
                value={form.owner_name}
                onChange={(e) => handleChange("owner_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => handleChange("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={isPending || !form.name.trim()}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
