"use client";

// Feature #17 — Modal criar/editar template com editor HTML básico

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconX } from "@tabler/icons-react";
import { useCreateEmailTemplate, useUpdateEmailTemplate } from "../../hooks/use-email-studio";
import type { EmailTemplate } from "../../types/marketing";

const TEMPLATE_CATEGORIES = [
  "Newsletter",
  "Promocional",
  "Transacional",
  "Boas-vindas",
  "Reativação",
  "Evento",
  "Outro",
] as const;

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)"),
  subject: z.string().min(2, "Assunto obrigatório (mín. 2 caracteres)"),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  html_content: z.string().min(1, "Conteúdo HTML obrigatório"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

export function EmailTemplateFormModal({ open, onClose, template }: Props) {
  const isEditing = !!template;
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subject: "",
      category: null,
      tags: [],
      html_content: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (template) {
        form.reset({
          name: template.name,
          subject: template.subject,
          category: template.category,
          tags: template.tags,
          html_content: template.html_content,
        });
      } else {
        form.reset({
          name: "",
          subject: "",
          category: null,
          tags: [],
          html_content: "",
        });
      }
    }
  }, [open, template, form]);

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      subject: values.subject,
      category: values.category,
      tags: values.tags,
      html_content: values.html_content,
    };

    if (isEditing && template) {
      updateMutation.mutate(
        { id: template.id, data: payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  }

  function addTag(tag: string) {
    const current = form.getValues("tags");
    const trimmed = tag.trim();
    if (trimmed && !current.includes(trimmed)) {
      form.setValue("tags", [...current, trimmed]);
    }
  }

  function removeTag(tag: string) {
    const current = form.getValues("tags");
    form.setValue("tags", current.filter((t) => t !== tag));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Template" : "Novo Template"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Template</FormLabel>
                  <Input placeholder="Ex: Newsletter Mensal" {...field} />
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
                  <Input placeholder="Ex: [TBO] Novidades de {{mes}}" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 min-h-[28px]">
                      {field.value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 rounded hover:text-destructive"
                          >
                            <IconX size={10} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Digitar tag e pressionar Enter..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* HTML Content */}
            <FormField
              control={form.control}
              name="html_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo HTML</FormLabel>
                  <Textarea
                    placeholder="<html><body><!-- Seu template aqui --></body></html>"
                    className="font-mono text-xs min-h-[200px] resize-y"
                    {...field}
                  />
                  <p className="text-xs text-muted-foreground">
                    Editor HTML. Variáveis dinâmicas: {"{{"} nome {"}}"}, {"{{"} email {"}}"}, etc.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Template"}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
