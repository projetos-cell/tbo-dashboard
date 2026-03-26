"use client";

import { useState } from "react";
import { IconCloudDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth-store";
import { useImportExternalImages } from "../hooks/use-website-projects";
import { toast } from "sonner";

/** Check if a URL is external (not from Supabase storage) */
function isExternalUrl(url: string): boolean {
  return (
    !!url &&
    !url.includes("supabase.co") &&
    !url.includes("supabase.in") &&
    (url.startsWith("http://") || url.startsWith("https://"))
  );
}

interface ImportImagesButtonProps {
  coverUrl: string | null;
  gallery: string[];
  onCoverChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
}

export function ImportImagesButton({
  coverUrl,
  gallery,
  onCoverChange,
  onGalleryChange,
}: ImportImagesButtonProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const importImages = useImportExternalImages();
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const externalCover = coverUrl && isExternalUrl(coverUrl);
  const externalGallery = gallery.filter(isExternalUrl);
  const totalExternal =
    (externalCover ? 1 : 0) + externalGallery.length;

  if (totalExternal === 0) return null;

  const handleImport = async () => {
    if (!tenantId) return;

    const allUrls: string[] = [];
    if (externalCover && coverUrl) allUrls.push(coverUrl);
    allUrls.push(...externalGallery);

    setProgress({ done: 0, total: allUrls.length });

    try {
      const results = await importImages.mutateAsync({
        urls: allUrls,
        tenantId,
        folder: "website",
        onProgress: (done, total) => setProgress({ done, total }),
      });

      let idx = 0;

      // Replace cover
      if (externalCover && coverUrl) {
        onCoverChange(results[idx]);
        idx++;
      }

      // Replace gallery items
      const newGallery = gallery.map((url) => {
        if (isExternalUrl(url)) {
          const newUrl = results[idx];
          idx++;
          return newUrl;
        }
        return url;
      });
      onGalleryChange(newGallery);

      toast.success(
        `${allUrls.length} ${allUrls.length === 1 ? "imagem importada" : "imagens importadas"} para o Storage`,
      );
    } catch {
      // Error toast handled by the hook
    } finally {
      setProgress({ done: 0, total: 0 });
    }
  };

  const isImporting = importImages.isPending;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isImporting}
          className="gap-2"
        >
          <IconCloudDownload className="h-4 w-4" />
          {isImporting
            ? `Importando ${progress.done}/${progress.total}...`
            : `Importar ${totalExternal} ${totalExternal === 1 ? "imagem externa" : "imagens externas"}`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Importar imagens para o Storage?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              {totalExternal}{" "}
              {totalExternal === 1
                ? "imagem está hospedada externamente"
                : "imagens estão hospedadas externamente"}{" "}
              (wearetbo.com.br). Ao importar, elas serão copiadas para o
              Supabase Storage e poderão ser gerenciadas diretamente pelo CMS.
            </span>
            {externalCover && (
              <span className="block text-xs">
                — 1 capa
              </span>
            )}
            {externalGallery.length > 0 && (
              <span className="block text-xs">
                — {externalGallery.length}{" "}
                {externalGallery.length === 1
                  ? "imagem de galeria"
                  : "imagens de galeria"}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isImporting && (
          <div className="space-y-1">
            <Progress
              value={
                progress.total > 0
                  ? (progress.done / progress.total) * 100
                  : 0
              }
            />
            <p className="text-xs text-muted-foreground text-center">
              {progress.done} de {progress.total}
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isImporting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importando..." : "Importar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
