"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { IconPlus, IconGripVertical, IconSearch, IconX, type Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CulturaItemCard } from "./cultura-item-card";
import { CulturaItemForm } from "./cultura-item-form";
import { CulturaItemDetail } from "./cultura-item-detail";
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
import type { CulturaCategoryKey } from "@/lib/constants";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Rascunhos" },
  { value: "archived", label: "Arquivados" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

function SortableCard({
  item,
  children,
  canEdit,
}: {
  item: CulturaRow;
  children: React.ReactNode;
  canEdit: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative group/sortable"
    >
      {canEdit && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 opacity-0 group-hover/sortable:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 transition-opacity"
          aria-label="Arrastar para reordenar"
          tabIndex={-1}
        >
          <IconGripVertical className="size-3 text-gray-400" />
        </button>
      )}
      {children}
    </div>
  );
}

export interface CulturaItemsPageConfig {
  category: CulturaCategoryKey;
  icon: Icon;
  title: string;
  description: string;
  buttonLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  hasStatusFilter?: boolean;
}

export function CulturaItemsPage({
  category,
  icon: PageIcon,
  title,
  description,
  buttonLabel,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  hasStatusFilter = false,
}: CulturaItemsPageConfig) {
  const { data: items, isLoading, error, refetch } = useCulturaItems(category);
  const createItem = useCreateCulturaItem();
  const updateItem = useUpdateCulturaItem();
  const deleteItem = useDeleteCulturaItem();
  const reorder = useReorderCulturaItems(category);
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "founder" || role === "diretoria";

  const [orderedItems, setOrderedItems] = useState<CulturaRow[]>([]);
  const undoStack = useRef<CulturaRow[][]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CulturaRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<CulturaRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (items) setOrderedItems(items);
  }, [items]);

  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.current.length > 0) {
        const prev = undoStack.current.pop()!;
        setOrderedItems(prev);
        reorder.mutate(prev.map((item, idx) => ({ id: item.id, order_index: idx })));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, reorder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const isFiltering =
    search.trim() !== "" || (hasStatusFilter && statusFilter !== "all");

  const filteredItems = useMemo(() => {
    let result = orderedItems;
    if (hasStatusFilter && statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.content ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [orderedItems, search, statusFilter, hasStatusFilter]);

  function handleDragEnd(event: DragEndEvent) {
    if (isFiltering) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedItems.findIndex((i) => i.id === active.id);
    const newIdx = orderedItems.findIndex((i) => i.id === over.id);
    undoStack.current.push([...orderedItems]);
    const newOrder = arrayMove(orderedItems, oldIdx, newIdx);
    setOrderedItems(newOrder);
    reorder.mutate(newOrder.map((item, idx) => ({ id: item.id, order_index: idx })));
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
          updates: { title: data.title, content: data.content, content_html: data.content_html, status: data.status },
          editedBy: user?.id,
        });
      } else {
        await createItem.mutateAsync({
          title: data.title,
          content: data.content,
          content_html: data.content_html,
          category,
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
    return (
      <CulturaItemDetail
        itemId={viewingId}
        onBack={() => setViewingId(null)}
        onEdit={() => {
          const item = orderedItems.find((i) => i.id === viewingId);
          if (item) { setEditingItem(item); setShowForm(true); setViewingId(null); }
        }}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => { setEditingItem(null); setShowForm(true); }}>
            <IconPlus className="size-4 mr-1" />
            {buttonLabel}
          </Button>
        )}
      </div>

      {/* Search + optional status filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
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
        {hasStatusFilter && (
          <div className="flex gap-1 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                variant={statusFilter === opt.value ? "default" : "outline"}
                className="cursor-pointer select-none h-8 px-3 text-xs"
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
                {opt.value !== "all" && !isLoading && (
                  <span className="ml-1 opacity-60">
                    ({orderedItems.filter((i) => i.status === opt.value).length})
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : filteredItems.length > 0 ? (
        isFiltering ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <CulturaItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onView={(i) => setViewingId(i.id)}
                onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
                onDelete={(i) => setDeletingItem(i)}
              />
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedItems.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {orderedItems.map((item) => (
                  <SortableCard key={item.id} item={item} canEdit={canEdit}>
                    <CulturaItemCard
                      item={item}
                      canEdit={canEdit}
                      onView={(i) => setViewingId(i.id)}
                      onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
                      onDelete={(i) => setDeletingItem(i)}
                    />
                  </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : isFiltering ? (
        <EmptyState
          icon={PageIcon}
          title="Nenhum resultado encontrado"
          description="Tente ajustar os filtros ou o termo de busca."
          cta={{ label: "Limpar filtros", onClick: () => { setSearch(""); setStatusFilter("all"); } }}
        />
      ) : (
        <EmptyState
          icon={PageIcon}
          title={emptyTitle}
          description={emptyDescription}
          cta={canEdit ? { label: buttonLabel, onClick: () => { setEditingItem(null); setShowForm(true); } } : undefined}
        />
      )}

      <CulturaItemForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        defaultCategory={category}
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
