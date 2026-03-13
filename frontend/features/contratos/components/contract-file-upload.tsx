"use client";

import { useState, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  IconUpload,
  IconFileText,
  IconPhoto,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";

// ─── Constants ────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT_STRING = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

// ─── Helpers ──────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return IconPhoto;
  return IconFileText;
}

// ─── Props ────────────────────────────────────────────────────────────

interface ContractFileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isPending: boolean;
  existingFileUrl?: string | null;
  existingFileName?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────

export function ContractFileUpload({
  file,
  onFileChange,
  isPending,
  existingFileUrl,
  existingFileName,
}: ContractFileUploadProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateAndSet = useCallback(
    (selected: File | undefined) => {
      setFileError(null);
      if (!selected) return;
      if (selected.size > MAX_FILE_SIZE) {
        setFileError(`Arquivo excede ${MAX_FILE_SIZE / 1024 / 1024}MB. Selecione um menor.`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(selected.type)) {
        setFileError("Formato não suportado. Envie PDF, JPG, PNG, DOC ou DOCX.");
        return;
      }
      onFileChange(selected);
    },
    [onFileChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items.length > 0) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      validateAndSet(e.dataTransfer.files[0]);
    },
    [validateAndSet],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSet(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile() {
    onFileChange(null);
    setFileError(null);
  }

  return (
    <div className="space-y-2">
      <Label>Anexo do Contrato</Label>

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isPending && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isPending) fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center gap-2
            rounded-md border-2 border-dashed p-6
            transition-all duration-200 cursor-pointer
            ${isDragging ? "border-[#f97316] bg-[#f97316]/5 scale-[1.01]" : "border-border hover:border-[#f97316]/50 hover:bg-muted/30"}
            ${isPending ? "pointer-events-none opacity-50" : ""}
            focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
          `}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
              isDragging ? "bg-[#f97316]/10" : "bg-muted"
            }`}
          >
            <IconUpload
              className={`h-5 w-5 transition-colors ${isDragging ? "text-[#f97316]" : "text-muted-foreground"}`}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragging ? (
                <span className="text-[#f97316]">Solte o arquivo aqui</span>
              ) : (
                <>
                  Arraste o arquivo ou{" "}
                  <span className="text-[#f97316] underline underline-offset-2">clique para selecionar</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC ou DOCX · Máx. 5MB</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/20 p-3 transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f97316]/10">
            {(() => {
              const Icon = getFileIcon(file.type);
              return <Icon className="h-5 w-5 text-[#f97316]" />;
            })()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          {!isPending && (
            <button
              type="button"
              onClick={removeFile}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              aria-label="Remover arquivo"
            >
              <IconX className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {fileError && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <IconAlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {existingFileUrl && !file && (
        <p className="text-xs text-muted-foreground">
          Arquivo atual:{" "}
          <a
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f97316] underline underline-offset-2 hover:text-[#ea580c]"
          >
            {existingFileName ?? "Ver arquivo"}
          </a>
          {" "}— selecione um novo para substituir.
        </p>
      )}
    </div>
  );
}
