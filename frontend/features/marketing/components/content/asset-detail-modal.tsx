"use client";

// Feature #38 — Modal de detalhe com preview, metadados, download e copy URL

import { useState } from "react";
import {
  IconDownload,
  IconCopy,
  IconCheck,
  IconFile,
  IconVideo,
  IconFileText,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { ContentAsset } from "@/features/marketing/types/marketing";

interface AssetDetailModalProps {
  asset: ContentAsset | null;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string): React.ElementType {
  if (fileType.startsWith("video/")) return IconVideo;
  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.startsWith("text/")
  )
    return IconFileText;
  return IconFile;
}

export function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const isImage = asset.file_type.startsWith("image/");
  const FileIcon = getFileIcon(asset.file_type);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.file_url);
      setCopied(true);
      toast.success("URL copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar URL");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = asset.file_url;
    a.download = asset.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{asset.name}</DialogTitle>
        </DialogHeader>

        {/* Preview area */}
        <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-muted/40">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.file_url}
              alt={asset.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <FileIcon className="size-16 opacity-40" />
              <span className="text-sm">{asset.file_type}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Tamanho</p>
            <p className="font-medium">{formatFileSize(asset.file_size)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Tipo</p>
            <p className="font-medium">{asset.file_type || "Desconhecido"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Upload em</p>
            <p className="font-medium">
              {new Date(asset.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {asset.tags.length > 0 && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1">
                {asset.tags.map((t) => (
                  <Badge key={t} variant="outline" className="h-5 text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button onClick={handleDownload} className="flex-1">
            <IconDownload className="mr-2 size-4" />
            Download
          </Button>
          <Button variant="outline" onClick={handleCopyUrl} className="flex-1">
            {copied ? (
              <IconCheck className="mr-2 size-4 text-green-500" />
            ) : (
              <IconCopy className="mr-2 size-4" />
            )}
            {copied ? "Copiado!" : "Copiar URL"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
