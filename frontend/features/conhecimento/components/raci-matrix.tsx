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

// Parsear conteúdo de RACI em texto corrido
// Formato típico: "Papel\nResponsável\nAprovador\nInformado\nArtista 3D\nExecução da modelagem\nMarco (Dir. Criativo)\nPO do projeto\n..."
function parseRACIContent(content: string): RACIEntry[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Encontrar onde os headers terminam e os dados começam
  // Headers típicos: Papel, Responsável, Aprovador, Informado (ou Consultado)
  const headerKeywords = ["papel", "responsável", "aprovador", "informado", "consultado"];

  // Encontrar o índice onde terminam os headers
  let dataStart = 0;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    if (headerKeywords.includes(lines[i].toLowerCase())) {
      dataStart = i + 1;
    }
  }

  // Verificar se há headers de 4 colunas (Papel, Responsável, Aprovador, Informado)
  // Os dados vêm em blocos de 4 linhas por pessoa
  const entries: RACIEntry[] = [];
  const dataLines = lines.slice(dataStart);

  // Tentar agrupar em blocos — cada pessoa tem N campos
  // Heurística: se temos headers com 3-4 colunas, agrupar de 3 em 3 ou 4 em 4
  const hasInfoColumn = lines.some((l) => l.toLowerCase() === "informado");
  const blockSize = hasInfoColumn ? 4 : 3;

  for (let i = 0; i + blockSize - 1 < dataLines.length; i += blockSize) {
    const person = dataLines[i];
    const responsible = dataLines[i + 1] || "";
    const accountable = dataLines[i + 2] || "";
    const informed = blockSize === 4 ? (dataLines[i + 3] || "") : "";

    // Pular linhas que são claramente separadores ou vazias
    if (person === "—" || person === "-" || person.length < 2) continue;

    // Determinar o papel RACI baseado no conteúdo
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
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {entry.responsible}
              </p>
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
