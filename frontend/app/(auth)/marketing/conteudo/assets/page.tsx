"use client";

// Feature #36 — Upload DnD zone com progresso para Supabase Storage
// Feature #37 — Filtro por tipo (imagem/vídeo/doc/outros) e tags
// Feature #38 — Modal de detalhe com preview, metadados, download e copy URL

import { useState, useMemo } from "react";
import {
  IconPhoto,
  IconUpload,
  IconSearch,
  IconFile,
  IconVideo,
  IconFileText,
  IconFilter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentAssets } from "@/features/marketing/hooks/use-marketing-content";
import { UploadAssetModal } from "@/features/marketing/components/content/upload-asset-modal";
import { AssetDetailModal } from "@/features/marketing/components/content/asset-detail-modal";
import type { ContentAsset } from "@/features/marketing/types/marketing";

type AssetTypeFilter = "all" | "image" | "video" | "doc" | "other";

const TYPE_LABELS: Record<AssetTypeFilter, string> = {
  all: "Todos",
  image: "Imagens",
  video: "Vídeos",
  doc: "Documentos",
  other: "Outros",
};

const CAT_LABEL: Record<string, string> = {
  image: "IMG",
  video: "VID",
  doc: "DOC",
  other: "FILE",
};

function getAssetCategory(fileType: string): Exclude<AssetTypeFilter, "all"> {
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("text")
  )
    return "doc";
  return "other";
}

function getFileIcon(fileType: string): React.ElementType {
  if (fileType.startsWith("video/")) return IconVideo;
  if (fileType.includes("pdf")) return IconFileText;
  if (fileType.startsWith("text/") || fileType.includes("document")) return IconFileText;
  return IconFile;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetCard({ asset, onClick }: { asset: ContentAsset; onClick: () => void }) {
  const isImage = asset.file_type.startsWith("image/");
  const FileIcon = getFileIcon(asset.file_type);
  const category = getAssetCategory(asset.file_type);

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:border-pink-400/40 hover:shadow-md transition-all duration-200"
    >
      <CardContent className="p-0">
        <div className="relative h-36 rounded-t-xl overflow-hidden bg-muted/40">
          {isImage && asset.file_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.file_url}
              alt={asset.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("hidden");
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              isImage && asset.file_url ? "hidden" : ""
            }`}
          >
            <FileIcon className="size-12 text-muted-foreground/40" />
          </div>
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="text-[10px] py-0 bg-background/80 backdrop-blur-sm"
            >
              {CAT_LABEL[category]}
            </Badge>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div>
            <p className="font-medium text-sm truncate leading-tight">{asset.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(asset.file_size)}</p>
          </div>
          {asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] py-0 h-4">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] py-0 h-4">
                  +{asset.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AssetsContent() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetTypeFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<ContentAsset | null>(null);
  const { data: assets, isLoading, error, refetch } = useContentAssets();

  // Derive all unique tags from data
  const allTags = useMemo(
    () => [...new Set((assets ?? []).flatMap((a) => a.tags))].sort(),
    [assets],
  );

  const filtered = (assets ?? []).filter((a) => {
    if (typeFilter !== "all" && getAssetCategory(a.file_type) !== typeFilter) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => a.tags.includes(t))) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
  });

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const hasFilters = typeFilter !== "all" || selectedTags.length > 0 || !!search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Assets</h1>
          <p className="text-sm text-muted-foreground">Criativos, imagens e arquivos de campanha.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <IconUpload className="mr-1 h-4 w-4" /> Upload
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFilter className="mr-1 h-4 w-4" />
                {TYPE_LABELS[typeFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(TYPE_LABELS) as AssetTypeFilter[]).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={typeFilter === key}
                  onCheckedChange={() => setTypeFilter(key)}
                >
                  {TYPE_LABELS[key]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tag chips filter (#37) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "border-pink-400 bg-pink-500/15 text-pink-700 dark:text-pink-300"
                    : "border-border text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {error ? (
        <ErrorState message="Erro ao carregar assets." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconPhoto}
          title={hasFilters ? "Nenhum asset encontrado" : "Biblioteca vazia"}
          description={
            hasFilters
              ? "Tente ajustar os filtros."
              : "Faça upload do primeiro asset para começar."
          }
          cta={
            !hasFilters
              ? { label: "Upload", onClick: () => setUploadOpen(true), icon: IconUpload }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onClick={() => setDetailAsset(asset)} />
          ))}
        </div>
      )}

      <UploadAssetModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} />
    </div>
  );
}

export default function AssetsPage() {
  return (
    <RequireRole module="marketing">
      <AssetsContent />
    </RequireRole>
  );
}
