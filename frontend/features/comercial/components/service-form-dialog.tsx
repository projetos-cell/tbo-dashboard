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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BU_LIST } from "@/lib/constants";
import {
  useCreateService,
  useUpdateService,
} from "@/features/comercial/hooks/use-services";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";

const SERVICE_TYPE_OPTIONS = [
  { value: "projeto", label: "Projeto" },
  { value: "fee_mensal", label: "Fee Mensal" },
  { value: "hora", label: "Hora" },
  { value: "pacote", label: "Pacote" },
] as const;

const SERVICE_UNIT_OPTIONS = [
  { value: "projeto", label: "Por Projeto" },
  { value: "mes", label: "Por Mes" },
  { value: "hora", label: "Por Hora" },
  { value: "pacote", label: "Por Pacote" },
  { value: "unidade", label: "Unidade" },
] as const;

const SERVICE_STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivado" },
] as const;

const serviceSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  description: z.string().optional(),
  bu: z.string().optional(),
  type: z.enum(["fee_mensal", "projeto", "hora", "pacote"]),
  base_price: z.string().min(1, "Preco obrigatorio"),
  unit: z.enum(["unidade", "hora", "mes", "pacote", "projeto"]),
  margin_pct: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceRow | null;
}

export function ServiceFormDialog({ open, onOpenChange, service }: ServiceFormDialogProps) {
  const isEditing = !!service;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      bu: "",
      type: "projeto",
      base_price: "0",
      unit: "projeto",
      margin_pct: "0",
      status: "active",
    },
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
        margin_pct: String(service.margin_pct ?? 0),
        status: service.status,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        bu: "",
        type: "projeto",
        base_price: "0",
        unit: "projeto",
        margin_pct: "0",
        status: "active",
      });
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
      margin_pct: parseFloat(values.margin_pct ?? "0") || 0,
      status: values.status,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Servico" : "Novo Servico"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Branding Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o servico..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BU_LIST.map((bu) => (
                          <SelectItem key={bu} value={bu}>
                            {bu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preco Base (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="margin_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Margem (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
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
