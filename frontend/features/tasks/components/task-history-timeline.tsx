"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconHistory,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTaskHistory } from "@/features/tasks/hooks/use-task-history";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
import type { TaskHistoryEntry } from "@/features/tasks/services/task-history";

// ─── Field label map ─────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  priority: "Prioridade",
  assignee_name: "Responsavel",
  assignee_id: "Responsavel",
  due_date: "Prazo",
  start_date: "Data de inicio",
  title: "Titulo",
  description: "Descricao",
  is_completed: "Concluida",
  section_id: "Secao",
  project_id: "Projeto",
  order_index: "Ordem",
  approval_status: "Aprovacao",
  is_milestone: "Marco",
  effort_estimate: "Esforco estimado",
  effort_actual: "Esforco real",
  recurrence_rule: "Repeticao",
};

// ─── Props ───────────────────────────────────────────

interface TaskHistoryTimelineProps {
  taskId: string;
}

// ─── Component ───────────────────────────────────────

export function TaskHistoryTimeline({ taskId }: TaskHistoryTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: entries, isLoading } = useTaskHistory(taskId, isOpen);

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 w-full text-left group py-1.5"
      >
        <IconHistory className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Historico
        </span>
        {isOpen ? (
          <IconChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        ) : (
          <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {isLoading ? (
            <TimelineSkeleton />
          ) : !entries || entries.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Nenhuma alteracao registrada
            </p>
          ) : (
            <div className="relative pl-5">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-0">
                {entries.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    isLast={index === entries.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Single history entry ────────────────────────────

function HistoryEntry({
  entry,
  isLast: _isLast,
}: {
  entry: TaskHistoryEntry;
  isLast: boolean;
}) {
  const timeAgo = formatDistanceToNow(new Date(entry.created_at), {
    locale: ptBR,
    addSuffix: true,
  });

  const initial = getInitial(entry);

  return (
    <div className="relative pb-4 last:pb-0">
      {/* Dot on timeline */}
      <div className="absolute -left-5 top-1 flex items-center justify-center">
        <div className="h-3.5 w-3.5 rounded-full bg-background border-2 border-muted-foreground/30 flex items-center justify-center">
          <span className="text-[6px] font-bold text-muted-foreground leading-none">
            {initial}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>

        <div className="mt-0.5">
          {entry.action === "create" && (
            <span className="text-xs text-foreground">Tarefa criada</span>
          )}

          {entry.action === "delete" && (
            <span className="text-xs text-foreground">Tarefa excluida</span>
          )}

          {entry.action === "status_change" && (
            <StatusChangeDiff entry={entry} />
          )}

          {entry.action === "update" && <FieldDiffs entry={entry} />}

          {/* Fallback for other action types */}
          {!["create", "delete", "status_change", "update"].includes(
            entry.action
          ) && (
            <span className="text-xs text-muted-foreground">
              {entry.action}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status change diff ──────────────────────────────

function StatusChangeDiff({ entry }: { entry: TaskHistoryEntry }) {
  const fromStatus = entry.from_state?.status as string | undefined;
  const toStatus = entry.to_state?.status as string | undefined;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-muted-foreground">Status:</span>
      {fromStatus && <StatusBadge status={fromStatus} />}
      <IconArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
      {toStatus && <StatusBadge status={toStatus} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = TASK_STATUS[status as TaskStatusKey];
  if (!config) {
    return (
      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
        {status}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] h-5 px-1.5 border-0"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </Badge>
  );
}

// ─── Field-level diffs ───────────────────────────────

function FieldDiffs({ entry }: { entry: TaskHistoryEntry }) {
  const toState = entry.to_state;
  if (!toState) {
    return <span className="text-xs text-muted-foreground">Atualizada</span>;
  }

  // Fields that were changed are keys in to_state
  const changedFields = Object.keys(toState).filter(
    (key) => !["updated_at", "id", "tenant_id", "created_by"].includes(key)
  );

  if (changedFields.length === 0) {
    return <span className="text-xs text-muted-foreground">Atualizada</span>;
  }

  return (
    <div className="space-y-1">
      {changedFields.map((field) => {
        const label = FIELD_LABELS[field] ?? field;
        const fromValue = entry.from_state?.[field];
        const toValue = toState[field];

        // Special handling for status within update action
        if (field === "status") {
          return (
            <div key={field} className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-foreground">
                {label}:
              </span>
              {fromValue != null ? <StatusBadge status={String(fromValue)} /> : null}
              <IconArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <StatusBadge status={String(toValue)} />
            </div>
          );
        }

        // Description: just say it was changed, don't show content
        if (field === "description") {
          return (
            <div key={field} className="text-xs">
              <span className="font-medium text-foreground">{label}</span>{" "}
              <span className="text-muted-foreground">alterada</span>
            </div>
          );
        }

        // Boolean fields
        if (field === "is_completed" || field === "is_milestone") {
          return (
            <div key={field} className="text-xs">
              <span className="font-medium text-foreground">{label}:</span>{" "}
              <span className="text-muted-foreground">
                {toValue ? "Sim" : "Nao"}
              </span>
            </div>
          );
        }

        return (
          <div key={field} className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="font-medium text-foreground">{label}:</span>
            {fromValue !== undefined && fromValue !== null && (
              <span className="bg-red-500/10 text-red-700 dark:text-red-400 line-through px-1 py-0.5 rounded text-[11px]">
                {formatFieldValue(field, fromValue)}
              </span>
            )}
            <IconArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-1 py-0.5 rounded text-[11px]">
              {formatFieldValue(field, toValue)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────

function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Nao";

  const strValue = String(value);

  // Date fields
  if (
    (field === "due_date" || field === "start_date" || field === "completed_at") &&
    strValue.length >= 10
  ) {
    try {
      const date = new Date(strValue);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return strValue;
    }
  }

  // Status field
  if (field === "status") {
    const config = TASK_STATUS[strValue as TaskStatusKey];
    return config?.label ?? strValue;
  }

  // Truncate long values
  if (strValue.length > 40) {
    return strValue.slice(0, 40) + "...";
  }

  return strValue;
}

function getInitial(entry: TaskHistoryEntry): string {
  const meta = entry.metadata;
  if (meta && typeof meta === "object") {
    const name =
      (meta.user_name as string) ??
      (meta.actor_name as string) ??
      (meta.name as string);
    if (name) return name.charAt(0).toUpperCase();
  }
  // Fallback: first char of user_id
  return entry.user_id?.charAt(0)?.toUpperCase() ?? "?";
}

// ─── Skeleton ────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="pl-5 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
