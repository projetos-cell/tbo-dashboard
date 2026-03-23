"use client";

import {
  IconClock,
  IconArrowRight,
  IconArrowNarrowRight,
  IconDiamond,
  IconCircleCheck,
  IconSquareCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconQuestionMark,
  IconBook2,
  // Tool icons
  IconBrandBlender,
  IconBrandFigma,
  IconBrandGoogle,
  IconBrandGit,
  IconBrandVercel,
  IconBrandReact,
  IconCamera,
  IconPhoto,
  IconBrush,
  IconPalette,
  IconVideo,
  IconPresentation,
  IconMail,
  IconChartBar,
  IconTarget,
  IconSpeakerphone,
  IconWorld,
  IconFileSpreadsheet,
  IconFileText,
  IconFolder,
  IconCloud,
  IconServer,
  IconCode,
  IconDeviceDesktop,
  IconApps,
  IconTool,
  IconCalendar,
  IconBrandAsana,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

// ─── Tools / Ferramentas ─────────────────────────────────────────

const TOOL_ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  "3ds max": { icon: IconDeviceDesktop, color: "#00A6A0" },
  "sketchup": { icon: IconDeviceDesktop, color: "#005F9E" },
  "blender": { icon: IconBrandBlender, color: "#F5792A" },
  "v-ray": { icon: IconCamera, color: "#1A1A2E" },
  "corona": { icon: IconCamera, color: "#F76B1C" },
  "autocad": { icon: IconTool, color: "#E51937" },
  "revit": { icon: IconTool, color: "#186BFF" },
  "substance": { icon: IconBrush, color: "#1A8C36" },
  "photoshop": { icon: IconPhoto, color: "#31A8FF" },
  "illustrator": { icon: IconPalette, color: "#FF9A00" },
  "after effects": { icon: IconVideo, color: "#9999FF" },
  "premiere": { icon: IconVideo, color: "#9999FF" },
  "davinci": { icon: IconVideo, color: "#E5453A" },
  "figma": { icon: IconBrandFigma, color: "#A259FF" },
  "canva": { icon: IconPalette, color: "#7B2FF7" },
  "indesign": { icon: IconFileText, color: "#FF3366" },
  "google drive": { icon: IconBrandGoogle, color: "#4285F4" },
  "google docs": { icon: IconBrandGoogle, color: "#4285F4" },
  "google sheets": { icon: IconBrandGoogle, color: "#0F9D58" },
  "google slides": { icon: IconBrandGoogle, color: "#F4B400" },
  "google analytics": { icon: IconChartBar, color: "#E37400" },
  "google ads": { icon: IconTarget, color: "#4285F4" },
  "meta ads": { icon: IconTarget, color: "#0668E1" },
  "facebook ads": { icon: IconTarget, color: "#1877F2" },
  "instagram": { icon: IconCamera, color: "#E1306C" },
  "linkedin": { icon: IconWorld, color: "#0A66C2" },
  "tiktok": { icon: IconVideo, color: "#000000" },
  "mailchimp": { icon: IconMail, color: "#FFE01B" },
  "rd station": { icon: IconMail, color: "#04A64B" },
  "hubspot": { icon: IconTarget, color: "#FF7A59" },
  "semrush": { icon: IconChartBar, color: "#FF622D" },
  "ahrefs": { icon: IconChartBar, color: "#3575D3" },
  "hotjar": { icon: IconChartBar, color: "#FD3A5C" },
  "asana": { icon: IconBrandAsana, color: "#F06A6A" },
  "trello": { icon: IconApps, color: "#0079BF" },
  "notion": { icon: IconFileText, color: "#000000" },
  "slack": { icon: IconSpeakerphone, color: "#4A154B" },
  "git": { icon: IconBrandGit, color: "#F05032" },
  "vercel": { icon: IconBrandVercel, color: "#000000" },
  "three.js": { icon: IconCode, color: "#049EF4" },
  "react": { icon: IconBrandReact, color: "#61DAFB" },
  "unreal": { icon: IconDeviceDesktop, color: "#0E1128" },
  "webgl": { icon: IconCode, color: "#990000" },
  "jspdf": { icon: IconFileText, color: "#E44D26" },
  "puppeteer": { icon: IconCode, color: "#00D8A2" },
  "powerpoint": { icon: IconPresentation, color: "#D04423" },
  "excel": { icon: IconFileSpreadsheet, color: "#217346" },
  "word": { icon: IconFileText, color: "#2B579A" },
  "biblioteca": { icon: IconFolder, color: "#F59E0B" },
  "servidor": { icon: IconServer, color: "#6366F1" },
  "omie": { icon: IconCloud, color: "#00B4D8" },
  "whatsapp": { icon: IconSpeakerphone, color: "#25D366" },
  "zoom": { icon: IconVideo, color: "#2D8CFF" },
  "teams": { icon: IconVideo, color: "#6264A7" },
  "meet": { icon: IconVideo, color: "#00897B" },
  "google meet": { icon: IconVideo, color: "#00897B" },
  "miro": { icon: IconApps, color: "#FFD02F" },
  "jira": { icon: IconApps, color: "#0052CC" },
  "linear": { icon: IconApps, color: "#5E6AD2" },
  "typeform": { icon: IconFileText, color: "#262627" },
};

