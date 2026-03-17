"use client";

import { useState } from "react";
import {
  IconPhoto,
  IconUpload,
  IconSearch,
  IconFile,
  IconVideo,
  IconFileText,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentAssets } from "@/features/marketing/hooks/use-marketing-content";

function getFileIcon(fileType: string): React.ElementType {
  if (fileType.startsWith("image/")) return IconPhoto;
  if (fileType.startsWith("video/")) return IconVideo;
  if (fileType.includes("pdf")) return IconFileText;
  return IconFile;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetsContent() {
  const [search, setSearch] = useState("");
  const { data: assets, isLoading, error, refetch } = useContentAssets();

  const filtered = (assets ?? []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Assets</h1>
          <p className="text-sm text-muted-foreground">Criativos, imagens e arquivos de campanha.</p>
        </div>
        <Button>
          <IconUpload className="mr-1 h-4 w-4" /> Upload
        </Button>
      </div>

      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar assets." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={IconPhoto} title={search ? "Nenhum asset encontrado" : "Biblioteca vazia"} description={search ? "Tente ajustar a busca." : "Faca upload do primeiro asset para comecar."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((asset) => {
            const FileIcon = getFileIcon(asset.file_type);
            return (
              <Card key={asset.id} className="cursor-pointer hover:border-pink-400/40 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="h-24 rounded-md bg-muted/40 flex items-center justify-center">
                    <FileIcon className="size-10 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(asset.file_size)}</p>
                  </div>
                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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
