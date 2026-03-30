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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconPlus,
  IconSearch,
  IconGripVertical,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { PageHeader, EmptyState } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import {
  usePedidos,
  useVendors,
  useVendorCategories,
  useDeletePedido,
  useUpdatePedido,
  useReorderPedidos,
} from "@/features/compras/hooks/use-compras";
import { PedidoForm } from "@/features/compras/components/pedido-form";
import { PedidoDetailSheet } from "@/features/compras/components/pedido-detail-sheet";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "@/features/compras/types";
import type { Pedido, PedidoStatus, PedidoPrioridade } from "@/features/compras/types";
import { cn } from "@/lib/utils";

type GroupBy = "status" | "prioridade" | "vendor" | "categoria" | "none";

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}

function StatusPicker({
  value,
  onChange,
}: {
  value: PedidoStatus;
  onChange: (s: PedidoStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-none">
          <Badge variant={cfg.badge} className="cursor-pointer hover:opacity-80">
            {cfg.label}
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        {(Object.keys(STATUS_CONFIG) as PedidoStatus[]).map((s) => (
          <button
            key={s}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
            onClick={() => {
              onChange(s);
              setOpen(false);
            }}
          >
            <Badge variant={STATUS_CONFIG[s].badge} className="text-xs">
              {STATUS_CONFIG[s].label}
            </Badge>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

interface SortablePedidoRowProps {
  pedido: Pedido;
  onView: (p: Pedido) => void;
  onEdit: (p: Pedido) => void;
  onDelete: (p: Pedido) => void;
  onStatusChange: (id: string, status: PedidoStatus) => void;
}

function SortablePedidoRow({
  pedido,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: SortablePedidoRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pedido.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:bg-muted/40",
        isDragging && "opacity-50 shadow-lg bg-muted"
      )}
      onClick={() => onView(pedido)}
    >
      <TableCell className="w-8 pl-3" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground"
        >
          <IconGripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{pedido.titulo}</TableCell>
      <TableCell className="text-muted-foreground">
        {pedido.vendor?.name ?? "—"}
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
      <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <StatusPicker
          value={pedido.status}
          onChange={(s) => onStatusChange(pedido.id, s)}
        />
      </TableCell>
      <TableCell className="tabular-nums">{formatCurrency(pedido.valor_estimado)}</TableCell>
      <TableCell>{formatDate(pedido.data_necessidade)}</TableCell>
      <TableCell className="text-right pr-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(pedido)}>
              <IconEye className="mr-2 size-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(pedido)}>
              <IconPencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(pedido)}
            >
              <IconTrash className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function PedidoGroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={9} className="py-1.5 pl-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} ({count})
      </TableCell>
    </TableRow>
  );
}

export default function OrcamentosPage() {
  const { toast } = useToast();
  const { data: pedidos = [] as Pedido[], isLoading } = usePedidos();
  const { data: vendors = [] as { id: string; name: string }[] } = useVendors();
  const { data: categories = [] as { id: string; name: string }[] } = useVendorCategories();
  const deletePedido = useDeletePedido();
  const updatePedido = useUpdatePedido();
  const reorderPedidos = useReorderPedidos();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("_all");
  const [filterPrioridade, setFilterPrioridade] = useState("_all");
  const [filterVendor, setFilterVendor] = useState("_all");
  const [filterCategoria, setFilterCategoria] = useState("_all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pedido | null>(null);
  const handleSetDeleteTarget = (p: Pedido) => setDeleteTarget(p);
  const handleViewPedido = (pd: Pedido): void => { setDetailId(pd.id); };

  const sensors = useSensors(useSensor(PointerSensor));

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const matchSearch =
        !search || p.titulo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "_all" || p.status === filterStatus;
      const matchPrioridade =
        filterPrioridade === "_all" || p.prioridade === filterPrioridade;
      const matchVendor =
        filterVendor === "_all" || p.vendor_id === filterVendor;
      const matchCategoria =
        filterCategoria === "_all" || p.categoria_id === filterCategoria;
      return matchSearch && matchStatus && matchPrioridade && matchVendor && matchCategoria;
    });
  }, [pedidos, search, filterStatus, filterPrioridade, filterVendor, filterCategoria]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, Pedido[]>();
    for (const p of filtered as Pedido[]) {
      let key = "";
      if (groupBy === "status") key = STATUS_CONFIG[p.status as PedidoStatus].label;
      else if (groupBy === "prioridade") key = PRIORIDADE_CONFIG[p.prioridade as PedidoPrioridade].label;
      else if (groupBy === "vendor") key = p.vendor?.name ?? "Sem fornecedor";
      else if (groupBy === "categoria") {
        const cat = (categories as { id: string; name: string }[]).find((c) => c.id === p.categoria_id);
        key = cat?.name ?? "Sem categoria";
      }
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    }
    return groups;
  }, [filtered, groupBy, categories]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (groupBy !== "none") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex((p) => p.id === active.id);
    const newIndex = filtered.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(filtered, oldIndex, newIndex);
    reorderPedidos.mutate(
      reordered.map((p, i) => ({ id: p.id, sort_order: i }))
    );
  };

  const handleStatusChange = (id: string, status: PedidoStatus) => {
    updatePedido.mutate({ id, updates: { status } });
  };

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePedido.mutateAsync(deleteTarget.id);
      toast({ title: "Pedido excluído" });
    } catch {
      toast({ title: "Erro ao excluir pedido", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const tableBody = (items: Pedido[]) => (
    <>
      {items.map((p: Pedido) => (
        <SortablePedidoRow
          key={p.id}
          pedido={p}
          onView={handleViewPedido}
          onEdit={handleEdit}
          onDelete={handleSetDeleteTarget}
          onStatusChange={handleStatusChange}
        />
      ))}
    </>
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Pedidos de Compra"
        description="Gerencie todos os pedidos de compra e orçamentos."
        actions={
          <Button
            onClick={() => {
              setEditingPedido(null);
              setFormOpen(true);
            }}
          >
            <IconPlus className="mr-1.5 size-4" />
            Novo Pedido
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
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
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
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
            <SelectItem value="status">Por status</SelectItem>
            <SelectItem value="prioridade">Por prioridade</SelectItem>
            <SelectItem value="vendor">Por fornecedor</SelectItem>
            <SelectItem value="categoria">Por categoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="Nenhum pedido encontrado"
          description="Ajuste os filtros ou crie um novo pedido."
          cta={{
            label: "Novo Pedido",
            onClick: () => {
              setEditingPedido(null);
              setFormOpen(true);
            },
          }}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Título</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Est.</TableHead>
                <TableHead>Data Necessidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped ? (
                Array.from<[string, Pedido[]]>(grouped.entries()).map(([label, items]) => (
                  <>
                    <PedidoGroupHeader key={`hdr-${label}`} label={label} count={items.length} />
                    {items.map((p: Pedido) => (
                      <SortablePedidoRow
                        key={p.id}
                        pedido={p}
                        onView={handleViewPedido}
                        onEdit={handleEdit}
                        onDelete={handleSetDeleteTarget}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </>
                ))
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filtered.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tableBody(filtered)}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <PedidoForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingPedido(null);
        }}
        pedido={editingPedido}
      />

      <PedidoDetailSheet pedidoId={detailId} onClose={() => setDetailId(null)} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.titulo}</strong> será excluído permanentemente,
              incluindo todos os seus itens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
