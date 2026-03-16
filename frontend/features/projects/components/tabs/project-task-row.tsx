"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconCircleCheck,
  IconCircle,
  IconCalendar,
  IconChevronRight,
  IconX,
  IconAlertTriangle,
  IconDiamond,
  IconClock,
  IconCheck,
  IconMessageCircle,
  IconRepeat,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_APPROVAL_STATUS,
  type TaskStatusKey,
  type TaskPriorityKey,
  type TaskApprovalStatusKey,
} from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { ProjectSubtaskRow } from "./project-subtask-row";
import { TaskContextMenu } from "@/features/tasks/components/task-context-menu";
import { TaskAssigneePicker } from "@/features/tasks/components/task-assignee-picker";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ExtraColumn {
  id: string;
  label: string;
  field: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
}

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
}

export function ProjectTaskRow({ task, subtasks, onSelect, extraColumns = [], sections, columnWidths = {}, customFields, fieldValues, onFieldChange }: ProjectTaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const updateTask = useUpdateTask();
  const done = !!task.is_completed;
  const hasSubtasks = subtasks.length > 0;
  const completedSubs = subtasks.filter((s) => s.is_completed).length;
  const statusConfig = TASK_STATUS[task.status as TaskStatusKey];
  const priorityConfig = task.priority ? TASK_PRIORITY[task.priority as TaskPriorityKey] : null;

  const overdue =
    !done && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  function toggleComplete() {
    updateTask.mutate({
      id: task.id,
      updates: {
        is_completed: !done,
        status: !done ? "concluida" : "pendente",
      },
    });
  }

  function handleUpdateStatus(status: string) {
    updateTask.mutate({
      id: task.id,
      updates: { status, is_completed: status === "concluida" },
    });
  }

  function handleUpdateDueDate(date: string | null) {
    updateTask.mutate({
      id: task.id,
      updates: { due_date: date },
    });
  }

  function handleUpdatePriority(priority: string | null) {
    updateTask.mutate({
      id: task.id,
      updates: { priority },
    });
  }

  function handleUpdateApproval(approval_status: string) {
    updateTask.mutate({
      id: task.id,
      updates: { approval_status } as never,
    });
  }

  const approvalKey = (task as Record<string, unknown>).approval_status as string | undefined;
  const approvalConfig = approvalKey && approvalKey !== "none"
    ? TASK_APPROVAL_STATUS[approvalKey as TaskApprovalStatusKey]
    : null;
  const isMilestone = !!(task as Record<string, unknown>).is_milestone;
  const estimatedHours = (task as Record<string, unknown>).estimated_hours as number | null;
  const loggedHours = (task as Record<string, unknown>).logged_hours as number | null;
  const recurrence = ((task as Record<string, unknown>).recurrence ?? "none") as string;

  return (
    <TaskContextMenu task={task} onSelect={onSelect}>
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
          <button
            type="button"
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
          >
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
            <button
              type="button"
              className="shrink-0"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            >
              <IconChevronRight
                className={cn(
                  "text-muted-foreground h-3.5 w-3.5 transition-transform",
                  expanded && "rotate-90",
                )}
              />
            </button>
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* T02 — Milestone diamond */}
              {isMilestone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconDiamond className="size-3.5 shrink-0 text-amber-500 fill-amber-100" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Marco</TooltipContent>
                </Tooltip>
              )}
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  done && "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </span>
              {overdue && !done && (
                <Badge
                  variant="secondary"
                  className="shrink-0 h-4 px-1 text-[10px] font-medium bg-red-50 text-red-600 border-red-200 gap-0.5"
                >
                  <IconAlertTriangle className="size-2.5" />
                  Atrasada
                </Badge>
              )}
              {/* T01 — Approval chip */}
              {approvalConfig && (
                <Badge
                  variant="secondary"
                  className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5"
                  style={{ backgroundColor: approvalConfig.bg, color: approvalConfig.color }}
                >
                  {approvalKey === "approved" ? (
                    <IconCheck className="size-2.5" />
                  ) : approvalKey === "changes_requested" ? (
                    <IconMessageCircle className="size-2.5" />
                  ) : null}
                  {approvalConfig.label}
                </Badge>
              )}
              {/* T03 — Effort hours badge */}
              {estimatedHours != null && estimatedHours > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5 text-muted-foreground"
                    >
                      <IconClock className="size-2.5" />
                      {loggedHours != null && loggedHours > 0
                        ? `${loggedHours}h / ${estimatedHours}h`
                        : `${estimatedHours}h est.`}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {loggedHours != null && loggedHours > 0
                      ? `${loggedHours}h registradas de ${estimatedHours}h estimadas`
                      : `${estimatedHours}h estimadas`}
                  </TooltipContent>
                </Tooltip>
              )}
              {/* T04 — Recurrence badge */}
              {recurrence !== "none" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="shrink-0 h-4 px-1 text-[10px] font-medium gap-0.5 text-muted-foreground"
                    >
                      <IconRepeat className="size-2.5" />
                      {recurrence === "daily" ? "Diária" : recurrence === "weekly" ? "Semanal" : "Mensal"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Tarefa recorrente ({recurrence === "daily" ? "diariamente" : recurrence === "weekly" ? "semanalmente" : "mensalmente"})
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {/* F04 — Progress bar inline para tasks com subtarefas */}
            {hasSubtasks && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 h-1 max-w-[80px] rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          completedSubs === subtasks.length ? "bg-green-500" : "bg-blue-400",
                        )}
                        style={{ width: `${Math.round((completedSubs / subtasks.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px] tabular-nums shrink-0">
                      {completedSubs}/{subtasks.length}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {completedSubs} de {subtasks.length} subtarefas concluídas
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="px-2" style={{ width: columnWidths.status ?? 130, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskStatusSelect
            value={task.status ?? ""}
            onChange={handleUpdateStatus}
          />
        </div>

        {/* Priority */}
        <div className="hidden px-2 md:block" style={{ width: columnWidths.priority ?? 120, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskPrioritySelect
            value={task.priority ?? ""}
            onChange={handleUpdatePriority}
          />
        </div>

        {/* Assignee (multi-avatar via junction table) */}
        <div className="hidden px-2 md:block overflow-hidden" style={{ width: columnWidths.assignee_name ?? 140, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskAssigneePicker task={task} />
        </div>

        {/* Due date (range: start_date → due_date) */}
        <div className="hidden px-2 md:block" style={{ width: columnWidths.due_date ?? 160, flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
          <TaskDateRangeCell
            startDate={task.start_date ?? null}
            dueDate={task.due_date ?? null}
            overdue={!!overdue}
            onChangeDue={handleUpdateDueDate}
          />
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

        {/* P01 — Custom field value cells (inline editable) */}
        {(customFields ?? []).map((field) => {
          const raw = fieldValues?.get(field.id);
          return (
            <div key={field.id} className="hidden px-2 md:block" style={{ width: 130, flex: "0 0 auto" }}>
              <EditableCustomFieldCell
                value={raw}
                type={field.type}
                fieldId={field.id}
                taskId={task.id}
                configJson={field.config_json}
                onSave={onFieldChange}
              />
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

// ─── Task Status Select ────────────────────────────────────────────────────────

function TaskStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const current = TASK_STATUS[value as TaskStatusKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none"
        >
          {current ? (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              style={{ backgroundColor: current.bg, color: current.color }}
            >
              {current.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer text-xs text-muted-foreground">
              {value || "Sem status"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs">Alterar status</DropdownMenuLabel>
        {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Task Priority Select ──────────────────────────────────────────────────────

function TaskPrioritySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string | null) => void;
}) {
  const current = value ? TASK_PRIORITY[value as TaskPriorityKey] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
        >
          {current ? (
            <>
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: current.color }}
              />
              <span className="truncate text-xs">{current.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel className="text-xs">Prioridade</DropdownMenuLabel>
        {value && (
          <DropdownMenuItem onClick={() => onChange(null)} className="gap-2 text-muted-foreground">
            <IconX className="size-3.5" />
            Remover
          </DropdownMenuItem>
        )}
        {(Object.entries(TASK_PRIORITY) as [TaskPriorityKey, (typeof TASK_PRIORITY)[TaskPriorityKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Task Date Range Cell (F06) ────────────────────────────────────────────────

function TaskDateRangeCell({
  startDate,
  dueDate,
  overdue,
  onChangeDue,
}: {
  startDate: string | null;
  dueDate: string | null;
  overdue: boolean;
  onChangeDue: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const dateObj = dueDate ? new Date(dueDate) : undefined;

  const hasRange = startDate && dueDate;

  // Calculate progress along temporal bar (0-100%)
  const rangeProgress = hasRange
    ? (() => {
        const start = new Date(startDate).getTime();
        const end = new Date(dueDate).getTime();
        const now = Date.now();
        const total = end - start;
        if (total <= 0) return 100;
        const elapsed = Math.min(Math.max(now - start, 0), total);
        return Math.round((elapsed / total) * 100);
      })()
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col gap-0.5 w-full rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-left",
            overdue && "text-red-600",
          )}
        >
          <div className="flex items-center gap-1">
            <IconCalendar className="size-3 shrink-0" />
            <span className="text-xs truncate">
              {hasRange
                ? `${format(new Date(startDate), "dd MMM", { locale: ptBR })} → ${format(new Date(dueDate), "dd MMM", { locale: ptBR })}`
                : dueDate
                  ? format(new Date(dueDate), "dd MMM yyyy", { locale: ptBR })
                  : "—"}
            </span>
          </div>
          {/* Temporal progress bar */}
          {hasRange && (
            <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  overdue ? "bg-red-400" : rangeProgress! >= 75 ? "bg-amber-400" : "bg-blue-400",
                )}
                style={{ width: `${rangeProgress}%` }}
              />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(date) => {
            onChangeDue(date ? format(date, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Editable Custom Field Cell (P01) ──────────────────────────────────────────

function EditableCustomFieldCell({
  value,
  type,
  fieldId,
  taskId,
  configJson,
  onSave,
}: {
  value: unknown;
  type: string;
  fieldId: string;
  taskId: string;
  configJson: Record<string, unknown> | null;
  onSave?: (taskId: string, fieldId: string, value: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<unknown>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = (v: unknown) => {
    setEditing(false);
    if (v !== value && onSave) onSave(taskId, fieldId, v);
  };

  // Checkbox — toggle on click, no popover
  if (type === "checkbox") {
    return (
      <button
        type="button"
        className="flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); commit(!value); }}
      >
        <Checkbox checked={!!value} className="size-4" />
      </button>
    );
  }

  // Select — popover with options
  if (type === "select") {
    const options = (configJson?.options as string[]) ?? [];
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center h-6 rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {value ? (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">{String(value)}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="start" sideOffset={4}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn("w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50", opt === value && "bg-muted")}
              onClick={(e) => { e.stopPropagation(); commit(opt); }}
            >
              {opt}
            </button>
          ))}
          {value != null && value !== "" && (
            <button
              type="button"
              className="w-full text-left text-xs px-2 py-1.5 rounded text-muted-foreground hover:bg-muted/50"
              onClick={(e) => { e.stopPropagation(); commit(null); }}
            >
              Limpar
            </button>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  // Multi-select — popover with checkboxes
  if (type === "multi_select") {
    const options = (configJson?.options as string[]) ?? [];
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-0.5 h-6 overflow-hidden rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {selected.length > 0 ? (
              <>
                {selected.slice(0, 2).map((v, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">{v}</Badge>
                ))}
                {selected.length > 2 && <span className="text-[10px] text-muted-foreground shrink-0">+{selected.length - 2}</span>}
              </>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start" sideOffset={4}>
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className="flex items-center gap-2 w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = checked ? selected.filter((s) => s !== opt) : [...selected, opt];
                  if (onSave) onSave(taskId, fieldId, next);
                }}
              >
                <Checkbox checked={checked} className="size-3.5" />
                {opt}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  // Date — popover with calendar
  if (type === "date") {
    const dateObj = value ? new Date(String(value)) : undefined;
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center h-6 rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {dateObj ? (
              <span className="text-xs text-muted-foreground">{format(dateObj, "dd MMM yyyy", { locale: ptBR })}</span>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={(d) => { commit(d ? format(d, "yyyy-MM-dd") : null); }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Text, number, email, url — inline input on click
  const display = renderDisplayValue(value, type);
  if (!editing) {
    return (
      <button
        type="button"
        className="flex items-center h-6 w-full rounded hover:bg-muted/50 transition-colors px-0.5 text-left"
        onClick={(e) => { e.stopPropagation(); setDraft(value ?? ""); setEditing(true); }}
      >
        {display}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      type={type === "number" ? "number" : type === "email" ? "email" : type === "url" ? "url" : "text"}
      className="h-6 text-xs px-1.5"
      value={String(draft ?? "")}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(draft);
        if (e.key === "Escape") { setEditing(false); setDraft(value); }
      }}
      onBlur={() => commit(draft)}
    />
  );
}

function renderDisplayValue(value: unknown, type: string) {
  if (value == null || value === "") {
    return <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>;
  }
  switch (type) {
    case "number":
      return <span className="text-xs tabular-nums text-muted-foreground">{String(value)}</span>;
    case "url":
      return (
        <span className="text-xs text-primary truncate">
          {String(value).replace(/^https?:\/\/(www\.)?/, "").slice(0, 30)}
        </span>
      );
    case "email":
      return <span className="text-xs text-primary truncate">{String(value)}</span>;
    default:
      return <span className="truncate text-xs text-muted-foreground">{String(value)}</span>;
  }
}
