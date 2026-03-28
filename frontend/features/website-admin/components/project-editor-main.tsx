"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { EditorContent, type Editor } from "@tiptap/react";
import { ProjectCoverUpload } from "./project-cover-upload";
import { GalleryUpload } from "./gallery-upload";
import type { WebsiteProjectFormValues } from "../schemas/website-schemas";

interface ProjectEditorMainProps {
  form: UseFormReturn<WebsiteProjectFormValues>;
  editor: Editor | null;
}

export function ProjectEditorMain({ form, editor }: ProjectEditorMainProps) {
  return (
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

      {/* Description (TipTap Editor) */}
      <div className="space-y-2">
        <Label>Descrição</Label>
        <div className="rounded-md border min-h-[200px]">
          {editor && <EditorToolbar editor={editor} />}
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
  );
}

/* ── TipTap Toolbar ─────────────────────────────────────────── */

interface EditorToolbarProps {
  editor: Editor;
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
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
  );
}
