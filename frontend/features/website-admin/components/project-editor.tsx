"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTrash,
  IconExternalLink,
  IconLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
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
import { useAuthStore } from "@/stores/auth-store";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import {
  useCreateWebsiteProject,
  useUpdateWebsiteProject,
  useDeleteWebsiteProject,
} from "../hooks/use-website-projects";
import { ProjectCoverUpload } from "./project-cover-upload";
import { GalleryUpload } from "./gallery-upload";
import { TagsInput } from "./tags-input";
import {
  websiteProjectSchema,
  generateSlug,
  type WebsiteProjectFormValues,
} from "../schemas/website-schemas";
import { CATEGORY_LABELS } from "../types";
import type { WebsiteProject } from "../types";

interface ProjectEditorProps {
  project?: WebsiteProject;
  mode: "create" | "edit";
}

export function ProjectEditor({ project, mode }: ProjectEditorProps) {
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const create = useCreateWebsiteProject();
  const update = useUpdateWebsiteProject();
  const remove = useDeleteWebsiteProject();

  const form = useForm<WebsiteProjectFormValues>({
    resolver: zodResolver(websiteProjectSchema) as never,
    defaultValues: {
      name: project?.name ?? "",
      slug: project?.slug ?? "",
      client_name: project?.client_name ?? "",
      location: project?.location ?? "",
      year: project?.year ?? new Date().getFullYear(),
      category: project?.category ?? "branding",
      cover_url: project?.cover_url ?? null,
      gallery: project?.gallery ?? [],
      description: project?.description ?? "",
      highlights: project?.highlights ?? [],
      services: project?.services ?? [],
      testimonial_text: project?.testimonial_text ?? "",
      testimonial_author: project?.testimonial_author ?? "",
      status: project?.status ?? "rascunho",
      sort_order: project?.sort_order ?? 0,
      seo_title: project?.seo_title ?? "",
      seo_description: project?.seo_description ?? "",
      published_at: project?.published_at ?? null,
    },
  });

  const name = form.watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && name) {
      form.setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  }, [autoSlug, name, form]);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExt.configure({ openOnClick: false }),
      ImageExt.configure({ inline: false, allowBase64: true }),
    ],
    content: project?.description ?? "",
    onUpdate: ({ editor: e }) => {
      form.setValue("description", e.getHTML(), { shouldDirty: true });
    },
  });

  const isSaving = create.isPending || update.isPending;

  const onSubmit = useCallback(
    async (values: WebsiteProjectFormValues) => {
      if (!tenantId) return;

      // Auto-set published_at when publishing
      const published_at =
        values.status === "publicado" && !values.published_at
          ? new Date().toISOString()
          : values.published_at;

      if (mode === "create") {
        const result = await create.mutateAsync({
          ...values,
          tenant_id: tenantId,
          published_at,
        });
        router.push(`/website-admin/projetos/${result.id}`);
      } else if (project) {
        await update.mutateAsync({
          id: project.id,
          data: { ...values, published_at },
        });
      }
    },
    [tenantId, mode, project, create, update, router],
  );

  const handleDelete = useCallback(async () => {
    if (!project) return;
    await remove.mutateAsync(project.id);
    router.push("/website-admin/projetos");
  }, [project, remove, router]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-3 -mx-6 px-6 border-b">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/website-admin/projetos")}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {mode === "create" ? "Novo Projeto" : project?.name ?? "Editar"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Preencha as informações do projeto"
                : `Última edição: ${new Date(project?.updated_at ?? "").toLocaleDateString("pt-BR")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <IconTrash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. O projeto será removido
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" size="sm" disabled={isSaving}>
            <IconDeviceFloppy className="h-4 w-4 mr-1" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover */}
          <div className="space-y-2">
            <Label>Capa do Projeto</Label>
            <Controller
              control={form.control}
              name="cover_url"
              render={({ field }) => (
                <ProjectCoverUpload
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ex: Edifício Aurora"
              className="text-lg font-medium h-12"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <div className="rounded-md border min-h-[200px]">
              {/* Toolbar */}
              {editor && (
                <div className="flex items-center gap-1 border-b px-2 py-1.5 bg-muted/50 flex-wrap">
                  <Button
                    type="button"
                    variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    H3
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button
                    type="button"
                    variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs font-bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    B
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    I
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button
                    type="button"
                    variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    Lista
                  </Button>
                  <Button
                    type="button"
                    variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    Citação
                  </Button>
                </div>
              )}
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 focus:outline-none min-h-[160px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[160px]"
              />
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-2">
            <Label>Galeria de Imagens</Label>
            <Controller
              control={form.control}
              name="gallery"
              render={({ field }) => (
                <GalleryUpload value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Testimonial */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <Label className="text-sm font-medium">Depoimento (opcional)</Label>
            <Textarea
              {...form.register("testimonial_text")}
              placeholder="O que o cliente disse sobre o projeto..."
              className="min-h-[80px]"
            />
            <Input
              {...form.register("testimonial_author")}
              placeholder="Nome do autor do depoimento"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
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
                  <span className="text-[10px] text-muted-foreground">
                    Auto
                  </span>
                  <Switch
                    checked={autoSlug}
                    onCheckedChange={setAutoSlug}
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

          {/* Metadata */}
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

          {/* Tags */}
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

          {/* SEO */}
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
        </div>
      </div>
    </form>
  );
}
