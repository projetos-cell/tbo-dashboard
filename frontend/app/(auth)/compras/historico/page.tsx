"use client";

import React, { useState, useMemo, useCallback } from "react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconSearch,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react";
import { PageHeader, EmptyState, DataPagination } from "@/components/shared";
import { usePedidos, useVendors, useVendorCategories } from "@/features/compras/hooks/use-compras";
import { PedidoDetailSheet } from "@/features/compras/components/pedido-detail-sheet";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "@/features/compras/types";
import type { Pedido, PedidoStatus, PedidoPrioridade } from "@/features/compras/types";
import { cn } from "@/lib/utils";

type GroupBy = "status" | "vendor" | "month" | "none";

const PAGE_SIZE = 25;

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}

function getMonthLabel(iso: string | null) {
  if (!iso) return "Sem data";
  return format(parseISO(iso), "MMMM yyyy", { locale: ptBR });
}

interface HistoricoTableRowProps {
  pedido: Pedido;
  categories: { id: string; name: string }[];
  onView: (p: Pedido) => void;
}

function HistoricoTableRow({ pedido, categories, onView }: HistoricoTableRowProps) {
  const statusCfg = STATUS_CONFIG[pedido.status];
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];
  const cat = categories.find((c) => c.id === pedido.categoria_id);
  const valor = pedido.valor_final ?? pedido.valor_estimado;

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/40"
      onClick={() => onView(pedido)}
    >
      <TableCell className="font-medium">{pedido.titulo}</TableCell>
      <TableCell className="text-muted-foreground">
        {pedido.vendor?.name ?? "—"}
      </TableCell>
      <TableCell>{cat?.name ?? "—"}</TableCell>
      <TableCell>
        <Badge variant={statusCfg.badge} className="text-xs">
          {statusCfg.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${prioridadeCfg.color}20`,
            color: prioridadeCfg.color,
          }}
        >
          {prioridadeCfg.label}
        </span>
      </TableCell>
      <TableCell className="tabular-nums">{formatCurrency(valor)}</TableCell>
      <TableCell>{formatDate(pedido.data_solicitacao)}</TableCell>
    </TableRow>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell
        colSpan={7}
        className="py-1.5 pl-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label} ({count})
      </TableCell>
    </TableRow>
  );
}

function DateRangePicker({
  value,
  onChange,
}: {
  value: { from: Date | null; to: Date | null };
  onChange: (v: { from: Date | null; to: Date | null }) => void;
}) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!value.from && !value.to) return "Período";
    if (value.from && !value.to)
      return format(value.from, "dd/MM/yyyy", { locale: ptBR });
    if (value.from && value.to)
      return `${format(value.from, "dd/MM", { locale: ptBR })} – ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`;
    return "Período";
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-52 justify-start text-left font-normal",
            !value.from && "text-muted-foreground"
          )}
        >
          <IconCalendar className="mr-2 size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: value.from ?? undefined,
            to: value.to ?? undefined,
          }}
          onSelect={(range: { from?: Date; to?: Date } | undefined) =>
            onChange({ from: range?.from ?? null, to: range?.to ?? null })
          }
          locale={ptBR}
          initialFocus
        />
        {(value.from || value.to) && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange({ from: null, to: null });
                setOpen(false);
              }}
            >
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function exportToCSV(pedidos: Pedido[], categories: { id: string; name: string }[]) {
  const headers = [
    "Título",
    "Fornecedor",
    "Categoria",
    "Status",
    "Prioridade",
    "Valor",
    "Data Solicitação",
  ];

  const rows = pedidos.map((p: Pedido) => {
    const cat = categories.find((c: { id: string; name: string }) => c.id === p.categoria_id);
    const valor = p.valor_final ?? p.valor_estimado;
    return [
      p.titulo,
      p.vendor?.name ?? "",
      cat?.name ?? "",
      STATUS_CONFIG[p.status as PedidoStatus].label,
      PRIORIDADE_CONFIG[p.prioridade as PedidoPrioridade].label,
      valor !== null ? valor.toString() : "",
      p.data_solicitacao ? format(parseISO(p.data_solicitacao), "dd/MM/yyyy") : "",
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `compras-historico-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function HistoricoPage() {
  const { data: allPedidos = [] as Pedido[], isLoading } = usePedidos();
  const { data: vendors = [] as { id: string; name: string }[] } = useVendors();
  const { data: categories = [] as { id: string; name: string }[] } = useVendorCategories();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("_all");
  const [filterVendor, setFilterVendor] = useState("_all");
  const [filterPrioridade, setFilterPrioridade] = useState("_all");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const handleViewPedido = (pd: Pedido): void => { setDetailId(pd.id); };

  const filtered = useMemo(() => {
    return allPedidos.filter((p) => {
      const matchSearch =
        !search || p.titulo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "_all" || p.status === filterStatus;
      const matchVendor = filterVendor === "_all" || p.vendor_id === filterVendor;
      const matchPrioridade =
        filterPrioridade === "_all" || p.prioridade === filterPrioridade;
      const matchDate =
        !dateRange.from ||
        !p.data_solicitacao ||
        isWithinInterval(parseISO(p.data_solicitacao), {
          start: startOfDay(dateRange.from),
          end: dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from),
        });
      return matchSearch && matchStatus && matchVendor && matchPrioridade && matchDate;
    });
  }, [allPedidos, search, filterStatus, filterVendor, filterPrioridade, dateRange]);

  // Sort by data_solicitacao desc
  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.data_solicitacao ?? 0).getTime() -
          new Date(a.data_solicitacao ?? 0).getTime()
      ),
    [filtered]
  );

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, Pedido[]>();
    for (const p of sorted as Pedido[]) {
      let key = "";
      if (groupBy === "status") key = STATUS_CONFIG[p.status as PedidoStatus].label;
      else if (groupBy === "vendor") key = p.vendor?.name ?? "Sem fornecedor";
      else if (groupBy === "month") key = getMonthLabel(p.data_solicitacao);
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    }
    return groups;
  }, [sorted, groupBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page]
  );

  const handleExport = useCallback(() => {
    exportToCSV(sorted, categories);
  }, [sorted, categories]);

  const tableRows = (items: Pedido[]) =>
    items.map((p) => (
      <HistoricoTableRow
        key={p.id}
        pedido={p}
        categories={categories as { id: string; name: string }[]}
        onView={handleViewPedido}
      />
    ));

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Histórico de Compras"
        description={`${sorted.length} pedido${sorted.length !== 1 ? "s" : ""} no histórico.`}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="mr-1.5 size-4" />
            Exportar CSV
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido..."
            className="pl-9"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v: string) => {
            setFilterStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos os status</SelectItem>
            {(Object.keys(STATUS_CONFIG) as PedidoStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterVendor}
          onValueChange={(v: string) => {
            setFilterVendor(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos os fornecedores</SelectItem>
            {vendors.map((v: { id: string; name: string }) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterPrioridade}
          onValueChange={(v: string) => {
            setFilterPrioridade(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {(Object.keys(PRIORIDADE_CONFIG) as PedidoPrioridade[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORIDADE_CONFIG[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker value={dateRange} onChange={(v) => { setDateRange(v); setPage(1); }} />
        <Select value={groupBy} onValueChange={(v: string) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem agrupamento</SelectItem>
            <SelectItem value="status">Por status</SelectItem>
            <SelectItem value="vendor">Por fornecedor</SelectItem>
            <SelectItem value="month">Por mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="Nenhum pedido encontrado"
          description="Ajuste os filtros para ver outros resultados."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped ? (
                  Array.from<[string, Pedido[]]>(grouped.entries()).map(([label, items]) => (
                    <React.Fragment key={label}>
                      <GroupHeader label={label} count={items.length} />
                      {tableRows(items)}
                    </React.Fragment>
                  ))
                ) : (
                  tableRows(paginated)
                )}
              </TableBody>
            </Table>
          </div>

          {groupBy === "none" && totalPages > 1 && (
            <DataPagination
              total={sorted.length}
              pagination={{ page, pageSize: PAGE_SIZE }}
              onPageChange={setPage}
              onPageSizeChange={() => void 0}
            />
          )}
        </>
      )}

      <PedidoDetailSheet pedidoId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
