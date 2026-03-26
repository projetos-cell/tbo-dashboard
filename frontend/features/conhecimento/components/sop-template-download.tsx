"use client";

import { useCallback } from "react";
import { IconDownload, IconFileText } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SOPStep } from "../types/sops";

/**
 * Extrai blocos de código (```) do conteúdo de um step e retorna o texto limpo do template.
 * Se não houver bloco de código, retorna o conteúdo inteiro.
 */
function extractTemplateContent(step: SOPStep): string {
  const content = step.content ?? "";
  const codeBlocks: string[] = [];
  const regex = /```(?:\w*\n)?([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push(match[1].trim());
  }

  if (codeBlocks.length > 0) {
    return codeBlocks.join("\n\n---\n\n");
  }

  // Fallback: return full content
  return content;
}

function isTemplateStep(step: SOPStep): boolean {
  const title = step.title.toLowerCase();
  return (
    title.includes("template") ||
    title.includes("modelo") ||
    title.includes("formulário")
  );
}

function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface SOPTemplateDownloadProps {
  steps: SOPStep[];
  sopSlug: string;
}

/**
 * Renderiza um botão para baixar todos os templates de um SOP como arquivo .md unificado.
 */
export function SOPTemplateDownload({ steps, sopSlug }: SOPTemplateDownloadProps) {
  const templateSteps = steps.filter(isTemplateStep);

  const handleDownload = useCallback(() => {
    if (templateSteps.length === 0) return;

    const parts = templateSteps.map((step) => {
      const cleanTitle = step.title.replace(/^\d+\.\s*/, "");
      const content = extractTemplateContent(step);
      return `# ${cleanTitle}\n\n${content}`;
    });

    const fullContent = parts.join("\n\n---\n\n");
    const filename = `${sopSlug}-templates.md`;
    downloadAsFile(fullContent, filename);
    toast.success("Templates baixados com sucesso");
  }, [templateSteps, sopSlug]);

  if (templateSteps.length === 0) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      className="gap-1.5"
    >
      <IconDownload className="size-4" />
      Baixar Templates
    </Button>
  );
}

/**
 * Botão de download inline para um step individual que contém template.
 */
export function StepTemplateDownloadButton({
  step,
  sopSlug,
}: {
  step: SOPStep;
  sopSlug: string;
}) {
  if (!isTemplateStep(step)) return null;

  const handleDownload = () => {
    const content = extractTemplateContent(step);
    const cleanTitle = step.title
      .replace(/^\d+\.\s*/, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const filename = `${sopSlug}-${cleanTitle}.md`;
    downloadAsFile(content, filename);
    toast.success("Template baixado");
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto shrink-0"
      title="Baixar template"
    >
      <IconFileText className="size-3" />
      Baixar
    </button>
  );
}
