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
import { CLIENT_STATUS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import type { Database } from "@/lib/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRow | null;
}

const emptyForm = {
  name: "",
  trading_name: "",
  cnpj: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  status: "lead",
  segment: "",
  notes: "",
  sales_owner: "",
  next_action: "",
  next_action_date: "",
};

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [form, setForm] = useState(emptyForm);

  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name ?? "",
        trading_name: client.trading_name ?? "",
        cnpj: client.cnpj ?? "",
        contact_name: client.contact_name ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        status: client.status ?? "lead",
        segment: client.segment ?? "",
        notes: client.notes ?? "",
        sales_owner: client.sales_owner ?? "",
        next_action: client.next_action ?? "",
        next_action_date: client.next_action_date ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [client, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      trading_name: form.trading_name || null,
      cnpj: form.cnpj || null,
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      status: form.status,
      segment: form.segment || null,
      notes: form.notes || null,
      sales_owner: form.sales_owner || null,
      next_action: form.next_action || null,
      next_action_date: form.next_action_date || null,
    };

    if (isEditing && client) {
      await updateClient.mutateAsync({ id: client.id, updates: payload });
    } else {
      await createClient.mutateAsync({ ...payload, tenant_id: tenantId });
    }

    onOpenChange(false);
  }

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Razão Social *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trading_name">Nome Fantasia</Label>
              <Input
                id="trading_name"
                value={form.trading_name}
                onChange={(e) => handleChange("trading_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
              />
            </div>
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
                  {Object.entries(CLIENT_STATUS).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contato Principal</Label>
              <Input
                id="contact_name"
                value={form.contact_name}
                onChange={(e) => handleChange("contact_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                value={form.segment}
                onChange={(e) => handleChange("segment", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales_owner">Responsável Comercial</Label>
            <Input
              id="sales_owner"
              value={form.sales_owner}
              onChange={(e) => handleChange("sales_owner", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="next_action">Próxima Ação</Label>
              <Input
                id="next_action"
                value={form.next_action}
                onChange={(e) => handleChange("next_action", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_action_date">Data Próxima Ação</Label>
              <Input
                id="next_action_date"
                type="date"
                value={form.next_action_date}
                onChange={(e) => handleChange("next_action_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
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
