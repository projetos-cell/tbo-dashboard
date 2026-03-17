"use client";

// Feature #26 — Modal criar/editar item de conteúdo

import { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconX, IconPlus } from "@tabler/icons-react";
import {
  useCreateContentItem,
  useUpdateContentItem,
} from "../../hooks/use-marketing-content";
import { useMarketingCampaigns } from "../../hooks/use-marketing-campaigns";
import { MARKETING_CONTENT_STATUS } from "@/lib/constants";
import type { ContentItem, ContentType, ContentStatus } from "../../types/marketing";
import { useAuthStore } from "@/stores/auth-store";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "post_social", label: "Post Social" },
  { value: "blog", label: "Blog" },
  { value: "video", label: "Vídeo" },
  { value: "email", label: "E-mail" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
  { value: "carrossel", label: "Carrossel" },
  { value: "infografico", label: "Infográfico" },
  { value: "ebook", label: "E-book" },
  { value: "outro", label: "Outro" },
];

const CHANNELS = [
  "Instagram", "Facebook", "LinkedIn", "TikTok",
  "YouTube", "Blog", "Email", "WhatsApp", "Twitter",
];

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  type: z.string().min(1, "Tipo obrigatório"),
  status: z.string().min(1, "Status obrigatório"),
  channel: z.string().optional(),
  scheduled_date: z.string().optional(),
  author_name: z.string().optional(),
  campaign_id: z.string().optional(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface TagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

function TagsAutocomplete({ selected, onChange, suggestions }: TagsProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !selected.includes(s),
  );

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !selected.includes(t)) onChange([...selected, t]);
    setInput("");
    setOpen(false);
  };

  const removeTag = (tag: string) => onChange(selected.filter((t) => t !== tag));

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap gap-1 min-h-9 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
        {selected.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1 pl-2 pr-1">
            {t}
            <button type="button" onClick={() => removeTag(t)} className="rounded-sm hover:bg-muted">
              <IconX className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
          placeholder={selected.length === 0 ? "Adicionar tags..." : ""}
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (input.trim()) addTag(input); }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open && (filtered.length > 0 || input.trim()) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {input.trim() && !suggestions.includes(input.trim()) && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              onClick={() => addTag(input)}
            >
              <IconPlus className="h-3.5 w-3.5" /> Criar &ldquo;{input.trim()}&rdquo;
            </button>
          )}
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
              onClick={() => addTag(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  item?: ContentItem | null;
}

export function ContentItemFormModal({ open, onClose, item }: Props) {
  const isEdit = !!item?.id;
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMutation = useCreateContentItem();
  const updateMutation = useUpdateContentItem();
  const { data: campaigns } = useMarketingCampaigns();

  const tagSuggestions = Array.from(
    new Set((campaigns ?? []).flatMap((c) => c.tags ?? [])),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "post_social",
      status: "ideia",
      channel: "",
      scheduled_date: "",
      author_name: "",
      campaign_id: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: item?.title ?? "",
        type: item?.type ?? "post_social",
        status: item?.status ?? "ideia",
        channel: item?.channel ?? "",
        scheduled_date: item?.scheduled_date ? item.scheduled_date.split("T")[0] : "",
        author_name: item?.author_name ?? "",
        campaign_id: item?.campaign_id ?? "",
        tags: item?.tags ?? [],
      });
    }
  }, [open, item, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      type: values.type as ContentType,
      status: values.status as ContentStatus,
      channel: values.channel || null,
      scheduled_date: values.scheduled_date || null,
      author_name: values.author_name || null,
      author_id: null,
      campaign_id: values.campaign_id || null,
      brief_id: null,
      published_date: null,
      tags: values.tags,
      tenant_id: tenantId ?? "",
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: item!.id, data: payload });
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
          <DialogTitle>{isEdit ? "Editar Conteúdo" : "Novo Conteúdo"}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título *</FormLabel>
                <Input {...field} placeholder="Ex: Post sobre lançamento" />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((t) => (
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
                  <FormLabel>Status *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MARKETING_CONTENT_STATUS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {CHANNELS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Agendada</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <Input {...field} placeholder="Nome do autor" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="campaign_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campanha</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Vincular campanha..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {(campaigns ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <TagsAutocomplete
                  selected={field.value}
                  onChange={field.onChange}
                  suggestions={tagSuggestions}
                />
                <FormMessage />
              </FormItem>
            )}
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
