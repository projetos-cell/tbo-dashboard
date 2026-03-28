"use client";

import { useState, useRef, useEffect } from "react";
import { IconPlus, IconRepeat, IconGripVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
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
import { ErrorState, ConfirmDialog, EmptyState } from "@/components/shared";
import { RitualCard } from "@/features/cultura/components/ritual-card";
import {
  useRitualTypes,
  useCreateRitualType,
  useUpdateRitualType,
  useDeleteRitualType,
  useToggleRitualTypeActive,
  useReorderRitualTypes,
} from "@/features/cultura/hooks/use-ritual-types";
import { RitualFormDialog, type RitualFormData } from "@/features/cultura/components/ritual-form-dialog";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

function SortableRitualCard({
  ritual,
  children,
  canEdit,
}: {
  ritual: RitualTypeRow;
  children: React.ReactNode;
  canEdit: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ritual.id });

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

export default function RituaisPage() {
  const { user, tenantId, role } = useAuthStore();
  const canEdit = role === "admin";

  const { data: rituals, isLoading, error, refetch } = useRitualTypes(canEdit);
  const createRitual = useCreateRitualType();
  const updateRitual = useUpdateRitualType();
  const deleteRitual = useDeleteRitualType();
  const toggleActive = useToggleRitualTypeActive();
  const reorder = useReorderRitualTypes(canEdit);

  const [orderedRituals, setOrderedRituals] = useState<RitualTypeRow[]>([]);
  const undoStack = useRef<RitualTypeRow[][]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RitualTypeRow | null>(null);
  const [deletingRitual, setDeletingRitual] = useState<RitualTypeRow | null>(null);

  useEffect(() => {
    if (rituals) setOrderedRituals(rituals);
  }, [rituals]);

  useEffect(() => {
    if (!canEdit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.current.length > 0) {
        const prev = undoStack.current.pop()!;
        setOrderedRituals(prev);
        reorder.mutate(prev.map((r, idx) => ({ id: r.id, sort_order: idx })));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, reorder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedRituals.findIndex((r) => r.id === active.id);
    const newIdx = orderedRituals.findIndex((r) => r.id === over.id);
    undoStack.current.push([...orderedRituals]);
    const newOrder = arrayMove(orderedRituals, oldIdx, newIdx);
    setOrderedRituals(newOrder);
    reorder.mutate(newOrder.map((r, idx) => ({ id: r.id, sort_order: idx })));
  }

  const handleSave = async (data: RitualFormData) => {
    try {
      if (editing) {
        await updateRitual.mutateAsync({
          id: editing.id,
          updates: {
            name: data.name,
            description: data.description,
            frequency: data.frequency,
            duration_minutes: data.duration_minutes,
            default_agenda: data.default_agenda,
          },
        });
      } else {
        await createRitual.mutateAsync({
          tenant_id: tenantId!,
          name: data.name,
          description: data.description,
          frequency: data.frequency,
          duration_minutes: data.duration_minutes,
          default_agenda: data.default_agenda,
          created_by: user?.id,
          is_system: false,
          is_active: true,
        } as Database["public"]["Tables"]["ritual_types"]["Insert"]);
      }
      setShowForm(false);
    } catch {
      // handled by mutation onError
    }
  };

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rituais</h1>
          <p className="text-sm text-gray-500">Rituais e cerimonias que fortalecem a cultura do time.</p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
            <IconPlus className="size-4 mr-1" />
            Novo ritual
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden p-4 pt-5 space-y-3">
              <div className="h-1 absolute top-0 left-0 right-0 bg-gray-100 rounded-none" />
              <div className="flex items-center gap-2 pt-1">
                <div className="size-4 rounded bg-gray-100" />
                <div className="h-4 w-28 rounded bg-gray-100" />
              </div>
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </Card>
          ))}
        </div>
      ) : orderedRituals.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedRituals.map((r) => r.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orderedRituals.map((ritual) => (
                <SortableRitualCard key={ritual.id} ritual={ritual} canEdit={canEdit}>
                  <RitualCard
                    ritual={ritual}
                    canEdit={canEdit}
                    onEdit={(r) => { setEditing(r); setShowForm(true); }}
                    onDelete={(r) => { if (!r.is_system) setDeletingRitual(r); }}
                    onToggleActive={(r) => toggleActive.mutate({ id: r.id, isActive: !r.is_active })}
                  />
                </SortableRitualCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState
          icon={IconRepeat}
          title="Nenhum ritual cadastrado"
          description="Crie rituais e cerimonias que fortalecem a cultura do time."
          cta={canEdit ? { label: "Novo ritual", onClick: () => { setEditing(null); setShowForm(true); } } : undefined}
        />
      )}

      <RitualFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
        onSave={handleSave}
        isSaving={createRitual.isPending || updateRitual.isPending}
      />

      <ConfirmDialog
        open={!!deletingRitual}
        onOpenChange={(open) => !open && setDeletingRitual(null)}
        title={`Excluir "${deletingRitual?.name}"?`}
        description="Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingRitual) await deleteRitual.mutateAsync(deletingRitual.id);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingRitual(null);
          }
        }}
      />
    </div>
  );
}
