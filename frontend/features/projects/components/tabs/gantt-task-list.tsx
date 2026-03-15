"use client";

import { useMemo } from "react";
import {
  IconChevronRight,
  IconChevronDown,
  IconCircleCheck,
  IconCircle,
  IconSubtask,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface Section {
  id: string;
  title: string;
  color: string | null;
  order_index: number | null;
}

interface GanttTaskListProps {
  sections: Section[];
  parents: TaskRow[];
  subtasksMap: Map<string, TaskRow[]>;
  collapsedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  selectedTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  compact?: boolean;
}

export function GanttTaskList({
  sections,
  parents,
  subtasksMap,
  collapsedSections,
  onToggleSection,
  selectedTaskId,
  onSelectTask,
  compact = false,
}: GanttTaskListProps) {
  const sectionGroups = useMemo(() => {
    const sectionOrder = new Map(sections.map((s, i) => [s.id, i]));
    const groups = new Map<string, { section: Section; tasks: TaskRow[] }>();

    for (const section of sections) {
      groups.set(section.id, { section, tasks: [] });
    }

    const noSection: TaskRow[] = [];

    for (const task of parents) {
      if (task.section_id && groups.has(task.section_id)) {
        groups.get(task.section_id)!.tasks.push(task);
      } else {
        noSection.push(task);
      }
    }

    for (const group of groups.values()) {
      group.tasks.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    }

    const sorted = [...groups.values()].sort(
      (a, b) =>
        (sectionOrder.get(a.section.id) ?? 999) -
        (sectionOrder.get(b.section.id) ?? 999)
    );

    return { sorted, noSection };
  }, [sections, parents]);

  const rowHeight = compact ? "h-7" : "h-9";
  const textSize = compact ? "text-[11px]" : "text-xs";

  return (
    <div className="flex flex-col border-r border-border/50 overflow-y-auto">
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-border/50 bg-muted/30 px-2 font-medium",
          rowHeight,
          textSize
        )}
      >
        <span className="text-muted-foreground">Tarefas</span>
      </div>

      {/* No-section tasks */}
      {sectionGroups.noSection.map((task) => (
        <TaskRowItem
          key={task.id}
          task={task}
          subtasks={subtasksMap.get(task.id)}
          selectedTaskId={selectedTaskId}
          onSelect={onSelectTask}
          compact={compact}
          textSize={textSize}
          rowHeight={rowHeight}
          depth={0}
        />
      ))}

      {/* Sections */}
      {sectionGroups.sorted.map(({ section, tasks }) => {
        const isCollapsed = collapsedSections.has(section.id);
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => onToggleSection(section.id)}
              className={cn(
                "flex w-full items-center gap-1.5 border-b border-border/30 bg-muted/20 px-2 text-left font-medium transition-colors hover:bg-muted/40",
                rowHeight,
                textSize
              )}
            >
              {isCollapsed ? (
                <IconChevronRight className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              )}
              {section.color && (
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: section.color }}
                />
              )}
              <span className="truncate">{section.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {tasks.length}
              </span>
            </button>

            {!isCollapsed &&
              tasks.map((task) => (
                <TaskRowItem
                  key={task.id}
                  task={task}
                  subtasks={subtasksMap.get(task.id)}
                  selectedTaskId={selectedTaskId}
                  onSelect={onSelectTask}
                  compact={compact}
                  textSize={textSize}
                  rowHeight={rowHeight}
                  depth={0}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Task row ─────────────────────────────────────────────

interface TaskRowItemProps {
  task: TaskRow;
  subtasks?: TaskRow[];
  selectedTaskId?: string | null;
  onSelect?: (id: string) => void;
  compact: boolean;
  textSize: string;
  rowHeight: string;
  depth: number;
}

function TaskRowItem({
  task,
  subtasks,
  selectedTaskId,
  onSelect,
  compact,
  textSize,
  rowHeight,
  depth,
}: TaskRowItemProps) {
  const status = TASK_STATUS[task.status as TaskStatusKey];
  const hasSubtasks = subtasks && subtasks.length > 0;
  const isSelected = selectedTaskId === task.id;

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect?.(task.id)}
        className={cn(
          "flex w-full items-center gap-1.5 border-b border-border/20 px-2 text-left transition-colors hover:bg-accent/30",
          rowHeight,
          textSize,
          isSelected && "bg-accent/50"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {task.is_completed ? (
          <IconCircleCheck className="size-3.5 shrink-0 text-green-500" />
        ) : (
          <IconCircle
            className="size-3.5 shrink-0"
            style={{ color: status?.color ?? "#6b7280" }}
          />
        )}
        <span
          className={cn(
            "truncate flex-1",
            task.is_completed && "line-through text-muted-foreground"
          )}
        >
          {task.title || "Sem título"}
        </span>
        {hasSubtasks && !compact && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 gap-0.5">
            <IconSubtask className="size-2.5" />
            {subtasks.length}
          </Badge>
        )}
      </button>

      {hasSubtasks &&
        subtasks.map((sub) => (
          <TaskRowItem
            key={sub.id}
            task={sub}
            selectedTaskId={selectedTaskId}
            onSelect={onSelect}
            compact={compact}
            textSize={textSize}
            rowHeight={rowHeight}
            depth={depth + 1}
          />
        ))}
    </>
  );
}
