"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  IconCircleCheck,
  IconCircle,
  IconCalendar,
  IconUser,
  IconUserCircle,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useTeamMembers } from "@/hooks/use-team";
import { ProjectSubtaskRow } from "./project-subtask-row";
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

interface ProjectTaskRowProps {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
  extraColumns?: ExtraColumn[];
  sections?: { id: string; title: string; color: string | null }[];
}

export function ProjectTaskRow({ task, subtasks, onSelect, extraColumns = [], sections }: ProjectTaskRowProps) {
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

  function handleUpdateAssignee(id: string | null, name: string | null) {
    updateTask.mutate({
      id: task.id,
      updates: { assignee_id: id, assignee_name: name },
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

  return (
    <div>
      <div
        className="flex items-center gap-0 border-b border-border/30 px-3 py-2 transition-colors last:border-b-0 hover:bg-muted/30 cursor-pointer"
        onClick={() => onSelect(task.id)}
      >
        {/* Completion toggle */}
        <div className="w-[40px] flex items-center justify-center px-1">
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
        <div className="min-w-[200px] flex-1 px-2 flex items-center gap-2">
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
          <span
            className={cn(
              "truncate text-sm font-medium",
              done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
          {hasSubtasks && (
            <span className="text-muted-foreground text-[10px] tabular-nums shrink-0">
              {completedSubs}/{subtasks.length}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="w-[130px] px-2" onClick={(e) => e.stopPropagation()}>
          <TaskStatusSelect
            value={task.status ?? ""}
            onChange={handleUpdateStatus}
          />
        </div>

        {/* Priority */}
        <div className="hidden w-[120px] px-2 md:block" onClick={(e) => e.stopPropagation()}>
          <TaskPrioritySelect
            value={task.priority ?? ""}
            onChange={handleUpdatePriority}
          />
        </div>

        {/* Assignee */}
        <div className="hidden w-[140px] px-2 md:block" onClick={(e) => e.stopPropagation()}>
          <TaskPersonSelect
            value={task.assignee_name ?? ""}
            currentId={task.assignee_id ?? ""}
            onChange={handleUpdateAssignee}
          />
        </div>

        {/* Due date */}
        <div className="hidden w-[120px] px-2 md:block" onClick={(e) => e.stopPropagation()}>
          <TaskDateCell
            value={task.due_date}
            onChange={handleUpdateDueDate}
            overdue={!!overdue}
          />
        </div>

        {/* Extra dynamic columns */}
        {extraColumns.map((col) => {
          let display = "\u2014";
          if (col.id.includes("start_date") && task.start_date) {
            display = format(new Date(task.start_date), "dd MMM yyyy", { locale: ptBR });
          } else if (col.id.includes("section") && task.section_id) {
            const sec = sections?.find((s) => s.id === task.section_id);
            display = sec?.title ?? "\u2014";
          } else if (col.id.includes("created_at") && task.created_at) {
            display = format(new Date(task.created_at), "dd MMM yyyy", { locale: ptBR });
          }
          return (
            <div key={col.id} className={cn("hidden px-2 md:block", col.width)}>
              <span className="truncate text-xs text-muted-foreground">{display}</span>
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
    </div>
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

// ─── Task Person Select ────────────────────────────────────────────────────────

function TaskPersonSelect({
  value,
  currentId,
  onChange,
}: {
  value: string;
  currentId: string;
  onChange: (id: string | null, name: string | null) => void;
}) {
  const { data: members } = useTeamMembers({ is_active: true });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.full_name.toLowerCase().includes(q));
  }, [members, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {value ? (
            <>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700"
              >
                {value
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="truncate text-xs">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1">
          {currentId && (
            <button
              type="button"
              onClick={() => {
                onChange(null, null);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconUserCircle className="size-4" />
              <span>Remover responsável</span>
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isSelected = member.id === currentId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onChange(member.id, member.full_name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                    {member.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-left">{member.full_name}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">atual</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Task Date Cell ────────────────────────────────────────────────────────────

function TaskDateCell({
  value,
  onChange,
  overdue,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  overdue: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dateObj = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            overdue && "text-red-600 font-medium",
          )}
        >
          <IconCalendar className="size-3" />
          <span className="text-xs">
            {value
              ? format(new Date(value), "dd MMM yyyy", { locale: ptBR })
              : "\u2014"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
