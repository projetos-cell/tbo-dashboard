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
import dynamic from "next/dynamic";

const FinanceChartsPanel = dynamic(
  () =>
    import("@/components/financeiro/finance-charts-panel").then((m) => ({
      default: m.FinanceChartsPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);
import {
  useFinanceTransactions,
  useFinanceCategories,
  useFinanceStatus,
  useFinanceStatusWithAmounts,
  useTriggerFinanceSync,
} from "@/hooks/use-finance";
import type { FinanceFilters } from "@/services/finance";
import {
  DateRangeFilter,
  type DateRangeValue,
  resolveDateRange,
} from "@/components/financeiro/date-range-filter";

// ── Types ────────────────────────────────────────────────────────────────────

type Section = "titulos" | "movimentacoes";
type TitulosTab = "todas" | "pagar" | "receber";
type MovTab = "todas" | "entradas" | "saidas" | "transferencias";

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
  previsto: {
    label: "Previsto",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: Clock,
  },
  provisionado: {
    label: "Provisionado",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
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
  recorrente: {
    label: "Recorrente",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    icon: RefreshCw,
  },
  cancelado: {
    label: "Cancelado",
    color: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800/30",
    icon: XCircle,
  },
};

// Context-aware type labels
const TITULOS_TYPE_LABELS: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
};

const MOV_TYPE_LABELS: Record<string, string> = {
  receita: "Entrada",
  despesa: "Saída",
  transferencia: "Transferência",
};

// ── Filter mapping per section / sub-tab ─────────────────────────────────────

function buildNavFilters(
  section: Section,
  titulosTab: TitulosTab,
  movTab: MovTab
): Partial<FinanceFilters> {
  if (section === "titulos") {
    switch (titulosTab) {
      case "pagar":
        return { type: "despesa", typeIn: undefined, statusIn: undefined };
      case "receber":
        return { type: "receita", typeIn: undefined, statusIn: undefined };
      default:
        // Todas — show receita + despesa (exclude transferencias)
        return {
          type: undefined,
          typeIn: ["receita", "despesa"],
          statusIn: undefined,
        };
    }
  }
  // movimentacoes — realized transactions
  switch (movTab) {
    case "entradas":
      return {
        type: "receita",
        typeIn: undefined,
        statusIn: ["pago", "provisionado"],
        dateField: "paid_date",
      };
    case "saidas":
      return {
        type: "despesa",
        typeIn: undefined,
        statusIn: ["pago", "provisionado"],
        dateField: "paid_date",
      };
    case "transferencias":
      return {
        type: "transferencia",
        typeIn: undefined,
        statusIn: undefined,
        dateField: "paid_date",
      };
    default:
      // Todas movimentações — paid/provisionado of all types
      return {
        type: undefined,
        typeIn: undefined,
        statusIn: ["pago", "provisionado"],
        dateField: "paid_date",
      };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  // ── Navigation state ──────────────────────────────────────────────────────
  const [section, setSection] = useState<Section>("titulos");
  const [titulosTab, setTitulosTab] = useState<TitulosTab>("todas");
  const [movTab, setMovTab] = useState<MovTab>("todas");

  // ── Filters state ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FinanceFilters>({
    page: 1,
    pageSize: 25,
    typeIn: ["receita", "despesa"], // default: Títulos / Todas
  });
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: "mtd" });

  // ── Section change handler (full reset) ───────────────────────────────────
  const handleSectionChange = useCallback((newSection: Section) => {
    setSection(newSection);
    // Reset sub-tabs to "todas"
    setTitulosTab("todas");
    setMovTab("todas");
    // Rebuild filters from scratch with section defaults
    const navFilters = buildNavFilters(newSection, "todas", "todas");
    setFilters({ page: 1, pageSize: 25, ...navFilters });
    setSearchInput("");
    setShowFilters(false);
    setSortField("date");
    setSortDir("desc");
  }, []);

  // ── Sub-tab change handlers (preserve user filters) ───────────────────────
  const handleTitulosTabChange = useCallback((tab: TitulosTab) => {
    setTitulosTab(tab);
    const navFilters = buildNavFilters("titulos", tab, "todas");
    setFilters((prev) => ({ ...prev, ...navFilters, page: 1 }));
  }, []);

  const handleMovTabChange = useCallback((tab: MovTab) => {
    setMovTab(tab);
    const navFilters = buildNavFilters("movimentacoes", "todas", tab);
    setFilters((prev) => ({ ...prev, ...navFilters, page: 1 }));
  }, []);

  // ── Effective filters (merge date range into query filters) ──────────────
  const effectiveFilters = useMemo<FinanceFilters>(() => {
    const { from, to } = resolveDateRange(dateRange);
    return { ...filters, dateFrom: from, dateTo: to };
  }, [filters, dateRange]);

  // ── Chart filters (strip pagination/search/type — charts handle type internally) ──
  const chartFilters = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page: _p, pageSize: _ps, search: _s, type: _t, typeIn: _ti, ...rest } = effectiveFilters;
    return rest;
  }, [effectiveFilters]);

  // ── Data hooks ────────────────────────────────────────────────────────────
  const { data: txData, isLoading: txLoading } =
    useFinanceTransactions(effectiveFilters);
  const { data: categories } = useFinanceCategories();
  const { data: status } = useFinanceStatus();
  const { from: amountsFrom, to: amountsTo } = resolveDateRange(dateRange);
  const { data: statusAmounts } = useFinanceStatusWithAmounts(amountsFrom, amountsTo);
  const syncMutation = useTriggerFinanceSync();

  const transactions = txData?.data ?? [];
  const totalCount = txData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize ?? 25));

  // ── Sort client-side ──────────────────────────────────────────────────────
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";

      switch (sortField) {
        case "date":
          // Movimentações: sort by paid_date (fallback date)
          va =
            section === "movimentacoes" ? (a.paid_date ?? a.date) : a.date;
          vb =
            section === "movimentacoes" ? (b.paid_date ?? b.date) : b.date;
          break;
        case "amount":
          va = a.amount;
          vb = b.amount;
          break;
        case "paid_amount":
          va = a.paid_amount;
          vb = b.paid_amount;
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
  }, [transactions, sortField, sortDir, section]);

  // ── Category name lookup map (id → name) ─────────────────────────────────
  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of (categories ?? [])) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  // ── Handlers ──────────────────────────────────────────────────────────────

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
    // Reset user filters but keep current nav position
    const navFilters = buildNavFilters(section, titulosTab, movTab);
    setFilters({ page: 1, pageSize: 25, ...navFilters });
    setSearchInput("");
    setDateRange({ preset: "mtd" });
  }, [section, titulosTab, movTab]);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir(
          field === "amount" || field === "paid_amount" ? "desc" : "asc"
        );
      }
    },
    [sortField]
  );

  const goPage = useCallback((p: number) => {
    setFilters((prev) => ({ ...prev, page: p }));
  }, []);

  // Active filter count (only user-set filters, not nav-driven ones)
  // Note: dateFrom/dateTo are now managed by DateRangeFilter, not counted here
  const activeFilterCount = [
    filters.status,
    filters.category_id,
    filters.business_unit,
    filters.project_id,
    filters.search,
  ].filter(Boolean).length;

  // ── Derived values ────────────────────────────────────────────────────────
  const typeLabels =
    section === "titulos" ? TITULOS_TYPE_LABELS : MOV_TYPE_LABELS;
  const colCount = section === "movimentacoes" ? 9 : 8;

  const sectionTitle =
    section === "titulos" ? "Títulos Financeiros" : "Movimentações de Caixa";
  const sectionSubtitle =
    section === "titulos"
      ? "Contas a pagar e a receber — obrigações financeiras"
      : "Entradas, saídas e transferências — fluxo de caixa realizado";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {sectionTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount > 0
              ? `${totalCount} registro${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`
              : sectionSubtitle}
            {status?.lastSyncAt && (
              <span className="ml-2 text-xs opacity-70">
                · Última sync: {formatDateTime(status.lastSyncAt)}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
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

      {/* Status summary cards — contextual per section */}
      {status && (
        <div
          className={`grid gap-3 grid-cols-2 ${
            section === "titulos" ? "sm:grid-cols-5" : "sm:grid-cols-4"
          }`}
        >
          {section === "titulos" ? (
            <>
              <StatusCard
                label="A Receber"
                value={statusAmounts?.arCount ?? status.totalReceitas}
                color="text-emerald-600 dark:text-emerald-400"
                amount={statusAmounts ? formatCurrency(statusAmounts.arAmount) : undefined}
              />
              <StatusCard
                label="A Pagar"
                value={statusAmounts?.apCount ?? status.totalDespesas}
                color="text-red-600 dark:text-red-400"
                amount={statusAmounts ? formatCurrency(statusAmounts.apAmount) : undefined}
              />
              <StatusCard
                label="Gap AR − AP"
                value={statusAmounts ? formatCurrency(statusAmounts.gap) : "—"}
                color={
                  statusAmounts && statusAmounts.gap >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }
                isCurrency
              />
              <StatusCard
                label="Pendentes"
                value={statusAmounts?.pendingCount ?? status.pendingCount}
                color="text-amber-600 dark:text-amber-400"
              />
              <StatusCard
                label="Atrasados"
                value={statusAmounts?.overdueCount ?? status.overdueCount}
                color="text-red-600 dark:text-red-400"
              />
            </>
          ) : (
            <>
              <StatusCard
                label="Pagas"
                value={status.paidCount}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <StatusCard
                label="Total"
                value={totalCount}
                color="text-foreground"
              />
              <StatusCard
                label="Pendentes"
                value={status.pendingCount}
                color="text-amber-600 dark:text-amber-400"
              />
              <StatusCard
                label="Categorias"
                value={status.categoriesCount}
                color="text-blue-600 dark:text-blue-400"
              />
            </>
          )}
        </div>
      )}

      {/* ── Charts Panel ──────────────────────────────────────────────────────── */}
      <FinanceChartsPanel section={section} filters={chartFilters} />

      {/* ── Level 1: Section toggle (segmented control) ─────────────────────── */}
      <div className="inline-flex rounded-lg bg-muted p-1">
        <button
          onClick={() => handleSectionChange("titulos")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            section === "titulos"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Títulos
        </button>
        <button
          onClick={() => handleSectionChange("movimentacoes")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            section === "movimentacoes"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Movimentações
        </button>
      </div>

      {/* ── Level 2: Sub-tabs (underlined, contextual per section) ──────────── */}
      <div className="flex gap-1 border-b border-border">
        {section === "titulos"
          ? ([
              { key: "todas" as const, label: "Todas" },
              { key: "pagar" as const, label: "Contas a Pagar" },
              { key: "receber" as const, label: "Contas a Receber" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTitulosTabChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  titulosTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab.label}
              </button>
            ))
          : ([
              { key: "todas" as const, label: "Todas" },
              { key: "entradas" as const, label: "Entradas" },
              { key: "saidas" as const, label: "Saídas" },
              { key: "transferencias" as const, label: "Transferências" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleMovTabChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  movTab === tab.key
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

      {/* Expanded filters — no Type dropdown (tabs handle type selection) */}
      {showFilters && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4
                        rounded-md border border-border bg-muted/30"
        >
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
              {section === "movimentacoes" ? (
                <>
                  <option value="pago">Pago</option>
                  <option value="provisionado">Provisionado</option>
                </>
              ) : (
                <>
                  <option value="previsto">Previsto</option>
                  <option value="provisionado">Provisionado</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="recorrente">Recorrente</option>
                  <option value="cancelado">Cancelado</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Categoria
            </label>
            <select
              value={filters.category_id ?? ""}
              onChange={(e) =>
                handleFilterChange("category_id", e.target.value)
              }
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

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Unidade de Negócio
            </label>
            <select
              value={filters.business_unit ?? ""}
              onChange={(e) =>
                handleFilterChange("business_unit", e.target.value)
              }
              className="w-full px-3 py-2 rounded-md border border-border bg-background
                         text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todas</option>
              <option value="Branding">Branding</option>
              <option value="Digital 3D">Digital 3D</option>
              <option value="Marketing">Marketing</option>
              <option value="Audiovisual">Audiovisual</option>
              <option value="Interiores">Interiores</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <SortableHeader
                  label={section === "movimentacoes" ? "Data Pgto" : "Data"}
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
                {section === "movimentacoes" && (
                  <SortableHeader
                    label="Valor Pago"
                    field="paid_amount"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    className="text-right"
                  />
                )}
                <SortableHeader
                  label="Vencimento"
                  field="due_date"
                  current={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Unidade
                </th>
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
                  <td
                    colSpan={colCount}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Carregando…
                  </td>
                </tr>
              ) : sortedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <p className="font-medium">
                      {section === "titulos"
                        ? "Nenhum título encontrado"
                        : "Nenhuma movimentação encontrada"}
                    </p>
                    <p className="text-xs mt-1">
                      {activeFilterCount > 0
                        ? "Tente ajustar os filtros ou limpar a busca."
                        : 'Clique em "Sincronizar Omie" para importar dados.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => {
                  const statusCfg =
                    STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.previsto;
                  const StatusIcon = statusCfg.icon;
                  const displayDate =
                    section === "movimentacoes"
                      ? (tx.paid_date ?? tx.date)
                      : tx.date;

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {formatDate(displayDate)}
                      </td>

                      {/* Type badge */}
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
                          {typeLabels[tx.type] ?? tx.type}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3">
                        <span className="line-clamp-1">{tx.description}</span>
                        {tx.category_id && categoryNameMap.get(tx.category_id) && (
                          <span className="block text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                            {categoryNameMap.get(tx.category_id)}
                          </span>
                        )}
                      </td>

                      {/* Counterpart */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {tx.counterpart ? (
                          <span className="line-clamp-1 max-w-[180px] inline-block">
                            {tx.counterpart}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Amount */}
                      <td
                        className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap ${
                          tx.type === "receita"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "despesa"
                              ? "text-red-600 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {tx.type === "receita"
                          ? "+"
                          : tx.type === "despesa"
                            ? "−"
                            : ""}
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* Paid amount — only in Movimentações */}
                      {section === "movimentacoes" && (
                        <td
                          className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap ${
                            tx.type === "receita"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : tx.type === "despesa"
                                ? "text-red-600 dark:text-red-400"
                                : ""
                          }`}
                        >
                          {tx.paid_amount > 0
                            ? formatCurrency(tx.paid_amount)
                            : "—"}
                        </td>
                      )}

                      {/* Due date */}
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">
                        {formatDate(tx.due_date)}
                      </td>

                      {/* Business Unit */}
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {(tx as any).business_unit ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                            {(tx as any).business_unit}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Status badge */}
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
                <span
                  key={`dots-${i}`}
                  className="px-1 text-muted-foreground"
                >
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
  amount,
  isCurrency = false,
}: {
  label: string;
  value: number | string;
  color: string;
  amount?: string;
  isCurrency?: boolean;
}) {
  // isCurrency signals value is pre-formatted; number values render natively
  void isCurrency;
  return (
    <div className="rounded-md border border-border p-4 bg-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${color}`}>
        {value}
      </p>
      {amount && (
        <p className={`text-xs font-medium mt-0.5 tabular-nums ${color} opacity-75`}>
          {amount}
        </p>
      )}
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
        <Icon
          className={`h-3.5 w-3.5 ${isActive ? "text-foreground" : "opacity-40"}`}
        />
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
