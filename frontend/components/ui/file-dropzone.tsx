"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onUpload: (files: File[]) => Promise<void> | void;
  maxSize?: number;
  accept?: Accept;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  onUpload,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept,
  multiple = true,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (multiple) {
        setStagedFiles((prev) => [...prev, ...acceptedFiles]);
      } else {
        setStagedFiles(acceptedFiles.slice(0, 1));
      }
    },
    [multiple]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxSize,
      accept,
      multiple,
      disabled: disabled || uploading,
    });

  const removeFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true);
    try {
      await onUpload(stagedFiles);
      setStagedFiles([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          (disabled || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-sm text-primary font-medium">
            Solte os arquivos aqui...
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Arraste arquivos aqui ou{" "}
              <span className="text-primary font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo {formatFileSize(maxSize)} por arquivo
            </p>
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections.map(({ file, errors }, i) => (
            <p key={i}>
              {file.name}: {errors.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {stagedFiles.length > 0 && (
        <div className="space-y-2">
          {stagedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <File className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatFileSize(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => removeFile(index)}
                disabled={uploading}
                aria-label="Remover arquivo"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Enviar {stagedFiles.length}{" "}
                {stagedFiles.length === 1 ? "arquivo" : "arquivos"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
