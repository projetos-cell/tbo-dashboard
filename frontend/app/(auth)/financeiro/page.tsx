"use client";

import { useState, useMemo, useCallback } from "react";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  X,
} from "lucide-react";
import {
  useFinanceTransactions,
  useFinanceCategories,
  useFinanceStatus,
  useTriggerFinanceSync,
} from "@/hooks/use-finance";
import type { FinanceFilters } from "@/services/finance";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return "Nunca";
  return new Date(isoStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pendente: {
    label: "Pendente",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: Clock,
  },
  pago: {
    label: "Pago",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: CheckCircle2,
  },
  atrasado: {
    label: "Atrasado",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: AlertCircle,
  },
  cancelado: {
    label: "Cancelado",
    color: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800/30",
    icon: XCircle,
  },
  parcial: {
    label: "Parcial",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: Clock,
  },
};

const TYPE_LABELS: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
  transferencia: "Transferência",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  // Filters state
  const [filters, setFilters] = useState<FinanceFilters>({
    page: 1,
    pageSize: 25,
  });
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"todas" | "pagar" | "receber">(
    "todas"
  );

  const handleTabChange = useCallback(
    (tab: "todas" | "pagar" | "receber") => {
      setActiveTab(tab);
      const typeMap: Record<string, FinanceFilters["type"] | undefined> = {
        todas: undefined,
        pagar: "despesa",
        receber: "receita",
      };
      setFilters((prev) => ({ ...prev, type: typeMap[tab], page: 1 }));
    },
    []
  );

  // Data hooks
  const { data: txData, isLoading: txLoading } = useFinanceTransactions(filters);
  const { data: categories } = useFinanceCategories();
  const { data: status } = useFinanceStatus();
  const syncMutation = useTriggerFinanceSync();

  const transactions = txData?.data ?? [];
  const totalCount = txData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize ?? 25));

  // Sort client-side (server already sorts by date desc, but we allow re-sorting)
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";

      switch (sortField) {
        case "date":
          va = a.date;
          vb = b.date;
          break;
        case "amount":
          va = a.amount;
          vb = b.amount;
          break;
        case "description":
          va = a.description.toLowerCase();
          vb = b.description.toLowerCase();
          break;
        case "status":
          va = a.status;
          vb = b.status;
          break;
        case "type":
          va = a.type;
          vb = b.type;
          break;
        case "due_date":
          va = a.due_date ?? "";
          vb = b.due_date ?? "";
          break;
        default:
          return 0;
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [transactions, sortField, sortDir]);

  // Handlers
  const handleSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (key: keyof FinanceFilters, value: string | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    const typeMap: Record<string, FinanceFilters["type"] | undefined> = {
      todas: undefined,
      pagar: "despesa",
      receber: "receita",
    };
    setFilters({ page: 1, pageSize: 25, type: typeMap[activeTab] });
    setSearchInput("");
  }, [activeTab]);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir(field === "amount" ? "desc" : "asc");
      }
    },
    [sortField]
  );

  const goPage = useCallback((p: number) => {
    setFilters((prev) => ({ ...prev, page: p }));
  }, []);

  const activeFilterCount = [
    activeTab === "todas" ? filters.type : undefined,
    filters.status,
    filters.category_id,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount > 0
              ? `${totalCount} transação${totalCount !== 1 ? "ões" : ""} encontrada${totalCount !== 1 ? "s" : ""}`
              : "Nenhuma transação"}
            {status?.lastSyncAt && (
              <span className="ml-2 text-xs opacity-70">
                · Última sync: {formatDateTime(status.lastSyncAt)}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                     bg-primary text-primary-foreground hover:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
          />
          {syncMutation.isPending ? "Sincronizando…" : "Sincronizar Omie"}
        </button>
      </div>

      {/* Sync result message */}
      {syncMutation.isSuccess && syncMutation.data && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            syncMutation.data.ok
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {syncMutation.data.message}
          {syncMutation.data.errors && syncMutation.data.errors.length > 0 && (
            <span className="block mt-1 text-xs opacity-75">
              Erros: {syncMutation.data.errors.slice(0, 3).join("; ")}
            </span>
          )}
        </div>
      )}

      {syncMutation.isError && (
        <div className="rounded-md px-4 py-3 text-sm bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300">
          Erro ao sincronizar:{" "}
          {syncMutation.error instanceof Error
            ? syncMutation.error.message
            : "Erro desconhecido"}
        </div>
      )}

      {/* Status summary cards */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatusCard
            label="Receitas"
            value={status.totalReceitas}
            color="text-emerald-600 dark:text-emerald-400"
          />
          <StatusCard
            label="Despesas"
            value={status.totalDespesas}
            color="text-red-600 dark:text-red-400"
          />
          <StatusCard
            label="Pendentes"
            value={status.pendingCount}
            color="text-amber-600 dark:text-amber-400"
          />
          <StatusCard
            label="Atrasados"
            value={status.overdueCount}
            color="text-red-600 dark:text-red-400"
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "todas", label: "Todas" },
          { key: "pagar", label: "Contas a Pagar" },
          { key: "receber", label: "Contas a Receber" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por descrição…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background
                       text-sm placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border
                      transition-colors ${
                        showFilters || activeFilterCount > 0
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm
                       text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4
                        rounded-md border border-border bg-muted/30">
          {activeTab === "todas" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tipo
              </label>
              <select
                value={filters.type ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "type",
                    e.target.value as FinanceFilters["type"]
                  )
                }
                className="w-full px-3 py-2 rounded-md border border-border bg-background
                           text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={filters.status ?? ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background
                         text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Categoria
            </label>
            <select
              value={filters.category_id ?? ""}
              onChange={(e) => handleFilterChange("category_id", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background
                         text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                De
              </label>
              <input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background
                           text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Até
              </label>
              <input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background
                           text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <SortableHeader
                  label="Data"
                  field="date"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Tipo"
                  field="type"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Descrição"
                  field="description"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                  className="min-w-[200px]"
                />
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Contraparte
                </th>
                <SortableHeader
                  label="Valor"
                  field="amount"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  label="Vencimento"
                  field="due_date"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Carregando transações…
                  </td>
                </tr>
              ) : sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="font-medium">Nenhuma transação encontrada</p>
                    <p className="text-xs mt-1">
                      {activeFilterCount > 0
                        ? "Tente ajustar os filtros ou limpar a busca."
                        : 'Clique em "Sincronizar Omie" para importar dados.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => {
                  const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pendente;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type === "receita"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : tx.type === "despesa"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}
                        >
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="line-clamp-1">{tx.description}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {tx.counterpart ? (
                          <span className="line-clamp-1 max-w-[180px] inline-block">
                            {tx.counterpart}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap ${
                          tx.type === "receita"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "despesa"
                              ? "text-red-600 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {tx.type === "receita" ? "+" : tx.type === "despesa" ? "−" : ""}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">
                        {formatDate(tx.due_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {filters.page ?? 1} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage((filters.page ?? 1) - 1)}
              disabled={(filters.page ?? 1) <= 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border
                         text-muted-foreground hover:text-foreground hover:bg-muted/50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {generatePageNumbers(filters.page ?? 1, totalPages).map((p, i) =>
              p === null ? (
                <span key={`dots-${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-md
                              text-sm font-medium transition-colors ${
                                p === (filters.page ?? 1)
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goPage((filters.page ?? 1) + 1)}
              disabled={(filters.page ?? 1) >= totalPages}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border
                         text-muted-foreground hover:text-foreground hover:bg-muted/50
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-md border border-border p-4 bg-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  );
}

function SortableHeader({
  label,
  field,
  current,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  field: string;
  current: string;
  dir: "asc" | "desc";
  onSort: (f: string) => void;
  className?: string;
}) {
  const isActive = current === field;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={`px-4 py-3 font-medium text-muted-foreground ${className}`}>
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${isActive ? "text-foreground" : "opacity-40"}`} />
      </button>
    </th>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [1];

  if (current > 3) pages.push(null);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push(null);

  pages.push(total);

  return pages;
}
