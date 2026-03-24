"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBold,
  IconItalic,
  IconLink,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconPhoto,
  IconArrowLeft,
  IconDeviceFloppy,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useUploadBlogCover } from "../hooks/use-blog-posts";
import { blogPostSchema, generateSlug, type BlogPostFormValues } from "../schemas/blog-schemas";
import { BlogCoverUpload } from "./blog-cover-upload";
import { BlogAuthorPicker } from "./blog-author-picker";
import { BlogStatusBadge } from "./blog-status-badge";
import type { BlogPostWithAuthor, BlogPostStatus } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPostEditorProps {
  post?: BlogPostWithAuthor | null;
  mode: "create" | "edit";
}

const TOOLBAR_BTN =
  "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground data-[active=true]:text-foreground data-[active=true]:bg-muted";

export function BlogPostEditor({ post, mode }: BlogPostEditorProps) {
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  const uploadCover = useUploadBlogCover();

  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_url ?? null);
  const [authorId, setAuthorId] = useState<string | null>(post?.author_id ?? userId ?? null);
  const [authorName, setAuthorName] = useState<string | null>(post?.author_name ?? null);
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(post?.author_avatar_url ?? null);

  const form = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      body: post?.body ?? "",
      status: (post?.status ?? "rascunho") as BlogPostFormValues["status"],
      author_id: post?.author_id ?? userId ?? null,
      published_at: post?.published_at ?? null,
      tags: post?.tags ?? [],
      cover_url: post?.cover_url ?? null,
    },
  });

  const title = form.watch("title");

  useEffect(() => {
    if (autoSlug && title) {
      form.setValue("slug", generateSlug(title));
    }
  }, [title, autoSlug, form]);

  // ─── TipTap Editor ──────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExt.configure({ openOnClick: false }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Comece a escrever seu artigo..." }),
    ],
    content: post?.body || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-4 py-3 prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-img:rounded-lg prose-img:mx-auto",
      },
    },
    onUpdate: ({ editor: e }) => {
      form.setValue("body", e.getHTML(), { shouldDirty: true });
    },
  });

  // ─── Image insert ───────────────────────────────────
  const insertImage = useCallback(() => {
    const url = window.prompt("URL da imagem:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // ─── Cover upload handler ───────────────────────────
  const handleCoverUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!tenantId) throw new Error("Sem tenant");
      const url = await uploadCover.mutateAsync({ tenantId, file });
      setCoverUrl(url);
      form.setValue("cover_url", url);
      return url;
    },
    [tenantId, uploadCover, form],
  );

  const handleCoverRemove = useCallback(() => {
    setCoverUrl(null);
    form.setValue("cover_url", null);
  }, [form]);

  // ─── Submit ─────────────────────────────────────────
  const onSubmit = form.handleSubmit(async (values) => {
    const v = values as BlogPostFormValues;
    const payload = {
      title: v.title,
      slug: v.slug,
      excerpt: v.excerpt ?? null,
      body: v.body,
      status: v.status,
      tags: v.tags,
      cover_url: coverUrl,
      author_id: authorId,
      published_at:
        v.status === "publicado" && !v.published_at
          ? new Date().toISOString()
          : (v.published_at ?? null),
    };

    if (mode === "create") {
      if (!tenantId) return;
      await createMutation.mutateAsync({ ...payload, tenant_id: tenantId });
      router.push("/blog");
    } else if (post) {
      await updateMutation.mutateAsync({ id: post.id, data: payload });
    }
  });

  const handleDelete = async () => {
    if (!post) return;
    await deleteMutation.mutateAsync(post.id);
    router.push("/blog");
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/blog")}>
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {mode === "create" ? "Novo Artigo" : "Editar Artigo"}
          </h1>
          {post && <BlogStatusBadge status={post.status} />}
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && post && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <IconTrash className="h-4 w-4 mr-1.5" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser desfeita. O artigo sera removido permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={onSubmit} disabled={saving} size="sm">
            <IconDeviceFloppy className="h-4 w-4 mr-1.5" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
            {/* Cover */}
            <BlogCoverUpload
              coverUrl={coverUrl}
              onUpload={handleCoverUpload}
              onRemove={handleCoverRemove}
            />

            {/* Title */}
            <Controller
              control={form.control}
              name="title"
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Titulo do artigo"
                  className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/40"
                />
              )}
            />

            {/* Toolbar */}
            {editor && (
              <div className="flex items-center gap-0.5 border rounded-lg px-2 py-1 bg-muted/30 flex-wrap">
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                  <IconH1 className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                  <IconH2 className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                  <IconH3 className="h-4 w-4" />
                </button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                  <IconBold className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <IconItalic className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
                  <IconCode className="h-4 w-4" />
                </button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                  <IconList className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                  <IconListNumbers className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                  <IconBlockquote className="h-4 w-4" />
                </button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <button
                  type="button"
                  className={TOOLBAR_BTN}
                  data-active={editor.isActive("link")}
                  onClick={() => {
                    const url = window.prompt("URL do link:", editor.getAttributes("link").href as string);
                    if (url === null) return;
                    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
                    editor.chain().focus().setLink({ href: url }).run();
                  }}
                >
                  <IconLink className="h-4 w-4" />
                </button>
                <button type="button" className={TOOLBAR_BTN} onClick={insertImage}>
                  <IconPhoto className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Editor */}
            <div className="rounded-lg border border-border/60 focus-within:border-ring/60 transition-colors bg-background min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l overflow-y-auto bg-muted/20 p-6 space-y-6 shrink-0 hidden lg:block">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Metadados</h2>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Controller
                control={form.control}
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
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Slug</Label>
                {mode === "create" && (
                  <button
                    type="button"
                    className="text-[10px] text-primary hover:underline"
                    onClick={() => setAutoSlug(!autoSlug)}
                  >
                    {autoSlug ? "Editar manual" : "Gerar auto"}
                  </button>
                )}
              </div>
              <Controller
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      className="h-9 text-xs font-mono"
                      disabled={autoSlug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        field.onChange(e);
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
                onSelect={(id) => {
                  setAuthorId(id);
                  form.setValue("author_id", id);
                }}
              />
            </div>

            {/* Data de publicacao */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data de publicacao</Label>
              <Controller
                control={form.control}
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
              <Label className="text-xs text-muted-foreground">Resumo (excerpt)</Label>
              <Controller
                control={form.control}
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
              <Label className="text-xs text-muted-foreground">Tags (separadas por virgula)</Label>
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <Input
                    className="h-9 text-xs"
                    value={(field.value as string[] ?? []).join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      field.onChange(tags);
                    }}
                    placeholder="marketing, tendencias, cases"
                  />
                )}
              />
            </div>
          </div>

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
      </div>
    </div>
  );
}
