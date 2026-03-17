"use client";

// Feature #6 — Briefing form modal (objetivo, público, mensagens-chave)

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconX } from "@tabler/icons-react";
import {
  useCreateCampaignBriefing,
  useUpdateCampaignBriefing,
} from "../../hooks/use-marketing-campaigns";
import type { CampaignBriefing } from "../../types/marketing";

const schema = z.object({
  objective: z.string().min(5, "Objetivo obrigatório (mín. 5 caracteres)").max(1000),
  target_audience: z.string().min(5, "Público-alvo obrigatório").max(1000),
  key_messages_input: z.string().optional(),
  deliverables_input: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  briefing?: CampaignBriefing | null;
}

export function BriefingFormModal({ open, onClose, campaignId, briefing }: Props) {
  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);

  const createMutation = useCreateCampaignBriefing();
  const updateMutation = useUpdateCampaignBriefing();
  const isEditing = !!briefing;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { objective: "", target_audience: "", key_messages_input: "", deliverables_input: "" },
  });

  useEffect(() => {
    if (briefing) {
      form.reset({
        objective: briefing.objective ?? "",
        target_audience: briefing.target_audience ?? "",
        key_messages_input: "",
        deliverables_input: "",
      });
      setKeyMessages(briefing.key_messages ?? []);
      setDeliverables(briefing.deliverables ?? []);
    } else {
      form.reset({ objective: "", target_audience: "", key_messages_input: "", deliverables_input: "" });
      setKeyMessages([]);
      setDeliverables([]);
    }
  }, [briefing, form, open]);

  function addItem(field: "key_messages_input" | "deliverables_input", setter: (fn: (prev: string[]) => string[]) => void) {
    const val = form.getValues(field)?.trim();
    if (!val) return;
    setter((prev) => [...prev, val]);
    form.setValue(field, "");
  }

  function removeItem(index: number, setter: (fn: (prev: string[]) => string[]) => void) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      campaign_id: campaignId,
      objective: values.objective,
      target_audience: values.target_audience,
      key_messages: keyMessages,
      deliverables,
      references: isEditing ? (briefing?.references ?? []) : [],
      approved_by: isEditing ? (briefing?.approved_by ?? null) : null,
      approved_at: isEditing ? (briefing?.approved_at ?? null) : null,
      status: isEditing ? briefing!.status : ("draft" as const),
    };
    if (isEditing && briefing) {
      await updateMutation.mutateAsync({ id: briefing.id, campaignId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Briefing" : "Novo Briefing"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo da campanha *</FormLabel>
                <Textarea
                  placeholder="Qual o principal objetivo desta campanha?"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-alvo *</FormLabel>
                <Textarea
                  placeholder="Descreva o público-alvo: perfil, idade, dores, comportamentos..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mensagens-chave */}
          <div className="space-y-2">
            <FormLabel>Mensagens-chave</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="key_messages_input"
                render={({ field }) => (
                  <Input
                    placeholder="Adicionar mensagem..."
                    {...field}
                    value={field.value ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addItem("key_messages_input", setKeyMessages); }
                    }}
                  />
                )}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem("key_messages_input", setKeyMessages)}>
                <IconPlus size={14} />
              </Button>
            </div>
            {keyMessages.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keyMessages.map((msg, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {msg}
                    <button type="button" onClick={() => removeItem(i, setKeyMessages)} className="opacity-60 hover:opacity-100">
                      <IconX size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Entregáveis */}
          <div className="space-y-2">
            <FormLabel>Entregáveis</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="deliverables_input"
                render={({ field }) => (
                  <Input
                    placeholder="Ex: 3 posts para Instagram, 1 email..."
                    {...field}
                    value={field.value ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addItem("deliverables_input", setDeliverables); }
                    }}
                  />
                )}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem("deliverables_input", setDeliverables)}>
                <IconPlus size={14} />
              </Button>
            </div>
            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {deliverables.map((d, i) => (
                  <Badge key={i} variant="outline" className="gap-1 text-xs">
                    {d}
                    <button type="button" onClick={() => removeItem(i, setDeliverables)} className="opacity-60 hover:opacity-100">
                      <IconX size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar briefing"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
