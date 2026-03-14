"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  IconPlus,
  IconBook,
  IconGripVertical,
  IconDots,
  IconPencil,
  IconTrash,
  IconSearch,
  IconX,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CulturaItemForm } from "@/features/cultura/components/cultura-item-form";
import { CulturaItemDetail } from "@/features/cultura/components/cultura-item-detail";
import {
  useCulturaItems,
  useCreateCulturaItem,
  useUpdateCulturaItem,
  useDeleteCulturaItem,
  useReorderCulturaItems,
} from "@/features/cultura/hooks/use-cultura";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

function SortableManualItem({
  item,
  index,
  canEdit,
  onView,
  onEdit,
  onDelete,
}: {
  item: CulturaRow;
  index: number;
  canEdit: boolean;
  onView: (item: CulturaRow) => void;
  onEdit: (item: CulturaRow) => void;
  onDelete: (item: CulturaRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <Card className="group hover:shadow-sm transition-shadow">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          {canEdit && (
            <button
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 transition-opacity shrink-0"
              aria-label="Arrastar para reordenar"
              tabIndex={-1}
            >
              <IconGripVertical className="size-3.5 text-gray-400" />
            </button>
          )}
          <div
            className="flex items-center justify-center size-8 rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-sm font-medium shrink-0 cursor-pointer"
            onClick={() => onView(item)}
          >
            {index + 1}
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onView(item)}
          >
            <h3 className="text-sm font-medium truncate">{item.title}</h3>
            {item.content_html && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {item.content_html.replace(/<[^>]*>/g, "").trim().slice(0, 100)}
              </p>
            )}
          </div>

          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Ações"
                >
                  <IconDots className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(item)}>
                  <IconEye className="size-3.5 mr-1.5" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <IconPencil className="size-3.5 mr-1.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => onDelete(item)}
                >
                  <IconTrash className="size-3.5 mr-1.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <IconBook className="size-4 text-gray-500/40 shrink-0" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManualPage() {
  const { data: items, isLoading, error, refetch } = useCulturaItems("manual");
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const reorder = useReorderCulturaItems("manual");
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const [orderedItems, setOrderedItems] = useState<CulturaRow[]>([]);
  const undoStack = useRef<CulturaRow[][]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CulturaRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<CulturaRow | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (items) setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "z" &&
        undoStack.current.length > 0
      ) {
        const prev = undoStack.current.pop()!;
        setOrderedItems(prev);
        reorder.mutate(
          prev.map((item, idx) => ({ id: item.id, order_index: idx }))
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, reorder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return orderedItems;
    const q = search.toLowerCase();
    return orderedItems.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.content ?? "").toLowerCase().includes(q)
    );
  }, [orderedItems, search]);

  function handleDragEnd(event: DragEndEvent) {
    if (search.trim()) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedItems.findIndex((i) => i.id === active.id);
    const newIdx = orderedItems.findIndex((i) => i.id === over.id);
    undoStack.current.push([...orderedItems]);
    const newOrder = arrayMove(orderedItems, oldIdx, newIdx);
    setOrderedItems(newOrder);
    reorder.mutate(
      newOrder.map((item, idx) => ({ id: item.id, order_index: idx }))
    );
  }

  const handleSave = async (data: {
    title: string;
    content: string;
    content_html: string;
    category: string;
    status: string;
  }) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          updates: {
            title: data.title,
            content: data.content,
            content_html: data.content_html,
            status: data.status,
          },
          editedBy: user?.id,
        });
      } else {
        await createItem.mutateAsync({
          title: data.title,
          content: data.content,
          content_html: data.content_html,
          category: "manual",
          status: data.status,
          tenant_id: tenantId!,
          author_id: user?.id,
        } as Database["public"]["Tables"]["cultura_items"]["Insert"]);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch {
      // handled by mutation onError
    }
  };

  if (viewingId) {
    const currentIndex = orderedItems.findIndex((i) => i.id === viewingId);
    const prevItem = currentIndex > 0 ? orderedItems[currentIndex - 1] : null;
    const nextItem = currentIndex < orderedItems.length - 1 ? orderedItems[currentIndex + 1] : null;

    return (
      <div className="space-y-4">
        {orderedItems.length > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={!prevItem}
              onClick={() => prevItem && setViewingId(prevItem.id)}
              className="gap-1 text-xs"
            >
              <IconChevronLeft className="size-3.5" />
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {orderedItems.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!nextItem}
              onClick={() => nextItem && setViewingId(nextItem.id)}
              className="gap-1 text-xs"
            >
              Próximo
              <IconChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
        <CulturaItemDetail
          itemId={viewingId}
          onBack={() => setViewingId(null)}
          onEdit={() => {
            const item = orderedItems.find((i) => i.id === viewingId);
            if (item) {
              setEditingItem(item);
              setShowForm(true);
              setViewingId(null);
            }
          }}
          canEdit={canEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Manual</h1>
          <p className="text-sm text-gray-500">
            Manual da cultura e guias de referencia.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            <IconPlus className="size-4 mr-1" />
            Nova pagina
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          placeholder="Buscar no manual..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <IconX className="size-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : filteredItems.length > 0 ? (
        search.trim() ? (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <SortableManualItem
                key={item.id}
                item={item}
                index={index}
                canEdit={canEdit}
                onView={(i) => setViewingId(i.id)}
                onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
                onDelete={(i) => setDeletingItem(i)}
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
              items={orderedItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedItems.map((item, index) => (
                  <SortableManualItem
                    key={item.id}
                    item={item}
                    index={index}
                    canEdit={canEdit}
                    onView={(i) => setViewingId(i.id)}
                    onEdit={(i) => {
                      setEditingItem(i);
                      setShowForm(true);
                    }}
                    onDelete={(i) => setDeletingItem(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : search.trim() ? (
        <EmptyState
          icon={IconBook}
          title="Nenhum resultado encontrado"
          description="Tente ajustar o termo de busca."
          cta={{ label: "Limpar busca", onClick: () => setSearch("") }}
        />
      ) : (
        <EmptyState
          icon={IconBook}
          title="Nenhuma pagina do manual cadastrada"
          description="Crie guias e referencias para a cultura do time."
          cta={
            canEdit
              ? {
                  label: "Nova pagina",
                  onClick: () => {
                    setEditingItem(null);
                    setShowForm(true);
                  },
                }
              : undefined
          }
        />
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory="manual"
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title={`Excluir "${deletingItem?.title}"?`}
        description="Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingItem) await deleteItem.mutateAsync(deletingItem.id);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingItem(null);
          }
        }}
      />
    </div>
  );
}
