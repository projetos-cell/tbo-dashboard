"use client";

import { IconCheck, IconClock, IconThumbUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export function PortalStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
      <Icon className="mx-auto mb-1 size-4 text-muted-foreground" />
      <p className="text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function PortalEnhancedTaskRow({
  task,
  canRequestApproval,
  onRequestApproval,
  isRequesting,
}: {
  task: TaskRow;
  canRequestApproval?: boolean;
  onRequestApproval?: (taskId: string) => void;
  isRequesting?: boolean;
}) {
  const isCompleted = task.is_completed;
  const dueDate = task.due_date
    ? new Date(task.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5 transition-colors hover:bg-accent/30">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/30"
        }`}
      >
        {isCompleted && <IconCheck className="size-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </p>
      </div>
      {task.status && !isCompleted && (
        <Badge variant="outline" className="text-[10px]">
          {task.status === "em_andamento"
            ? "Em Andamento"
            : task.status === "revisao"
              ? "Revisao"
              : task.status}
        </Badge>
      )}
      {dueDate && (
        <span className="text-xs text-muted-foreground">{dueDate}</span>
      )}
      {canRequestApproval && !isCompleted && onRequestApproval && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 gap-1 px-2 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onRequestApproval(task.id)}
          disabled={isRequesting}
        >
          <IconThumbUp className="size-3" />
          Pedir aprovacao
        </Button>
      )}
    </div>
  );
}
