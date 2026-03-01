"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHANGELOG_TAGS,
  NAV_ITEMS,
  type ChangelogTagKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ChangelogRow = Database["public"]["Tables"]["changelog_entries"]["Row"];

const changelogSchema = z.object({
  version: z.string().min(1, "Versao e obrigatoria"),
  title: z.string().min(1, "Titulo e obrigatorio"),
  published_at: z.string().min(1, "Data de publicacao e obrigatoria"),
  description: z.string().optional(),
  tag: z.string().optional(),
  module: z.string().optional(),
  author: z.string().optional(),
});

type ChangelogFormData = z.infer<typeof changelogSchema>;

interface ChangelogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ChangelogRow | null;
  onSave: (data: {
    version: string;
    title: string;
    description: string;
    tag: string | null;
    module: string | null;
    published_at: string;
    author: string | null;
  }) => Promise<void>;
}

export function ChangelogForm({
  open,
  onOpenChange,
  entry,
  onSave,
}: ChangelogFormProps) {
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<string>("");
  const [module, setModule] = useState<string>("");
  const [publishedAt, setPublishedAt] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ChangelogFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setVersion(entry?.version || "");
      setTitle(entry?.title || "");
      setDescription(entry?.description || "");
      setTag(entry?.tag || "");
      setModule(entry?.module || "");
      setPublishedAt(
        entry?.published_at
          ? entry.published_at.split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setAuthor(entry?.author || "");
      setErrors({});
    }
  }, [open, entry]);

  const handleSubmit = async () => {
    const result = changelogSchema.safeParse({
      version: version.trim(),
      title: title.trim(),
      published_at: publishedAt,
      description: description.trim(),
      tag,
      module,
      author: author.trim(),
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangelogFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ChangelogFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSave({
        version: version.trim(),
        title: title.trim(),
        description: description.trim(),
        tag: tag || null,
        module: module || null,
        published_at: publishedAt,
        author: author.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Editar Entrada" : "Nova Entrada de Changelog"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para{" "}
            {entry ? "atualizar" : "registrar"} a mudanca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cl-version">Versao *</Label>
              <Input
                id="cl-version"
                value={version}
                onChange={(e) => { setVersion(e.target.value); setErrors((prev) => ({ ...prev, version: undefined })); }}
                placeholder="1.0.0"
              />
              {errors.version && (
                <p className="text-xs text-destructive">{errors.version}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cl-date">Data de Publicacao *</Label>
              <Input
                id="cl-date"
                type="date"
                value={publishedAt}
                onChange={(e) => { setPublishedAt(e.target.value); setErrors((prev) => ({ ...prev, published_at: undefined })); }}
              />
              {errors.published_at && (
                <p className="text-xs text-destructive">{errors.published_at}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-title">Titulo *</Label>
            <Input
              id="cl-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
              placeholder="Titulo da mudanca..."
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tag</Label>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={!tag ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setTag("")}
              >
                Nenhuma
              </Badge>
              {(
                Object.entries(CHANGELOG_TAGS) as [
                  ChangelogTagKey,
                  (typeof CHANGELOG_TAGS)[ChangelogTagKey],
                ][]
              ).map(([key, def]) => (
                <Badge
                  key={key}
                  variant={tag === key ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  style={
                    tag === key
                      ? { backgroundColor: def.color, color: "#fff" }
                      : {}
                  }
                  onClick={() => setTag(key)}
                >
                  {def.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Modulo</Label>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modulo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {NAV_ITEMS.map((item) => (
                  <SelectItem key={item.module} value={item.module}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-desc">Descricao</Label>
            <Textarea
              id="cl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as mudancas realizadas..."
              rows={5}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-author">Autor</Label>
            <Input
              id="cl-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nome do autor..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!version.trim() || !title.trim() || !publishedAt || saving}
          >
            {saving
              ? "Salvando..."
              : entry
                ? "Salvar alteracoes"
                : "Criar entrada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
