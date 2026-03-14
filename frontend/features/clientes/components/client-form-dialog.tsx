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
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateClient, useUpdateClient } from "@/features/clientes/hooks/use-clients";
import type { Database } from "@/lib/supabase/types";
import { ClientFormFields } from "./client-form-fields";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export const clientSchema = z.object({
  name: z.string().min(1, "Razao social e obrigatoria"),
  trading_name: z.string().optional(),
  cnpj: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.string().min(1),
  segment: z.string().optional(),
  notes: z.string().optional(),
  sales_owner: z.string().optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRow | null;
}

const emptyForm: ClientFormData = {
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

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

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
    setErrors({});
  }, [client, open]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = clientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ClientFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ClientFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

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
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields
            form={form as ClientFormData & { [key: string]: string }}
            errors={errors}
            onChange={handleChange}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
