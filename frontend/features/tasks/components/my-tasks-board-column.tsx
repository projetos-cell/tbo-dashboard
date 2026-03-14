"use client";

import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import { QuickAddTask } from "./quick-add-task";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

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

  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700">{sectionName}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[100px] flex-1 space-y-2 rounded-lg p-2 transition-colors ${
          isOver ? "bg-primary/5 ring-1 ring-primary/20" : "bg-gray-100/30"
        }`}
      >
        <SortableContext
          id={sectionId}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">
              Nenhuma tarefa
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
