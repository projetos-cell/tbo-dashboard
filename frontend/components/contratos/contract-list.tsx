"use client";

import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { CONTRACT_STATUS, type ContractStatusKey } from "@/lib/constants";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractListProps {
  contracts: ContractRow[];
  isLoading: boolean;
  onSelect: (contract: ContractRow) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function isExpiring(contract: ContractRow, days = 30) {
  if (contract.status !== "ativo" || !contract.end_date) return false;
  const diff =
    (new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function ContractList({
  contracts,
  isLoading,
  onSelect,
}: ContractListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhum contrato encontrado</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou adicione novos contratos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contracts.map((contract) => {
        const statusConfig =
          CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
            label: contract.status,
            color: "#6b7280",
            bg: "rgba(107,114,128,0.12)",
          };
        const expiring = isExpiring(contract);

        return (
          <div
            key={contract.id}
            className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            onClick={() => onSelect(contract)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{contract.title}</p>
                {expiring && (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {contract.client_name ?? "Sem cliente"}
                {contract.project_name && ` · ${contract.project_name}`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {contract.value != null && contract.value > 0 && (
                <span className="text-sm font-medium">
                  {formatCurrency(contract.value)}
                </span>
              )}
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </Badge>
              {contract.end_date && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
