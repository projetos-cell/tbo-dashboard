"use client";

import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import { QuickAddTask } from "./quick-add-task";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// Section color palette (deterministic by index)
const SECTION_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-pink-500",
];

function getSectionColor(sectionId: string): string {
  let hash = 0;
  for (let i = 0; i < sectionId.length; i++) {
    hash = sectionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SECTION_COLORS[Math.abs(hash) % SECTION_COLORS.length];
}

// ─── Sortable task card wrapper ──────────────────────────────
export function SortableCard({
  task,
  onClick,
}: {
  task: MyTaskWithSection;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "task", sectionId: task.my_section_id },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task as TaskRow} onClick={onClick} />
    </div>
  );
}

// ─── Board column (one per section) ─────────────────────────
export function BoardColumn({
  sectionId,
  sectionName,
  tasks,
  onSelect,
}: {
  sectionId: string;
  sectionName: string;
  tasks: MyTaskWithSection[];
  onSelect: (task: TaskRow) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: sectionId });
  const maxOrder = tasks.reduce((max, t) => Math.max(max, t.my_sort_order), 0);
  const colorClass = getSectionColor(sectionId);

  return (
    <div className="flex min-w-[280px] max-w-[320px] shrink-0 flex-col">
      {/* Column header with colored accent */}
      <div className="mb-2">
        <div className={cn("h-1 rounded-t-full mb-2", colorClass)} />
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {sectionName}
          </h3>
          <Badge
            variant="secondary"
            className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px] font-semibold tabular-nums"
          >
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 space-y-2 rounded-lg p-2 transition-colors",
          isOver
            ? "bg-primary/5 ring-1 ring-primary/20"
            : "bg-muted/30"
        )}
      >
        <SortableContext
          id={sectionId}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground/50">
              Arraste tarefas aqui
            </p>
          ) : (
            tasks.map((task) => (
              <SortableCard
                key={task.id}
                task={task}
                onClick={() => onSelect(task as TaskRow)}
              />
            ))
          )}
        </SortableContext>
        <QuickAddTask sectionId={sectionId} sortOrder={maxOrder + 1} />
      </div>
    </div>
  );
}
