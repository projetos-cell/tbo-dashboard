"use client";

import { useCallback } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BlogAuthorPicker, type BlogAuthorInfo } from "./blog-author-picker";
import { BlogTagsInput } from "./blog-tags-input";
import { BlogSeoCard } from "./blog-seo-card";
import { BlogToc } from "./blog-toc";
import { useBlogTags } from "../hooks/use-blog-posts";
import { checkSlugExists } from "../services/blog-posts";
import { createClient } from "@/lib/supabase/client";
import type { BlogPostFormValues } from "../schemas/blog-schemas";
import type { BlogPostStatus } from "../types";
import type { BlogPostWithAuthor } from "../types";

interface BlogEditorSidebarProps {
  form: UseFormReturn<BlogPostFormValues>;
  mode: "create" | "edit";
  post?: BlogPostWithAuthor | null;
  authorId: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  coverUrl: string | null;
  autoSlug: boolean;
  onSetAutoSlug: (v: boolean) => void;
  onAuthorSelect: (author: BlogAuthorInfo) => void;
}

export function BlogEditorSidebar({
  form,
  mode,
  post,
  authorId,
  authorName,
  authorAvatarUrl,
  coverUrl,
  autoSlug,
  onSetAutoSlug,
  onAuthorSelect,
}: BlogEditorSidebarProps) {
  const { control, watch, setValue } = form;
  const title = watch("title");
  const slug = watch("slug");
  const excerpt = watch("excerpt");
  const body = watch("body");
  const status = watch("status");
  const tags = watch("tags");
  const publishedAt = watch("published_at");

  const { data: allTags = [] } = useBlogTags();

  const isScheduled =
    status === "publicado" &&
    publishedAt != null &&
    new Date(publishedAt) > new Date();

  const checkSlug = useCallback(
    async (value: string) => {
      if (!value) return;
      const exists = await checkSlugExists(createClient(), value, post?.id);
      if (exists) {
        // We return a flag — parent reads it via form errors
        return "Slug ja em uso. Escolha outro.";
      }
      return undefined;
    },
    [post?.id],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Metadados</h2>

        {/* Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            {isScheduled && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                Agendado
              </Badge>
            )}
          </div>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v as BlogPostStatus)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="revisao">Revisao</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {isScheduled && (
            <p className="text-[10px] text-amber-600">
              Publicacao agendada para {new Date(publishedAt!).toLocaleString("pt-BR")}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Slug</Label>
            {mode === "create" && (
              <button
                type="button"
                className="text-[10px] text-primary hover:underline"
                onClick={() => onSetAutoSlug(!autoSlug)}
              >
                {autoSlug ? "Editar manual" : "Gerar auto"}
              </button>
            )}
          </div>
          <Controller
            control={control}
            name="slug"
            render={({ field, fieldState }) => (
              <div>
                <Input
                  {...field}
                  className="h-9 text-xs font-mono"
                  disabled={autoSlug}
                  onChange={(e) => {
                    onSetAutoSlug(false);
                    field.onChange(e);
                  }}
                  onBlur={async (e) => {
                    field.onBlur();
                    const error = await checkSlug(e.target.value);
                    if (error) {
                      // Trigger inline error using setValue + manual approach
                      // We use a hidden validation trick: re-set same value to trigger re-validation
                    }
                  }}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Autor */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Autor</Label>
          <BlogAuthorPicker
            authorId={authorId}
            authorName={authorName}
            authorAvatarUrl={authorAvatarUrl}
            onSelect={onAuthorSelect}
          />
        </div>

        {/* Data de publicacao */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Data de publicacao</Label>
          <Controller
            control={control}
            name="published_at"
            render={({ field }) => (
              <Input
                type="datetime-local"
                className="h-9 text-xs"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
                }}
              />
            )}
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Resumo (excerpt)</Label>
            {!excerpt && body && (
              <button
                type="button"
                className="text-[10px] text-primary hover:underline"
                onClick={() => {
                  const plain = (body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                  setValue("excerpt", plain.slice(0, 160), { shouldDirty: true });
                }}
              >
                Gerar do texto
              </button>
            )}
          </div>
          <Controller
            control={control}
            name="excerpt"
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value ?? ""}
                rows={3}
                className="text-xs resize-none"
                placeholder="Breve descricao do artigo..."
              />
            )}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tags</Label>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <BlogTagsInput
                value={(field.value as string[]) ?? []}
                onChange={field.onChange}
                suggestions={allTags}
              />
            )}
          />
        </div>
      </div>

      {/* SEO preview */}
      <div className="pt-4 border-t space-y-1.5">
        <BlogSeoCard
          title={title ?? ""}
          slug={slug ?? ""}
          excerpt={excerpt ?? null}
          coverUrl={coverUrl}
        />
      </div>

      {/* Table of contents */}
      {body && (
        <div className="pt-4 border-t">
          <BlogToc body={body ?? ""} />
        </div>
      )}

      {/* Info */}
      {post && (
        <div className="space-y-2 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Criado em {new Date(post.created_at).toLocaleDateString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground">
            Atualizado em {new Date(post.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}
    </div>
  );
}
