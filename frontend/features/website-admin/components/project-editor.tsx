"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCreateWebsiteProject,
  useUpdateWebsiteProject,
  useDeleteWebsiteProject,
} from "../hooks/use-website-projects";
import { ImportImagesButton } from "./import-images-button";
import { ProjectEditorHeader } from "./project-editor-header";
import { ProjectEditorMain } from "./project-editor-main";
import { ProjectEditorSidebar } from "./project-editor-sidebar";
import {
  websiteProjectSchema,
  generateSlug,
  type WebsiteProjectFormValues,
} from "../schemas/website-schemas";
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
      <ProjectEditorHeader
        mode={mode}
        project={project}
        isSaving={isSaving}
        onDelete={handleDelete}
      />

      {/* Import external images banner */}
      {mode === "edit" && (
        <ImportImagesButton
          coverUrl={form.watch("cover_url") ?? null}
          gallery={form.watch("gallery")}
          onCoverChange={(url) =>
            form.setValue("cover_url", url, { shouldDirty: true })
          }
          onGalleryChange={(urls) =>
            form.setValue("gallery", urls, { shouldDirty: true })
          }
        />
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectEditorMain form={form} editor={editor} />
        <ProjectEditorSidebar
          form={form}
          autoSlug={autoSlug}
          onAutoSlugChange={setAutoSlug}
        />
      </div>
    </form>
  );
}
