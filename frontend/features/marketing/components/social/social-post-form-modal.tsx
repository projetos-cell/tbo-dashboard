"use client";

// Feature #45 — Modal criar post (conteúdo, plataforma/conta, mídia URLs, agendamento)

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useCreateRsmPost,
  useRsmAccounts,
} from "../../hooks/use-marketing-social";

const POST_TYPES = [
  { value: "post", label: "Post / Feed" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
  { value: "video", label: "Vídeo" },
  { value: "carrossel", label: "Carrossel" },
  { value: "outro", label: "Outro" },
];

const schema = z.object({
  account_id: z.string().min(1, "Conta obrigatória"),
  title: z.string().min(1, "Título obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  type: z.string().min(1, "Tipo obrigatório"),
  media_note: z.string(),
  scheduled_date: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SocialPostFormModal({ open, onClose }: Props) {
  const createMutation = useCreateRsmPost();
  const { data: accounts } = useRsmAccounts();
  const tenantId = useAuthStore((s) => s.tenantId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      account_id: "",
      title: "",
      content: "",
      type: "post",
      media_note: "",
      scheduled_date: null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        account_id: "",
        title: "",
        content: "",
        type: "post",
        media_note: "",
        scheduled_date: null,
      });
    }
  }, [open, form]);

  function onSubmit(values: FormValues) {
    const mediaUrls = values.media_note
      ? values.media_note.split(",").map((u) => u.trim()).filter(Boolean)
      : [];
    createMutation.mutate(
      {
        account_id: values.account_id,
        title: values.title,
        content: values.content,
        type: values.type,
        status: values.scheduled_date ? "agendado" : "rascunho",
        scheduled_date: values.scheduled_date ?? null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        tenant_id: tenantId ?? "",
      } as never,
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Post</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Conta / Plataforma */}
          <FormField
            control={form.control}
            name="account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts ?? [])
                      .filter((a) => a.is_active !== false)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          @{a.handle} · {String(a.platform)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar formato..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <Input placeholder="Título do post..." {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conteúdo */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo / Legenda</FormLabel>
                <Textarea
                  placeholder="Escreva a legenda ou conteúdo do post..."
                  rows={4}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mídia URLs */}
          <FormField
            control={form.control}
            name="media_note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mídia (URLs, separadas por vírgula)</FormLabel>
                <Input
                  placeholder="https://storage.supabase.co/..., https://..."
                  {...field}
                />
                <p className="text-xs text-muted-foreground">
                  Cole as URLs das mídias vinculadas a este post.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Agendamento */}
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agendar para (opcional)</FormLabel>
                <Input
                  type="datetime-local"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para salvar como rascunho.
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
              {createMutation.isPending ? "Salvando..." : "Criar Post"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
