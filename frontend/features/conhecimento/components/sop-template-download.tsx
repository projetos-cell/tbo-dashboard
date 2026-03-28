"use client";

import { useState, useCallback } from "react";
import {
  IconDownload,
  IconFileText,
  IconFileWord,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { SOPStep } from "../types/sops";
import type { SOPTemplateData } from "../templates/sop-content-parser";

// Re-export for backward compat
export type SOPTemplatePdfData = SOPTemplateData;

function isTemplateStep(step: SOPStep): boolean {
  const title = step.title.toLowerCase();
  if (title.includes("ferramenta")) return false;
  return (
    title.includes("template") ||
    title.includes("modelo") ||
    title.includes("formulário") ||
    title.includes("formulario")
  );
}

type TemplateFormat = "pdf" | "docx";

async function downloadTemplate(
  data: SOPTemplateData,
  format: TemplateFormat
) {
  const endpoint =
    format === "pdf"
      ? "/api/sops/generate-template-pdf"
      : "/api/sops/generate-template-docx";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(
      err.error ?? `Erro ao gerar ${format.toUpperCase()}`
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="(.+?)"/);
  const filename =
    filenameMatch?.[1] ?? `template.${format}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Props compartilhadas ────────────────────────────────────────────────────

interface SOPContext {
  sopTitle: string;
  sopSlug: string;
  sopBu: string;
  sopVersion: number;
}

// ─── Botao principal: baixar todos os templates do SOP ───────────────────────

interface SOPTemplateDownloadProps extends SOPContext {
  steps: SOPStep[];
}

export function SOPTemplateDownload({
  steps,
  sopTitle,
  sopSlug,
  sopBu,
  sopVersion,
}: SOPTemplateDownloadProps) {
  const [loading, setLoading] = useState(false);
  const templateSteps = steps.filter(isTemplateStep);

  const handleDownload = useCallback(
    async (format: TemplateFormat) => {
      if (templateSteps.length === 0) return;
      setLoading(true);
      try {
        for (const step of templateSteps) {
          await downloadTemplate(
            {
              sopTitle,
              sopSlug,
              sopBu,
              sopVersion,
              stepTitle: step.title,
              stepContent: step.content ?? "",
            },
            format
          );
        }
        const label = format.toUpperCase();
        toast.success(
          templateSteps.length === 1
            ? `Template baixado em ${label}`
            : `${templateSteps.length} templates baixados em ${label}`
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao gerar template"
        );
      } finally {
        setLoading(false);
      }
    },
    [templateSteps, sopTitle, sopSlug, sopBu, sopVersion]
  );

  if (templateSteps.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconDownload className="size-4" />
          )}
          Baixar Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("pdf")}>
          <IconFileText className="size-4 mr-2" />
          Baixar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("docx")}>
          <IconFileWord className="size-4 mr-2" />
          Baixar DOCX (editavel)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Botao inline por secao ──────────────────────────────────────────────────

interface StepTemplateDownloadButtonProps extends SOPContext {
  step: SOPStep;
}

export function StepTemplateDownloadButton({
  step,
  sopTitle,
  sopSlug,
  sopBu,
  sopVersion,
}: StepTemplateDownloadButtonProps) {
  const [loading, setLoading] = useState<TemplateFormat | null>(null);

  if (!isTemplateStep(step)) return null;

  const handleDownload = async (
    e: React.MouseEvent,
    format: TemplateFormat
  ) => {
    e.stopPropagation();
    setLoading(format);
    try {
      await downloadTemplate(
        {
          sopTitle,
          sopSlug,
          sopBu,
          sopVersion,
          stepTitle: step.title,
          stepContent: step.content ?? "",
        },
        format
      );
      toast.success(
        `Template baixado em ${format.toUpperCase()}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao gerar template"
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <span className="inline-flex items-center gap-2 ml-auto shrink-0">
      <button
        onClick={(e) => handleDownload(e, "pdf")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        title="Baixar template em PDF"
      >
        {loading === "pdf" ? (
          <IconLoader2 className="size-3 animate-spin" />
        ) : (
          <IconFileText className="size-3" />
        )}
        PDF
      </button>
      <button
        onClick={(e) => handleDownload(e, "docx")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        title="Baixar template em DOCX"
      >
        {loading === "docx" ? (
          <IconLoader2 className="size-3 animate-spin" />
        ) : (
          <IconFileWord className="size-3" />
        )}
        DOCX
      </button>
    </span>
  );
}
