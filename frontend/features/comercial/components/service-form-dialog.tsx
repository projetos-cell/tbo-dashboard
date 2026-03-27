"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  useCreateService,
  useUpdateService,
} from "@/features/comercial/hooks/use-services";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";
import {
  ServiceBasicFields,
  ServicePricingFields,
  type ServiceFormValues,
} from "./service-form-fields";

// ── Schema ───────────────────────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  bu: z.string().optional(),
  type: z.enum(["fee_mensal", "projeto", "hora", "pacote"]),
  base_price: z.string().min(1, "Preco obrigatorio"),
  unit: z.enum(["unidade", "hora", "mes", "pacote", "projeto"]),
  margin_pct: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
  hours_estimated: z.string().optional(),
  third_party_cost: z.string().optional(),
  complexity_multiplier: z.string().optional(),
  revisions_included: z.string().optional(),
  min_price: z.string().optional(),
});

// ── Props ────────────────────────────────────────────────────────────────────

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceRow | null;
}

const DEFAULT_VALUES: ServiceFormValues = {
  name: "", description: "", bu: "",
  type: "projeto", base_price: "0",
  unit: "projeto", margin_pct: "30", status: "active",
  hours_estimated: "0", third_party_cost: "0",
  complexity_multiplier: "1", revisions_included: "0", min_price: "0",
};

// ── Component ────────────────────────────────────────────────────────────────

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const isEditing = !!service;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description ?? "",
        bu: service.bu ?? "",
        type: service.type,
        base_price: String(service.base_price),
        unit: service.unit,
        margin_pct: String(service.margin_pct ?? 30),
        status: service.status,
        hours_estimated: String(service.hours_estimated ?? 0),
        third_party_cost: String(service.third_party_cost ?? 0),
        complexity_multiplier: String(service.complexity_multiplier ?? 1),
        revisions_included: String(service.revisions_included ?? 0),
        min_price: String(service.min_price ?? 0),
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [service, form]);

  async function onSubmit(values: ServiceFormValues) {
    const payload = {
      name: values.name,
      description: values.description || null,
      bu: values.bu || null,
      type: values.type,
      base_price: parseFloat(values.base_price) || 0,
      unit: values.unit,
      margin_pct: parseFloat(values.margin_pct ?? "30") || 30,
      status: values.status,
      hours_estimated: parseFloat(values.hours_estimated ?? "0") || 0,
      third_party_cost: parseFloat(values.third_party_cost ?? "0") || 0,
      complexity_multiplier: parseFloat(values.complexity_multiplier ?? "1") || 1,
      revisions_included: parseInt(values.revisions_included ?? "0") || 0,
      min_price: parseFloat(values.min_price ?? "0") || 0,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: service!.id, updates: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ServiceBasicFields form={form} />
          <ServicePricingFields form={form} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
