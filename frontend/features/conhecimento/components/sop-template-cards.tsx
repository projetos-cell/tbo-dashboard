"use client";

import { useState, useCallback } from "react";
import {
  IconFileText,
  IconDownload,
  IconLoader2,
  IconCode,
  IconChecklist,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SOPTemplatePdfData } from "../templates/sop-template-pdf";

// ─── Parse sub-templates from content ────────────────────────────────────────

interface SubTemplate {
  title: string;
  content: string;
  preview: string;
  type: "form" | "checklist" | "code" | "generic";
}

function parseSubTemplates(content: string): SubTemplate[] {
  const templates: SubTemplate[] = [];

  // Split by bold headings (**TITLE**)
  const parts = content.split(/(?=\*\*[^*]+\*\*\s*$)/m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Extract title from **bold** heading
    const titleMatch = trimmed.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const body = titleMatch[2].trim();
      templates.push({
        title,
        content: body,
        preview: extractPreview(body),
        type: detectTemplateType(title, body),
      });
    } else if (templates.length === 0) {
      // Content before any heading — treat as single template
      templates.push({
        title: "Template",
        content: trimmed,
        preview: extractPreview(trimmed),
        type: detectTemplateType("", trimmed),
      });
    } else {
      // Append to last template
      const last = templates[templates.length - 1];
      last.content += "\n" + trimmed;
      last.preview = extractPreview(last.content);
    }
  }

  // If no sub-templates found, wrap everything as one
  if (templates.length === 0 && content.trim()) {
    templates.push({
      title: "Template",
      content: content.trim(),
      preview: extractPreview(content),
      type: detectTemplateType("", content),
    });
  }

  return templates;
}

function extractPreview(content: string): string {
  // Extract first code block or first few lines
  const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim().split("\n").slice(0, 3).join("\n");
  }
  return content.split("\n").filter((l) => l.trim()).slice(0, 3).join("\n");
}

function detectTemplateType(
  title: string,
  content: string
): SubTemplate["type"] {
  const lower = (title + " " + content).toLowerCase();
  if (lower.includes("checklist") || lower.includes("[ ]")) return "checklist";
  if (lower.includes("formulário") || lower.includes("formulario")) return "form";
  if (content.includes("```")) return "code";
  return "generic";
}

const TYPE_ICONS: Record<SubTemplate["type"], typeof IconFileText> = {
  form: IconFileText,
  checklist: IconChecklist,
  code: IconCode,
  generic: IconFileText,
};

const TYPE_LABELS: Record<SubTemplate["type"], string> = {
  form: "Formulário",
  checklist: "Checklist",
  code: "Padrão / Referência",
  generic: "Template",
};

// ─── Download helper ─────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

interface TemplateCardsRendererProps {
  content: string;
  sopTitle: string;
  sopSlug: string;
  sopBu: string;
  sopVersion: number;
}

export function TemplateCardsRenderer({
  content,
  sopTitle,
  sopSlug,
  sopBu,
  sopVersion,
}: TemplateCardsRendererProps) {
  const templates = parseSubTemplates(content);

  if (templates.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {templates.map((tmpl, idx) => (
        <TemplateCard
          key={idx}
          template={tmpl}
          sopTitle={sopTitle}
          sopSlug={sopSlug}
          sopBu={sopBu}
          sopVersion={sopVersion}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  sopTitle,
  sopSlug,
  sopBu,
  sopVersion,
}: {
  template: SubTemplate;
  sopTitle: string;
  sopSlug: string;
  sopBu: string;
  sopVersion: number;
}) {
  const [loading, setLoading] = useState(false);
  const Icon = TYPE_ICONS[template.type];

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      await downloadTemplatePdf({
        sopTitle,
        sopSlug,
        sopBu,
        sopVersion,
        stepTitle: template.title,
        stepContent: `**${template.title}**\n${template.content}`,
      });
      toast.success("Template baixado em PDF");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao gerar PDF"
      );
    } finally {
      setLoading(false);
    }
  }, [template, sopTitle, sopSlug, sopBu, sopVersion]);

  return (
    <Card className="group hover:border-foreground/20 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 size-9 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium leading-tight truncate">
              {template.title}
            </h4>
            <span className="text-[10px] text-muted-foreground">
              {TYPE_LABELS[template.type]}
            </span>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-md bg-muted/50 border border-border/50 p-2.5 font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap overflow-hidden">
          {template.preview}
        </div>

        {/* Download button */}
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs gap-1.5"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <IconLoader2 className="size-3.5 animate-spin" />
          ) : (
            <IconDownload className="size-3.5" />
          )}
          Baixar PDF
        </Button>
      </CardContent>
    </Card>
  );
}
