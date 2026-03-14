"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  usePdiGoals,
  useCreatePdiGoal,
  useDeletePdiGoal,
  useReorderPdiGoals,
} from "@/features/pdi/hooks/use-pdi";
import { useAuthStore } from "@/stores/auth-store";
import { computePdiProgress } from "@/features/pdi/services/pdi";
import type { PdiGoalWithActions } from "@/features/pdi/services/pdi";
import { PdiGoalItem } from "./pdi-goal-item";
import { PdiGoalForm } from "./pdi-goal-form";
import { IconTarget, IconPlus, IconGripVertical } from "@tabler/icons-react";
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

interface PdiGoalsSectionProps {
  pdiId: string;
  personId: string;
  personSkills: Array<{ id: string; skill_name: string; proficiency_level: number | null }>;
}

function SortableGoalItem({
  goal,
  pdiId,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  goal: PdiGoalWithActions;
  pdiId: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="relative group/sortable"
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-3 hidden cursor-grab touch-none group-hover/sortable:flex items-center text-muted-foreground hover:text-foreground"
        aria-label="Reordenar meta"
      >
        <IconGripVertical className="h-4 w-4" />
      </button>
      <PdiGoalItem
        goal={goal}
        pdiId={pdiId}
        expanded={expanded}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export function PdiGoalsSection({ pdiId, personSkills }: PdiGoalsSectionProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();

  const { data: goals, isLoading: goalsLoading } = usePdiGoals(pdiId);
  const createGoalMutation = useCreatePdiGoal();
  const deleteGoalMutation = useDeletePdiGoal();
  const reorderMutation = useReorderPdiGoals(pdiId);

  const [orderedGoals, setOrderedGoals] = useState<PdiGoalWithActions[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editGoalData, setEditGoalData] = useState<PdiGoalWithActions | null>(null);

  const undoStack = useRef<PdiGoalWithActions[][]>([]);

  useEffect(() => {
    if (goals) setOrderedGoals(goals);
  }, [goals]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && undoStack.current.length > 0) {
        e.preventDefault();
        const prev = undoStack.current.pop()!;
        setOrderedGoals(prev);
        reorderMutation.mutate(prev.map((g, idx) => ({ id: g.id, sort_order: idx })));
        toast({ title: "Reordenação desfeita" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reorderMutation, toast]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const progress = orderedGoals.length > 0 ? computePdiProgress(orderedGoals) : 0;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedGoals.findIndex((g) => g.id === active.id);
    const newIdx = orderedGoals.findIndex((g) => g.id === over.id);
    undoStack.current.push([...orderedGoals]);
    const newOrder = arrayMove(orderedGoals, oldIdx, newIdx);
    setOrderedGoals(newOrder);
    reorderMutation.mutate(newOrder.map((g, idx) => ({ id: g.id, sort_order: idx })));
  }

  function toggleGoalExpanded(goalId: string) {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  }

  function handleCreateGoal() {
    if (!newGoalTitle.trim() || !tenantId) return;
    createGoalMutation.mutate(
      { tenant_id: tenantId, pdi_id: pdiId, title: newGoalTitle.trim() },
      {
        onSuccess: () => setNewGoalTitle(""),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleDeleteGoal(goalId: string) {
    deleteGoalMutation.mutate(
      { id: goalId, pdiId },
      { onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }) }
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progresso</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <h4 className="flex items-center gap-1.5 text-sm font-semibold">
        <IconTarget className="h-4 w-4" /> Metas ({orderedGoals.length})
      </h4>

      {goalsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-gray-100/40" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 pl-5">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                {orderedGoals.map((goal) => (
                  <SortableGoalItem
                    key={goal.id}
                    goal={goal}
                    pdiId={pdiId}
                    expanded={expandedGoals.has(goal.id)}
                    onToggle={() => toggleGoalExpanded(goal.id)}
                    onEdit={() => {
                      setEditGoalData(goal);
                      setGoalFormOpen(true);
                    }}
                    onDelete={() => handleDeleteGoal(goal.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Quick add */}
          <div className="flex items-center gap-2">
            <Input
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Nova meta rápida..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateGoal();
                }
              }}
            />
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              onClick={handleCreateGoal}
              disabled={!newGoalTitle.trim() || createGoalMutation.isPending}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setEditGoalData(null);
              setGoalFormOpen(true);
            }}
          >
            <IconTarget className="mr-1 h-3 w-3" /> Nova meta com detalhes / vincular competência
          </Button>
        </>
      )}

      <PdiGoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        pdiId={pdiId}
        editData={editGoalData}
        personSkills={personSkills}
      />
    </div>
  );
}
