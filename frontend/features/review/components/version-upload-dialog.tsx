"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/features/review/constants";
import { useUploadVersion } from "@/features/review/hooks/use-review-versions";
import { getVersionLabel } from "@/features/review/types";

interface VersionUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sceneId: string;
  projectId: string;
  nextVersionNumber: number;
}

export function VersionUploadDialog({
  open,
  onOpenChange,
  sceneId,
  projectId,
  nextVersionNumber,
}: VersionUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const uploadVersion = useUploadVersion(sceneId, projectId);

  const nextLabel = getVersionLabel(nextVersionNumber);

  const accept = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].reduce<Record<string, string[]>>(
    (acc, type) => {
      acc[type] = [];
      return acc;
    },
    {}
  );

  const handleUpload = async () => {
    if (files.length === 0) return;
    uploadVersion.mutate(files[0], {
      onSuccess: () => {
        setFiles([]);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Versão — {nextLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta versão será registrada como <strong>{nextLabel}</strong>. Selecione o arquivo de render ou vídeo.
          </p>

          <FileUploader
            value={files}
            onValueChange={setFiles}
            accept={accept}
            maxSize={MAX_FILE_SIZE}
            maxFiles={1}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={files.length === 0 || uploadVersion.isPending}
            onClick={handleUpload}
          >
            {uploadVersion.isPending ? "Enviando..." : "Enviar Versão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
