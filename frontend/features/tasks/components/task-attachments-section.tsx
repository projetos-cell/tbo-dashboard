"use client";

import { useState, useCallback } from "react";
import {
  IconUpload,
  IconFile,
  IconPhoto,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypeXls,
  IconFileTypeZip,
  IconDownload,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks/use-attachments";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl } from "@/services/attachments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
];

// ─── Helpers ──────────────────────────────────────────

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <IconFile className="size-4 text-muted-foreground" />;
  if (mimeType.startsWith("image/")) return <IconPhoto className="size-4 text-blue-500" />;
  if (mimeType === "application/pdf") return <IconFileTypePdf className="size-4 text-red-500" />;
  if (mimeType.includes("word")) return <IconFileTypeDoc className="size-4 text-blue-600" />;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return <IconFileTypeXls className="size-4 text-green-600" />;
  if (mimeType.includes("zip")) return <IconFileTypeZip className="size-4 text-yellow-600" />;
  return <IconFile className="size-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────

interface TaskAttachmentsSectionProps {
  taskId: string;
}

export function TaskAttachmentsSection({ taskId }: TaskAttachmentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);

  const { data: attachments, isLoading } = useAttachments({ task_id: taskId });
  const upload = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const userId = useAuthStore((s) => s.user?.id);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name}: máximo 25 MB`);
          continue;
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          toast.error(`${file.name}: tipo não suportado`);
          continue;
        }

        setUploading((prev) => [...prev, file.name]);
        try {
          await upload.mutateAsync({ file, taskId });
          toast.success(`${file.name} enviado`);
        } catch {
          toast.error(`Erro ao enviar ${file.name}`);
        } finally {
          setUploading((prev) => prev.filter((n) => n !== file.name));
        }
      }
    },
    [upload, taskId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleOpenFile = async (filePath: string) => {
    const supabase = createClient();
    try {
      const url = await getSignedUrl(supabase, filePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro ao abrir arquivo");
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      await deleteAttachment.mutateAsync({ id, filePath });
      toast.success("Anexo removido");
    } catch {
      toast.error("Erro ao remover anexo");
    }
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors",
          isDragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <IconUpload className="size-4 shrink-0" />
        <span>Arraste ou clique para anexar</span>
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept={ALLOWED_MIME_TYPES.join(",")}
        />
      </label>

      {/* Upload progress */}
      {uploading.map((name) => (
        <div key={name} className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <span className="max-w-[160px] truncate">{name}</span>
        </div>
      ))}

      {/* File list */}
      {isLoading && (
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && attachments && attachments.length > 0 && (
        <div className="space-y-0.5">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
            >
              {getFileIcon(att.mime_type)}

              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => handleOpenFile(att.file_path)}
              >
                <span className="block truncate text-sm font-medium">{att.file_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(att.file_size)}
                </span>
              </button>

              <Button
                size="icon"
                variant="ghost"
                className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleOpenFile(att.file_path)}
                aria-label="Baixar arquivo"
              >
                <IconDownload className="size-3.5" />
              </Button>

              {att.uploaded_by === userId && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 opacity-0 text-destructive hover:text-destructive transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(att.id, att.file_path)}
                  aria-label="Remover anexo"
                >
                  <IconX className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!attachments || attachments.length === 0) && uploading.length === 0 && (
        <p className="py-1 text-center text-xs text-muted-foreground">Nenhum anexo</p>
      )}
    </div>
  );
}
