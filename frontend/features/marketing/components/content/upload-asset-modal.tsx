"use client";

// Feature #36 — Upload de arquivo com drag-drop zone e progresso para Supabase Storage

import { useState, useRef, useCallback } from "react";
import { IconUpload, IconX, IconFile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

interface UploadAssetModalProps {
  open: boolean;
  onClose: () => void;
}

type FileProgress = { value: number; error: boolean };

export function UploadAssetModal({ open, onClose }: UploadAssetModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<Record<string, FileProgress>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleUpload = async () => {
    if (!files.length || !tenantId) return;
    setUploading(true);
    const supabase = createClient();
    let anyError = false;

    for (const file of files) {
      const key = file.name;
      try {
        setProgress((p) => ({ ...p, [key]: { value: 10, error: false } }));
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: storageError } = await supabase.storage
          .from("marketing-assets")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (storageError) throw storageError;

        setProgress((p) => ({ ...p, [key]: { value: 70, error: false } }));

        const { data: publicData } = supabase.storage
          .from("marketing-assets")
          .getPublicUrl(path);

        await (supabase as SupabaseClient)
          .from("marketing_content_assets")
          .insert({
            tenant_id: tenantId,
            name: file.name,
            file_url: publicData.publicUrl,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            tags,
            campaign_id: null,
            uploaded_by: userId ?? null,
          } as never);

        setProgress((p) => ({ ...p, [key]: { value: 100, error: false } }));
      } catch {
        anyError = true;
        setProgress((p) => ({ ...p, [key]: { value: 100, error: true } }));
      }
    }

    qc.invalidateQueries({ queryKey: ["marketing-content-assets"] });
    setUploading(false);

    if (anyError) {
      toast.error("Alguns arquivos falharam no upload");
    } else {
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso`);
      handleClose();
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setTags([]);
    setTagInput("");
    setProgress({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload de Assets</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragging
              ? "border-pink-400 bg-pink-50/10"
              : "border-border hover:border-muted-foreground/40"
          }`}
        >
          <IconUpload className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Arraste arquivos ou clique para selecionar</p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF, MP4 e outros</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* File list with progress */}
        {files.length > 0 && (
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {files.map((f, i) => {
              const prog = progress[f.name];
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <IconFile className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{f.name}</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  {prog !== undefined ? (
                    <div className="w-20">
                      <Progress
                        value={prog.value}
                        className={prog.error ? "[&>div]:bg-red-500" : ""}
                      />
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                    >
                      <IconX className="size-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: campanha, institucional"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1"
            />
            <Button variant="outline" onClick={addTag} type="button">
              Adicionar
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => removeTag(t)}
                >
                  {t} <IconX className="size-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!files.length || uploading}>
            {uploading ? "Enviando..." : `Enviar${files.length > 0 ? ` (${files.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
