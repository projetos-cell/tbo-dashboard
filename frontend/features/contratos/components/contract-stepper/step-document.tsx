"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconFileUpload,
  IconX,
  IconFileText,
  IconSparkles,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ContractGenerator } from "../contract-generator";
import type { ContractPdfData } from "../../templates/types";

interface StepDocumentProps {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Pre-fill data for the generator (from stepper state) */
  generatorPrefill?: Partial<ContractPdfData>;
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

export function StepDocument({ file, onChange, generatorPrefill }: StepDocumentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

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

  // If file already exists, show it with option to replace
  if (file) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <IconCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)} — Pronto para envio
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          O documento sera enviado ao Clicksign junto com o envelope de
          assinaturas. Clique no X para remover e gerar um novo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── PRIMARY: Gerar PDF automaticamente ─────────────────── */}
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <IconSparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">Gerar contrato automaticamente</p>
              <Badge variant="secondary" className="text-[10px]">
                Recomendado
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF profissional com 13 clausulas, usando os dados que voce preencheu.
              Modelo TBO com IA para personalizar clausulas.
            </p>
          </div>
        </div>

        <ContractGenerator
          prefill={generatorPrefill}
          onGenerated={(generatedFile) => onChange(generatedFile)}
          variant="default"
          size="default"
          label="Gerar Contrato PDF"
        />
      </div>

      {/* ── SECONDARY: Upload manual (collapsible) ─────────────── */}
      <Collapsible open={showUpload} onOpenChange={setShowUpload}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <IconUpload className="h-3.5 w-3.5" />
            <span>Ja tenho o documento pronto</span>
            <div className="flex-1 border-b border-dashed" />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <IconFileUpload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Arraste o documento ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mb-3">
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
        </CollapsibleContent>
      </Collapsible>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        O documento sera enviado ao Clicksign junto com o envelope de
        assinaturas. Voce pode pular esta etapa e enviar o documento depois.
      </p>
    </div>
  );
}
