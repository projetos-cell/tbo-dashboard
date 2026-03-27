"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IconCircleCheck,
  IconCircle,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { ProjectSubtaskRow } from "./project-subtask-row";
import { TaskContextMenu } from "@/features/tasks/components/task-context-menu";
import { TaskAssigneePicker } from "@/features/tasks/components/task-assignee-picker";
import {
  TaskStatusSelect,
  TaskPrioritySelect,
  TaskDateRangeCell,
  EditableCustomFieldCell,
} from "./task-row-cells";
import { TaskRowTitleCell } from "./task-row-title-cell";
import type { Database } from "@/lib/supabase/types";
import type { ExtraColumn } from "./task-list-helpers";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface CustomFieldDef {
  id: string;
  name: string;
  type: string;
  config_json: Record<string, unknown> | null;
}

interface ProjectTaskRowProps {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
  extraColumns?: ExtraColumn[];
  sections?: { id: string; title: string; color: string | null }[];
  columnWidths?: Record<string, number>;
  customFields?: CustomFieldDef[];
  fieldValues?: Map<string, unknown>;
  onFieldChange?: (taskId: string, fieldId: string, value: unknown) => void;
  selectedIds?: Set<string>;
  onClearSelection?: () => void;
}

export function ProjectTaskRow({ task, subtasks, onSelect, extraColumns = [], sections, columnWidths = {}, customFields, fieldValues, onFieldChange, selectedIds, onClearSelection }: ProjectTaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const updateTask = useUpdateTask();
  const done = !!task.is_completed;
  const hasSubtasks = subtasks.length > 0;
  const completedSubs = subtasks.filter((s) => s.is_completed).length;

  const overdue =
    !done && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  function toggleComplete() {
    updateTask.mutate({
      id: task.id,
      updates: { is_completed: !done, status: !done ? "concluida" : "pendente" },
    });
  }

  function handleUpdateStatus(status: string) {
    updateTask.mutate({ id: task.id, updates: { status, is_completed: status === "concluida" } });
  }

  function handleUpdateDueDate(date: string | null) {
    updateTask.mutate({ id: task.id, updates: { due_date: date } });
  }

  function handleUpdatePriority(priority: string | null) {
    updateTask.mutate({ id: task.id, updates: { priority } });
  }

  const approvalKey = (task as Record<string, unknown>).approval_status as string | undefined;
  const isMilestone = !!(task as Record<string, unknown>).is_milestone;
  const estimatedHours = (task as Record<string, unknown>).estimated_hours as number | null;
  const loggedHours = (task as Record<string, unknown>).logged_hours as number | null;
  const recurrence = ((task as Record<string, unknown>).recurrence ?? "none") as string;

  return (
    <TaskContextMenu task={task} onSelect={onSelect} selectedIds={selectedIds} onClearSelection={onClearSelection}>
    <motion.div
      whileHover={{ y: -1, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="flex items-center gap-0 border-b border-border/30 px-3 py-2 transition-colors last:border-b-0 hover:bg-muted/30 cursor-pointer"
        onClick={() => onSelect(task.id)}
      >
        {/* Completion toggle */}
        <div className="flex items-center justify-center px-1" style={{ width: columnWidths.check ?? 40 }}>
          <button type="button" className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleComplete(); }}>
            {done ? (
              <IconCircleCheck className="h-4 w-4 text-green-500" />
            ) : (
              <IconCircle className="text-muted-foreground/40 h-4 w-4" />
            )}
          </button>
        </div>

        {/* Title */}
        <div className="px-2 flex items-center gap-2" style={{ flex: "1 1 0%", minWidth: 200 }}>
          {hasSubtasks && (
            <button type="button" className="shrink-0" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
              <IconChevronRight className={cn("text-muted-foreground h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} />
            </button>
          )}
          <TaskRowTitleCell
            title={task.title}
            done={done}
            overdue={!!overdue}
            isMilestone={isMilestone}
            approvalKey={approvalKey}
            estimatedHours={estimatedHours}
            loggedHours={loggedHours}
            recurrence={recurrence}
            hasSubtasks={hasSubtasks}
            completedSubs={completedSubs}
            totalSubs={subtasks.length}
          />
        </div>

        {/* Status */}
        <div className="px-2" style={{ width: columnWidths.status ?? 130, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskStatusSelect value={task.status ?? ""} onChange={handleUpdateStatus} />
        </div>

        {/* Priority */}
        <div className="hidden px-2 md:block" style={{ width: columnWidths.priority ?? 120, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskPrioritySelect value={task.priority ?? ""} onChange={handleUpdatePriority} />
        </div>

        {/* Assignee */}
        <div className="hidden px-2 md:block overflow-hidden" style={{ width: columnWidths.assignee_name ?? 140, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskAssigneePicker task={task} />
        </div>

        {/* Due date */}
        <div className="hidden px-2 md:block" style={{ width: columnWidths.due_date ?? 160, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskDateRangeCell startDate={task.start_date ?? null} dueDate={task.due_date ?? null} overdue={!!overdue} onChangeDue={handleUpdateDueDate} />
        </div>

        {/* Extra dynamic columns */}
        {extraColumns.map((col) => {
          let display = "\u2014";
          if (col.field === "start_date" && task.start_date) {
            display = format(new Date(task.start_date), "dd MMM yyyy", { locale: ptBR });
          } else if (col.field === "section" && task.section_id) {
            const sec = sections?.find((s) => s.id === task.section_id);
            display = sec?.title ?? "\u2014";
          } else if (col.field === "created_at" && task.created_at) {
            display = format(new Date(task.created_at), "dd MMM yyyy", { locale: ptBR });
          }
          return (
            <div key={col.id} className={cn("hidden px-2 md:block", col.width)}>
              <span className="truncate text-xs text-muted-foreground">{display}</span>
            </div>
          );
        })}

        {/* Custom field value cells */}
        {(customFields ?? []).map((field) => {
          const raw = fieldValues?.get(field.id);
          return (
            <div key={field.id} className="hidden px-2 md:block" style={{ width: 130, flex: "0 0 auto" }}>
              <EditableCustomFieldCell value={raw} type={field.type} fieldId={field.id} taskId={task.id} configJson={field.config_json} onSave={onFieldChange} />
            </div>
          );
        })}
      </div>

      {/* Subtasks (expanded) */}
      {expanded && hasSubtasks && (
        <div className="border-l-2 border-muted ml-[40px]">
          {subtasks.map((sub) => (
            <ProjectSubtaskRow key={sub.id} subtask={sub} onSelect={onSelect} />
          ))}
        </div>
      )}
    </motion.div>
    </TaskContextMenu>
  );
}
