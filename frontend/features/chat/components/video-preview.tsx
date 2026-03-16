"use client";

import { useRef, useState } from "react";
import { IconPlayerPlay, IconDownload, IconExternalLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPreviewProps {
  url: string;
  fileName: string;
  fileSize?: number | null;
  fileType?: string;
  className?: string;
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Feature #40 — Inline video player.
 * Shows a click-to-play poster overlay, then renders a native <video> element.
 * Lazy — video only loads when user clicks play.
 */
export function VideoPreview({
  url,
  fileName,
  fileSize,
  fileType,
  className,
}: VideoPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handlePlay() {
    setPlaying(true);
    // Small delay so the video element mounts first
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => null);
    });
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden max-w-sm bg-black", className)}>
      {!playing ? (
        /* ── Click-to-play overlay ───────────────────── */
        <div className="relative aspect-video flex items-center justify-center bg-black/80 cursor-pointer group" onClick={handlePlay}>
          {/* Thumbnail placeholder gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />

          {/* Play button */}
          <button
            type="button"
            className="relative z-10 flex items-center justify-center h-14 w-14 rounded-full bg-white/90 hover:bg-white shadow-lg transition-transform group-hover:scale-105"
            aria-label="Reproduzir vídeo"
          >
            <IconPlayerPlay size={24} className="text-gray-800 ml-0.5" fill="currentColor" />
          </button>

          {/* File info overlay */}
          <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-xs font-medium truncate">{fileName}</p>
            {fileSize && (
              <p className="text-white/60 text-[10px]">{formatSize(fileSize)}</p>
            )}
          </div>
        </div>
      ) : (
        /* ── Native video player ──────────────────────── */
        <video
          ref={videoRef}
          src={url}
          controls
          className="w-full max-h-96 bg-black"
          preload="metadata"
          title={fileName}
        >
          {fileType && <source src={url} type={fileType} />}
          Seu navegador não suporta o player de vídeo.
        </video>
      )}

      {/* Actions bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/80 border-t">
        <span className="flex-1 text-xs text-muted-foreground truncate">{fileName}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer" title="Abrir em nova aba">
            <IconExternalLink size={12} />
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
          <a href={url} download={fileName} title="Baixar">
            <IconDownload size={12} />
          </a>
        </Button>
      </div>
    </div>
  );
}
