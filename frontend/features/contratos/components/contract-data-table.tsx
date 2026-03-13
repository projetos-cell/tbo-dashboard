"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconDotsVertical,
  IconPencil,
  IconDownload,
  IconRefresh,
  IconTrash,
  IconAlertTriangle,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  type ContractStatusKey,
  type ContractCategoryKey,
} from "@/lib/constants";
import {
  InlineSelect,
  type InlineSelectOption,
} from "@/components/ui/inline-select";
import { InlineCurrency } from "@/components/ui/inline-currency";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

// ─── Sort types ───────────────────────────────────────────────────────
type SortColumn =
  | "title"
  | "category"
  | "person_name"
  | "monthly_value"
  | "end_date"
  | "status";
type SortDirection = "asc" | "desc";
interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

interface ContractDataTableProps {
  contracts: ContractRow[];
  isLoading: boolean;
  showCategory?: boolean;
  onEdit: (contract: ContractRow) => void;
  onSelect: (contract: ContractRow) => void;
  onDelete: (contract: ContractRow) => void;
  onInlineUpdate?: (
    id: string,
    updates: Partial<ContractRow>,
  ) => void;
}

// ─── Inline select option arrays ─────────────────────────────────────
const CATEGORY_OPTIONS: InlineSelectOption[] = Object.entries(
  CONTRACT_CATEGORY,
).map(([key, cfg]) => ({
  value: key,
  label: cfg.label,
  color: cfg.color,
  bg: cfg.bg,
}));

const STATUS_OPTIONS: InlineSelectOption[] = Object.entries(
  CONTRACT_STATUS,
).map(([key, cfg]) => ({
  value: key,
  label: cfg.label,
  color: cfg.color,
  bg: cfg.bg,
}));

// ─── Helpers ──────────────────────────────────────────────────────────

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

/** Resolve a downloadable URL — tries file_url first, then source_path */
function getFileUrl(contract: ContractRow): string | null {
  if (contract.file_url) return contract.file_url;
  if (contract.source_path && contract.source_path.startsWith("http"))
    return contract.source_path;
  return null;
}

/** Generic comparator for sort */
function compareValues(
  a: ContractRow,
  b: ContractRow,
  column: SortColumn,
  direction: SortDirection
): number {
  let valA: string | number | null;
  let valB: string | number | null;

  switch (column) {
    case "title":
      valA = a.title?.toLowerCase() ?? "";
      valB = b.title?.toLowerCase() ?? "";
      break;
    case "category":
      valA = a.category?.toLowerCase() ?? "";
      valB = b.category?.toLowerCase() ?? "";
      break;
    case "person_name":
      valA = a.person_name?.toLowerCase() ?? "";
      valB = b.person_name?.toLowerCase() ?? "";
      break;
    case "monthly_value":
      valA = a.monthly_value ?? 0;
      valB = b.monthly_value ?? 0;
      break;
    case "end_date":
      valA = a.end_date ?? "";
      valB = b.end_date ?? "";
      break;
    case "status":
      valA = a.status?.toLowerCase() ?? "";
      valB = b.status?.toLowerCase() ?? "";
      break;
    default:
      return 0;
  }

  // Nulls / empty always go last
  if (!valA && valB) return 1;
  if (valA && !valB) return -1;
  if (!valA && !valB) return 0;

  let result: number;
  if (typeof valA === "number" && typeof valB === "number") {
    result = valA - valB;
  } else {
    result = String(valA).localeCompare(String(valB), "pt-BR");
  }

  return direction === "desc" ? -result : result;
}

// ─── Sort header component ───────────────────────────────────────────

