"use client";

import { useState } from "react";
import { IconX, IconPhoto, IconVideo, IconFile, IconFileTypePdf, IconDownload, IconExternalLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChannelMedia } from "@/features/chat/hooks/use-channel-media";
import type { GalleryItem, MediaType } from "@/features/chat/services/chat-media-gallery";

interface MediaGalleryPanelProps {
  channelId: string | null;
  channelName?: string;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Feature #38 — Media Gallery Panel.
 * Side panel showing all files, images, videos, and PDFs from the channel.
 * Tabs: Todos / Imagens / Vídeos / PDFs / Arquivos
 */
export function MediaGalleryPanel({ channelId, channelName, onClose }: MediaGalleryPanelProps) {
  const [tab, setTab] = useState<"all" | MediaType>("all");
  const { data: items, isLoading } = useChannelMedia(channelId);

  const filtered = (items ?? []).filter((item) => tab === "all" || item.mediaType === tab);

  const counts: Record<string, number> = { all: items?.length ?? 0 };
  for (const item of items ?? []) {
    counts[item.mediaType] = (counts[item.mediaType] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col h-full w-80 border-l bg-background shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <p className="text-sm font-semibold">Arquivos & Mídia</p>
          {channelName && (
            <p className="text-xs text-muted-foreground">#{channelName}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <IconX size={16} />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full rounded-none border-b h-auto p-0 bg-transparent justify-start gap-0 overflow-x-auto shrink-0">
          {(["all", "image", "video", "pdf", "file"] as const).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs gap-1 shrink-0"
            >
              {t === "all" && "Todos"}
              {t === "image" && <><IconPhoto size={12} /> Imagens</>}
              {t === "video" && <><IconVideo size={12} /> Vídeos</>}
              {t === "pdf" && <><IconFileTypePdf size={12} /> PDFs</>}
              {t === "file" && <><IconFile size={12} /> Arquivos</>}
              {(counts[t] ?? 0) > 0 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1 py-0 ml-0.5">
                  {counts[t]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        {(["all", "image", "video", "pdf", "file"] as const).map((t) => (
          <TabsContent key={t} value={t} className="flex-1 overflow-y-auto m-0 p-0">
            {isLoading ? (
              <LoadingSkeleton type={t} />
            ) : filtered.length === 0 ? (
              <EmptyState type={t} />
            ) : t === "image" || (t === "all" && filtered.some((i) => i.mediaType === "image")) ? (
              <MixedGalleryView items={filtered} />
            ) : (
              <FileListView items={filtered} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ── Image grid view ─────────────────────────────────────────────── */

function MixedGalleryView({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  // Group by date
  const grouped = items.reduce<Record<string, GalleryItem[]>>((acc, item) => {
    const date = formatDate(item.sentAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <>
      <div className="p-3 space-y-4">
        {Object.entries(grouped).map(([date, groupItems]) => (
          <div key={date}>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">{date}</p>
            <div className="grid grid-cols-3 gap-1">
              {groupItems.map((item) => (
                <GalleryThumbnail key={item.id} item={item} onClick={() => item.mediaType === "image" && setLightbox(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <IconX size={20} />
          </Button>
          <img
            src={lightbox.file_url}
            alt={lightbox.file_name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-white text-sm">{lightbox.file_name}</span>
            <Button variant="secondary" size="sm" asChild>
              <a href={lightbox.file_url} download={lightbox.file_name}>
                <IconDownload size={14} className="mr-1" /> Baixar
              </a>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function GalleryThumbnail({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  if (item.mediaType === "image") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity"
        title={item.file_name}
      >
        <img
          src={item.file_url}
          alt={item.file_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </button>
    );
  }

  // Non-image items in the mixed grid
  return (
    <a
      href={item.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="aspect-square rounded border bg-muted/50 flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors p-2"
      title={item.file_name}
    >
      <MediaTypeIcon type={item.mediaType} size={20} />
      <span className="text-[9px] text-muted-foreground truncate w-full text-center">{item.file_name}</span>
    </a>
  );
}

/* ── File list view ──────────────────────────────────────────────── */

function FileListView({ items }: { items: GalleryItem[] }) {
  return (
    <div className="p-3 space-y-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors group">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted shrink-0">
            <MediaTypeIcon type={item.mediaType} size={16} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium truncate">{item.file_name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatSize(item.file_size)} · {formatDate(item.sentAt)}
              {item.senderName && ` · ${item.senderName}`}
            </span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
              <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                <IconExternalLink size={12} />
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
              <a href={item.file_url} download={item.file_name}>
                <IconDownload size={12} />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function MediaTypeIcon({ type, size = 16, className }: { type: MediaType; size?: number; className?: string }) {
  switch (type) {
    case "image": return <IconPhoto size={size} className={cn("text-blue-500", className)} />;
    case "video": return <IconVideo size={size} className={cn("text-purple-500", className)} />;
    case "pdf": return <IconFileTypePdf size={size} className={cn("text-red-500", className)} />;
    default: return <IconFile size={size} className={cn("text-muted-foreground", className)} />;
  }
}

function LoadingSkeleton({ type }: { type: string }) {
  if (type === "image" || type === "all") {
    return (
      <div className="p-3 grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded" />
        ))}
      </div>
    );
  }
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  const labels: Record<string, string> = {
    all: "Nenhum arquivo compartilhado",
    image: "Nenhuma imagem compartilhada",
    video: "Nenhum vídeo compartilhado",
    pdf: "Nenhum PDF compartilhado",
    file: "Nenhum arquivo compartilhado",
  };

  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
      <IconFile size={28} className="opacity-30" />
      <p className="text-xs">{labels[type] ?? "Sem conteúdo"}</p>
    </div>
  );
}
