"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagsInput } from "./tags-input";
import { CATEGORY_LABELS } from "../types";
import type { WebsiteProjectFormValues } from "../schemas/website-schemas";

interface ProjectEditorSidebarProps {
  form: UseFormReturn<WebsiteProjectFormValues>;
  autoSlug: boolean;
  onAutoSlugChange: (value: boolean) => void;
}

export function ProjectEditorSidebar({
  form,
  autoSlug,
  onAutoSlugChange,
}: ProjectEditorSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Status / Publication */}
      <PublicationCard form={form} autoSlug={autoSlug} onAutoSlugChange={onAutoSlugChange} />

      {/* Metadata */}
      <MetadataCard form={form} />

      {/* Tags */}
      <TagsCard form={form} />

      {/* SEO */}
      <SeoCard form={form} />
    </div>
  );
}

/* ── Publication Card ───────────────────────────────────────── */

interface CardProps {
  form: UseFormReturn<WebsiteProjectFormValues>;
}

interface PublicationCardProps extends CardProps {
  autoSlug: boolean;
  onAutoSlugChange: (value: boolean) => void;
}

function PublicationCard({ form, autoSlug, onAutoSlugChange }: PublicationCardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="text-sm font-medium">Publicação</h3>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="slug">Slug</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Auto</span>
            <Switch
              checked={autoSlug}
              onCheckedChange={onAutoSlugChange}
              className="scale-75"
            />
          </div>
        </div>
        <Input
          id="slug"
          {...form.register("slug")}
          disabled={autoSlug}
          className="font-mono text-xs"
        />
        {form.formState.errors.slug && (
          <p className="text-xs text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Ordem de exibição</Label>
        <Input
          id="sort_order"
          type="number"
          {...form.register("sort_order", { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

/* ── Metadata Card ──────────────────────────────────────────── */

function MetadataCard({ form }: CardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="text-sm font-medium">Dados do Projeto</h3>

      <div className="space-y-2">
        <Label htmlFor="client_name">Cliente</Label>
        <Input
          id="client_name"
          {...form.register("client_name")}
          placeholder="Nome da incorporadora"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          {...form.register("location")}
          placeholder="Ex: São Paulo, SP"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input
          id="year"
          type="number"
          {...form.register("year", { valueAsNumber: true })}
          placeholder="2026"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}

/* ── Tags Card ──────────────────────────────────────────────── */

function TagsCard({ form }: CardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="text-sm font-medium">Serviços & Destaques</h3>

      <div className="space-y-2">
        <Label>Serviços prestados</Label>
        <Controller
          control={form.control}
          name="services"
          render={({ field }) => (
            <TagsInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Digite e pressione Enter"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Destaques / Resultados</Label>
        <Controller
          control={form.control}
          name="highlights"
          render={({ field }) => (
            <TagsInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Ex: +40% vendas na primeira semana"
            />
          )}
        />
      </div>
    </div>
  );
}

/* ── SEO Card ───────────────────────────────────────────────── */

function SeoCard({ form }: CardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="text-sm font-medium">SEO</h3>

      <div className="space-y-2">
        <Label htmlFor="seo_title">Título SEO</Label>
        <Input
          id="seo_title"
          {...form.register("seo_title")}
          placeholder="Título para buscadores (max 70 chars)"
          maxLength={70}
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {(form.watch("seo_title") ?? "").length}/70
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo_description">Descrição SEO</Label>
        <Textarea
          id="seo_description"
          {...form.register("seo_description")}
          placeholder="Descrição para buscadores (max 160 chars)"
          maxLength={160}
          className="min-h-[60px]"
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {(form.watch("seo_description") ?? "").length}/160
        </p>
      </div>
    </div>
  );
}
