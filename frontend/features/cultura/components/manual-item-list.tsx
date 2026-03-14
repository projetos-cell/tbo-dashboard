"use client";

import { IconBook } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ManualSortableItem } from "./manual-sortable-item";
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
  arrayMove,
} from "@dnd-kit/sortable";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

interface ManualItemListProps {
  isLoading: boolean;
  error: Error | null;
  orderedItems: CulturaRow[];
  filteredItems: CulturaRow[];
  searching: boolean;
  canEdit: boolean;
  onReorder: (items: CulturaRow[]) => void;
  onView: (item: CulturaRow) => void;
  onEdit: (item: CulturaRow) => void;
  onDelete: (item: CulturaRow) => void;
  onClearSearch: () => void;
  onNewItem: () => void;
  onRetry: () => void;
}

export function ManualItemList({
  isLoading,
  error,
  orderedItems,
  filteredItems,
  searching,
  canEdit,
  onReorder,
  onView,
  onEdit,
  onDelete,
  onClearSearch,
  onNewItem,
  onRetry,
}: ManualItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedItems.findIndex((i) => i.id === active.id);
    const newIdx = orderedItems.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(orderedItems, oldIdx, newIdx));
  }

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  if (filteredItems.length === 0) {
    return searching ? (
      <EmptyState
        icon={IconBook}
        title="Nenhum resultado encontrado"
        description="Tente ajustar o termo de busca."
        cta={{ label: "Limpar busca", onClick: onClearSearch }}
      />
    ) : (
      <EmptyState
        icon={IconBook}
        title="Nenhuma página do manual cadastrada"
        description="Crie guias e referências para a cultura do time."
        cta={canEdit ? { label: "Nova página", onClick: onNewItem } : undefined}
      />
    );
  }

  if (searching) {
    return (
      <div className="space-y-2">
        {filteredItems.map((item, index) => (
          <ManualSortableItem
            key={item.id}
            item={item}
            index={index}
            canEdit={canEdit}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={orderedItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {orderedItems.map((item, index) => (
            <ManualSortableItem
              key={item.id}
              item={item}
              index={index}
              canEdit={canEdit}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
