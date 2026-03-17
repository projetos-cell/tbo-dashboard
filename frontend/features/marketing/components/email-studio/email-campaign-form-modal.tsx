"use client";

// Feature #19 — Modal criar campanha de email (nome, assunto, template, lista, agendamento)

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateEmailCampaign,
  useEmailTemplates,
} from "../../hooks/use-email-studio";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)"),
  subject: z.string().min(2, "Assunto obrigatório (mín. 2 caracteres)"),
  template_id: z.string().nullable(),
  list_name: z.string().min(1, "Nome da lista obrigatório"),
  scheduled_at: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EmailCampaignFormModal({ open, onClose }: Props) {
  const createMutation = useCreateEmailCampaign();
  const { data: templates } = useEmailTemplates();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subject: "",
      template_id: null,
      list_name: "",
      scheduled_at: null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        subject: "",
        template_id: null,
        list_name: "",
        scheduled_at: null,
      });
    }
  }, [open, form]);

  function onSubmit(values: FormValues) {
    createMutation.mutate(
      {
        name: values.name,
        subject: values.subject,
        template_id: values.template_id ?? null,
        list_id: null,
        scheduled_at: values.scheduled_at ?? null,
      },
      { onSuccess: onClose },
    );
  }

  // Quando troca de template, preenche assunto automaticamente
  function handleTemplateChange(templateId: string) {
    form.setValue("template_id", templateId || null);
    if (templateId) {
      const tmpl = templates?.find((t) => t.id === templateId);
      if (tmpl && !form.getValues("subject")) {
        form.setValue("subject", tmpl.subject);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Campanha de Email</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Campanha</FormLabel>
                  <Input placeholder="Ex: Newsletter Abril 2026" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template */}
            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar template (opcional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                          {t.category ? ` · ${t.category}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assunto */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto do Email</FormLabel>
                  <Input placeholder="Ex: [TBO] Novidades de Abril" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lista */}
            <FormField
              control={form.control}
              name="list_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lista de Contatos</FormLabel>
                  <Input placeholder="Ex: Clientes Ativos, Newsletter Geral..." {...field} />
                  <p className="text-xs text-muted-foreground">
                    Nome da lista de destinatários desta campanha.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agendamento */}
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agendamento (opcional)</FormLabel>
                  <Input
                    type="datetime-local"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para salvar como rascunho.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Campanha"}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
