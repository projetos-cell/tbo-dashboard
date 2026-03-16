"use client";

import { useState } from "react";
import { IconFile, IconDownload, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatAttachmentRow } from "@/features/chat/services/chat-attachments";
import { isImageFile } from "@/features/chat/services/chat-attachments";
import { isVideoFile, isPdfFile } from "@/features/chat/services/chat-media-gallery";
import { PdfPreview } from "./pdf-preview";
import { VideoPreview } from "./video-preview";

interface MessageAttachmentsProps {
  attachments: ChatAttachmentRow[];
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => isImageFile(a.file_type));
  const videos = attachments.filter((a) => isVideoFile(a.file_type));
  const pdfs = attachments.filter((a) => isPdfFile(a.file_type));
  const files = attachments.filter(
    (a) => !isImageFile(a.file_type) && !isVideoFile(a.file_type) && !isPdfFile(a.file_type),
  );

  return (
    <div className="mt-1 space-y-1.5">
      {/* Image grid */}
      {images.length > 0 && (
        <div className={cn("flex gap-1 flex-wrap", images.length === 1 && "max-w-sm")}>
          {images.map((img) => (
            <ImagePreview key={img.id} attachment={img} />
          ))}
        </div>
      )}

      {/* #40 — Video players */}
      {videos.map((v) => (
        <VideoPreview
          key={v.id}
          url={v.file_url}
          fileName={v.file_name}
          fileSize={v.file_size}
          fileType={v.file_type}
        />
      ))}

      {/* #39 — PDF previews */}
      {pdfs.map((p) => (
        <PdfPreview
          key={p.id}
          url={p.file_url}
          fileName={p.file_name}
          fileSize={p.file_size}
        />
      ))}

      {/* Generic file list */}
      {files.map((file) => (
        <FileItem key={file.id} attachment={file} />
      ))}
    </div>
  );
}

/* ── Image thumbnail with lightbox ─────────────────────────────────── */

function ImagePreview({ attachment }: { attachment: ChatAttachmentRow }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="rounded-lg overflow-hidden border hover:opacity-90 transition-opacity cursor-pointer"
      >
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="max-h-48 max-w-xs object-cover"
          loading="lazy"
        />
      </button>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <IconX size={20} />
          </Button>
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ── File download card ────────────────────────────────────────────── */

function FileItem({ attachment }: { attachment: ChatAttachmentRow }) {
  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-lg border bg-muted/50 px-3 py-2 max-w-xs hover:bg-muted transition-colors group"
    >
      <IconFile size={20} className="text-muted-foreground shrink-0" />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm truncate">{attachment.file_name}</span>
        <span className="text-[10px] text-muted-foreground">
          {formatSize(attachment.file_size)}
        </span>
      </div>
      <IconDownload
        size={16}
        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </a>
  );
}
