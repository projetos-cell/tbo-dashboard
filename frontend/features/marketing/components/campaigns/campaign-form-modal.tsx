"use client";

import { useEffect, useState, useRef } from "react";
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
import { IconX, IconPlus } from "@tabler/icons-react";
import {
  useCreateMarketingCampaign,
  useUpdateMarketingCampaign,
  useMarketingCampaigns,
} from "../../hooks/use-marketing-campaigns";
import { MARKETING_CAMPAIGN_STATUS } from "@/lib/constants";
import type { MarketingCampaign, MarketingCampaignStatus } from "../../types/marketing";
import { useAuthStore } from "@/stores/auth-store";

// Feature #15 — Tags autocomplete multi-select com tags existentes do tenant
function TagsAutocomplete({
  selected,
  onChange,
  suggestions,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (t) => t.toLowerCase().includes(input.toLowerCase()) && !selected.includes(t),
  );

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setInput("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(selected.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 min-h-10 focus-within:ring-1 focus-within:ring-ring cursor-text" onClick={() => wrapperRef.current?.querySelector("input")?.focus()}>
        {selected.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100">
              <IconX size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Adicionar tag..." : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && (filtered.length > 0 || input.trim()) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul className="max-h-40 overflow-auto py-1">
            {filtered.slice(0, 8).map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => addTag(tag)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                >
                  {tag}
                </button>
              </li>
            ))}
            {input.trim() && !suggestions.includes(input.trim()) && !selected.includes(input.trim()) && (
              <li>
                <button
                  type="button"
                  onClick={() => addTag(input)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-1.5 text-primary transition-colors"
                >
                  <IconPlus size={12} />
                  Criar &ldquo;{input.trim()}&rdquo;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const CHANNELS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Email",
  "Google Ads",
  "Meta Ads",
  "WhatsApp",
  "Blog",
  "Eventos",
  "Outros",
] as const;

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório (mín. 2 caracteres)").max(100),
  description: z.string().max(500).optional(),
  status: z.enum([
    "planejamento",
    "briefing",
    "em_producao",
    "ativa",
    "pausada",
    "finalizada",
    "cancelada",
  ]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_str: z.string().optional(),
  channels: z.array(z.string()),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  campaign?: MarketingCampaign | null;
}

export function CampaignFormModal({ open, onClose, campaign }: Props) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createMutation = useCreateMarketingCampaign();
  const updateMutation = useUpdateMarketingCampaign();
  const isEditing = !!campaign;

  // Feature #15: derive existing tags from all campaigns
  const { data: allCampaigns } = useMarketingCampaigns();
  const existingTags = Array.from(
    new Set((allCampaigns ?? []).flatMap((c) => c.tags ?? [])),
  ).sort();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      status: "planejamento",
      start_date: "",
      end_date: "",
      budget_str: "",
      channels: [],
      tags: [],
    },
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name,
        description: campaign.description ?? "",
        status: campaign.status,
        start_date: campaign.start_date?.split("T")[0] ?? "",
        end_date: campaign.end_date?.split("T")[0] ?? "",
        budget_str:
          campaign.budget != null ? (campaign.budget / 100).toFixed(2) : "",
        channels: campaign.channels ?? [],
        tags: campaign.tags ?? [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        status: "planejamento",
        start_date: "",
        end_date: "",
        budget_str: "",
        channels: [],
        tags: [],
      });
    }
  }, [campaign, form]);

  async function onSubmit(values: FormValues) {
    const budgetNum = values.budget_str ? parseFloat(values.budget_str) : null;
    const payload = {
      tenant_id: tenantId ?? "",
      name: values.name,
      description: values.description ?? null,
      status: values.status as MarketingCampaignStatus,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      budget: budgetNum != null && !isNaN(budgetNum) ? Math.round(budgetNum * 100) : null,
      spent: isEditing ? (campaign?.spent ?? null) : null,
      owner_id: null,
      owner_name: null,
      channels: values.channels,
      tags: values.tags,
    };

    if (isEditing && campaign) {
      await updateMutation.mutateAsync({ id: campaign.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  function toggleChannel(ch: string) {
    const current = form.getValues("channels");
    const next = current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch];
    form.setValue("channels", next);
  }

  const channels = form.watch("channels");
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da campanha *</FormLabel>
                <Input placeholder="Ex: Lançamento Produto X" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status + Budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MARKETING_CAMPAIGN_STATUS).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          {def.label}
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
              name="budget_str"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (R$)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Datas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <Input type="date" {...field} value={field.value ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fim</FormLabel>
                  <Input type="date" {...field} value={field.value ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  placeholder="Objetivo e contexto da campanha..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Canais */}
          <div className="space-y-2">
            <FormLabel>Canais</FormLabel>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                    channels.includes(ch)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-muted hover:border-primary/40"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            {channels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {channels.map((ch) => (
                  <Badge key={ch} variant="secondary" className="gap-1 text-xs">
                    {ch}
                    <button
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className="ml-0.5 opacity-60 hover:opacity-100"
                    >
                      <IconX size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Feature #15: Tags autocomplete */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <TagsAutocomplete
                  selected={field.value}
                  onChange={field.onChange}
                  suggestions={existingTags}
                />
                <p className="text-[11px] text-muted-foreground">
                  Digite e pressione Enter ou vírgula para adicionar. Selecione tags existentes.
                </p>
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar campanha"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
