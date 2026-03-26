"use client";

import { useState, useCallback } from "react";
import { IconDownload, IconFileText, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SOPStep } from "../types/sops";
import type { SOPTemplatePdfData } from "../templates/sop-template-pdf";

function isTemplateStep(step: SOPStep): boolean {
  const title = step.title.toLowerCase();
  return (
    title.includes("template") ||
    title.includes("modelo") ||
    title.includes("formulário") ||
    title.includes("formulario")
  );
}

async function downloadTemplatePdf(pdfData: SOPTemplatePdfData) {
  const res = await fetch("/api/sops/generate-template-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pdfData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error ?? "Erro ao gerar PDF");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="(.+?)"/);
  const filename = filenameMatch?.[1] ?? "template.pdf";

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

// ─── Botão principal: baixar todos os templates do SOP como PDFs ─────────────

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

  const handleDownload = useCallback(async () => {
    if (templateSteps.length === 0) return;
    setLoading(true);
    try {
      for (const step of templateSteps) {
        await downloadTemplatePdf({
          sopTitle,
          sopSlug,
          sopBu,
          sopVersion,
          stepTitle: step.title,
          stepContent: step.content ?? "",
        });
      }
      toast.success(
        templateSteps.length === 1
          ? "Template baixado em PDF"
          : `${templateSteps.length} templates baixados em PDF`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao gerar PDF"
      );
    } finally {
      setLoading(false);
    }
  }, [templateSteps, sopTitle, sopSlug, sopBu, sopVersion]);

  if (templateSteps.length === 0) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
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
  );
}

// ─── Botão inline por seção ──────────────────────────────────────────────────

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
  const [loading, setLoading] = useState(false);

  if (!isTemplateStep(step)) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent accordion toggle
    setLoading(true);
    try {
      await downloadTemplatePdf({
        sopTitle,
        sopSlug,
        sopBu,
        sopVersion,
        stepTitle: step.title,
        stepContent: step.content ?? "",
      });
      toast.success("Template baixado em PDF");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao gerar PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto shrink-0"
      title="Baixar template em PDF"
    >
      {loading ? (
        <IconLoader2 className="size-3 animate-spin" />
      ) : (
        <IconFileText className="size-3" />
      )}
      PDF
    </button>
  );
}
