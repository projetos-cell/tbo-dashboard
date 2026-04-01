"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { DENSITY_ROW_PADDING } from "@/components/shared";
import { ContractTableRow } from "./contract-table-row";

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
  onInlineUpdate?: (id: string, updates: Partial<ContractRow>) => void;
}

// ─── Sort helper ──────────────────────────────────────────────────────

function compareValues(
  a: ContractRow,
  b: ContractRow,
  column: SortColumn,
  direction: SortDirection,
): number {
  let valA: string | number | null;
  let valB: string | number | null;

  switch (column) {
    case "title":       valA = a.title?.toLowerCase() ?? "";       valB = b.title?.toLowerCase() ?? ""; break;
    case "category":    valA = a.category?.toLowerCase() ?? "";    valB = b.category?.toLowerCase() ?? ""; break;
    case "person_name": valA = a.person_name?.toLowerCase() ?? ""; valB = b.person_name?.toLowerCase() ?? ""; break;
    case "monthly_value": valA = a.monthly_value ?? 0;             valB = b.monthly_value ?? 0; break;
    case "end_date":    valA = a.end_date ?? "";                   valB = b.end_date ?? ""; break;
    case "status":      valA = a.status?.toLowerCase() ?? "";      valB = b.status?.toLowerCase() ?? ""; break;
    default: return 0;
  }

  if (!valA && valB) return 1;
  if (valA && !valB) return -1;
  if (!valA && !valB) return 0;

  const result =
    typeof valA === "number" && typeof valB === "number"
      ? valA - valB
      : String(valA).localeCompare(String(valB), "pt-BR");

  return direction === "desc" ? -result : result;
}

// ─── SortHeader ───────────────────────────────────────────────────────

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
      onClick={(e) => { e.stopPropagation(); onSort(column); }}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors select-none ${
        isActive ? "text-[#f97316]" : "text-muted-foreground hover:text-foreground"
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

// ─── LoadingSkeleton ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="bg-muted/30 px-4 py-3">
        <div className="grid grid-cols-12 gap-4">
          {["Nome / Objeto", "Tipo", "Responsável", "Valor", "Vigência", ""].map((h) => (
            <div
              key={h}
              className={`text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                h === "Nome / Objeto" ? "col-span-4" : h === "" ? "col-span-1" : "col-span-2"
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

// ─── Main component ───────────────────────────────────────────────────

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
  const { sortPref, saveSort, density } = useTablePreferences("contratos");
  const rowPadding = DENSITY_ROW_PADDING[density];

  // Map SortPref (hook) → SortState (local type)
  const sort: SortState | null = sortPref
    ? { column: sortPref.columnId as SortColumn, direction: sortPref.direction }
    : null;

  function handleSort(column: SortColumn) {
    if (sort?.column !== column) {
      saveSort({ columnId: column, direction: "asc" });
    } else if (sort.direction === "asc") {
      saveSort({ columnId: column, direction: "desc" });
    } else {
      saveSort(null);
    }
  }

  const sorted = useMemo(() => {
    if (!sort) return contracts;
    return [...contracts].sort((a, b) => compareValues(a, b, sort.column, sort.direction));
  }, [contracts, sort]);

  if (isLoading) return <LoadingSkeleton />;
  if (contracts.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-4 py-3 hidden md:block group/header">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <SortHeader label="Nome / Objeto" column="title" sort={sort} onSort={handleSort} />
            </div>
            {showCategory && (
              <div className="col-span-1">
                <SortHeader label="Tipo" column="category" sort={sort} onSort={handleSort} />
              </div>
            )}
            <div className={showCategory ? "col-span-2" : "col-span-3"}>
              <SortHeader label="Cliente" column="person_name" sort={sort} onSort={handleSort} />
            </div>
            <div className="col-span-2">
              <SortHeader label="Valor" column="monthly_value" sort={sort} onSort={handleSort} className="justify-end" />
            </div>
            <div className="col-span-2">
              <SortHeader label="Vigência" column="end_date" sort={sort} onSort={handleSort} />
            </div>
            <div className="col-span-1 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
              Ações
            </div>
          </div>
        </div>

        {/* Sort indicator */}
        {sort && (
          <div className="px-4 py-1.5 bg-[#f97316]/5 border-b border-[#f97316]/10 flex items-center justify-between">
            <span className="text-xs text-[#f97316]">
              Ordenado por{" "}
              <span className="font-medium">
                {{ title: "Nome", category: "Tipo", person_name: "Responsável", monthly_value: "Valor", end_date: "Vigência", status: "Status" }[sort.column]}
              </span>{" "}
              ({sort.direction === "asc" ? "A → Z" : "Z → A"})
            </span>
            <button onClick={() => saveSort(null)} className="text-xs text-[#f97316] hover:text-[#ea580c] font-medium">
              Limpar
            </button>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {sorted.map((contract) => (
            <ContractTableRow
              key={contract.id}
              contract={contract}
              showCategory={showCategory}
              onEdit={onEdit}
              onSelect={onSelect}
              onDeleteRequest={setDeleteTarget}
              onInlineUpdate={onInlineUpdate}
              rowPadding={rowPadding}
            />
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.title}</strong>? Esta ação não pode ser desfeita.
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
