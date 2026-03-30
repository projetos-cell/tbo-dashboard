"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconSearch,
  IconCheck,
  IconX,
  IconGripVertical,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { PageHeader, EmptyState } from "@/components/shared";
import {
  usePedidos,
  useVendors,
  useReorderPedidos,
} from "@/features/compras/hooks/use-compras";
import { AprovacaoForm } from "@/features/compras/components/aprovacao-form";
import { PedidoDetailSheet } from "@/features/compras/components/pedido-detail-sheet";
import { PRIORIDADE_CONFIG } from "@/features/compras/types";
import type { Pedido, PedidoPrioridade, DecisaoAprovacao } from "@/features/compras/types";
import { cn } from "@/lib/utils";

type GroupBy = "prioridade" | "vendor" | "none";

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}

interface AprovacaoCardProps {
  pedido: Pedido;
  onView: (p: Pedido) => void;
  onAprovar: (p: Pedido) => void;
  onRejeitar: (p: Pedido) => void;
}

function AprovacaoCard({ pedido, onView, onAprovar, onRejeitar }: AprovacaoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pedido.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];
  const excerpt = pedido.descricao
    ? pedido.descricao.length > 120
      ? pedido.descricao.slice(0, 120) + "..."
      : pedido.descricao
    : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={() => onView(pedido)}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <IconGripVertical className="size-4" />
      </button>

      <CardHeader className="pb-2 pr-8">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-snug">{pedido.titulo}</p>
          <span
            className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${prioridadeCfg.color}20`,
              color: prioridadeCfg.color,
            }}
          >
            {prioridadeCfg.label}
          </span>
        </div>
        {pedido.vendor && (
          <p className="text-xs text-muted-foreground">{pedido.vendor.name}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconCurrencyDollar className="size-3.5" />
            {formatCurrency(pedido.valor_estimado)}
          </span>
          <span className="flex items-center gap-1">
            <IconCalendar className="size-3.5" />
            {formatDate(pedido.data_necessidade)}
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onAprovar(pedido)}
          >
            <IconCheck className="mr-1 size-4" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onRejeitar(pedido)}
          >
            <IconX className="mr-1 size-4" />
            Rejeitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupSection({
  label,
  pedidos,
  onView,
  onAprovar,
  onRejeitar,
}: {
  label: string;
  pedidos: Pedido[];
  onView: (p: Pedido) => void;
  onAprovar: (p: Pedido) => void;
  onRejeitar: (p: Pedido) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} ({pedidos.length})
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pedidos.map((p) => (
          <AprovacaoCard
            key={p.id}
            pedido={p}
            onView={onView}
            onAprovar={onAprovar}
            onRejeitar={onRejeitar}
          />
        ))}
      </div>
    </div>
  );
}

export default function AprovacoesPage() {
  const { data: allPedidos = [] as Pedido[], isLoading } = usePedidos();
  const { data: vendors = [] as { id: string; name: string }[] } = useVendors();
  const reorderPedidos = useReorderPedidos();

  const [search, setSearch] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("_all");
  const [filterVendor, setFilterVendor] = useState<string>("_all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const [aprovacaoOpen, setAprovacaoOpen] = useState<boolean>(false);
  const [aprovacaoTarget, setAprovacaoTarget] = useState<Pedido | null>(null);
  const [aprovacaoDecisao, setAprovacaoDecisao] = useState<DecisaoAprovacao>("aprovado");
  const [detailId, setDetailId] = useState<string | null>(null);
  const handleViewPedido = (p: Pedido): void => { setDetailId(p.id); };

  const sensors = useSensors(useSensor(PointerSensor));

  const pendentes = useMemo(
    () => allPedidos.filter((p) => p.status === "aguardando_aprovacao"),
    [allPedidos]
  );

  const filtered = useMemo(() => {
    return pendentes.filter((p) => {
      const matchSearch =
        !search || p.titulo.toLowerCase().includes(search.toLowerCase());
      const matchPrioridade =
        filterPrioridade === "_all" || p.prioridade === filterPrioridade;
      const matchVendor =
        filterVendor === "_all" || p.vendor_id === filterVendor;
      return matchSearch && matchPrioridade && matchVendor;
    });
  }, [pendentes, search, filterPrioridade, filterVendor]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, Pedido[]>();
    for (const p of filtered as Pedido[]) {
      const key =
        groupBy === "prioridade"
          ? PRIORIDADE_CONFIG[p.prioridade as PedidoPrioridade].label
          : (p.vendor?.name ?? "Sem fornecedor");
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    }
    return groups;
  }, [filtered, groupBy]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (groupBy !== "none") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex((p) => p.id === active.id);
    const newIndex = filtered.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(filtered, oldIndex, newIndex);
    reorderPedidos.mutate(reordered.map((p: Pedido, i: number) => ({ id: p.id, sort_order: i })));
  };

  const openAprovacao = (pedido: Pedido, decisao: DecisaoAprovacao) => {
    setAprovacaoTarget(pedido);
    setAprovacaoDecisao(decisao);
    setAprovacaoOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Aprovações"
        description={`${filtered.length} pedido${filtered.length !== 1 ? "s" : ""} aguardando aprovação.`}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
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
        <Select value={filterVendor} onValueChange={setFilterVendor}>
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
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem agrupamento</SelectItem>
            <SelectItem value="prioridade">Por prioridade</SelectItem>
            <SelectItem value="vendor">Por fornecedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconCheck}
          title="Nenhum pedido aguardando aprovação"
          description={
            pendentes.length === 0
              ? "Tudo aprovado! Nenhum pedido na fila."
              : "Ajuste os filtros para ver outros pedidos."
          }
        />
      ) : grouped ? (
        <div className="space-y-8">
          {Array.from<[string, Pedido[]]>(grouped.entries()).map(([label, items]) => (
            <GroupSection
              key={label}
              label={label}
              pedidos={items}
              onView={handleViewPedido}
              onAprovar={(p: Pedido) => openAprovacao(p, "aprovado")}
              onRejeitar={(p: Pedido) => openAprovacao(p, "rejeitado")}
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p: Pedido) => (
                <AprovacaoCard
                  key={p.id}
                  pedido={p}
                  onView={handleViewPedido}
                  onAprovar={(pd: Pedido) => openAprovacao(pd, "aprovado")}
                  onRejeitar={(pd: Pedido) => openAprovacao(pd, "rejeitado")}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {aprovacaoTarget && (
        <AprovacaoForm
          open={aprovacaoOpen}
          onOpenChange={(v) => {
            setAprovacaoOpen(v);
            if (!v) setAprovacaoTarget(null);
          }}
          pedidoId={aprovacaoTarget.id}
          pedidoTitulo={aprovacaoTarget.titulo}
          initialDecisao={aprovacaoDecisao}
        />
      )}

      <PedidoDetailSheet pedidoId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
