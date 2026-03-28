"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TableExt from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBold, IconItalic, IconStrikethrough, IconLink,
  IconArrowLeft, IconDeviceFloppy, IconEye, IconEdit,
  IconTrash, IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useUploadBlogCover,
  useUploadBlogImage,
} from "../hooks/use-blog-posts";
import { blogPostSchema, generateSlug, type BlogPostFormValues } from "../schemas/blog-schemas";
import { BlogCoverUpload } from "./blog-cover-upload";
import { BlogStatusBadge } from "./blog-status-badge";
import { BlogAiGenerateDialog } from "./blog-ai-generate-dialog";
import { BlogPreview } from "./blog-preview";
import { BlogEditorToolbar } from "./blog-editor-toolbar";
import { BlogEditorSidebar } from "./blog-editor-sidebar";
import { BlogSlashMenu } from "./blog-slash-menu";
import { SlashCommandExtension, buildSlashSuggestion, type SlashCommand } from "./blog-slash-commands";
import type { BlogAuthorInfo } from "./blog-author-picker";
import type { BlogPostWithAuthor, BlogPostStatus } from "../types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPostEditorProps {
  post?: BlogPostWithAuthor | null;
  mode: "create" | "edit";
}

const TOOLBAR_BTN =
  "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground data-[active=true]:text-foreground data-[active=true]:bg-muted";

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function getReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function BlogPostEditor({ post, mode }: BlogPostEditorProps) {
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();
  const uploadCover = useUploadBlogCover();
  const uploadImage = useUploadBlogImage();

  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_url ?? null);
  const [authorId, setAuthorId] = useState<string | null>(post?.author_id ?? userId ?? null);
  const [authorName, setAuthorName] = useState<string | null>(post?.author_name ?? null);
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(post?.author_avatar_url ?? null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [slashItems, setSlashItems] = useState<SlashCommand[]>([]);
  const [slashRect, setSlashRect] = useState<(() => DOMRect | null) | null>(null);
  const [slashCommand, setSlashCommand] = useState<((item: SlashCommand) => void) | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const body = form.watch("body");
  const excerpt = form.watch("excerpt");
  const tags = form.watch("tags");
  const publishedAt = form.watch("published_at");
  const status = form.watch("status");
  const slug = form.watch("slug");

  const wordCount = getWordCount(body ?? "");
  const readingTime = getReadingTime(wordCount);

  // Auto-slug on title change
  useEffect(() => {
    if (autoSlug && title) {
      form.setValue("slug", generateSlug(title));
    }
  }, [title, autoSlug, form]);

  // Auto-save every 30s for edit mode (not when published)
  useEffect(() => {
    if (mode !== "edit" || !post || !form.formState.isDirty || status === "publicado") return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      if (!form.formState.isDirty) return;
      try {
        const values = form.getValues() as BlogPostFormValues;
        await updateMutation.mutateAsync({
          id: post.id,
          data: {
            title: values.title,
            slug: values.slug,
            excerpt: values.excerpt ?? null,
            body: values.body,
            status: values.status,
            tags: values.tags,
            cover_url: coverUrl,
            author_id: authorId,
            published_at: values.published_at ?? null,
          },
        });
        toast("Rascunho salvo", { description: "Auto-save", duration: 2000 });
      } catch {
        // Silent fail on auto-save
      }
    }, 30000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, title, status]);

  // Unsaved changes guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty]);

  // Keyboard shortcut Cmd/Ctrl+Shift+P to toggle preview
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setViewMode((v) => (v === "edit" ? "preview" : "edit"));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ─── Slash commands ─────────────────────────────────
  const slashSuggestion = buildSlashSuggestion(
    (items, props) => {
      setSlashItems(items);
      setSlashRect(() => props.clientRect);
      setSlashCommand(() => props.command);
    },
    () => {
      setSlashItems([]);
      setSlashRect(null);
      setSlashCommand(null);
    },
  );

  // ─── TipTap Editor ──────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Comece a escrever ou digite "/" para inserir bloco...' }),
      TableExt.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      SlashCommandExtension.configure({ suggestion: slashSuggestion }),
    ],
    content: post?.body || "",
    editorProps: {
      attributes: { class: "blog-prose focus:outline-none min-h-[400px] px-4 py-3" },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith("image/")) {
            handleInlineImageDrop(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      form.setValue("body", e.getHTML(), { shouldDirty: true });
    },
  });

  // Inline image drop handler
  const handleInlineImageDrop = useCallback(
    async (file: File) => {
      if (!tenantId || !editor) return;
      try {
        const url = await uploadImage.mutateAsync({ tenantId, file });
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // error handled in mutation
      }
    },
    [tenantId, uploadImage, editor],
  );

  // Image upload from toolbar
  const handleToolbarImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!tenantId) throw new Error("Sem tenant");
      return uploadImage.mutateAsync({ tenantId, file });
    },
    [tenantId, uploadImage],
  );

  // Cover upload
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

  const handleAuthorSelect = useCallback((author: BlogAuthorInfo) => {
    setAuthorId(author.id);
    setAuthorName(author.name);
    setAuthorAvatarUrl(author.avatarUrl);
    form.setValue("author_id", author.id);
  }, [form]);

  // ─── Submit ─────────────────────────────────────────
  const onSubmit = form.handleSubmit(async (values) => {
    const v = values as BlogPostFormValues;
    const isScheduled = v.status === "publicado" && v.published_at != null && new Date(v.published_at) > new Date();
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
        v.status === "publicado" && !isScheduled && !v.published_at
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

  const handleAiGenerated = useCallback(
    (result: { title: string; excerpt: string; tags: string[]; body: string }) => {
      if (result.title) {
        form.setValue("title", result.title, { shouldDirty: true });
        if (autoSlug) form.setValue("slug", generateSlug(result.title));
      }
      if (result.excerpt) form.setValue("excerpt", result.excerpt, { shouldDirty: true });
      if (result.tags?.length) form.setValue("tags", result.tags, { shouldDirty: true });
      if (result.body && editor) {
        editor.commands.setContent(result.body);
        form.setValue("body", result.body, { shouldDirty: true });
      }
    },
    [editor, form, autoSlug],
  );

  const saving = createMutation.isPending || updateMutation.isPending;

  // Sidebar content (reused in both desktop sidebar and mobile sheet)
  const sidebarContent = (
    <BlogEditorSidebar
      form={form as UseFormReturn<BlogPostFormValues>}
      mode={mode}
      post={post}
      authorId={authorId}
      authorName={authorName}
      authorAvatarUrl={authorAvatarUrl}
      coverUrl={coverUrl}
      autoSlug={autoSlug}
      onSetAutoSlug={setAutoSlug}
      onAuthorSelect={handleAuthorSelect}
    />
  );

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
          {/* View toggle */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
            <button type="button" onClick={() => setViewMode("edit")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <IconEdit className="h-3.5 w-3.5" />Editar
            </button>
            <button type="button" onClick={() => setViewMode("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <IconEye className="h-3.5 w-3.5" />Preview
            </button>
          </div>

          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <IconSettings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-sm">Metadados</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{sidebarContent}</div>
            </SheetContent>
          </Sheet>

          <Separator orientation="vertical" className="h-6" />

          {mode === "edit" && post && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <IconTrash className="h-4 w-4 mr-1.5" />Excluir
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
          <BlogAiGenerateDialog onGenerated={handleAiGenerated} />
          <Button onClick={onSubmit} disabled={saving} size="sm">
            <IconDeviceFloppy className="h-4 w-4 mr-1.5" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "preview" ? (
            <BlogPreview
              title={title}
              excerpt={excerpt ?? null}
              body={body ?? ""}
              coverUrl={coverUrl}
              authorName={authorName}
              authorAvatarUrl={authorAvatarUrl}
              publishedAt={publishedAt ?? null}
              tags={(tags as string[]) ?? []}
            />
          ) : (
            <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
              <BlogCoverUpload
                coverUrl={coverUrl}
                onUpload={handleCoverUpload}
                onRemove={handleCoverRemove}
              />
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

              {editor && (
                <BlogEditorToolbar editor={editor} onImageUpload={handleToolbarImageUpload} />
              )}

              {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-0.5 rounded-md border bg-background p-1 shadow-md">
                  <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <IconBold className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <IconItalic className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <IconStrikethrough className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className={TOOLBAR_BTN} data-active={editor.isActive("link")} onClick={() => editor.chain().focus().setLink({ href: "" }).run()}>
                    <IconLink className="h-3.5 w-3.5" />
                  </button>
                </BubbleMenu>
              )}

              <div className="rounded-lg border border-border/60 focus-within:border-ring/60 transition-colors bg-background min-h-[400px]">
                <EditorContent editor={editor} />
              </div>

              <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
                <span>{wordCount} palavras</span>
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <div className="w-80 border-l overflow-y-auto bg-muted/20 p-6 shrink-0 hidden lg:block">
          {sidebarContent}
        </div>
      </div>

      {/* Slash commands menu portal */}
      {slashItems.length > 0 && editor && (
        <BlogSlashMenu
          items={slashItems}
          clientRect={slashRect}
          onSelect={(item) => {
            item.command(editor);
            if (slashCommand) slashCommand(item);
            setSlashItems([]);
            setSlashRect(null);
          }}
          onClose={() => {
            setSlashItems([]);
            setSlashRect(null);
          }}
        />
      )}
    </div>
  );
}
