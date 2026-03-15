"use client";

import { useState, useRef } from "react";
import {
  IconCircleCheck,
  IconCircle,
  IconChevronRight,
  IconChevronDown,
  IconPlus,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Types ────────────────────────────────────────────────

export interface GanttTaskItem {
  id: string;
  name: string;
  type: "section" | "task";
  isSubtask: boolean;
  sectionId?: string;
  sectionColor?: string;
  hasSubtasks?: boolean;
  parentId?: string;
}

interface GanttTaskListProps {
  items: GanttTaskItem[];
  tasksMap: Map<string, TaskRow>;
  selectedTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  collapsedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  rowHeight: number;
  headerHeight: number;
  minRows: number;
  onAddTask?: (sectionId?: string) => void;
  sortableTaskIds?: string[];
}

// ─── Component ────────────────────────────────────────────

export function GanttTaskList({
  items,
  tasksMap,
  selectedTaskId,
  onSelectTask,
  collapsedTasks,
  onToggleExpand,
  rowHeight,
  headerHeight,
  minRows,
  onAddTask,
  sortableTaskIds,
}: GanttTaskListProps) {
  const emptyRows = Math.max(0, minRows - items.length);
  const hasSortable = sortableTaskIds && sortableTaskIds.length > 0;

  const content = (
    <>
      {items.map((item) => {
        if (item.type === "section") {
          return (
            <SectionRow
              key={item.id}
              item={item}
              rowHeight={rowHeight}
              onAddTask={onAddTask}
            />
          );
        }

        if (hasSortable && !item.isSubtask) {
          return (
            <SortableTaskRowItem
              key={item.id}
              item={item}
              task={tasksMap.get(item.id)}
              isSelected={selectedTaskId === item.id}
              isCollapsed={collapsedTasks.has(item.id)}
              onSelect={onSelectTask}
              onToggleExpand={onToggleExpand}
              rowHeight={rowHeight}
            />
          );
        }

        return (
          <TaskRowItem
            key={item.id}
            item={item}
            task={tasksMap.get(item.id)}
            isSelected={selectedTaskId === item.id}
            isCollapsed={collapsedTasks.has(item.id)}
            onSelect={onSelectTask}
            onToggleExpand={onToggleExpand}
            rowHeight={rowHeight}
          />
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col border-r border-border/50">
      {/* Header — must match gantt header height */}
      <div
        className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-3 text-xs font-medium text-muted-foreground"
        style={{ height: headerHeight }}
      >
        <span>Nome da tarefa</span>
        {onAddTask && (
          <button
            type="button"
            onClick={() => onAddTask()}
            className="flex size-5 items-center justify-center rounded hover:bg-accent/50 transition-colors"
            title="Adicionar tarefa"
          >
            <IconPlus className="size-3.5" />
          </button>
        )}
      </div>

      {/* Task / Section rows — each matches gantt bar row height exactly */}
      {hasSortable ? (
        <SortableContext items={sortableTaskIds} strategy={verticalListSortingStrategy}>
          {content}
        </SortableContext>
      ) : (
        content
      )}

      {/* Empty rows to fill remaining space */}
      {Array.from({ length: emptyRows }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="border-b border-border/20"
          style={{ height: rowHeight }}
        />
      ))}
    </div>
  );
}

// ─── Section Row ──────────────────────────────────────────

function SectionRow({
  item,
  rowHeight,
  onAddTask,
}: {
  item: GanttTaskItem;
  rowHeight: number;
  onAddTask?: (sectionId?: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 border-b border-border/30 bg-muted/20 px-3 text-xs font-semibold group"
      style={{ height: rowHeight }}
    >
      {item.sectionColor && (
        <div
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.sectionColor }}
        />
      )}
      <span className="truncate flex-1">{item.name}</span>
      {onAddTask && (
        <button
          type="button"
          onClick={() => onAddTask(item.sectionId)}
          className="flex size-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-accent/50 transition-all"
          title="Adicionar tarefa nesta seção"
        >
          <IconPlus className="size-3" />
        </button>
      )}
    </div>
  );
}

// ─── Sortable Task Row ───────────────────────────────────

function SortableTaskRowItem(props: {
  item: GanttTaskItem;
  task?: TaskRow;
  isSelected: boolean;
  isCollapsed: boolean;
  onSelect?: (id: string) => void;
  onToggleExpand: (id: string) => void;
  rowHeight: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch">
      <div
        {...attributes}
        {...listeners}
        className="flex w-[18px] shrink-0 cursor-grab items-center justify-center text-muted-foreground/20 hover:text-muted-foreground/60 active:cursor-grabbing"
      >
        <IconGripVertical className="size-3" />
      </div>
      <div className="flex-1">
        <TaskRowItem {...props} reducedPadding />
      </div>
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────

function TaskRowItem({
  item,
  task,
  isSelected,
  isCollapsed,
  onSelect,
  onToggleExpand,
  rowHeight,
  reducedPadding,
}: {
  item: GanttTaskItem;
  task?: TaskRow;
  isSelected: boolean;
  isCollapsed: boolean;
  onSelect?: (id: string) => void;
  onToggleExpand: (id: string) => void;
  rowHeight: number;
  reducedPadding?: boolean;
}) {
  const status = task ? TASK_STATUS[task.status as TaskStatusKey] : undefined;
  const isCompleted = task?.is_completed ?? false;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item.id)}
      className={cn(
        "flex w-full items-center gap-1.5 border-b border-border/20 text-left text-xs transition-colors hover:bg-accent/30 group",
        isSelected && "bg-accent/50",
      )}
      style={{
        height: rowHeight,
        paddingLeft: reducedPadding ? (item.isSubtask ? 24 : 4) : (item.isSubtask ? 32 : 12),
        paddingRight: 8,
      }}
    >
      {/* Expand/collapse toggle for parents with subtasks */}
      {item.hasSubtasks && !item.isSubtask ? (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onToggleExpand(item.id);
            }
          }}
          className="flex size-4 shrink-0 items-center justify-center rounded hover:bg-accent/50"
        >
          {isCollapsed ? (
            <IconChevronRight className="size-3 text-muted-foreground" />
          ) : (
            <IconChevronDown className="size-3 text-muted-foreground" />
          )}
        </span>
      ) : (
        <span className="w-4 shrink-0" />
      )}

      {/* Status icon */}
      {isCompleted ? (
        <IconCircleCheck className="size-3.5 shrink-0 text-green-500" />
      ) : (
        <IconCircle
          className="size-3.5 shrink-0"
          style={{ color: status?.color ?? "#6b7280" }}
        />
      )}

      {/* Task name */}
      <span
        className={cn(
          "truncate flex-1",
          isCompleted && "line-through text-muted-foreground",
        )}
      >
        {item.name.replace(/^\s*└\s*/, "")}
      </span>
    </button>
  );
}

// ─── Inline Add Task Input ────────────────────────────────

export function InlineAddTaskInput({
  rowHeight,
  onSubmit,
  onCancel,
}: {
  rowHeight: number;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-2 border-b border-border/20 px-3"
      style={{ height: rowHeight }}
    >
      <IconPlus className="size-3.5 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onSubmit(value.trim());
            setValue("");
          }
          if (e.key === "Escape") onCancel();
        }}
        onBlur={() => {
          if (value.trim()) onSubmit(value.trim());
          onCancel();
        }}
        placeholder="Nome da tarefa..."
        className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
