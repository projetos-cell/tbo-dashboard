"use client";

import { useState } from "react";
import { IconFile, IconDownload, IconExternalLink, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PdfPreviewProps {
  url: string;
  fileName: string;
  fileSize?: number | null;
  className?: string;
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Feature #39 — Inline PDF preview.
 * Shows a compact card with toggle to expand an iframe preview.
 * Falls back gracefully if iframe is blocked by browser security.
 */
export function PdfPreview({ url, fileName, fileSize, className }: PdfPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className={cn("rounded-lg border bg-muted/30 overflow-hidden max-w-sm", className)}>
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100 dark:bg-red-900/30 shrink-0">
          <IconFile size={16} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{fileName}</span>
          <span className="text-[10px] text-muted-foreground">
            PDF{fileSize ? ` · ${formatSize(fileSize)}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Recolher" : "Visualizar PDF"}
          >
            {expanded ? <IconEyeOff size={14} /> : <IconEye size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer" title="Abrir em nova aba">
              <IconExternalLink size={14} />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
          >
            <a href={url} download={fileName} title="Baixar">
              <IconDownload size={14} />
            </a>
          </Button>
        </div>
      </div>

      {/* Inline preview */}
      {expanded && (
        <div className="border-t">
          {iframeError ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
              <IconFile size={24} className="opacity-40" />
              <p>Preview indisponível</p>
              <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Abrir PDF <IconExternalLink size={13} className="ml-1" />
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              src={url}
              title={fileName}
              className="w-full h-80 border-0"
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
