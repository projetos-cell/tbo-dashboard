"use client";

import { useState, useMemo, useCallback } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  useFinanceTransactions,
  useDeleteTransaction,
  useFinanceCategories,
  useFinanceCostCenters,
  useFinanceChartData,
  useBulkAutoCategorize,
} from "@/features/financeiro/hooks/use-finance";
import {
  getTBOYearRange,
  getTBOSemesterRange,
  getTBOQuarterRange,
  getTBOYearPeriods,
} from "@/features/financeiro/services/finance-cycle";
import { TransactionForm } from "@/features/financeiro/components/transaction-form";
import type {
  FinanceTransaction,
  FinanceFilters,
} from "@/features/financeiro/services/finance-types";

const STATUS_COLORS: Record<string, string> = {
  previsto: "bg-blue-100 text-blue-800",
  provisionado: "bg-purple-100 text-purple-800",
  pago: "bg-green-100 text-green-800",
  liquidado: "bg-emerald-100 text-emerald-800",
  parcial: "bg-amber-100 text-amber-800",
  atrasado: "bg-red-100 text-red-800",
  recorrente: "bg-indigo-100 text-indigo-800",
  cancelado: "bg-gray-100 text-gray-800",
};

const TYPE_ICONS = {
  receita: <ArrowUpCircle className="h-4 w-4 text-green-600" />,
  despesa: <ArrowDownCircle className="h-4 w-4 text-red-600" />,
  transferencia: <ArrowLeftRight className="h-4 w-4 text-blue-600" />,
} as const;

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}

const PAGE_SIZE = 25;

const YEAR = new Date().getFullYear();

// TBO financial cycle: periods run from day 15 to day 14
const yearRange = getTBOYearRange(YEAR);
const s1 = getTBOSemesterRange(YEAR, 1);
const s2 = getTBOSemesterRange(YEAR, 2);
const q1 = getTBOQuarterRange(YEAR, 1);
const q2 = getTBOQuarterRange(YEAR, 2);
const q3 = getTBOQuarterRange(YEAR, 3);
const q4 = getTBOQuarterRange(YEAR, 4);
const monthPeriods = getTBOYearPeriods(YEAR);

const PERIOD_OPTIONS = [
  { value: "year", label: `${YEAR}`, from: yearRange.from, to: yearRange.to },
  // Semestres (ciclo 15-14)
  { value: "s1", label: `S1 ${YEAR}`, from: s1.from, to: s1.to },
  { value: "s2", label: `S2 ${YEAR}`, from: s2.from, to: s2.to },
  // Trimestres (ciclo 15-14)
  { value: "q1", label: `Q1 ${YEAR}`, from: q1.from, to: q1.to },
  { value: "q2", label: `Q2 ${YEAR}`, from: q2.from, to: q2.to },
  { value: "q3", label: `Q3 ${YEAR}`, from: q3.from, to: q3.to },
  { value: "q4", label: `Q4 ${YEAR}`, from: q4.from, to: q4.to },
  // Meses (ciclo 15-14)
  ...monthPeriods,
  { value: "all", label: "Todos", from: undefined as string | undefined, to: undefined as string | undefined },
] as const;

