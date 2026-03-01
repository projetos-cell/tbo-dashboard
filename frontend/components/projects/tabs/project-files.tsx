"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Image,
  Film,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks/use-attachments";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Attachment = Database["public"]["Tables"]["project_attachments"]["Row"];

interface ProjectFilesProps {
  projectId: string;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return FileText;
  return File;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const { data: attachments, isLoading } = useAttachments({
    project_id: projectId,
  });
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadAttachment.mutateAsync({ file, projectId });
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("project-attachments")
      .createSignedUrl(attachment.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    const confirmed = window.confirm(
      `Excluir "${attachment.file_name}"?`
    );
    if (!confirmed) return;
    await deleteAttachment.mutateAsync({
      id: attachment.id,
      filePath: attachment.file_path,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileDropzone onUpload={handleUpload} />

      {attachments && attachments.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {attachments.length}{" "}
              {attachments.length === 1 ? "arquivo" : "arquivos"}
            </p>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("grid")}
                aria-label="Visualizacao em grade"
              >
                <Grid3X3 className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("list")}
                aria-label="Visualizacao em lista"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((att) => {
                const Icon = getFileIcon(att.mime_type);
                const isImage = att.mime_type?.startsWith("image/");
                return (
                  <Card key={att.id} className="group">
                    <CardContent className="p-3">
                      {isImage ? (
                        <div className="h-24 rounded-md bg-muted flex items-center justify-center overflow-hidden mb-2">
                          <Image className="size-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="h-24 rounded-md bg-muted flex items-center justify-center mb-2">
                          <Icon className="size-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium truncate">
                        {att.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(att.file_size)}
                        {att.created_at &&
                          ` • ${format(new Date(att.created_at), "dd MMM", { locale: ptBR })}`}
                      </p>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleDownload(att)}
                        >
                          <Download className="size-3 mr-1" />
                          Baixar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive"
                          onClick={() => handleDelete(att)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {attachments.map((att) => {
                const Icon = getFileIcon(att.mime_type);
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 px-4 py-2.5 group"
                  >
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">
                      {att.file_name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatSize(att.file_size)}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {att.created_at &&
                        format(new Date(att.created_at), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => handleDownload(att)}
                        aria-label="Download"
                      >
                        <Download className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive"
                        onClick={() => handleDelete(att)}
                        aria-label="Excluir arquivo"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {(!attachments || attachments.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum arquivo anexado
        </p>
      )}
    </div>
  );
}
