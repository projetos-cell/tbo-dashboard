"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useUploadWebsiteImage } from "../hooks/use-website-projects";

interface ProjectCoverUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ProjectCoverUpload({ value, onChange }: ProjectCoverUploadProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const upload = useUploadWebsiteImage();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || !tenantId) return;
      const url = await upload.mutateAsync({
        tenantId,
        file,
        folder: "website-covers",
      });
      onChange(url);
    },
    [tenantId, upload, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (value) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
        <Image
          src={value}
          alt="Cover"
          fill
          className="object-cover"
          unoptimized
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={() => onChange(null)}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed cursor-pointer
        transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
        ${upload.isPending ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input {...getInputProps()} />
      {upload.isPending ? (
        <p className="text-sm text-muted-foreground">Enviando...</p>
      ) : (
        <>
          <IconPhoto className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Solte a imagem" : "Arraste ou clique para enviar"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            JPG, PNG ou WebP — até 10 MB
          </p>
        </>
      )}
    </div>
  );
}
