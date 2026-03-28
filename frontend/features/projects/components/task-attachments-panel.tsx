"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconPaperclip,
  IconTrash,
  IconDownload,
  IconFileText,
  IconPhoto,
  IconVideo,
  IconFile,
  IconUpload,
  IconFileZip,
} from "@tabler/icons-react";
import {
  useTaskAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "../hooks/use-task-advanced";
import type { TaskAttachment } from "../hooks/use-task-advanced";

function getFileIcon(fileType: string | null) {
  if (!fileType) return IconFile;
  if (fileType.startsWith("image/")) return IconPhoto;
  if (fileType.startsWith("video/")) return IconVideo;
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("text")) return IconFileText;
  if (fileType.includes("zip") || fileType.includes("tar") || fileType.includes("compressed")) return IconFileZip;
  return IconFile;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface TaskAttachmentsPanelProps {
  taskId: string;
}

export function TaskAttachmentsPanel({ taskId }: TaskAttachmentsPanelProps) {
  const { data: attachments, isLoading } = useTaskAttachments(taskId);
  const uploadAttachment = useUploadAttachment(taskId);
  const deleteAttachment = useDeleteAttachment(taskId);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => uploadAttachment.mutate(file));
    },
    [uploadAttachment],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => uploadAttachment.mutate(file));
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconPaperclip size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Anexos</h3>
        {attachments && attachments.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{attachments.length}</span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center transition-colors hover:border-muted-foreground/40"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Upload files"
        />
        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
          <IconUpload size={20} className="text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Arraste arquivos aqui ou clique para selecionar
          </p>
        </div>
        {uploadAttachment.isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
            <p className="text-xs font-medium">Enviando...</p>
          </div>
        )}
      </div>

      {/* Files list */}
      {attachments && attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment: TaskAttachment) => {
            const FileIcon = getFileIcon(attachment.file_type);
            return (
              <li
                key={attachment.id}
                className="group flex items-center gap-3 rounded-md border bg-card px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <FileIcon size={16} className="shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium">{attachment.file_name}</p>
                  {attachment.file_size && (
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={attachment.file_name}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <IconDownload size={13} />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            deleteAttachment.mutate({
                              id: attachment.id,
                              storagePath: attachment.storage_path,
                            })
                          }
                        >
                          <IconTrash size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Remover</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed py-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhum anexo</p>
        </div>
      )}
    </div>
  );
}
