"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { useProjetosKanban } from "@/hooks/use-projetos-kanban";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { KanbanToolbar } from "@/components/kanban/KanbanToolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import type { KanbanTask, KanbanStatus } from "@/validations/kanban.schema";
import type { KanbanView } from "@/components/kanban/KanbanHeader";

// ---------------------------------------------------------------------------
// Column config — reflete os status reais de projetos
// ---------------------------------------------------------------------------

const COLUMN_CONFIG: { status: KanbanStatus; label: string }[] = [
  { status: "backlog",      label: "Backlog" },
  { status: "todo",         label: "Em Revisão" },
  { status: "in-progress",  label: "Em Andamento" },
  { status: "done",         label: "Concluído" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjetosBoard() {
  const [view, setView] = useState<KanbanView>("board");
  const [activeDragTask, setActiveDragTask] = useState<KanbanTask | null>(null);
  const undoStack = useRef<Array<{ id: string; status: KanbanStatus }>>([]);
  const { query, tasksByStatus, moveProjectMutation } = useProjetosKanban();
  const { isLoading, isError } = query;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Ctrl+Z — desfaz último move
  const handleUndo = useCallback(() => {
    const last = undoStack.current.pop();
    if (!last) return;
    moveProjectMutation.mutate(last);
    toast.info("Movimento desfeito");
  }, [moveProjectMutation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo]);

  function handleDragStart(event: DragStartEvent) {
    const task = query.data?.find((t) => t.id === event.active.id);
    if (task) setActiveDragTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragTask(null);
    const { active, over } = event;
    if (!over) return;
    const targetStatus = over.id as KanbanStatus;
    const task = query.data?.find((t) => t.id === active.id);
    if (!task || task.status === targetStatus) return;
    undoStack.current.push({ id: task.id, status: task.status });
    moveProjectMutation.mutate({ id: task.id, status: targetStatus });
  }

  return (
    <RequireRole module="projetos">
      <div className="flex h-full min-h-0 flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <KanbanHeader title="Board de Projetos" view={view} onViewChange={setView} />
          <Button>
            <IconPlus className="mr-1.5 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Toolbar */}
        <KanbanToolbar />

        {/* Board */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {COLUMN_CONFIG.map(({ status }) => (
              <div key={status} className="bg-muted/50 flex h-[560px] w-80 flex-shrink-0 flex-col gap-3 rounded-lg p-3">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="border-destructive/30 bg-destructive/5 flex h-64 flex-col items-center justify-center gap-3 rounded-lg border text-center">
            <p className="text-destructive text-sm font-medium">Erro ao carregar os projetos</p>
            <Button variant="outline" size="sm" onClick={() => query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex h-full flex-nowrap gap-4 pb-4">
                {COLUMN_CONFIG.map(({ status, label }) => (
                  <KanbanColumn key={status} id={status} title={label} count={tasksByStatus[status].length}>
                    {tasksByStatus[status].map((task) => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                  </KanbanColumn>
                ))}
              </div>
            </div>
            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeDragTask ? <KanbanCard task={activeDragTask} isDragOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </RequireRole>
  );
}
