"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "./project-card";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { usePropertyOptions, useCreatePropertyOption } from "@/features/projects/hooks/use-project-properties";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { PropertyCategory } from "@/features/projects/services/project-properties";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectBoardProps {
  projects: Project[];
}

function SortableCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ProjectCard project={project} editable dragListeners={listeners} />
    </div>
  );
}

/* ── Inline add column form ─────────────────────────────────────────── */

const PRESET_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#0ea5e9",
];

function colorToBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

function AddColumnInline({ nextOrder }: { nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [category, setCategory] = useState<PropertyCategory>("in_progress");
  const createOption = useCreatePropertyOption();

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;

    const key = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    createOption.mutate({
      property: "status",
      key,
      label: trimmed,
      color,
      bg: colorToBg(color),
      category,
      sort_order: nextOrder,
    });

    setLabel("");
    setColor("#6b7280");
    setCategory("in_progress");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="flex w-[260px] min-w-[260px] shrink-0 flex-col">
        <Button
          variant="ghost"
          className="h-auto flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/20 py-8 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          onClick={() => setOpen(true)}
        >
          <IconPlus className="size-5" />
          <span className="text-xs font-medium">Adicionar coluna</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-[260px] min-w-[260px] shrink-0 flex-col">
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <Input
          placeholder="Nome do status..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          autoFocus
        />

        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "size-5 rounded-full transition-all",
                color === c && "ring-2 ring-offset-1 ring-primary",
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v as PropertyCategory)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="done">Concluídos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={submit}
            disabled={!label.trim() || createOption.isPending}
          >
            Criar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Board ──────────────────────────────────────────────────────────── */

export function ProjectBoard({ projects }: ProjectBoardProps) {
  const updateProject = useUpdateProject();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const undo = useUndoStack();
  const { toast } = useToast();

  // Fetch dynamic status options (falls back to hardcoded PROJECT_STATUS)
  const { data: statusOptions = [] } = usePropertyOptions("status");

  // Build columns from dynamic options
  const columns = useMemo(() => {
    if (statusOptions.length === 0) {
      // Fallback to hardcoded while loading
      return (Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
        ([key, cfg]) => ({ key, label: cfg.label, color: cfg.color })
      );
    }
    return statusOptions.map((opt) => ({
      key: opt.key,
      label: opt.label,
      color: opt.color,
    }));
  }, [statusOptions]);

  // Merge overrides (optimistic status changes) with filtered props
  const localProjects = projects.map((p) =>
    overrides[p.id] ? { ...p, status: overrides[p.id] } : p
  );

  // Clear overrides when mutations settle
  if (!updateProject.isPending && Object.keys(overrides).length > 0) {
    setOverrides({});
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getProjectsByStatus = useCallback(
    (status: string) => localProjects.filter((p) => p.status === status),
    [localProjects]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;

    const project = localProjects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    const oldStatus = project.status;

    // Push to undo stack
    undo.push({
      type: "MOVE_PROJECT",
      payload: { projectId, fromStatus: oldStatus, toStatus: newStatus },
      inverse: { projectId, fromStatus: newStatus, toStatus: oldStatus },
    });

    // Optimistic update
    setOverrides((prev) => ({ ...prev, [projectId]: newStatus }));

    // Persist to Supabase
    updateProject.mutate({
      id: projectId,
      updates: { status: newStatus },
    });
  }

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { projectId, toStatus } = action.inverse as {
      projectId: string;
      fromStatus: string;
      toStatus: string;
    };

    // Mark as undoing so the push is ignored
    undo.setUndoing(true);

    // Optimistic revert
    setOverrides((prev) => ({ ...prev, [projectId]: toStatus }));

    // Persist revert to Supabase
    updateProject.mutate(
      { id: projectId, updates: { status: toStatus } },
      {
        onSuccess: () => {
          undo.setUndoing(false);
          toast({
            title: "Desfeito",
            description: "Movimento revertido com sucesso.",
          });
        },
        onError: () => {
          undo.setUndoing(false);
          // Rollback the optimistic revert
          const original = action.payload as { toStatus: string };
          setOverrides((prev) => ({ ...prev, [projectId]: original.toStatus }));
          toast({
            title: "Erro ao desfazer",
            description: "Não foi possível reverter o movimento.",
            variant: "destructive",
          });
        },
      }
    );
  }, [undo, updateProject, toast]);

  // Ctrl+Z / Cmd+Z listener
  useUndoKeyboard(handleUndo);

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((col) => {
            const statusProjects = getProjectsByStatus(col.key);
            return (
              <div
                key={col.key}
                className="flex w-[260px] min-w-[260px] shrink-0 flex-col"
              >
                {/* Column header */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="text-sm font-medium">{col.label}</h3>
                  <span className="text-xs text-gray-500">
                    {statusProjects.length}
                  </span>
                </div>

                {/* Column body — droppable */}
                <SortableContext
                  id={col.key}
                  items={statusProjects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[100px]">
                    {statusProjects.length === 0 ? (
                      <p className="py-8 text-center text-xs text-gray-500">
                        Nenhum projeto
                      </p>
                    ) : (
                      statusProjects.map((project) => (
                        <SortableCard key={project.id} project={project} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}

          {/* Add column button */}
          <AddColumnInline nextOrder={columns.length} />
        </div>
      </DndContext>
    </div>
  );
}
