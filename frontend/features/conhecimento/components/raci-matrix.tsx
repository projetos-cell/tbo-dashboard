"use client";

import {
  IconUser,
  IconCheck,
  IconEye,
  IconMessage,
  IconStar,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RACIEntry {
  person: string;
  role: string;
  responsible: string;
  accountable: string;
  informed: string;
}

const RACI_BADGE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  R: { label: "Responsável", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: IconCheck },
  A: { label: "Aprovador", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: IconStar },
  C: { label: "Consultado", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: IconMessage },
  I: { label: "Informado", color: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400", icon: IconEye },
};

// Gerar iniciais de um nome
function getInitials(name: string): string {
  return name
    .split(/[\s/]+/)
    .filter((w) => w.length > 1 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || name.substring(0, 2).toUpperCase();
}

// Gerar cor consistente baseada no nome
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
    "bg-teal-500", "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Detectar se o conteúdo é uma tabela markdown (linhas com |)
function isMarkdownTable(content: string): boolean {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return lines.length >= 3 && lines[0].includes("|") && lines[1].includes("---");
}

// Parsear tabela markdown RACI
// Formato: | Atividade | Responsável | Aprovador | Consultado | Informado |
function parseMarkdownRACITable(content: string): RACIEntry[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.match(/^\|[\s-|]+\|$/));

  if (lines.length < 2) return [];

  // Parsear header para encontrar índices das colunas
  const headerCells = lines[0].split("|").map((c) => c.trim()).filter(Boolean);
  const headerLower = headerCells.map((h) => h.toLowerCase());

  const colIdx = {
    activity: headerLower.findIndex((h) => h.includes("atividade") || h.includes("papel") || h.includes("etapa")),
    responsible: headerLower.findIndex((h) => h.includes("responsável") || h.includes("responsavel")),
    accountable: headerLower.findIndex((h) => h.includes("aprovador") || h.includes("accountable")),
    consulted: headerLower.findIndex((h) => h.includes("consultado") || h.includes("consulted")),
    informed: headerLower.findIndex((h) => h.includes("informado") || h.includes("informed")),
  };

  const entries: RACIEntry[] = [];

  // Pular header (já processado) — data rows começam no índice 1
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    const activity = colIdx.activity >= 0 ? (cells[colIdx.activity] || "") : (cells[0] || "");
    const responsible = colIdx.responsible >= 0 ? (cells[colIdx.responsible] || "—") : "—";
    const accountable = colIdx.accountable >= 0 ? (cells[colIdx.accountable] || "—") : "—";
    const consulted = colIdx.consulted >= 0 ? (cells[colIdx.consulted] || "—") : "—";
    const informed = colIdx.informed >= 0 ? (cells[colIdx.informed] || "—") : "—";

    if (!activity || activity === "—") continue;

    // Determinar papel RACI principal baseado em quem tem conteúdo
    let raciRole = "R";
    if (responsible !== "—" && responsible.length > 0) {
      raciRole = "R";
    }
    // Se a atividade envolve "aprovação", marcar como A
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes("aprovação") || lowerActivity.includes("aprovação")) {
      raciRole = "A";
    } else if (lowerActivity.includes("registro") || lowerActivity.includes("revisão")) {
      raciRole = "R";
    } else if (lowerActivity.includes("knowledge") || lowerActivity.includes("transfer")) {
      raciRole = "R";
    }

    entries.push({
      person: activity,
      role: raciRole,
      responsible,
      accountable,
      informed: [consulted !== "—" ? `C: ${consulted}` : "", informed !== "—" ? `I: ${informed}` : ""]
        .filter(Boolean)
        .join(" | ") || "—",
    });
  }

  return entries;
}

// Parsear conteúdo de RACI — suporta tabela markdown e texto corrido
function parseRACIContent(content: string): RACIEntry[] {
  // Tentar primeiro como tabela markdown
  if (isMarkdownTable(content)) {
    const entries = parseMarkdownRACITable(content);
    if (entries.length > 0) return entries;
  }

  // Fallback: texto corrido (formato legado)
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const headerKeywords = ["papel", "responsável", "aprovador", "informado", "consultado"];

  let dataStart = 0;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    if (headerKeywords.includes(lines[i].toLowerCase())) {
      dataStart = i + 1;
    }
  }

  const entries: RACIEntry[] = [];
  const dataLines = lines.slice(dataStart);
  const hasInfoColumn = lines.some((l) => l.toLowerCase() === "informado");
  const blockSize = hasInfoColumn ? 4 : 3;

  for (let i = 0; i + blockSize - 1 < dataLines.length; i += blockSize) {
    const person = dataLines[i];
    const responsible = dataLines[i + 1] || "";
    const accountable = dataLines[i + 2] || "";
    const informed = blockSize === 4 ? (dataLines[i + 3] || "") : "";

    if (person === "—" || person === "-" || person.length < 2) continue;

    let raciRole = "R";
    const lowerResp = responsible.toLowerCase();
    const lowerPerson = person.toLowerCase();
    if (lowerResp.includes("aprovação") || lowerResp.includes("aprovador") || lowerResp.includes("aprovação final")) {
      raciRole = "A";
    } else if (lowerResp.includes("execução") || lowerResp.includes("executor") || lowerResp.includes("modelagem") || lowerResp.includes("desenvolvimento")) {
      raciRole = "R";
    } else if (lowerResp.includes("consultado") || lowerPerson.includes("cliente")) {
      raciRole = "C";
    }

    entries.push({
      person,
      role: raciRole,
      responsible,
      accountable,
      informed,
    });
  }

  return entries;
}

interface RACIMatrixProps {
  content: string;
}

export function RACIMatrix({ content }: RACIMatrixProps) {
  const entries = parseRACIContent(content);

  if (entries.length === 0) {
    // Fallback: renderizar como texto se não conseguir parsear
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, idx) => {
        const badgeCfg = RACI_BADGE_CONFIG[entry.role] || RACI_BADGE_CONFIG.R;
        const BadgeIcon = badgeCfg.icon;
        const initials = getInitials(entry.person);
        const avatarColor = getAvatarColor(entry.person);

        return (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{entry.person}</p>
              {entry.responsible && entry.responsible !== "—" && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {entry.responsible}
                </p>
              )}
              <div className="mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeCfg.color}`}
                >
                  <BadgeIcon className="size-3" />
                  {badgeCfg.label}
                </span>
              </div>
              {entry.accountable && entry.accountable !== "—" && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Aprova: {entry.accountable}
                </p>
              )}
              {entry.informed && entry.informed !== "—" && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {entry.informed}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Detectar se um step contém RACI
export function isRACIStep(title: string): boolean {
  const lower = title.toLowerCase();
  return lower.includes("raci") || lower.includes("responsáveis") || lower.includes("responsaveis");
}
