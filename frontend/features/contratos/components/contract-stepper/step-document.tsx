"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, X, FileText } from "lucide-react";

interface StepDocumentProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepDocument({ file, onChange }: StepDocumentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(f.type)) {
        setError("Formato invalido. Aceitos: PDF, DOC, DOCX");
        return;
      }

      if (f.size > MAX_SIZE) {
        setError("Arquivo muito grande. Maximo: 10MB");
        return;
      }

      onChange(f);
    },
    [onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50"
          }`}
        >
          <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Arraste o documento aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            PDF, DOC ou DOCX (max 10MB)
          </p>
          <Button type="button" variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              Selecionar Arquivo
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={onInputChange}
              />
            </label>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        O documento sera enviado ao Clicksign junto com o envelope de
        assinaturas. Voce pode pular esta etapa e enviar o documento depois.
      </p>
    </div>
  );
}
