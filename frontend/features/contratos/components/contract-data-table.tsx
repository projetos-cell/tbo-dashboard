"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  type ContractStatusKey,
  type ContractCategoryKey,
} from "@/lib/constants";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

interface ContractDataTableProps {
  contracts: ContractRow[];
  isLoading: boolean;
  showCategory?: boolean;
  onEdit: (contract: ContractRow) => void;
  onSelect: (contract: ContractRow) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
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

function isExpiring(contract: ContractRow, days = 30): boolean {
  if (contract.status !== "active" || !contract.end_date) return false;
  const diff =
    (new Date(contract.end_date).getTime() - Date.now()) /
    (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function ContractDataTable({
  contracts,
  isLoading,
  showCategory = true,
  onEdit,
  onSelect,
}: ContractDataTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-12 gap-4">
            {["Nome / Objeto", "Tipo", "Responsável", "Valor", "Vigência", ""].map(
              (h) => (
                <div
                  key={h}
                  className={`text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                    h === "Nome / Objeto"
                      ? "col-span-4"
                      : h === ""
                        ? "col-span-1"
                        : "col-span-2"
                  }`}
                >
                  {h}
                </div>
              )
            )}
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="h-10 animate-pulse rounded-lg bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-4 py-3 hidden md:block">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Nome / Objeto
          </div>
          {showCategory && (
            <div className="col-span-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tipo
            </div>
          )}
          <div
            className={`${showCategory ? "col-span-2" : "col-span-3"} text-xs font-medium text-muted-foreground uppercase tracking-wider`}
          >
            Responsável
          </div>
          <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
            Valor
          </div>
          <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Vigência / Status
          </div>
          <div className="col-span-1 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
            Ações
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/50">
        {contracts.map((contract) => {
          const statusCfg =
            CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
              label: contract.status ?? "—",
              color: "#6b7280",
              bg: "rgba(107,114,128,0.12)",
            };
          const categoryCfg =
            CONTRACT_CATEGORY[contract.category as ContractCategoryKey];
          const expiring = isExpiring(contract);

          return (
            <div
              key={contract.id}
              className="group px-4 py-3 transition-colors hover:bg-muted/20 cursor-pointer"
              onClick={() => onSelect(contract)}
            >
              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                {/* Nome / Objeto */}
                <div className="col-span-4 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {contract.title}
                  </p>
                  {contract.file_name && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {contract.file_name}
                    </p>
                  )}
                </div>

                {/* Tipo badge */}
                {showCategory && (
                  <div className="col-span-1">
                    {categoryCfg ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: categoryCfg.bg,
                          color: categoryCfg.color,
                        }}
                      >
                        {categoryCfg.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                )}

                {/* Responsável / PO */}
                <div
                  className={`${showCategory ? "col-span-2" : "col-span-3"} flex items-center gap-2 min-w-0`}
                >
                  {contract.person_name ? (
                    <>
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {getInitials(contract.person_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {contract.person_name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Valor */}
                <div className="col-span-2 text-right">
                  {contract.monthly_value != null &&
                  contract.monthly_value > 0 ? (
                    <span className="text-sm font-medium">
                      {formatCurrency(contract.monthly_value)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Vigência / Status */}
                <div className="col-span-2 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                    }}
                  >
                    {statusCfg.label}
                  </Badge>
                  {contract.end_date && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {expiring && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                </div>

                {/* Ações */}
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(contract);
                        }}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Editar
                      </DropdownMenuItem>
                      {contract.file_url && (
                        <DropdownMenuItem asChild>
                          <a
                            href={contract.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Baixar PDF
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(contract);
                        }}
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        Renovar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="md:hidden space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {contract.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.person_name ?? "Sem responsável"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 shrink-0"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                    }}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryCfg && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: categoryCfg.bg,
                          color: categoryCfg.color,
                        }}
                      >
                        {categoryCfg.label}
                      </Badge>
                    )}
                    {contract.end_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(contract.end_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    )}
                  </div>
                  {contract.monthly_value != null &&
                    contract.monthly_value > 0 && (
                      <span className="text-sm font-medium">
                        {formatCurrency(contract.monthly_value)}
                      </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
