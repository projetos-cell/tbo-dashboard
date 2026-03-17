"use client";

// Feature #33 — Modal criar/editar brief de conteúdo

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconX, IconPlus } from "@tabler/icons-react";
import { useCreateContentBrief, useUpdateContentBrief } from "../../hooks/use-marketing-content";
import { useAuthStore } from "@/stores/auth-store";
import type { ContentBrief } from "../../types/marketing";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  objective: z.string().optional(),
  target_audience: z.string().optional(),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Reusable chip-input for string arrays
function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput("");
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium leading-none">{label}</p>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={!input.trim()}>
          <IconPlus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 pl-2 pr-1 text-xs">
              {v}
              <button
                type="button"
                className="rounded-sm hover:bg-muted ml-0.5"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  brief?: ContentBrief | null;
}

export function BriefFormModal({ open, onClose, brief }: Props) {
  const isEdit = !!brief?.id;
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMutation = useCreateContentBrief();
  const updateMutation = useUpdateContentBrief();

  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", objective: "", target_audience: "", deadline: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: brief?.title ?? "",
        objective: brief?.objective ?? "",
        target_audience: brief?.target_audience ?? "",
        deadline: brief?.deadline ? brief.deadline.split("T")[0] : "",
      });
      setKeyMessages(brief?.key_messages ?? []);
      setDeliverables(brief?.deliverables ?? []);
    }
  }, [open, brief, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      objective: values.objective || null,
      target_audience: values.target_audience || null,
      key_messages: keyMessages,
      references: brief?.references ?? [],
      deliverables,
      deadline: values.deadline || null,
      status: (brief?.status ?? "draft") as ContentBrief["status"],
      created_by: null,
      approved_by: null,
      tenant_id: tenantId ?? "",
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: brief!.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Brief" : "Novo Brief de Conteúdo"}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título *</FormLabel>
                <Input {...field} placeholder="Ex: Brief campanha verão 2026" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objetivo</FormLabel>
                <Textarea
                  {...field}
                  placeholder="Qual o objetivo principal deste conteúdo?"
                  rows={2}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Público-alvo</FormLabel>
                  <Input {...field} placeholder="Ex: Jovens 18-35" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <ChipInput
            label="Mensagens-chave"
            values={keyMessages}
            onChange={setKeyMessages}
            placeholder="Digite e pressione Enter"
          />
          <ChipInput
            label="Entregáveis"
            values={deliverables}
            onChange={setDeliverables}
            placeholder="Ex: 3 posts + 1 reels"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
