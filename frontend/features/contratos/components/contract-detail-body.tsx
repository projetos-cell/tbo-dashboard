"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconExternalLink,
  IconAlertTriangle,
  IconFileText,
  IconClock,
  IconTag,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
  type ContractStatusKey,
  type ContractCategoryKey,
} from "@/lib/constants";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractDetailBodyProps {
  contract: ContractRow;
  downloadUrl: string | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ContractDetailBody({ contract, downloadUrl }: ContractDetailBodyProps) {
  const statusConfig =
    CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
      label: contract.status ?? "—",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
    };

  const categoryConfig = contract.category
    ? CONTRACT_CATEGORY[contract.category as ContractCategoryKey]
    : undefined;

  const typeConfig = contract.type
    ? CONTRACT_TYPE[contract.type as keyof typeof CONTRACT_TYPE]
    : undefined;

  const daysRemaining = contract.end_date
    ? Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiring =
    contract.status === "active" &&
    daysRemaining !== null &&
    daysRemaining >= 0 &&
    daysRemaining <= 30;

  const isExpired =
    contract.status === "active" &&
    daysRemaining !== null &&
    daysRemaining < 0;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      {/* Responsável */}
      {contract.person_name && (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs bg-muted font-medium">
              {getInitials(contract.person_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {contract.person_name}
            </p>
            <p className="text-xs text-muted-foreground">Responsável</p>
          </div>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {contract.monthly_value != null && contract.monthly_value > 0 && (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconCurrencyDollar className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Valor Mensal
              </span>
            </div>
            <p className="text-base font-semibold">
              {formatCurrency(contract.monthly_value)}
            </p>
          </div>
        )}

        {(contract.start_date || contract.end_date) && (
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconCalendar className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Vigência
              </span>
            </div>
            <div className="space-y-0.5">
              {contract.start_date && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Início:</span>{" "}
                  <span className="font-medium">
                    {new Date(contract.start_date).toLocaleDateString("pt-BR")}
                  </span>
                </p>
              )}
              {contract.end_date && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Término:</span>{" "}
                  <span className="font-medium">
                    {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expiring Alert */}
      {isExpiring && daysRemaining !== null && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex items-start gap-2.5">
          <IconAlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Contrato expira em {daysRemaining} dias
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
              Verifique a necessidade de renovação.
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3 flex items-start gap-2.5">
          <IconAlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-700 dark:text-red-400">
              Contrato vencido
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-0.5">
              Este contrato expirou há {Math.abs(daysRemaining ?? 0)} dias.
            </p>
          </div>
        </div>
      )}

      {/* Descrição */}
      {contract.description && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Descrição
          </h4>
          <p className="text-sm whitespace-pre-wrap text-foreground/80 leading-relaxed">
            {contract.description}
          </p>
        </div>
      )}

      {/* Arquivo */}
      {downloadUrl && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Arquivo
          </h4>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 hover:bg-muted/40 transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-[#f97316]/10 flex items-center justify-center shrink-0">
              <IconFileText className="h-4.5 w-4.5 text-[#f97316]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {contract.file_name ?? "Contrato.pdf"}
              </p>
              <p className="text-xs text-muted-foreground">
                Clique para abrir
              </p>
            </div>
            <IconExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </a>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Detalhes
        </h4>
        <div className="rounded-lg border border-border/50 divide-y divide-border/50">
          {typeConfig && (
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconTag className="h-3.5 w-3.5" />
                <span>Tipo</span>
              </div>
              <span className="text-sm font-medium">{typeConfig.label}</span>
            </div>
          )}
          {categoryConfig && (
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconTag className="h-3.5 w-3.5" />
                <span>Categoria</span>
              </div>
              <span className="text-sm font-medium">{categoryConfig.label}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconClock className="h-3.5 w-3.5" />
              <span>Status</span>
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Badge>
          </div>
          {contract.created_at && (
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalendar className="h-3.5 w-3.5" />
                <span>Criado em</span>
              </div>
              <span className="text-sm">
                {new Date(contract.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
