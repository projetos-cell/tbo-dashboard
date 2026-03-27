"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { IconGripVertical } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ProjectTaskRow } from "./project-task-row";
import type { TaskRow, ExtraColumn } from "./task-list-helpers";
import type { CustomField } from "@/features/projects/services/custom-fields";

export interface SortableTaskRowProps {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
  extraColumns: ExtraColumn[];
  sections?: { id: string; title: string; color: string | null }[];
  columnWidths?: Record<string, number>;
  customFields?: CustomField[];
  fieldValues?: Map<string, unknown>;
  onFieldChange?: (taskId: string, fieldId: string, value: unknown) => void;
  isSelected?: boolean;
  onMultiSelectClick?: (id: string, e: ReactMouseEvent) => void;
  selectedIds?: Set<string>;
  onClearSelection?: () => void;
}

export function SortableTaskRow({
  task,
  subtasks,
  onSelect,
  extraColumns,
  sections,
  columnWidths,
  customFields,
  fieldValues,
  onFieldChange,
  isSelected,
  onMultiSelectClick,
  selectedIds,
  onClearSelection,
}: SortableTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-select-id={task.id}
      className={cn(
        "flex items-stretch",
        isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
      )}
      onClick={(e) => {
        if ((e.shiftKey || e.ctrlKey || e.metaKey) && onMultiSelectClick) {
          e.preventDefault();
          e.stopPropagation();
          onMultiSelectClick(task.id, e);
        }
      }}
    >
      <div
        {...attributes}
        {...listeners}
        data-drag-handle
        className="flex w-[28px] shrink-0 cursor-grab items-center justify-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
      >
        <IconGripVertical className="size-3.5" />
      </div>
      <div className="flex-1">
        <ProjectTaskRow
          task={task}
          subtasks={subtasks}
          onSelect={onSelect}
          extraColumns={extraColumns}
          sections={sections}
          columnWidths={columnWidths}
          customFields={customFields}
          fieldValues={fieldValues}
          onFieldChange={onFieldChange}
          selectedIds={selectedIds}
          onClearSelection={onClearSelection}
        />
      </div>
    </div>
  );
}
