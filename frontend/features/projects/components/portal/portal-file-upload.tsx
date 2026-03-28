"use client";

import { useRef, useState, useCallback } from "react";
import {
  IconUpload,
  IconFile,
  IconDownload,
  IconTrash,
  IconPhoto,
  IconFileText,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared";
import { usePortalFiles, useUploadPortalFile, useDeletePortalFile } from "@/features/projects/hooks/use-portal";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PortalFileUploadProps {
  projectId: string;
  tenantId: string;
  uploaderName?: string;
  uploaderEmail?: string;
  taskId?: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"];
  if (imageExts.includes(ext)) {
    return <IconPhoto className="size-4 text-blue-500" />;
  }
  const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
  if (docExts.includes(ext)) {
    return <IconFileText className="size-4 text-orange-500" />;
  }
  return <IconFile className="size-4 text-muted-foreground" />;
}

export function PortalFileUpload({
  projectId,
  tenantId,
  uploaderName,
  uploaderEmail,
  taskId,
}: PortalFileUploadProps) {
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { data: files = [], isLoading } = usePortalFiles(projectId);
  const upload = useUploadPortalFile();
  const deleteFile = useDeletePortalFile(projectId);

  const resolvedName =
    uploaderName ?? user?.user_metadata?.name ?? user?.email ?? "Anonimo";
  const resolvedEmail = uploaderEmail ?? user?.email ?? "";

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const fileArr = Array.from(incoming);
      setPendingFiles((prev) => [...prev, ...fileArr]);

      fileArr.forEach((file) => {
        upload.mutate(
          {
            tenant_id: tenantId,
            project_id: projectId,
            task_id: taskId ?? null,
            uploaded_by_name: resolvedName,
            uploaded_by_email: resolvedEmail,
            file,
          },
          {
            onSuccess: () => {
              setPendingFiles((prev) => prev.filter((f) => f !== file));
              toast.success(`"${file.name}" enviado com sucesso`);
            },
            onError: () => {
              setPendingFiles((prev) => prev.filter((f) => f !== file));
              toast.error(`Erro ao enviar "${file.name}"`);
            },
          },
        );
      });
    },
    [upload, tenantId, projectId, taskId, resolvedName, resolvedEmail],
  );

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDelete(id: string, storagePath: string, fileName: string) {
    deleteFile.mutate(
      { id, storagePath },
      {
        onSuccess: () => toast.success(`"${fileName}" removido`),
        onError: () => toast.error(`Erro ao remover "${fileName}"`),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconUpload className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          Arquivos{" "}
          <span className="text-muted-foreground font-normal">
            ({files.length})
          </span>
        </h3>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/60 bg-card hover:border-primary/50 hover:bg-accent/20"
        }`}
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <IconUpload className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Clique ou arraste arquivos</p>
          <p className="text-xs text-muted-foreground">
            Qualquer formato · Max 50 MB por arquivo
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Pending uploads */}
      {pendingFiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Enviando...</p>
          {pendingFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2 opacity-60"
            >
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {files.length === 0 && pendingFiles.length === 0 ? (
        <EmptyState
          title="Sem arquivos"
          description="Envie arquivos para compartilhar com a equipe e o cliente."
          compact
        />
      ) : (
        <div className="space-y-1.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2.5 transition-colors hover:bg-accent/20"
            >
              <FileIcon fileName={file.file_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.file_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(file.file_size)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {file.uploaded_by_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(file.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {file.public_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    asChild
                  >
                    <a
                      href={file.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.file_name}
                    >
                      <IconDownload className="size-3.5" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() =>
                    handleDelete(file.id, file.storage_path, file.file_name)
                  }
                  disabled={deleteFile.isPending}
                >
                  <IconX className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