function SortHeader({
  label,
  column,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  column: SortColumn;
  sort: SortState | null;
  onSort: (column: SortColumn) => void;
  className?: string;
}) {
  const isActive = sort?.column === column;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSort(column);
      }}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors select-none ${
        isActive
          ? "text-[#f97316]"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      {label}
      {isActive ? (
        sort.direction === "asc" ? (
          <IconArrowUp className="h-3 w-3" />
        ) : (
          <IconArrowDown className="h-3 w-3" />
        )
      ) : (
        <IconArrowsUpDown className="h-3 w-3 opacity-0 group-hover/header:opacity-40 transition-opacity" />
      )}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export function ContractDataTable({
  contracts,
  isLoading,
  showCategory = true,
  onEdit,
  onSelect,
  onDelete,
  onInlineUpdate,
}: ContractDataTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ContractRow | null>(null);
  const [sort, setSort] = useState<SortState | null>(null);

  // Toggle sort: none → asc → desc → none
  function handleSort(column: SortColumn) {
    setSort((prev) => {
      if (prev?.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return null; // reset
    });
  }

  // Sorted contracts
  const sorted = useMemo(() => {
    if (!sort) return contracts;
    return [...contracts].sort((a, b) =>
      compareValues(a, b, sort.column, sort.direction)
    );
  }, [contracts, sort]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-12 gap-4">
            {[
              "Nome / Objeto",
              "Tipo",
              "Responsável",
              "Valor",
              "Vigência",
              "",
            ].map((h) => (
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
            ))}
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
    <>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-4 py-3 hidden md:block group/header">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <SortHeader
                label="Nome / Objeto"
                column="title"
                sort={sort}
                onSort={handleSort}
              />
            </div>
            {showCategory && (
              <div className="col-span-1">
                <SortHeader
                  label="Tipo"
                  column="category"
                  sort={sort}
                  onSort={handleSort}
                />
              </div>
            )}
            <div className={showCategory ? "col-span-2" : "col-span-3"}>
              <SortHeader
                label="Cliente"
                column="person_name"
                sort={sort}
                onSort={handleSort}
              />
            </div>
            <div className="col-span-2">
              <SortHeader
                label="Valor"
                column="monthly_value"
                sort={sort}
                onSort={handleSort}
                className="justify-end"
              />
            </div>
            <div className="col-span-2">
              <SortHeader
                label="Vigência"
                column="end_date"
                sort={sort}
                onSort={handleSort}
              />
            </div>
            <div className="col-span-1 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
              Ações
            </div>
          </div>
        </div>

        {/* Sort indicator bar */}
        {sort && (
          <div className="px-4 py-1.5 bg-[#f97316]/5 border-b border-[#f97316]/10 flex items-center justify-between">
            <span className="text-xs text-[#f97316]">
              Ordenado por{" "}
              <span className="font-medium">
                {
                  {
                    title: "Nome",
                    category: "Tipo",
                    person_name: "Responsável",
                    monthly_value: "Valor",
                    end_date: "Vigência",
                    status: "Status",
                  }[sort.column]
                }
              </span>{" "}
              ({sort.direction === "asc" ? "A → Z" : "Z → A"})
            </span>
            <button
              onClick={() => setSort(null)}
              className="text-xs text-[#f97316] hover:text-[#ea580c] font-medium"
            >
              Limpar
            </button>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {sorted.map((contract) => {
            const statusCfg =
              CONTRACT_STATUS[contract.status as ContractStatusKey] ?? {
                label: contract.status ?? "—",
                color: "#6b7280",
                bg: "rgba(107,114,128,0.12)",
              };
            const categoryCfg =
              CONTRACT_CATEGORY[contract.category as ContractCategoryKey];
            const expiring = isExpiring(contract);
            const downloadUrl = getFileUrl(contract);

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

                  {/* Tipo badge — inline edit */}
                  {showCategory && (
                    <div className="col-span-1">
                      <InlineSelect
                        value={contract.category}
                        options={CATEGORY_OPTIONS}
                        onSave={(v) =>
                          onInlineUpdate?.(contract.id, { category: v })
                        }
                        disabled={!onInlineUpdate}
                        fallbackLabel="—"
                      />
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

                  {/* Valor — inline edit */}
                  <div className="col-span-2 text-right">
                    <InlineCurrency
                      value={contract.monthly_value}
                      onSave={(v) =>
                        onInlineUpdate?.(contract.id, { monthly_value: v })
                      }
                      disabled={!onInlineUpdate}
                    />
                  </div>

                  {/* Vigência / Status — inline edit */}
                  <div className="col-span-2 flex items-center gap-2">
                    <InlineSelect
                      value={contract.status}
                      options={STATUS_OPTIONS}
                      onSave={(v) =>
                        onInlineUpdate?.(contract.id, { status: v })
                      }
                      disabled={!onInlineUpdate}
                      fallbackLabel="—"
                    />
                    {contract.end_date && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(contract.end_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    )}
                    {expiring && (
                      <IconAlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>

                  {/* Ações */}
                  <div
                    className="col-span-1 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onEdit(contract)}>
                          <IconPencil className="mr-2 h-3.5 w-3.5" />
                          Editar
                        </DropdownMenuItem>
                        {downloadUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconDownload className="mr-2 h-3.5 w-3.5" />
                              Baixar PDF
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(contract)}>
                          <IconRefresh className="mr-2 h-3.5 w-3.5" />
                          Renovar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setDeleteTarget(contract)}
                        >
                          <IconTrash className="mr-2 h-3.5 w-3.5" />
                          Excluir
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteTarget?.title}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
