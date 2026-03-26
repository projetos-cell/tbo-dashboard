"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { IconPlus, IconX, IconGripVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useUploadWebsiteImage } from "../hooks/use-website-projects";

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function GalleryUpload({ value, onChange }: GalleryUploadProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const upload = useUploadWebsiteImage();

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!tenantId) return;
      const urls: string[] = [];
      for (const file of files) {
        const url = await upload.mutateAsync({
          tenantId,
          file,
          folder: "website-gallery",
        });
        urls.push(url);
      }
      onChange([...value, ...urls]);
    },
    [tenantId, upload, value, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
  });

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-video rounded-md overflow-hidden border bg-muted group"
            >
              <Image
                src={url}
                alt={`Imagem ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove(i)}
              >
                <IconX className="h-3 w-3" />
              </Button>
              <span className="absolute bottom-1 left-1 text-[10px] text-white/80 bg-black/40 rounded px-1">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`
          flex items-center justify-center h-20 rounded-lg border-2 border-dashed cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${upload.isPending ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} />
        {upload.isPending ? (
          <p className="text-sm text-muted-foreground">Enviando...</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconPlus className="h-4 w-4" />
            <span>Adicionar imagens à galeria</span>
          </div>
        )}
      </div>
    </div>
  );
}
