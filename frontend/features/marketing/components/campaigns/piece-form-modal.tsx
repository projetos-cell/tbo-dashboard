"use client";

// Feature #9 — Peças form modal (tipo, responsável, prazo)

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
  useCreateCampaignPiece,
  useUpdateCampaignPiece,
} from "../../hooks/use-marketing-campaigns";
import type { CampaignPiece } from "../../types/marketing";

const PIECE_TYPES = [
  { value: "banner", label: "Banner" },
  { value: "post_feed", label: "Post Feed" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
  { value: "email", label: "Email" },
  { value: "landing_page", label: "Landing Page" },
  { value: "video", label: "Vídeo" },
  { value: "gif", label: "GIF" },
  { value: "infografico", label: "Infográfico" },
  { value: "apresentacao", label: "Apresentação" },
  { value: "outro", label: "Outro" },
] as const;

const PIECE_STATUSES = [
  { value: "pendente", label: "Pendente" },
  { value: "em_producao", label: "Em Produção" },
  { value: "revisao", label: "Revisão" },
  { value: "aprovado", label: "Aprovado" },
  { value: "publicado", label: "Publicado" },
] as const;

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)").max(150),
  type: z.string().min(1, "Tipo obrigatório"),
  status: z.enum(["pendente", "em_producao", "revisao", "aprovado", "publicado"]),
  assigned_to: z.string().max(100).optional(),
  due_date: z.string().optional(),
  file_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  piece?: CampaignPiece | null;
}

export function PieceFormModal({ open, onClose, campaignId, piece }: Props) {
  const createMutation = useCreateCampaignPiece();
  const updateMutation = useUpdateCampaignPiece();
  const isEditing = !!piece;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "banner",
      status: "pendente",
      assigned_to: "",
      due_date: "",
      file_url: "",
    },
  });

  useEffect(() => {
    if (piece) {
      form.reset({
        name: piece.name,
        type: piece.type,
        status: piece.status,
        assigned_to: piece.assigned_to ?? "",
        due_date: piece.due_date?.split("T")[0] ?? "",
        file_url: piece.file_url ?? "",
      });
    } else {
      form.reset({ name: "", type: "banner", status: "pendente", assigned_to: "", due_date: "", file_url: "" });
    }
  }, [piece, form, open]);

  async function onSubmit(values: FormValues) {
    const payload = {
      campaign_id: campaignId,
      name: values.name,
      type: values.type,
      status: values.status,
      assigned_to: values.assigned_to || null,
      due_date: values.due_date || null,
      file_url: values.file_url || null,
    };
    if (isEditing && piece) {
      await updateMutation.mutateAsync({ id: piece.id, campaignId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Peça" : "Nova Peça"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da peça *</FormLabel>
                <Input placeholder="Ex: Banner principal 1080x1080" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PIECE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PIECE_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Input placeholder="Nome do responsável" {...field} value={field.value ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <Input type="date" {...field} value={field.value ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="file_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do arquivo</FormLabel>
                <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar peça"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
