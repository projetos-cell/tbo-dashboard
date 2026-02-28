"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import {
  CULTURA_CATEGORIES,
  CULTURA_STATUS,
  type CulturaCategoryKey,
  type CulturaStatusKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

interface CulturaItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CulturaRow | null;
  defaultCategory?: CulturaCategoryKey;
  onSave: (data: {
    title: string;
    content: string;
    content_html: string;
    category: string;
    status: string;
    icon?: string;
  }) => Promise<void>;
}

export function CulturaItemForm({
  open,
  onOpenChange,
  item,
  defaultCategory,
  onSave,
}: CulturaItemFormProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [content, setContent] = useState(item?.content || "");
  const [contentHtml, setContentHtml] = useState(item?.content_html || "");
  const [category, setCategory] = useState<string>(
    item?.category || defaultCategory || "pilar"
  );
  const [status, setStatus] = useState<string>(item?.status || "draft");
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTitle(item?.title || "");
      setContent(item?.content || "");
      setContentHtml(item?.content_html || "");
      setCategory(item?.category || defaultCategory || "pilar");
      setStatus(item?.status || "draft");
    }
    onOpenChange(isOpen);
  };

  const handleEditorChange = (html: string) => {
    setContentHtml(html);
    setContent(html);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content,
        content_html: contentHtml,
        category,
        status,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar item" : "Novo item de cultura"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para{" "}
            {item ? "atualizar" : "criar"} o item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titulo</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo do item..."
            />
          </div>

          {!defaultCategory && (
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.entries(CULTURA_CATEGORIES) as [
                    CulturaCategoryKey,
                    (typeof CULTURA_CATEGORIES)[CulturaCategoryKey],
                  ][]
                ).map(([key, def]) => (
                  <Badge
                    key={key}
                    variant={category === key ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    style={
                      category === key
                        ? { backgroundColor: def.color, color: "#fff" }
                        : {}
                    }
                    onClick={() => setCategory(key)}
                  >
                    {def.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex gap-1.5">
              {(
                Object.entries(CULTURA_STATUS) as [
                  CulturaStatusKey,
                  (typeof CULTURA_STATUS)[CulturaStatusKey],
                ][]
              ).map(([key, def]) => (
                <Badge
                  key={key}
                  variant={status === key ? "default" : "outline"}
                  className={cn("cursor-pointer text-xs")}
                  onClick={() => setStatus(key)}
                >
                  {def.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Conteudo</Label>
            <TiptapEditor
              content={contentHtml || content || ""}
              onChange={handleEditorChange}
              placeholder="Escreva o conteudo aqui..."
              minHeight="min-h-[300px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
            {item ? "Salvar alteracoes" : "Criar item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
