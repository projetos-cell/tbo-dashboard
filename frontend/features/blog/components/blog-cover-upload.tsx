"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { IconPhoto, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogCoverUploadProps {
  coverUrl: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  disabled?: boolean;
}

export function BlogCoverUpload({ coverUrl, onUpload, onRemove, disabled }: BlogCoverUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: disabled || uploading,
  });

  if (coverUrl) {
    return (
      <div className="relative group rounded-lg overflow-hidden border border-border">
        <Image
          src={coverUrl}
          alt="Capa do artigo"
          width={800}
          height={400}
          className="w-full h-48 object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button variant="secondary" size="sm" disabled={uploading}>
              {uploading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconPhoto className="h-4 w-4" />}
              <span className="ml-1.5">Trocar</span>
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={onRemove} disabled={uploading}>
            <IconTrash className="h-4 w-4" />
            <span className="ml-1.5">Remover</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        (disabled || uploading) && "opacity-50 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <IconLoader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      ) : (
        <IconPhoto className="h-8 w-8 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground text-center">
        {isDragActive ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para selecionar"}
      </p>
      <p className="text-xs text-muted-foreground/60">JPG, PNG ou WebP. Max 5MB.</p>
    </div>
  );
}
