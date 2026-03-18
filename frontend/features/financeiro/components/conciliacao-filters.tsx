"use client";

// ── ConciliacaoFilters ─────────────────────────────────────────────────────────
// Barra de filtros: período, status, valor mínimo/máximo, conta bancária.
// ─────────────────────────────────────────────────────────────────────────────

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BankAccount } from "@/lib/supabase/types/bank-reconciliation";
import { IconFilter, IconX } from "@tabler/icons-react";

export type ConciliacaoStatusFilter = "all" | "pendente" | "sugestao" | "auto" | "conciliado";

export interface ConciliacaoFiltersState {
  status: ConciliacaoStatusFilter;
  dateFrom: string;
  dateTo: string;
  bankAccountId: string;
}

export const DEFAULT_FILTERS: ConciliacaoFiltersState = {
  status: "all",
  dateFrom: "",
  dateTo: "",
  bankAccountId: "",
};

interface ConciliacaoFiltersProps {
  filters: ConciliacaoFiltersState;
  onChange: (filters: ConciliacaoFiltersState) => void;
  bankAccounts: BankAccount[];
  isLoadingAccounts: boolean;
}

export function ConciliacaoFilters({
  filters,
  onChange,
  bankAccounts,
  isLoadingAccounts,
}: ConciliacaoFiltersProps) {
  const isDirty =
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.bankAccountId !== "";

  function set<K extends keyof ConciliacaoFiltersState>(key: K, value: ConciliacaoFiltersState[K]) {
    onChange({ ...filters, [key]: value });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <IconFilter className="size-3.5" />
        Filtros
      </div>

      {/* Conta bancária */}
      <Select
        value={filters.bankAccountId || "all"}
        onValueChange={(v) => set("bankAccountId", v === "all" ? "" : v)}
        disabled={isLoadingAccounts}
      >
        <SelectTrigger className="h-8 text-xs w-44">
          <SelectValue placeholder="Todas as contas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as contas</SelectItem>
          {bankAccounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.bank_name} — {acc.account_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(v) => set("status", v as ConciliacaoStatusFilter)}
      >
        <SelectTrigger className="h-8 text-xs w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="pendente">Sem match</SelectItem>
          <SelectItem value="sugestao">Sugestão</SelectItem>
          <SelectItem value="auto">Auto-conciliar</SelectItem>
          <SelectItem value="conciliado">Conciliados</SelectItem>
        </SelectContent>
      </Select>

      {/* Período: de */}
      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => set("dateFrom", e.target.value)}
        className="h-8 text-xs w-36"
        placeholder="De"
      />

      {/* Período: até */}
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => set("dateTo", e.target.value)}
        className="h-8 text-xs w-36"
        placeholder="Até"
      />

      {/* Clear */}
      {isDirty && (
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1" onClick={reset}>
          <IconX className="size-3" />
          Limpar
        </Button>
      )}
    </div>
  );
}
