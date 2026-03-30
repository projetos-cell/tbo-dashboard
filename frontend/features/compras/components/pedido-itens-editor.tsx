"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconGripVertical, IconTrash, IconPlus } from "@tabler/icons-react";
import { useUpsertPedidoItens, usePedidoItens } from "../hooks/use-compras";
import { useAuthStore } from "@/stores/auth-store";
import type { PedidoItem } from "../types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ItemRow {
  key: string;
  pedido_id: string;
  tenant_id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unit: number | null;
  sort_order: number;
}

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

interface SortableRowProps {
  item: ItemRow;
  onChange: (key: string, field: keyof ItemRow, value: string | number | null) => void;
  onRemove: (key: string) => void;
}

function SortableRow({ item, onChange, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subtotal =
    item.quantidade > 0 && item.valor_unit !== null
      ? item.quantidade * item.valor_unit
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background p-2",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <IconGripVertical className="size-4" />
      </button>

      <Input
        className="flex-1"
        placeholder="Descrição do item"
        value={item.descricao}
        onChange={(e) => onChange(item.key, "descricao", e.target.value)}
      />
      <Input
        className="w-20"
        type="number"
        min={1}
        placeholder="Qtd"
        value={item.quantidade}
        onChange={(e) => onChange(item.key, "quantidade", parseInt(e.target.value) || 1)}
      />
      <Input
        className="w-20"
        placeholder="Un"
        value={item.unidade}
        onChange={(e) => onChange(item.key, "unidade", e.target.value)}
      />
      <Input
        className="w-28"
        type="number"
        step="0.01"
        min={0}
        placeholder="Valor unit."
        value={item.valor_unit ?? ""}
        onChange={(e) =>
          onChange(
            item.key,
            "valor_unit",
            e.target.value === "" ? null : parseFloat(e.target.value)
          )
        }
      />
      <span className="w-24 text-right text-sm text-muted-foreground tabular-nums">
        {formatCurrency(subtotal)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => onRemove(item.key)}
      >
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
}

interface PedidoItensEditorProps {
  pedidoId: string;
}

export function PedidoItensEditor({ pedidoId }: PedidoItensEditorProps) {
  const tenantId = useAuthStore((s) => s.tenantId) ?? "";
  const { data: savedItems = [] } = usePedidoItens(pedidoId);
  const upsert = useUpsertPedidoItens();
  const { toast } = useToast();

  const [rows, setRows] = useState<ItemRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const mapped: ItemRow[] = savedItems.map((item) => ({
      key: item.id,
      pedido_id: item.pedido_id,
      tenant_id: item.tenant_id,
      descricao: item.descricao,
      quantidade: item.quantidade,
      unidade: item.unidade ?? "",
      valor_unit: item.valor_unit,
      sort_order: item.sort_order,
    }));
    setRows(mapped);
    setIsDirty(false);
  }, [savedItems]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.key === active.id);
    const newIndex = rows.findIndex((r) => r.key === over.id);
    const reordered = arrayMove(rows, oldIndex, newIndex).map((r, i) => ({
      ...r,
      sort_order: i,
    }));
    setRows(reordered);
    setIsDirty(true);
  };

  const handleChange = (key: string, field: keyof ItemRow, value: string | number | null) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
    setIsDirty(true);
  };

  const handleRemove = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
    setIsDirty(true);
  };

  const handleAddRow = () => {
    const newRow: ItemRow = {
      key: `new-${Date.now()}`,
      pedido_id: pedidoId,
      tenant_id: tenantId,
      descricao: "",
      quantidade: 1,
      unidade: "un",
      valor_unit: null,
      sort_order: rows.length,
    };
    setRows((prev) => [...prev, newRow]);
    setIsDirty(true);
  };

  const handleSave = async () => {
    const items: Omit<PedidoItem, "id" | "created_at">[] = rows.map((r, i) => ({
      pedido_id: r.pedido_id,
      tenant_id: r.tenant_id,
      descricao: r.descricao,
      quantidade: r.quantidade,
      unidade: r.unidade || null,
      valor_unit: r.valor_unit,
      sort_order: i,
    }));

    try {
      await upsert.mutateAsync({ pedidoId, items });
      toast({ title: "Itens salvos" });
      setIsDirty(false);
    } catch {
      toast({ title: "Erro ao salvar itens", variant: "destructive" });
    }
  };

  const total = rows.reduce(
    (acc, r) =>
      acc + (r.valor_unit !== null ? r.quantidade * r.valor_unit : 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Itens do Pedido</p>
        {isDirty && (
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={upsert.isPending}
          >
            {upsert.isPending ? "Salvando..." : "Salvar Itens"}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum item adicionado ainda.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rows.map((r) => r.key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                <span className="w-4" />
                <span className="flex-1">Descrição</span>
                <span className="w-20">Qtd</span>
                <span className="w-20">Un</span>
                <span className="w-28">Valor Unit.</span>
                <span className="w-24 text-right">Subtotal</span>
                <span className="w-8" />
              </div>
              {rows.map((item) => (
                <SortableRow
                  key={item.key}
                  item={item}
                  onChange={handleChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
        >
          <IconPlus className="mr-1.5 size-4" />
          Adicionar Item
        </Button>

        {rows.length > 0 && (
          <div className="text-sm font-semibold">
            Total:{" "}
            <span className="text-base">
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