function matchTool(text: string): { icon: React.ElementType; color: string; name: string } | null {
  const lower = text.toLowerCase().trim();
  for (const [key, config] of Object.entries(TOOL_ICON_MAP)) {
    if (lower.includes(key)) {
      return { ...config, name: text.trim() };
    }
  }
  return null;
}

export function ToolsRenderer({ content }: { content: string }) {
  // Separar por vírgulas, pontos ou quebras de linha
  const rawTools = content
    .split(/[,;\n]+/)
    .map((t) => t.replace(/\.$/, "").trim())
    .filter((t) => t.length > 1);

  const tools = rawTools.map((t) => {
    const matched = matchTool(t);
    return matched || { icon: IconTool, color: "#6B7280", name: t };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool, idx) => {
        const Icon = tool.icon;
        return (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
          >
            <Icon className="size-4 shrink-0" style={{ color: tool.color }} />
            <span className="text-xs font-medium">{tool.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SLAs e Prazos ───────────────────────────────────────────────

interface SLAItem {
  label: string;
  value: string;
  days?: number;
  isExtension?: boolean;
}

function parseSLAs(content: string): SLAItem[] {
  const items: SLAItem[] = [];

  // Dividir por ponto ou quebra de linha
  const segments = content
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  for (const seg of segments) {
    // Padrão: "Label: X dias" ou "Label: texto"
    const colonMatch = seg.match(/^(.+?):\s*(.+)$/);
    if (colonMatch) {
      const label = colonMatch[1].trim();
      const value = colonMatch[2].trim();

      // Extrair número de dias se presente
      const daysMatch = value.match(/(\d+)[\s-]*(?:a\s*(\d+)\s*)?dia/i);
      const days = daysMatch
        ? daysMatch[2]
          ? Math.round((parseInt(daysMatch[1]) + parseInt(daysMatch[2])) / 2)
          : parseInt(daysMatch[1])
        : undefined;

      const isExtension = label.toLowerCase().includes("extensão") || label.toLowerCase().includes("excecão");

      items.push({ label, value, days, isExtension });
    }
  }

  return items;
}

export function SLARenderer({ content }: { content: string }) {
  const items = parseSLAs(content);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    );
  }

  const maxDays = Math.max(...items.filter((i) => i.days).map((i) => i.days!), 1);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const pct = item.days ? Math.min((item.days / maxDays) * 100, 100) : 0;

        return (
          <div
            key={idx}
            className={`rounded-lg border p-3 ${
              item.isExtension
                ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800"
                : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{item.label}</span>
              {item.days && (
                <Badge variant="outline" className="text-[10px] gap-1 h-5">
                  <IconClock className="size-3" />
                  {item.value.match(/\d+[\s-]*(?:a\s*\d+\s*)?dia[^\s]*/i)?.[0] || `${item.days}d`}
                </Badge>
              )}
            </div>
            {item.days ? (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tbo-orange/70 to-tbo-orange transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{item.value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Fluxograma ──────────────────────────────────────────────────

interface FlowNode {
  label: string;
  type: "start" | "end" | "step" | "decision" | "approval";
}

function parseFlowchart(content: string): FlowNode[] {
  // Split por → (seta)
  const parts = content
    .split(/\s*→\s*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return parts.map((part) => {
    const lower = part.toLowerCase();
    let type: FlowNode["type"] = "step";

    if (lower === "início" || lower === "inicio" || lower === "start") type = "start";
    else if (lower === "fim" || lower === "end") type = "end";
    else if (part.startsWith("[DECISÃO") || part.startsWith("[DECISAO") || lower.includes("?")) type = "decision";
    else if (part.startsWith("[APROVAÇÃO") || part.startsWith("[APROVACAO") || part.includes("APROVAÇÃO")) type = "approval";

    // Limpar marcadores
    const label = part.replace(/^\[|\]$/g, "").trim();

    return { label, type };
  });
}

const FLOW_NODE_STYLES: Record<FlowNode["type"], { bg: string; border: string; icon: React.ElementType; text: string }> = {
  start: { bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-400", icon: IconPlayerPlay, text: "text-green-600" },
  end: { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-400", icon: IconPlayerStop, text: "text-red-600" },
  step: { bg: "bg-blue-50/50 dark:bg-blue-950/10", border: "border-blue-300", icon: IconCircleCheck, text: "text-blue-600" },
  decision: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-400", icon: IconDiamond, text: "text-amber-600" },
  approval: { bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-400", icon: IconCircleCheck, text: "text-purple-600" },
};

export function FlowchartRenderer({ content }: { content: string }) {
  const nodes = parseFlowchart(content);

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nodes.map((node, idx) => {
        const style = FLOW_NODE_STYLES[node.type];
        const NodeIcon = style.icon;
        const isLast = idx === nodes.length - 1;

        return (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium ${style.bg} ${style.border}`}
            >
              <NodeIcon className={`size-3.5 shrink-0 ${style.text}`} />
              <span>{node.label}</span>
            </div>
            {!isLast && (
              <IconArrowNarrowRight className="size-4 text-muted-foreground shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Glossário ───────────────────────────────────────────────────

interface GlossaryEntry {
  term: string;
  definition: string;
}

function parseGlossary(content: string): GlossaryEntry[] {
  const entries: GlossaryEntry[] = [];

  // Padrão: "TERMO: definição" separados por ponto
  const segments = content
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .filter((s) => s.trim().length > 3);

  for (const seg of segments) {
    const match = seg.match(/^([^:]+?):\s*(.+?)\.?$/);
    if (match) {
      entries.push({
        term: match[1].trim(),
        definition: match[2].trim().replace(/\.$/, ""),
      });
    }
  }

  return entries;
}

export function GlossaryRenderer({ content }: { content: string }) {
  const entries = parseGlossary(content);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card"
        >
          <div className="shrink-0 mt-0.5">
            <IconBook2 className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold font-mono text-foreground">
              {entry.term}
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {entry.definition}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Checklist ───────────────────────────────────────────────────

interface ChecklistItem {
  text: string;
  checked: boolean;
}

function parseChecklist(content: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Padrão: "[ ] texto" ou "[x] texto" ou itens separados por ";"
  // Também aceita texto corrido separado por ";" com itens sem marcador
  const hasMarkers = content.includes("[ ]") || content.includes("[x]") || content.includes("[X]");

  if (hasMarkers) {
    const matches = content.matchAll(/\[([ xX])\]\s*([^[\]]+?)(?=\[|$)/g);
    for (const m of matches) {
      const text = m[2].trim().replace(/;\s*$/, "");
      if (text.length > 2) {
        items.push({ text, checked: m[1] !== " " });
      }
    }
  } else {
    // Split por ";", "." seguido de maiúscula, ou quebra de linha
    const parts = content
      .split(/[;\n]+|(?<=\.)\s+(?=[A-Z])/)
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter((s) => s.length > 3);
    for (const part of parts) {
      items.push({ text: part, checked: false });
    }
  }

  return items;
}

export function ChecklistRenderer({ content }: { content: string }) {
  const items = parseChecklist(content);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <label
          key={idx}
          className="flex items-start gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
        >
          <div className="shrink-0 mt-0.5">
            <div className="size-4 rounded border-2 border-muted-foreground/30 group-hover:border-tbo-orange/50 flex items-center justify-center transition-colors">
              {item.checked && (
                <IconCircleCheck className="size-3.5 text-green-500" />
              )}
            </div>
          </div>
          <span className="text-xs leading-relaxed">{item.text}</span>
        </label>
      ))}
    </div>
  );
}

export function isChecklistSection(title: string): boolean {
  const lower = title.toLowerCase();
  return lower.includes("checklist") || lower.includes("check list") || lower.includes("critérios de qualidade") || lower.includes("criterios de qualidade");
}

// ─── Detector ────────────────────────────────────────────────────

export type SpecialSectionType = "tools" | "sla" | "flowchart" | "glossary" | "checklist" | null;

export function detectSpecialSection(title: string): SpecialSectionType {
  const lower = title.toLowerCase();
  if (lower.includes("ferramenta") || lower.includes("template") || lower.includes("software")) return "tools";
  if (lower.includes("sla") || lower.includes("prazo")) return "sla";
  if (lower.includes("fluxograma") || lower.includes("fluxo")) return "flowchart";
  if (lower.includes("glossário") || lower.includes("glossario") || lower.includes("definições") || lower.includes("definicoes")) return "glossary";
  if (isChecklistSection(title)) return "checklist";
  return null;
}
