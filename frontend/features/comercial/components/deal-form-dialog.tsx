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
import { useCreateDeal, useUpdateDeal } from "@/features/comercial/hooks/use-commercial";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";
import { DealFormFields, type DealFormValues } from "./deal-form-fields";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

const dealSchema = z.object({
  name: z.string().min(1, "Nome do deal e obrigatorio"),
  company: z.string().optional(),
  contact: z.string().optional(),
  contact_email: z.string().email("Email invalido").optional().or(z.literal("")),
  stage: z.string().min(1),
  value: z.string().optional(),
  probability: z.string().optional(),
  expected_close: z.string().optional(),
  owner_name: z.string().optional(),
  source: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: DealRow | null;
}

const emptyForm: DealFormValues = {
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

export function DealFormDialog({ open, onOpenChange, deal }: DealFormDialogProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const [form, setForm] = useState<DealFormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DealFormData, string>>>({});

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
    setErrors({});
  }, [deal, open]);

  function handleChange(field: keyof DealFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = dealSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DealFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof DealFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

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

    try {
      if (isEditing && deal) {
        await updateDeal.mutateAsync({ id: deal.id, updates: payload });
        toast.success("Deal atualizado com sucesso.");
      } else {
        await createDeal.mutateAsync({ ...payload, tenant_id: tenantId });
        toast.success("Deal criado com sucesso.");
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao salvar deal: ${message}`);
    }
  }

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Deal" : "Novo Deal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DealFormFields form={form} errors={errors} onChange={handleChange} />

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