export default function TransacoesPage() {
  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("year");
  const [page, setPage] = useState(1);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const period = PERIOD_OPTIONS.find((p) => p.value === periodFilter) ?? PERIOD_OPTIONS[0];

  const filters: FinanceFilters = useMemo(
    () => ({
      ...(typeFilter !== "all" && { type: typeFilter as FinanceFilters["type"] }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(search.trim() && { search: search.trim() }),
      ...(period.from && { dateFrom: period.from }),
      ...(period.to && { dateTo: period.to }),
      page,
      pageSize: PAGE_SIZE,
    }),
    [typeFilter, statusFilter, search, period.from, period.to, page]
  );

  const { data, isLoading, isError, error, refetch } = useFinanceTransactions(filters);
  const { data: categories = [] } = useFinanceCategories();
  const { data: costCenters = [] } = useFinanceCostCenters();
  const { mutate: deleteTx, isPending: deleting } = useDeleteTransaction();
  const { mutate: bulkCategorize, isPending: bulkPending } = useBulkAutoCategorize();

  const transactions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const costCenterMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cc of costCenters) map.set(cc.id, `${cc.code} - ${cc.name}`);
    return map;
  }, [costCenters]);

  const handleEdit = useCallback((tx: FinanceTransaction) => {
    setEditingTx(tx);
    setFormOpen(true);
  }, []);

  const handleNew = useCallback(() => {
    setEditingTx(null);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteTx(deleteId, {
      onSuccess: () => {
        toast.success("Transação excluída.");
        setDeleteId(null);
      },
      onError: (e) => toast.error(e.message),
    });
  }, [deleteId, deleteTx]);

  // Period totals (all transactions in period, not just current page)
  const chartFilters = useMemo(
    () => ({
      ...(typeFilter !== "all" && { type: typeFilter as FinanceFilters["type"] }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(period.from && { dateFrom: period.from }),
      ...(period.to && { dateTo: period.to }),
    }),
    [typeFilter, statusFilter, period.from, period.to]
  );
  const { data: allTx = [] } = useFinanceChartData(chartFilters);

  // Count uncategorized transactions from the full period data
  const uncategorizedCount = useMemo(
    () => allTx.filter((t) => !t.category_id || !t.cost_center_id).length,
    [allTx]
  );

  const handleBulkCategorize = useCallback(() => {
    const txToProcess = allTx
      .filter((t) => !t.category_id || !t.cost_center_id)
      .map((t) => ({
        id: t.id,
        description: t.description,
        type: t.type,
        counterpart: t.counterpart ?? null,
        business_unit: t.business_unit ?? null,
        category_id: t.category_id ?? null,
        cost_center_id: t.cost_center_id ?? null,
      }));

    if (txToProcess.length === 0) {
      toast.info("Todas as transações já estão categorizadas.");
      return;
    }

    bulkCategorize(
      { transactions: txToProcess, categories, costCenters },
      {
        onSuccess: (result) => {
          if (result.updated === 0) {
            toast.info("Nenhuma transação pôde ser categorizada automaticamente.");
          } else {
            toast.success(
              `${result.updated} transação(ões) categorizada(s) automaticamente.`
            );
          }
        },
        onError: (e) => toast.error(e.message),
      }
    );
  }, [allTx, categories, costCenters, bulkCategorize]);

  const handleExportCSV = useCallback(() => {
    const BOM = "\uFEFF";
    const headers = ["Data", "Tipo", "Status", "Descrição", "Contraparte", "Valor", "Valor Pago", "Vencimento", "Categoria", "Centro de Custo", "BU"].join(";");
    const rows = allTx.map((tx) => [
      formatDate(tx.date),
      tx.type,
      tx.status,
      `"${(tx.description ?? "").replace(/"/g, '""')}"`,
      `"${(tx.counterpart ?? "").replace(/"/g, '""')}"`,
      String(tx.amount ?? 0).replace(".", ","),
      String(tx.paid_amount ?? 0).replace(".", ","),
      formatDate(tx.due_date),
      `"${categoryMap.get(tx.category_id ?? "") ?? ""}"`,
      `"${costCenterMap.get(tx.cost_center_id ?? "") ?? ""}"`,
      `"${tx.business_unit ?? ""}"`,
    ].join(";"));
    const csv = BOM + headers + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allTx, categoryMap, costCenterMap]);

  const summary = useMemo(() => {
    const receitas = allTx
      .filter((t) => t.type === "receita")
      .reduce((s, t) => s + Number(t.amount), 0);
    const despesas = allTx
      .filter((t) => t.type === "despesa")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [allTx]);

  return (
    <RBACGuard minRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
            <p className="text-muted-foreground text-sm">
              {totalCount} transações encontradas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {uncategorizedCount > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkCategorize}
                disabled={bulkPending}
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                {bulkPending
                  ? "Categorizando…"
                  : `Auto-categorizar (${uncategorizedCount})`}
              </Button>
            )}
            {allTx.length > 0 && (
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            )}
            <Button onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-green-600">
                {formatBRL(summary.receitas)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-red-600">
                {formatBRL(summary.despesas)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold ${summary.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatBRL(summary.saldo)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={periodFilter}
            onValueChange={(v) => {
              setPeriodFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="previsto">Previsto</SelectItem>
              <SelectItem value="provisionado">Provisionado</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="liquidado">Liquidado</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Erro ao carregar transações</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">
                {error instanceof Error ? error.message : "Verifique a conexão e tente novamente."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Contraparte</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <p className="text-muted-foreground">
                        Nenhuma transação encontrada.
                      </p>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={handleNew}
                      >
                        Criar primeira transação
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(tx)}
                    >
                      <TableCell>{TYPE_ICONS[tx.type]}</TableCell>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.category_id
                          ? categoryMap.get(tx.category_id) ?? "—"
                          : <span className="text-amber-500">sem categoria</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.cost_center_id
                          ? costCenterMap.get(tx.cost_center_id) ?? "—"
                          : <span className="text-amber-500">sem CC</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.counterpart ?? "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono font-medium ${
                          tx.type === "receita"
                            ? "text-green-600"
                            : tx.type === "despesa"
                              ? "text-red-600"
                              : ""
                        }`}
                      >
                        {formatBRL(Number(tx.amount))}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(tx.due_date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[tx.status] ?? ""}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(tx);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(tx.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Form Dialog */}
        <TransactionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          editingTransaction={editingTx}
        />

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A transação será removida
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Excluindo…" : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RBACGuard>
  );
}
